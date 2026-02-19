import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "../components/ui/sidebar";
import LogSearchField from "./log-search-field";
import { Button } from "@/components/ui/button";
import { SettingsIcon, UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SettingsMenu from "./settings-menu";
import { useRef } from "react";
import { useDataContext } from "@/context/data-context";
import { usePapaParse } from "react-papaparse";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, setData } = useDataContext();

  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <SettingsIcon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Settings</DialogTitle>
              <SettingsMenu />
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <UploadLogButton /> 
            </TooltipTrigger>
            <TooltipContent>
              Upload CSV Log
            </TooltipContent>
          </Tooltip>
        </div>
        <LogSearchField headerFields={data?.meta.fields ?? []}/> 
      </SidebarHeader>
      <SidebarContent>
        {data?.meta.fields?.map((field: string) => (
          <div key={field} className="p-2 border-b border-border">{field}</div>
        ))}
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UploadLogButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { readString } = usePapaParse();
  const { data, setData } = useDataContext(); 
  
  const handleParse = async (e: InputEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const fileContent = await file.text();
    console.log(fileContent);
  };
  
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onInput={handleParse}
      />
      <Button 
        variant="outline" 
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon />
      </Button>
    </div>
  );
}
