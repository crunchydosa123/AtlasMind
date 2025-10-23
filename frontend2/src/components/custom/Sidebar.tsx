import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Home, Inbox } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts/UserContext";
import { Card } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";

const items = [
  { title: "Projects", url: "/project", icon: Home, redirect: "/projects" },
  { title: "Resources", url: "/resources", icon: Inbox, redirect: "/resources"  },
  { title: "Agents", url: "/agents", icon: Calendar, redirect: "/agents"  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser()
  const location = useLocation();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Optional: remove other user-related info
    localStorage.removeItem("user");
    setUser(null)

    // Redirect to login page
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Card className="p-2">
          <div className="flex justify-start gap-1 items-center">
            <img src="/assets/logo.png" className="h-12 w-12 ml-1" />
            <div className="text-2xl font-bold">MindGrid</div>
          </div>
        </Card>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      variant={isActive ? 'active' : 'outline'}
                    >
                      <a href={item.redirect} className="flex items-center gap-2 p-2 rounded-md">
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
                <Button onClick={handleLogout}>Logout</Button>
              </DropdownMenuLabel>
            </Card>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
