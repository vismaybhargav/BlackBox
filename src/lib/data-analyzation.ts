export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
): number[] {
  return data.map((item, index) => {
    if (item[key] === undefined || item[key] === null) {
      console.warn(
        `Key "${key}" is missing in item:`,
        item,
        `at index ${index}. Returning NaN for this entry.`,
      );
      console.dir(data[index], { depth: null });
      return NaN;
    }

    if (typeof item === "object" && item && key in item) {
      const value = item[key];
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
