import { createContext, useState } from "react";

type TopicContextValue = {
  axis: "left" | "discrete" | "right",
  topics: string[]
}

type TopicContextType = {
  topicData: TopicContextValue[],
  setTopicData: React.Dispatch<React.SetStateAction<TopicContextValue[]>>,
}

export const TopicContext = createContext<TopicContextType | null>(null);

export function TopicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [topicData, setTopicData] = useState<TopicContextValue[]>([
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
  ]);

  return (
    <TopicContext.Provider value={{ topicData, setTopicData }}>
      {children}
    </TopicContext.Provider>
  );
}
