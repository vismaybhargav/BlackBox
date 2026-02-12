import type { ParseResult } from "papaparse";
import { createContext, useContext, useMemo, useState } from "react";

type DataContextValue = {
  data: ParseResult<unknown> | null;
  setData: React.Dispatch<React.SetStateAction<ParseResult<unknown> | null>>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ParseResult<unknown> | null>(null);
  const value = useMemo(() => ({ data, setData }), [data]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
