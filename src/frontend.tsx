/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import type { ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SettingsProvider } from "./context/settings-context";
import { DataProvider } from "./context/data-context";
import { DragDropProvider } from "@dnd-kit/react";
import {
  TopicContextProvider,
  type AxisId,
  defaultTopicData,
  useTopicContext,
} from "./context/topic-context";

function AppProviders() {
  const { setTopicData } = useTopicContext();

  function handleDragEnd(
    event: Parameters<
      NonNullable<ComponentProps<typeof DragDropProvider>["onDragEnd"]>
    >[0],
  ) {
    const { operation, canceled } = event;

    if (canceled) {
      return;
    }

    const draggedTopic = operation.source?.data?.topic;
    const targetAxis = operation.target?.data?.axis as AxisId | undefined;

    if (typeof draggedTopic !== "string" || targetAxis === undefined) {
      return;
    }

    setTopicData((currentTopicData) => {
      const nextTopicData = currentTopicData.length > 0 ? currentTopicData : defaultTopicData;
      const withoutTopic = nextTopicData.map((entry) => ({
        ...entry,
        topics: entry.topics.filter((topic) => topic !== draggedTopic),
      }));

      return withoutTopic.map((entry) => {
        if (entry.axis !== targetAxis) {
          return entry;
        }

        return {
          ...entry,
          topics: entry.topics.includes(draggedTopic)
            ? entry.topics
            : [...entry.topics, draggedTopic],
        };
      });
    });
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <DataProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </DataProvider>
    </DragDropProvider>
  );
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <TopicContextProvider>
      <AppProviders />
    </TopicContextProvider>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
