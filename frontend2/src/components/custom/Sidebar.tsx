import { useLocation } from "react-router-dom";
import { Calendar, Home, Inbox, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts/UserContext";
import { Card } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";

const items = [
  { title: "Projects", url: "/projects", icon: Home },
  { title: "Resources", url: "/resources", icon: Inbox },
  { title: "Agents", url: "/agents", icon: Calendar },
  { title: "Documents", url: "/documents", icon: Search },
];

export function AppSidebar() {
  const { user } = useUser()
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      variant={isActive ? 'active' : 'outline'}
                    >
                      <a href={item.url} className="flex items-center gap-2 p-2 rounded-md">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant={'outline'}>{user?.name} </Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <Card className="bg-0">
                <DropdownMenuLabel className="p-4">
                  <Button>Logout</Button>
                </DropdownMenuLabel>
              </Card>
              
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
