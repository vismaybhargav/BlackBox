import { createContext } from "react";

type SettingOptions = {
    discreteDataRenderingType: "band" | "bg",
    continuousDataRenderingType: "smooth" | "stepped",
};

export const SettingsContext = createContext<SettingOptions>({
    discreteDataRenderingType: "band",
    continuousDataRenderingType: "smooth",
});