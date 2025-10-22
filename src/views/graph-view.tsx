import { useMemo } from "react";
import type { Row } from "@/lib/log-handle";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, LineChart, XAxis, YAxis } from "recharts";

const SERIES_COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#7c3aed",
    "#ea580c",
    "#0891b2",
    "#ca8a04",
    "#d946ef",
];

type ChartRow = Row & { __index: number };

type GraphViewProps = {
    data: ChartRow[];
    seriesKeys: string[];
    isParsing: boolean;
};

export default function GraphView({ data, seriesKeys, isParsing }: GraphViewProps) {
    const palette = useMemo(
        () =>
            seriesKeys.map((key, index) => ({
                key,
                color: SERIES_COLORS[index % SERIES_COLORS.length],
            })),
        [seriesKeys]
    );

    const chartConfig = useMemo(() => {
        return palette.reduce<ChartConfig>((config, { key, color }) => {
            config[key] = {
                label: key,
                color,
            };
            return config;
        }, {});
    }, [palette]);

    if (!data.length) {
        return (
            <div className="text-muted-foreground text-sm">
                {isParsing ? "Preparing chart data…" : "No rows available yet."}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col">
            <ChartContainer config={chartConfig} className="h-[420px] w-full">
                <LineChart data={data} margin={{ top: 20, right: 24, left: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.35} />
                    <XAxis dataKey="__index" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
            </ChartContainer>
            {isParsing && (
                <div className="text-muted-foreground mt-3 text-sm">Streaming additional rows…</div>
            )}
        </div>
    );
}
