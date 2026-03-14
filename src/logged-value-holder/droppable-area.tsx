import { type AxisId, useTopicContext } from "@/context/topic-context";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/react";
import { ChartBarStacked, ChartLine } from "lucide-react";

type TopicDisplay = {
  value: string;
  accentColor?: string;
};

type TopicDropZoneProps = {
  topicDisplay: Record<string, TopicDisplay>;
};

export default function TopicDropZone({ topicDisplay }: TopicDropZoneProps) {
  return (
    <div className="grid h-full w-full gap-3 p-3 md:grid-cols-3">
      <ContinousTopicDropZone
        id="continous-topic-drop-zone-axis-1"
        topicDisplay={topicDisplay}
      />
      <DiscreteTopicDropZone
        id="discrete-topic-drop-zone"
        topicDisplay={topicDisplay}
      />
      <ContinousTopicDropZone
        id="continous-topic-drop-zone-axis-2"
        topicDisplay={topicDisplay}
      />
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

function TopicRow({
  axis,
  topic,
  topicDisplay,
}: {
  axis: AxisId;
  topic: string;
  topicDisplay: Record<string, TopicDisplay>;
}) {
  const { setTopicData } = useTopicContext();
  const display = topicDisplay[topic];

  return (
    <div className="flex items-start justify-between gap-3 rounded-sm border border-border/70 bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-black/10",
              !display?.accentColor && "bg-muted",
            )}
            style={
              display?.accentColor
                ? { backgroundColor: display.accentColor }
                : undefined
            }
          />
          <span className="truncate text-sm font-medium">{topic}</span>
        </div>
        <div className="pl-4 text-sm text-muted-foreground">{display?.value ?? "—"}</div>
      </div>
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
    </div>
  );
}

export function ContinousTopicDropZone({
  id,
  topicDisplay,
}: {
  id: string;
  topicDisplay: Record<string, TopicDisplay>;
}) {
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
      className={cn(
        "flex h-full flex-col gap-3 border border-dashed border-border/80 bg-card p-4",
        isDropTarget && "bg-accent",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <ChartLine className="size-4" />
        <h1 className="font-semibold">
          {axis === "left" ? "Left Axis" : "Right Axis"}
        </h1>
      </div>
      <div className="flex flex-col gap-2 overflow-auto">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <TopicRow
              key={topic}
              axis={axis}
              topic={topic}
              topicDisplay={topicDisplay}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Drop topics here.</p>
        )}
      </div>
    </div>
  );
}

export function DiscreteTopicDropZone({
  id,
  topicDisplay,
}: {
  id: string;
  topicDisplay: Record<string, TopicDisplay>;
}) {
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
      className={cn(
        "flex h-full flex-col gap-3 border border-dashed border-border/80 bg-secondary/35 p-4",
        isDropTarget && "bg-secondary/70",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <ChartBarStacked className="size-4" />
        <h1 className="font-semibold">Discrete Fields</h1>
      </div>
      <div className="flex flex-col gap-2 overflow-auto">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <TopicRow
              key={topic}
              axis={axis}
              topic={topic}
              topicDisplay={topicDisplay}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Drop state fields here.</p>
        )}
      </div>
    </div>
  );
}
