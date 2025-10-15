import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewProjectPopover from "@/components/custom/NewProjectPopover";
import AllResourcesTable from "@/components/custom/AllResourcesTable";

const AllResources = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Resources</h1>
          <NewProjectPopover />
        </div>

        {/* Projects Grid */}
        <div className=" gap-6">
          <AllResourcesTable/>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AllResources;
