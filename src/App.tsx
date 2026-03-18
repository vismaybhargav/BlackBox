import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "uplot/dist/uPlot.min.css";
import uPlot from "uplot";
import { useDataContext } from "./context/data-context";
import type { ParseResult } from "papaparse";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import TopicDropZone from "./logged-value-holder/droppable-area";
import ResponsivePlot from "./responsive-chart";
import { useTopicContext } from "./context/topic-context";
import { extractAxisData } from "./lib/data-analyzation";
import {
  buildDiscreteLanes,
  buildDiscretePlotData,
  formatTopicValue,
  getCurrentDiscreteValue,
  getCurrentRowIndex,
  getDefaultXTopic,
  getRows,
  getXValues,
  type DiscreteLane,
} from "./lib/discrete-data";

const CONTINUOUS_PALETTE = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];
const SYNC_KEY = "blackbox-sync";

function createDiscreteBandPlugin(
  lanes: DiscreteLane[],
  xValues: number[],
): uPlot.Plugin {
  return {
    hooks: {
      draw: [
        (plot) => {
          if (lanes.length === 0) {
            return;
          }

          const { ctx, bbox } = plot;
          const laneHeight = bbox.height / lanes.length;
          const right = bbox.left + bbox.width;

          ctx.save();

          lanes.forEach((lane, laneIndex) => {
            const laneTop = bbox.top + laneIndex * laneHeight;
            const innerTop = laneTop + 2;
            const innerHeight = Math.max(0, laneHeight - 4);

            ctx.fillStyle = "#111827";
            ctx.fillRect(bbox.left, innerTop, bbox.width, innerHeight);

            lane.segments.forEach((segment, segmentIndex) => {
              const startValue = xValues[segment.startIndex];
              if (startValue === undefined || Number.isNaN(startValue)) {
                return;
              }

              const nextSegment = lane.segments[segmentIndex + 1];
              const nextStartValue =
                nextSegment !== undefined
                  ? xValues[nextSegment.startIndex]
                  : undefined;
              const startX = plot.valToPos(startValue, "x", true);
              const endX =
                nextStartValue !== undefined
                  ? plot.valToPos(nextStartValue, "x", true)
                  : right;
              const segmentWidth = Math.max(1, endX - startX);

              ctx.fillStyle = segment.color;
              ctx.fillRect(startX, innerTop, segmentWidth, innerHeight);

              if (segmentWidth > 36) {
                ctx.font = "600 12px sans-serif";
                ctx.fillStyle = "#e5e7eb";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                  segment.label,
                  startX + segmentWidth / 2,
                  innerTop + innerHeight / 2,
                );
              }
            });

            if (!lane.supported) {
              ctx.font = "600 12px sans-serif";
              ctx.fillStyle = "#9ca3af";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                "Unsupported discrete values",
                bbox.left + bbox.width / 2,
                innerTop + innerHeight / 2,
              );
            }
          });

          ctx.restore();
        },
      ],
    },
  };
}

export default function App() {
  const { data } = useDataContext();
  const { topicData } = useTopicContext();
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const continuousPlotRef = useRef<uPlot | null>(null);
  const discretePlotRef = useRef<uPlot | null>(null);
  const scaleSyncSource = useRef<"continuous" | "discrete" | null>(null);

  const rows = useMemo(
    () => getRows(data as ParseResult<unknown> | undefined),
    [data],
  );
  const xTopic = useMemo(() => getDefaultXTopic(data?.meta.fields), [data]);

  const discreteAxis = topicData.find((entry) => entry.axis === "discrete");
  const leftAxis = topicData.find((entry) => entry.axis === "left");
  const rightAxis = topicData.find((entry) => entry.axis === "right");
  const leftTopics = leftAxis?.topics ?? [];
  const rightTopics = rightAxis?.topics ?? [];
  const discreteTopics = discreteAxis?.topics ?? [];

  const xValues = useMemo(() => getXValues(rows, xTopic), [rows, xTopic]);
  const hasXData = xValues.length > 0;

  const continuousData = useMemo((): uPlot.AlignedData => {
    const plottedTopics = [...leftTopics, ...rightTopics];

    if (rows.length === 0) {
      return [[], ...plottedTopics.map(() => [])];
    }

    return [
      xValues,
      ...plottedTopics.map((topic) => extractAxisData(rows, topic, "number")),
    ];
  }, [leftTopics, rightTopics, rows, xValues]);

  const discreteLanes = useMemo(
    () => buildDiscreteLanes(rows, discreteTopics),
    [discreteTopics, rows],
  );

  const discreteData = useMemo(
    () => buildDiscretePlotData(xValues, discreteTopics.length),
    [discreteTopics.length, xValues],
  );

  const currentRowIndex = useMemo(
    () => getCurrentRowIndex(cursorIndex, rows.length),
    [cursorIndex, rows.length],
  );

  const topicDisplay = useMemo(() => {
    const display: Record<string, { value: string; accentColor?: string }> = {};

    [...leftTopics, ...rightTopics].forEach((topic, index) => {
      const value =
        currentRowIndex !== null ? rows[currentRowIndex]?.[topic] : undefined;
      display[topic] = {
        value: formatTopicValue(value),
        accentColor:
          CONTINUOUS_PALETTE[index % CONTINUOUS_PALETTE.length] ??
          CONTINUOUS_PALETTE[0],
      };
    });

    discreteLanes.forEach((lane) => {
      const value = getCurrentDiscreteValue(lane, currentRowIndex);
      const matchingSegment = lane.segments.find(
        (segment) =>
          currentRowIndex !== null &&
          currentRowIndex >= segment.startIndex &&
          currentRowIndex <= segment.endIndex,
      );

      display[lane.topic] = {
        value,
        accentColor: matchingSegment?.color,
      };
    });

    return display;
  }, [currentRowIndex, discreteLanes, leftTopics, rightTopics, rows]);

  const syncXScale = useCallback(
    (source: "continuous" | "discrete", min?: number, max?: number) => {
      if (min === undefined || max === undefined) {
        return;
      }

      const target =
        source === "continuous"
          ? discretePlotRef.current
          : continuousPlotRef.current;

      if (!target) {
        return;
      }

      const currentMin = target.scales.x.min;
      const currentMax = target.scales.x.max;
      if (currentMin === min && currentMax === max) {
        return;
      }

      scaleSyncSource.current = source;
      target.setScale("x", { min, max });
      scaleSyncSource.current = null;
    },
    [],
  );

  const continuousOptions = useMemo((): uPlot.Options => {
    const hasAnyYTopics = leftTopics.length > 0 || rightTopics.length > 0;
    const showContinuousXAxis = discreteTopics.length === 0;

    return {
      width: 1600,
      height: 480,
      legend: {
        show: false,
      },
      cursor: {
        sync: {
          key: SYNC_KEY,
        },
      },
      hooks: {
        setCursor: [
          (plot) => {
            setCursorIndex(typeof plot.cursor.idx === "number" ? plot.cursor.idx : null);
          },
        ],
        setScale: [
          (plot, key) => {
            if (key !== "x" || scaleSyncSource.current === "discrete") {
              return;
            }

            syncXScale("continuous", plot.scales.x.min, plot.scales.x.max);
          },
        ],
      },
      series: [
        {
          ...(hasXData
            ? {}
            : {
                values: (_plot: uPlot, splits: number[]) =>
                  splits.map((value) => `${value}`),
              }),
        },
        ...leftTopics.map((topic, index) => ({
          show: true,
          label: topic,
          scale: "y",
          stroke: CONTINUOUS_PALETTE[index % CONTINUOUS_PALETTE.length],
          width: 2,
        })),
        ...rightTopics.map((topic, index) => ({
          show: true,
          label: topic,
          scale: "y2",
          stroke:
            CONTINUOUS_PALETTE[
              (leftTopics.length + index) % CONTINUOUS_PALETTE.length
            ],
          width: 2,
        })),
      ],
      axes: [
        {
          size: showContinuousXAxis ? 34 : 22,
          stroke: showContinuousXAxis
            ? "rgba(100, 116, 139, 0.8)"
            : "rgba(0, 0, 0, 0)",
          ticks: {
            show: showContinuousXAxis,
            stroke: showContinuousXAxis
              ? "rgba(100, 116, 139, 0.8)"
              : "rgba(0, 0, 0, 0)",
          },
          values: showContinuousXAxis ? undefined : () => [],
          grid: {
            show: true,
            stroke: "rgba(148, 163, 184, 0.28)",
          },
        },
        {
          scale: "y",
          side: 3,
        },
        {
          scale: "y2",
          side: 1,
          show: rightTopics.length > 0,
          grid: { show: false },
        },
      ],
      scales: {
        x: {
          time: false,
          auto: hasXData,
          range: hasXData ? undefined : [0, 10],
        },
        y: hasAnyYTopics
          ? {}
          : {
              auto: false,
              range: [0, 1],
            },
      },
    };
  }, [discreteTopics.length, hasXData, leftTopics, rightTopics, syncXScale]);

  const discretePlotHeight = useMemo(() => {
    if (discreteTopics.length === 0) {
      return 0;
    }

    return Math.max(104, Math.min(72 + discreteTopics.length * 40, 268));
  }, [discreteTopics.length]);

  const discreteOptions = useMemo((): uPlot.Options => {
    const laneCount = Math.max(1, discreteTopics.length);

    return {
      width: 1600,
      height: discretePlotHeight,
      legend: {
        show: false,
      },
      cursor: {
        sync: {
          key: SYNC_KEY,
        },
      },
      hooks: {
        setCursor: [
          (plot) => {
            setCursorIndex(typeof plot.cursor.idx === "number" ? plot.cursor.idx : null);
          },
        ],
        setScale: [
          (plot, key) => {
            if (key !== "x" || scaleSyncSource.current === "continuous") {
              return;
            }

            syncXScale("discrete", plot.scales.x.min, plot.scales.x.max);
          },
        ],
      },
      plugins: [createDiscreteBandPlugin(discreteLanes, xValues)],
      series: [
        {},
        ...discreteTopics.map((topic) => ({
          label: topic,
          scale: "y",
          show: false,
          stroke: "rgba(0, 0, 0, 0)",
        })),
      ],
      axes: [
        {
          size: 34,
          stroke: "rgba(100, 116, 139, 0.8)",
          ticks: {
            show: true,
            stroke: "rgba(100, 116, 139, 0.8)",
          },
          grid: {
            show: true,
            stroke: "rgba(148, 163, 184, 0.28)",
          },
        },
        {
          scale: "y",
          show: false,
          grid: {
            show: false,
          },
        },
      ],
      scales: {
        x: {
          time: false,
          auto: hasXData,
          range: hasXData ? undefined : [0, 10],
        },
        y: {
          auto: false,
          range: [0.5, laneCount + 0.5],
        },
      },
    };
  }, [
    discreteLanes,
    discretePlotHeight,
    discreteTopics,
    hasXData,
    syncXScale,
    xValues,
  ]);

  useEffect(() => {
    if (cursorIndex !== null && cursorIndex >= rows.length) {
      setCursorIndex(rows.length > 0 ? rows.length - 1 : null);
    }
  }, [cursorIndex, rows.length]);

  return (
    <SidebarProvider>
      <main className="flex w-full">
        <AppSidebar />
        <ResizablePanelGroup orientation="vertical" className="w-full">
          <ResizablePanel defaultSize="75%" className="min-h-0" minSize="30%">
            <div className="h-full min-h-0 w-full border-b border-border bg-card">
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1">
                  <ResponsivePlot
                    options={continuousOptions}
                    data={continuousData}
                    onCreate={(plot) => {
                      continuousPlotRef.current = plot;
                    }}
                    onDelete={() => {
                      continuousPlotRef.current = null;
                    }}
                  />
                </div>
                {discreteTopics.length > 0 ? (
                  <div
                    className="border-t border-border"
                    style={{ height: `${discretePlotHeight}px` }}
                  >
                    <ResponsivePlot
                      options={discreteOptions}
                      data={discreteData}
                      onCreate={(plot) => {
                        discretePlotRef.current = plot;
                        const scale = continuousPlotRef.current?.scales.x;
                        if (scale?.min !== undefined && scale.max !== undefined) {
                          plot.setScale("x", { min: scale.min, max: scale.max });
                        }
                      }}
                      onDelete={() => {
                        discretePlotRef.current = null;
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="25%" className="min-h-0">
            <div className="h-full min-h-0 overflow-auto">
              <TopicDropZone topicDisplay={topicDisplay} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </SidebarProvider>
  );
}
