
import React, { createContext, useMemo, useState } from "react";

export type SettingOptions = {
  discreteDataRenderingType: "band" | "bg";
  continuousDataRenderingType: "smooth" | "stepped";
  chartingLibrary: "uplot" | "recharts";
};

type Option<V extends string | number | boolean> = {
  default: V;
  label: string;
  type: "string" | "number" | "boolean";
  choices: readonly { value: V; label: string }[];
  tooltip?: string;
};

type SettingsMap = { [K in keyof SettingOptions]: Option<SettingOptions[K]> };

export const SETTINGS: SettingsMap = {
  discreteDataRenderingType: {
    default: "band",
    label: "Discrete Data Rendering Type",
    type: "string",
    choices: [
      { value: "band", label: "Band" },
      { value: "bg", label: "Background" },
    ] as const,
  },
  continuousDataRenderingType: {
    default: "smooth",
    label: "Continuous Data Rendering Type",
    type: "string",
    choices: [
      { value: "smooth", label: "Smooth" },
      { value: "stepped", label: "Stepped" },
    ] as const,
  },
  chartingLibrary: {
    default: "uplot",
    label: "Charting Library",
    type: "string",
    choices: [
      { value: "uplot", label: "uPlot" },
      { value: "recharts", label: "ReCharts" },
    ] as const,
    tooltip: "Note: ReCharts (SVG Based) doesn't support large datasets well. Use uPlot (Canvas Based) for better performance with large logs.",
  },
};

type SettingsContextValue = {
  settings: SettingOptions;
  setSetting: <K extends keyof SettingOptions>(key: K, value: unknown) => void;
};

const defaultSettings: SettingOptions = {
  discreteDataRenderingType: SETTINGS.discreteDataRenderingType.default,
  continuousDataRenderingType: SETTINGS.continuousDataRenderingType.default,
  chartingLibrary: SETTINGS.chartingLibrary.default,
};

export const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  setSetting: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingOptions>(defaultSettings);

  const setSetting: SettingsContextValue["setSetting"] = (key, value) => {
    if(value === undefined) return;
    
    const option = SETTINGS[key];   
    if(!option) {
      console.warn(`Invalid setting key: ${key}`);
      return;
    }

    switch (option.type) {
      case "string":
        if (typeof value !== "string") {
          console.warn(`Invalid value type for ${key}. Expected string.`);
          return;
        }
        break;
      case "number":
        if (typeof value !== "number") {
          console.warn(`Invalid value type for ${key}. Expected number.`);
          return;
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {       
          console.warn(`Invalid value type for ${key}. Expected boolean.`);
          return;
        }
        break;
    }
            
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const ctx = useMemo(() => ({ settings, setSetting }), [settings]);

  return <SettingsContext.Provider value={ctx}>{children}</SettingsContext.Provider>;
}
