import { parse, ParseResult } from 'papaparse'

type Row = Record<string, unknown>;

export async function parseCSV(fileContents: string) {
    parse<Row>(fileContents, {
        delimiter: ",",
        dynamicTyping: true,
        fastMode: true,
        header: true,
        complete: (res: ParseResult<Row>) => {

        },
        error: (error: Error) => {
            return Promise.reject(error.name);
        }
    });
}