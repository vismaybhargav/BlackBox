import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "../components/ui/sidebar";
import LogSearchField from "./log-search-field";
import { Button } from "@/components/ui/button";
import { SettingsIcon, UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ParseResult } from "papaparse";
import SettingsMenu from "./settings-menu";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: ParseResult<unknown> | null;
};

export function AppSidebar({ data, ...props }: AppSidebarProps) {
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
              <Button variant="outline">
                <UploadIcon />
              </Button>
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
