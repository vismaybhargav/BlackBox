import Papa from "papaparse";

type Row = {
	TIME_MILLIS: string,
	TIME_ELAPSED: string,
	PRESSURE: string,
	ALT: string,
	ALT_V: string,
	PREDICTED_APOGEE: string,
	DRAG_COEF_CMD: string,
	DRAG_ANGLE: string,
	FLIGHT_STATE: string
};

const input = document.querySelector<HTMLInputElement>("#fileInput");
if (!input) throw new Error("Missing fileInput element");

input.addEventListener("change", () => {
	const file = input.files?.[0];
	console.log(file);
	if (!file) return;

	Papa.parse<Row>(file, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: false,
		complete: (results) => {
			if (results.errors.length) {
				console.log("CSV Parse Errors: ", results.errors);
				return;
			}

			const rows = results.data;
			const headers = results.meta.fields ?? (rows[0] ? Object.keys(rows[0]) : []);

			console.log("headers: ", headers);
			console.log("rows: ", rows);
		}
	}
	);
});
