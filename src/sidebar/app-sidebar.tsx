import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "../components/ui/sidebar";
import TopicSearchField from "./topic-search-field";
import { Button } from "@/components/ui/button";
import { BoxIcon, SettingsIcon, UploadIcon } from "lucide-react";
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
        <div className="flex gap-1 w-full items-center">
          <h1 className="text-2xl font-bold tasa-orbiter-font align-baseline">BlackBox</h1>
          <BoxIcon size={36} fill="true" stroke="white"/> 
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
        <TopicSearchField headerFields={data?.meta.fields ?? []}/> 
      </SidebarHeader>
      <SidebarContent>
        <div className="flex-col">
          <h1 className="justify-self-center">Topics</h1>
          {data?.meta.fields?.map((field: string) => (
            <div key={field} className="p-2 border">{field}</div>
          ))}
        </div>
        
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
  
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onInput={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;
          const fileContent = await file.text();

          readString(fileContent, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              setData(results);
            },
            error: (error) => {
              console.error("Error parsing CSV:", error);
            },
          });
        }}
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
