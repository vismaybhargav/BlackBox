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

function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
): number[] {
  return data
    .map((item, index) => {
      if (item[key] === undefined || item[key] === null) {
        console.warn(
          `Key "${key}" is missing in item:`,
          item,
          `at index ${index}. Returning NaN for this entry.`,
        );
        console.dir(data[index], { depth: null });
      }

      if (typeof item === "object" && item && key in item) {
        const value = item[key];
        if (typeof value === "number") {
          return value;
        } else {
          console.warn(
            `Expected a number for key "${key}", but got: ${value} as (${typeof value}). DID YOU SET DYNAMIC TYPING?`,
          );
        }
      }
      return NaN;
    })
    .filter((value): value is number => !isNaN(value));
}

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
        {
          label: xTopic,
        },
        {
          scale: "y",
          side: 3,
          label: leftTopics.join(", "),
        },
        {
          scale: "y2",
          side: 1,
          label: rightTopics.join(", "),
          grid: { show: false },
        },
      ],
      scales: {
        x: {
          time: false,
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
            {/* <UplotReact options={options} data={chartData}></UplotReact> */}
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
