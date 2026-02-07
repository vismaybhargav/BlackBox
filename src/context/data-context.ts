import type { ParseResult } from "papaparse";
import { createContext } from "react";

export const DataContext = createContext<ParseResult<object> | null>(null);
