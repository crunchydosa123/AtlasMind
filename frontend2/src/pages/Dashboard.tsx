import { AppSidebar } from "@/components/custom/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const Dashboard = () => {
  return (
     <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        
      </main>
    </SidebarProvider>
  )
}

export default Dashboard