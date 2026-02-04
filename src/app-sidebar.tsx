import type React from "react";
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, Sidebar } from "./components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>
      </SidebarContent>
      <SidebarFooter>

      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
