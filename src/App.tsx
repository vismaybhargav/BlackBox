import { usePapaParse } from "react-papaparse";
import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { Field, FieldDescription, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { useMemo, useState } from "react";
import type { ParseResult } from "papaparse";
import UplotReact from "uplot-react";
import 'uplot/dist/uPlot.min.css';
import type { AlignedData } from "uplot";
import uPlot from "uplot";

export default function App() {
  const { readString } = usePapaParse();
  const [loadedFile, setLoadingFile] = useState(false);
  const [data, setData] = useState<ParseResult<unknown> | null>(null);

  const [options, setOptions] = useState<uPlot.Options>(
    useMemo(
      () => ({
        title: "",
        width: 800,
        height: 600,
        series: [
          {
            label: "time"
          },
          {
            show: true,
            label: "time",
            stroke: "red",
            width: 1,
            dash: [10, 5]
          }
        ],
        scales: {
          x: {
            time: false
          }
        }
      }),
      []
    )
  );

  const [chartData, setChartData] = useState<uPlot.AlignedData>(
    useMemo<uPlot.AlignedData>(() => {
      const xData = data?.data[0] as number[] || [];
      const yData = data?.data[3] as number[] || [];
      return [xData, yData];
    }, [data])
  );

  return (
    <SidebarProvider>
      <main className="flex grow">
        <AppSidebar data={data} />
        <div>
          <Field>
            <FieldLabel htmlFor="csvInput">Open CSV File</FieldLabel>
            <Input
              id="csvInput"
              type="file"
              onInput={async (e) => {
                const file = e.currentTarget.files?.[0];
                if (!file) return;
                const fileContent = await file.text();

                readString(fileContent, {
                  header: true,
                  dynamicTyping: true,
                  complete: (results) => {
                    setData(results);
                  },
                  error: (error) => {
                    console.error("Error parsing CSV:", error);
                  },
                });
              }}
            />
            <FieldDescription>Select a CSV File</FieldDescription>
          </Field>
        </div>
        <UplotReact options={options} data={chartData}></UplotReact>
      </main>
    </SidebarProvider>
  );
}
