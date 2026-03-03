import { createContext } from "react";

type TopicContextValue = {
  axis: "left" | "discrete" | "right",
  topics: string[]
}

type TopicContextType = {
  topicData: TopicContextValue[],
  setTopicData: React.Dispatch<React.SetStateAction<TopicContextValue[]>>,
}

export const TopicContext = createContext<>()

export function TopicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [topicData, setTopicData] = useState([]);

  return (
    <TopicContext.Provider value={{ topicData, setTopicData }}>
      {children}
    </TopicContext.Provider>
  );
}
