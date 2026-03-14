import { extractAxisData } from "./data-analyzation";

export type DataRow = Record<string, unknown>;

export type DiscreteSegment = {
  startIndex: number;
  endIndex: number;
  label: string;
  color: string;
};

export type DiscreteLane = {
  topic: string;
  values: Array<string | null>;
  segments: DiscreteSegment[];
  supported: boolean;
};

const FALLBACK_X_TOPIC = "timeMillis";
const DISCRETE_PALETTE = [
  "#ca8a04",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#db2777",
];

export function getDefaultXTopic(fields: string[] | undefined): string {
  return fields?.[0] ?? FALLBACK_X_TOPIC;
}

export function getRows(data: { data?: unknown } | null | undefined): DataRow[] {
  if (!data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data as DataRow[];
}

export function extractRawAxisData(data: DataRow[], key: string): unknown[] {
  return data.map((item) => item[key]);
}

export function normalizeDiscreteValue(value: unknown): string | null {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    if (trimmed.toLowerCase() === "true") {
      return "true";
    }

    if (trimmed.toLowerCase() === "false") {
      return "false";
    }

    return trimmed;
  }

  return null;
}

export function getDiscreteStateColor(label: string): string {
  if (label === "true") {
    return "#c9a227";
  }

  if (label === "false") {
    return "#4f86c6";
  }

  let hash = 0;
  for (let index = 0; index < label.length; index += 1) {
    hash = (hash * 31 + label.charCodeAt(index)) >>> 0;
  }

  return DISCRETE_PALETTE[hash % DISCRETE_PALETTE.length] ?? DISCRETE_PALETTE[0];
}

export function buildDiscreteLanes(
  rows: DataRow[],
  topics: string[],
): DiscreteLane[] {
  return topics.map((topic) => {
    const values = extractRawAxisData(rows, topic).map(normalizeDiscreteValue);
    const segments: DiscreteSegment[] = [];
    let currentLabel: string | null = null;
    let segmentStart = -1;

    values.forEach((value, index) => {
      if (value === currentLabel) {
        return;
      }

      if (currentLabel !== null && segmentStart >= 0) {
        segments.push({
          startIndex: segmentStart,
          endIndex: index - 1,
          label: currentLabel,
          color: getDiscreteStateColor(currentLabel),
        });
      }

      currentLabel = value;
      segmentStart = value === null ? -1 : index;
    });

    if (currentLabel !== null && segmentStart >= 0) {
      segments.push({
        startIndex: segmentStart,
        endIndex: values.length - 1,
        label: currentLabel,
        color: getDiscreteStateColor(currentLabel),
      });
    }

    return {
      topic,
      values,
      segments,
      supported: values.some((value) => value !== null),
    };
  });
}

export function buildDiscretePlotData(
  xValues: number[],
  laneCount: number,
): uPlot.AlignedData {
  return [
    xValues,
    ...Array.from({ length: laneCount }, (_, index) =>
      xValues.map(() => index + 1),
    ),
  ];
}

export function formatTopicValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "—";
    }

    const fixed = value.toFixed(6);
    return fixed.replace(/\.?0+$/, "");
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function getCurrentRowIndex(
  requestedIndex: number | null,
  rowCount: number,
): number | null {
  if (rowCount === 0) {
    return null;
  }

  if (
    requestedIndex !== null &&
    requestedIndex >= 0 &&
    requestedIndex < rowCount
  ) {
    return requestedIndex;
  }

  return rowCount - 1;
}

export function getCurrentDiscreteValue(
  lane: DiscreteLane,
  rowIndex: number | null,
): string {
  if (rowIndex === null) {
    return "—";
  }

  return lane.values[rowIndex] ?? "—";
}

export function getXValues(rows: DataRow[], xTopic: string): number[] {
  return extractAxisData(rows, xTopic, "number");
}
