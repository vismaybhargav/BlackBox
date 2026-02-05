import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "../components/ui/sidebar";
import LogSearchField from "./log-search-field";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { CSVData } from "@/context/data-context";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: CSVData | null;
};

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Menu />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Settings</DialogTitle>
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <LogSearchField headerFields={data?.meta.fields ?? []}/> 
      </SidebarHeader>
      <SidebarContent>
        {data?.meta.fields?.map((field) => (
          <div key={field} className="p-2 border-b border-border">{field}</div>
        ))}
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
