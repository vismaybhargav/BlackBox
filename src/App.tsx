import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { useCallback, useMemo } from "react";
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

export default function App() {
  const { data } = useDataContext();
  const { topicData } = useTopicContext();

  const convertToUplotData = useCallback(
    (
      incomingData: ParseResult<unknown> | undefined,
      axes: ReturnType<typeof useTopicContext>["topicData"],
    ): uPlot.AlignedData => {
      if (
        !incomingData ||
        !incomingData.data ||
        !Array.isArray(incomingData.data)
      ) {
        const emptySeriesCount =
          1 +
          axes.find((entry) => entry.axis === "left")!.topics.length +
          axes.find((entry) => entry.axis === "right")!.topics.length;

        return Array.from({ length: emptySeriesCount }, () => []) as unknown as uPlot.AlignedData;
      }

      const rows = incomingData.data as Array<Record<string, unknown>>;
      const discreteAxis = axes.find((entry) => entry.axis === "discrete");
      const leftAxis = axes.find((entry) => entry.axis === "left");
      const rightAxis = axes.find((entry) => entry.axis === "right");
      const xTopic = discreteAxis?.topics[0] ?? "timeMillis";
      const plottedTopics = [
        ...(leftAxis?.topics ?? []),
        ...(rightAxis?.topics ?? []),
      ];

      return [
        extractAxisData(rows, xTopic),
        ...plottedTopics.map((topic) => extractAxisData(rows, topic)),
      ];
    },
    [],
  );

  const chartData = useMemo(() => {
    return convertToUplotData(
      data as ParseResult<unknown> | undefined,
      topicData,
    );
  }, [convertToUplotData, data, topicData]);

  const options = useMemo((): uPlot.Options => {
    const discreteAxis = topicData.find((entry) => entry.axis === "discrete");
    const leftAxis = topicData.find((entry) => entry.axis === "left");
    const rightAxis = topicData.find((entry) => entry.axis === "right");
    const xTopic = discreteAxis?.topics[0] ?? "timeMillis";
    const leftTopics = leftAxis?.topics ?? [];
    const rightTopics = rightAxis?.topics ?? [];
    const hasXData = chartData[0]?.length > 0;
    const hasAnyYTopics = leftTopics.length > 0 || rightTopics.length > 0;
    const palette = [
      "#ef4444",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
    ];

    return {
      title: "",
      width: 1600,
      height: 600,
      legend: {
        show: true,
        live: true,
      },
      series: [
        {
          label: xTopic,
          ...(!hasXData
            ? {
                values: (_u: uPlot, splits: number[]) =>
                  splits.map((value) => `${value}`),
              }
            : {}),
        },
        ...leftTopics.map((topic, index) => ({
          show: true,
          label: topic,
          scale: "y",
          stroke: palette[index % palette.length],
          width: 1,
        })),
        ...rightTopics.map((topic, index) => ({
          show: true,
          label: topic,
          scale: "y2",
          stroke: palette[(leftTopics.length + index) % palette.length],
          width: 1,
        })),
      ],
      axes: [
        {},
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
  }, [topicData]);

  return (
    <SidebarProvider>
      <main className="flex w-full">
        <AppSidebar />
        <ResizablePanelGroup orientation="vertical" className="w-full">
          <ResizablePanel defaultSize="75%" className="min-h-0" minSize="30%">
            <div className="h-full min-h-0 w-full">
              <ResponsivePlot options={options} data={chartData} />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="25%" className="min-h-0">
            <div className="h-full min-h-0 overflow-auto">
              <TopicDropZone />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </SidebarProvider>
  );
}
function extractAxisData(rows: Record<string, unknown>[], xTopic: string): uPlot.TypedArray | number[] {
  throw new Error("Function not implemented.");
}

