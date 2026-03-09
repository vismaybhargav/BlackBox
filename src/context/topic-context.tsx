import React, { createContext, useContext, useMemo, useState } from "react";

export type AxisId = "left" | "discrete" | "right";

export type TopicAxisAssignment = {
  axis: AxisId;
  topics: string[];
};

type TopicContextType = {
  topicData: TopicAxisAssignment[];
  setTopicData: React.Dispatch<React.SetStateAction<TopicAxisAssignment[]>>;
};

export const defaultTopicData: TopicAxisAssignment[] = [
  {
    axis: "left",
    topics: [],
  },
  {
    axis: "discrete",
    topics: [],
  },
  {
    axis: "right",
    topics: [],
  },
];

const TopicContext = createContext<TopicContextType | undefined>(undefined);

export function useTopicContext() {
  const context = useContext(TopicContext);

  if (!context) {
    throw new Error("useTopicContext must be used within a TopicContextProvider");
  }

  return context;
}

export function TopicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [topicData, setTopicData] = useState<TopicAxisAssignment[]>(defaultTopicData);
  const value = useMemo(() => ({ topicData, setTopicData }), [topicData]);

  return (
    <TopicContext.Provider value={value}>
      {children}
    </TopicContext.Provider>
  );
}
