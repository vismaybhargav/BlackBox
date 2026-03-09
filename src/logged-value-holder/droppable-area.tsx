import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { type AxisId, useTopicContext } from "@/context/topic-context";
import { XIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/react";
import { ChartBarStacked, ChartLine } from "lucide-react";

export default function TopicDropZone() {
  return (
    <div className="w-full h-full">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="33.33%" disabled={true}>
          <ContinousTopicDropZone id="continous-topic-drop-zone-axis-1" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="33.33%" disabled={true}>
          <DiscreteTopicDropZone id="discrete-topic-drop-zone" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="33.33%" disabled={true}>
          <ContinousTopicDropZone id="continous-topic-drop-zone-axis-2" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

const dropZoneAxisMap: Record<string, AxisId> = {
  "continous-topic-drop-zone-axis-1": "left",
  "discrete-topic-drop-zone": "discrete",
  "continous-topic-drop-zone-axis-2": "right",
};

function getAxisForDropZone(id: string): AxisId {
  return dropZoneAxisMap[id] ?? "left";
}

function TopicPill({ axis, topic }: { axis: AxisId; topic: string }) {
  const { setTopicData } = useTopicContext();

  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm">
      <span>{topic}</span>
      <button
        type="button"
        className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => {
          setTopicData((currentTopicData) =>
            currentTopicData.map((entry) =>
              entry.axis === axis
                ? {
                    ...entry,
                    topics: entry.topics.filter((value) => value !== topic),
                  }
                : entry,
            ),
          );
        }}
        aria-label={`Remove ${topic} from ${axis} axis`}
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

export function ContinousTopicDropZone({ id }: { id: string }) {
  const axis = getAxisForDropZone(id);
  const { topicData } = useTopicContext();
  const topics = topicData.find((entry) => entry.axis === axis)?.topics ?? [];
  const { ref, isDropTarget } = useDroppable({
    id,
    data: { axis },
  });

  return (
    <div
      ref={ref}
      className={`flex h-full flex-col gap-3 border border-dashed p-4 ${
        isDropTarget ? "bg-green-100" : "bg-green-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <ChartLine className="size-4" />
        <h1>{axis === "left" ? "Left Axis" : "Right Axis"}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.length > 0 ? (
          topics.map((topic) => <TopicPill key={topic} axis={axis} topic={topic} />)
        ) : (
          <p className="text-sm text-muted-foreground">Drop topics here.</p>
        )}
      </div>
    </div>
  );
}

export function DiscreteTopicDropZone({ id }: { id: string }) {
  const axis = getAxisForDropZone(id);
  const { topicData } = useTopicContext();
  const topics = topicData.find((entry) => entry.axis === axis)?.topics ?? [];
  const { ref, isDropTarget } = useDroppable({
    id,
    data: { axis },
  });

  return (
    <div
      ref={ref}
      className={`flex h-full flex-col gap-3 border border-dashed p-4 ${
        isDropTarget ? "bg-secondary/80" : "bg-secondary"
      }`}
    >
      <div className="flex items-center gap-2">
        <ChartBarStacked className="size-4" />
        <h1>Discrete Axis</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.length > 0 ? (
          topics.map((topic) => <TopicPill key={topic} axis={axis} topic={topic} />)
        ) : (
          <p className="text-sm text-muted-foreground">
            Drop the X-axis topic here.
          </p>
        )}
      </div>
    </div>
  );
}
