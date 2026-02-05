import { createContext, useContext, useMemo, useState } from "react";
import type { ParseResult } from "papaparse";
import type { Dispatch, ReactNode, SetStateAction } from "react";

// TODO: Figure out a way to type CSVData based on user-provided schema
export type CSVData = ParseResult<unknown>;

type DataContextValue = {
  data: CSVData | null,
  setData: Dispatch<CSVData | null>,
};

export const DataContext = createContext<DataContextValue | null>(null);