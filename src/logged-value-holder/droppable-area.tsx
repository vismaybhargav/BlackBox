import { Empty, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useDroppable } from "@dnd-kit/react";
import { ChartBarStacked, ChartLine } from "lucide-react";

export default function TopicDropZone() {
    return (
        <div className="w-full h-full">
            <ResizablePanelGroup
                orientation="horizontal"
            >
                <ResizablePanel
                    defaultSize="33.33%"
                    disabled={true}
                >
                    <ContinuousTopicDropZone id="continous-topic-drop-zone-axis-1" />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    defaultSize="33.33%"
                    disabled={true}
                >
                    <DiscreteTopicDropZone id="discrete-topic-drop-zone" />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    defaultSize="33.33%"
                    disabled={true}
                >
                    <ContinuousTopicDropZone id="continous-topic-drop-zone-axis-2" />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export function ContinuousTopicDropZone({ id }: { id: string }) {
    const { ref } = useDroppable({
        id
    });

    return (
        <div ref={ref} className="flex h-full bg-secondary">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ChartLine />
                    </EmptyMedia>
                </EmptyHeader>
            </Empty>
        </div>
    );
}

export function DiscreteTopicDropZone({ id }: { id: string }) {
    const { ref } = useDroppable({
        id
    });

    return (
        <div ref={ref} className="flex h-full bg-secondary">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ChartBarStacked/>
                    </EmptyMedia>
                </EmptyHeader>
            </Empty>
        </div>
    );
}
