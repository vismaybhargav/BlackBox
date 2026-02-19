import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { useCallback, useMemo, useState } from "react";
import UplotReact from "uplot-react";
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot";
import { useDataContext } from "./context/data-context";
import type { ParseResult } from "papaparse";

function extractAxisData(data: Array<Record<string, unknown>>, key: string): number[] {
  return data.map((item, index) => {
    if(item[key] === undefined || item[key] === null) {
      console.warn(`Key "${key}" is missing in item:`, item, `at index ${index}. Returning NaN for this entry.`);
      console.dir(data[index], { depth: null });
    }

    if (typeof item === "object" && item && key in item) {
      const value = item[key];
      if (typeof value === "number") {
        return value;
      } else {
        console.warn(`Expected a number for key "${key}", but got: ${value} as (${typeof value}). DID YOU SET DYNAMIC TYPING?`);  
      }
    }
    return NaN;
  }).filter((value): value is number => !isNaN(value));
}

export default function App() {
  const [options, setOptions] = useState<uPlot.Options>(
    {
        title: "",
        width: 800,
        height: 600,
        series: [
          {
            label: "time"
          },
          {
            show: true,
            label: "alt",
            stroke: "red",
            width: 1,
          }
        ],
        scales: {
          x: {
            time: false
          }
        }
      });

  const { data, setData } = useDataContext();

  const convertToUplotData = useCallback((incomingData: ParseResult<unknown> | undefined): uPlot.AlignedData => {
    if (!incomingData || !incomingData.data || !Array.isArray(incomingData.data)) {
      return [[], []];
    }

    const xData = extractAxisData(incomingData.data as Array<Record<string, unknown>>, "timeMillis");
    const yData = extractAxisData(incomingData.data as Array<Record<string, unknown>>, "alt");
    return [xData, yData];
  }, []);

  const chartData = useMemo(() => {
    return convertToUplotData(data as ParseResult<unknown> | undefined);
  }, [data]);

  return (
    <SidebarProvider>
      <main className="flex grow">
        <AppSidebar />
        <UplotReact options={options} data={chartData}></UplotReact>
      </main>
    </SidebarProvider>
  );
}
