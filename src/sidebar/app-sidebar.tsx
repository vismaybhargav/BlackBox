import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "../components/ui/sidebar";
import LogSearchField from "./log-search-field";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        </div>
        <LogSearchField /> 
      </SidebarHeader>
      <SidebarContent>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
