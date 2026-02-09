import type { ParseResult } from "papaparse";
import { createContext, useState } from "react";

type DataContextValue = {
  data: ParseResult<object> | null;
  setData: (data: ParseResult<object> | null) => void;  
};

export const DataContext = createContext<DataContextValue | null>({
  data: null,
  setData: () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ParseResult<object> | null>(null);

  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
}
