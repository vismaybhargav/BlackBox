import { Empty, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TopicContext } from "@/context/topic-context";
import { useDroppable } from "@dnd-kit/react";
import { ChartBarStacked, ChartLine } from "lucide-react";
import { useContext } from "react";

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

export function ContinousTopicDropZone({ id }: { id: string }) {
  const { ref } = useDroppable({
    id,
  });

  const { topicData } = useContext(TopicContext);

  return (
    <div ref={ref} className="flex h-full bg-green-50">
      <div className="mx-auto bg-yellow-200 align-middle">
        {id === "continous-topic-drop-zone-axis-1" ? (
          <h1>Left Axis</h1>
        ) : (
          <h1>Right Axis</h1>
        )}
      </div>
    </div>
  );
}

export function DiscreteTopicDropZone({ id }: { id: string }) {
  const { ref } = useDroppable({
    id,
  });

  return <div ref={ref} className="flex h-full bg-secondary"></div>;
}
