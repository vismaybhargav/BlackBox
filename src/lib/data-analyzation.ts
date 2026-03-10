export function extractAxisData(
  data: Array<Record<string, unknown>>,
  key: string,
): number[] {
  return data
    .map((item, index) => {
      if (item[key] === undefined || item[key] === null) {
        console.warn(
          `Key "${key}" is missing in item:`,
          item,
          `at index ${index}. Returning NaN for this entry.`,
        );
        console.dir(data[index], { depth: null });
      }

      if (typeof item === "object" && item && key in item) {
        const value = item[key];
        if (typeof value === "number") {
          return value;
        } else {
          console.warn(
            `Expected a number for key "${key}", but got: ${value} as (${typeof value}). DID YOU SET DYNAMIC TYPING?`,
          );
        }
      }
      return NaN;
    })
    .filter((value): value is number => !isNaN(value));
}