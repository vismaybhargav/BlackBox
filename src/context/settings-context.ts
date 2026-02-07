import { createContext } from "react";

type SettingOptions = {
    discreteDataRenderingType: "band" | "bg",
    continuousDataRenderingType: "smooth" | "stepped",
    chartingLibrary: "uplot" | "recharts",
};

export const SettingsContext = createContext<SettingOptions>({
    discreteDataRenderingType: "band",
    continuousDataRenderingType: "smooth",
    chartingLibrary: "uplot"
});
