import { ModeToggle } from "@/components/mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GraphView from "@/views/graph-view";
import TableView from "@/views/table-view";
import { parseCSV, Row } from "@/lib/log-handle";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type ChartRow = Row & { __index: number };

export default function MainPage() {
    const [activeTab, setActiveTab] = useState("table");
    const [columns, setColumns] = useState<string[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [chartRows, setChartRows] = useState<ChartRow[]>([]);
    const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);

    useEffect(() => {
        let parseHandle: ReturnType<typeof parseCSV> | undefined;
        let numericCandidates: Set<string> | undefined;

        const unsubscribe = window.electronAPI.onCSVOpened((data) => {
            parseHandle?.abort();
            setColumns([]);
            setRows([]);
            setChartRows([]);
            setSeriesKeys([]);
            setParseError(null);
            setIsParsing(true);

            numericCandidates = undefined;

            parseHandle = parseCSV(data, {
                onHeader: (fields) => {
                    setColumns(fields);
                    numericCandidates = new Set(fields);
                    setSeriesKeys([]);
                },
                onChunk: (chunk) => {
                    if (!chunk.length) return;

                    setRows((current) => current.concat(chunk));
                    setChartRows((current) => {
                        const startIndex = current.length;
                        const nextRows = chunk.map((row, idx) => ({
                            ...row,
                            __index: startIndex + idx,
                        }));
                        return current.concat(nextRows);
                    });

                    if (numericCandidates && numericCandidates.size) {
                        const updated = new Set(numericCandidates);
                        for (const field of Array.from(updated)) {
                            const hasNonNumeric = chunk.some((row) => {
                                const value = row[field];
                                return typeof value !== "number" || Number.isNaN(value);
                            });
                            if (hasNonNumeric) {
                                updated.delete(field);
                            }
                        }
                        numericCandidates = updated;
                        setSeriesKeys(Array.from(updated));
                    }
                },
                onError: (error) => {
                    console.error("Failed to parse CSV", error);
                    setParseError(error.message);
                    setIsParsing(false);
                },
                onComplete: () => {
                    setIsParsing(false);
                },
            });
        });

        return () => {
            unsubscribe?.();
            parseHandle?.abort();
        };
    }, []);

    const hasRows = rows.length > 0;
    const noSeriesMessage = useMemo(() => {
        if (!columns.length) return "Open a CSV file to start";
        return "No numeric columns available for charting";
    }, [columns]);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="flex items-center justify-end gap-2 border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ModeToggle />
            </header>
            <main className="px-6 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="">
                    <TabsList>
                        <TabsTrigger value="table">Table</TabsTrigger>
                        <TabsTrigger value="graph">Graph</TabsTrigger>
                        <TabsTrigger value="threed">3D</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table" className="py-4">
                        {parseError && <div className="text-destructive mb-2 text-sm">{parseError}</div>}
                        {hasRows ? (
                            <TableView
                                columns={columns}
                                data={rows}
                                filename={"filename.csv"}
                                isParsing={isParsing}
                            />
                        ) : (
                            <div className="text-muted-foreground text-sm">
                                {isParsing ? "Loading rows…" : "Open a CSV file to inspect its rows"}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="graph" className="py-4">
                        {parseError && <div className="text-destructive mb-2 text-sm">{parseError}</div>}
                        {seriesKeys.length ? (
                            <GraphView data={chartRows} seriesKeys={seriesKeys} isParsing={isParsing} />
                        ) : (
                            <div className="text-muted-foreground text-sm">
                                {isParsing ? "Preparing chart data…" : noSeriesMessage}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="threed">
                        <Canvas>
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                            <mesh>
                                <boxGeometry args={[2, 2, 2]}/>
                                <meshPhongMaterial />
                            </mesh>
                            <directionalLight position={[0, 0, 5]} color="red"/>
                            <OrbitControls makeDefault />
                        </Canvas>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
