import Papa from 'papaparse'

async function parseCSV(filename: string) {
    let data = Papa.parse(filename);
}