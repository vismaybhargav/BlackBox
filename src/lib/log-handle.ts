import { ParseStepResult, Parser, parse } from "papaparse";

export type Row = Record<string, number | string | null>;

export type ParseCallbacks = {
    onHeader?: (columns: string[]) => void;
    onChunk?: (rows: Row[]) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
};

export type ParseCSVHandle = {
    abort: () => void;
};

const DEFAULT_CHUNK_SIZE = 500;

export function parseCSV(
    fileContents: string,
    callbacks: ParseCallbacks,
    options?: { chunkSize?: number }
): ParseCSVHandle {
    const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    let bufferedRows: Row[] = [];
    let headerEmitted = false;
    let parserRef: Parser | undefined;

    const flushBuffer = () => {
        if (!bufferedRows.length) return;
        callbacks.onChunk?.(bufferedRows);
        bufferedRows = [];
    };

    const handleStep = (result: ParseStepResult<Row>, parser: Parser) => {
        parserRef = parser;

        if (result.errors?.length) {
            const [firstError] = result.errors;
            callbacks.onError?.(new Error(firstError.message));
            parser.abort();
            return;
        }

        if (!headerEmitted && result.meta.fields) {
            headerEmitted = true;
            callbacks.onHeader?.(result.meta.fields);
        }

        const row = result.data;
        if (!row || !Object.keys(row).length) return;

        bufferedRows.push(row);
        if (bufferedRows.length >= chunkSize) {
            flushBuffer();
        }
    };

    const parser = parse<Row>(fileContents, {
        delimiter: ",",
        dynamicTyping: true,
        fastMode: true,
        header: true,
        skipEmptyLines: "greedy",
        worker: true,
        step: handleStep,
        complete: () => {
            flushBuffer();
            callbacks.onComplete?.();
        },
        error: (error: Error) => {
            callbacks.onError?.(error);
        },
    });

    return {
        abort: () => {
            if (parserRef) {
                parserRef.abort();
            } else if (typeof (parser as unknown as Papa.Parser)?.abort === "function") {
                (parser as unknown as Papa.Parser).abort();
            }
        },
    };
}
