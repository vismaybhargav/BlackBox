import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETTINGS, SettingsContext, type SettingOptions } from "@/context/settings-context";
import { typedEntries } from "@/lib/typed-entries";
import { useContext } from "react"

export default function SettingsMenu() {
    return (
        <div className="space-y-4">
            {typedEntries(SETTINGS).map(([key, option]) => {
                if(option.type === "string") {
                    return <SettingSelectMenuItem key={key} settingKey={key} />
                }
            })}
        </div>
    )
}

function SettingSelectMenuItem<K extends keyof SettingOptions>({ settingKey }: { settingKey: K }) {
    const option = SETTINGS[settingKey];
    const { settings, setSetting } = useContext(SettingsContext);
    const currentSetting = settings[settingKey];
    
    if (option.type !== "string") {
        return null;
    }

    return (
        <div className="flex justify-between">
            <Label className="text-md" htmlFor={settingKey}>{option.label}</Label>
            <Select 
                defaultValue={currentSetting}
                onValueChange={(value) => setSetting(settingKey, value)}
            >
                <SelectTrigger id={settingKey}>
                    <SelectValue>
                        {option.choices.find(choice => choice.value === currentSetting)?.label}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {option.choices.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>{choice.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
