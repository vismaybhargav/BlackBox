import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Row } from "@/lib/log-handle";
import { useEffect, useRef, useState } from "react";

const ROW_CHUNK_SIZE = 250;

type TableViewProps = {
    columns: string[];
    data: Row[];
    filename: string;
    isParsing: boolean;
};

export default function TableView({ columns, data, filename, isParsing }: TableViewProps) {
    const [visibleRows, setVisibleRows] = useState<Row[]>([]);
    const renderedCountRef = useRef(0);

    useEffect(() => {
        let cancelled = false;

        if (data.length < renderedCountRef.current) {
            renderedCountRef.current = 0;
            setVisibleRows([]);
        }

        const pump = () => {
            if (cancelled) return;

            const nextChunk = data.slice(renderedCountRef.current, renderedCountRef.current + ROW_CHUNK_SIZE);

            if (!nextChunk.length) {
                if (isParsing) {
                    if (typeof requestAnimationFrame === "function") {
                        requestAnimationFrame(pump);
                    } else {
                        setTimeout(pump, 16);
                    }
                }
                return;
            }

            renderedCountRef.current += nextChunk.length;
            setVisibleRows((current) => current.concat(nextChunk));

            if (renderedCountRef.current < data.length || isParsing) {
                if (typeof requestAnimationFrame === "function") {
                    requestAnimationFrame(pump);
                } else {
                    setTimeout(pump, 16);
                }
            }
        };

        pump();

        return () => {
            cancelled = true;
        };
    }, [data, isParsing]);

    return (
        <Table>
            <TableCaption>{filename}</TableCaption>
            <TableHeader>
                <TableRow>
                    {columns.map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {visibleRows.map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                        {columns.map((col) => (
                            <TableCell key={`${rowIdx}-${col}`}>{row[col]}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
