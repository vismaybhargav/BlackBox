type AxisDataType = "auto" | "number" | "string";

export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
  type: "number",
): number[];
export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
  type: "string",
): string[];
export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
  type?: "auto",
): number[] | string[];
export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
  type: AxisDataType = "auto",
): number[] | string[] {
  const firstDefinedValue = data.find(
    (item) => item[key] !== undefined && item[key] !== null,
  )?.[key];
  const resolvedType =
    type === "auto" ? (typeof firstDefinedValue === "string" ? "string" : "number") : type;

  return data.map((item, index) => {
    if (item[key] === undefined || item[key] === null) {
      console.warn(`Key "${key}" is missing in item:`, item, `at index ${index}.`);
      console.dir(data[index], { depth: null });
      return resolvedType === "string" ? "" : NaN;
    }

    if (typeof item === "object" && item && key in item) {
      const value = item[key];

      if (resolvedType === "string") {
        if (typeof value === "string") {
          return value;
        }

        if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        }

        console.warn(
          `Expected a string-like value for key "${key}", but got: ${value} as (${typeof value}).`,
        );
        return "";
      }

      if (typeof value === "number") {
        return value;
      }

      if (typeof value === "string" && value.trim() !== "") {
        const parsedValue = Number(value);
        if (!Number.isNaN(parsedValue)) {
          return parsedValue;
        }
      }

      console.warn(
        `Expected a numeric value for key "${key}", but got: ${value} as (${typeof value}).`,
      );
    }

    return NaN;
  });
}
