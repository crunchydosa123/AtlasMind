import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectCard } from "@/components/custom/ProjectCard";
import NewProjectPopover from "@/components/custom/NewProjectPopover";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import NewResourcePopover from "@/components/custom/NewResourcePopover";

const ProjectResources = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Project: 123</h1>

          </div>
          <div className="flex justify-between">
            <h1>Resources</h1>
            <NewResourcePopover />
          </div>

          <Table>
            <TableCaption>A list of your project resources.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Uploaded on</TableHead>
                <TableHead className="text-right">Uploaded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Resource 1.docx</TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Guidelines_doc.docx</TableCell>
                <TableCell className="text-right">1 Oct 2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProjectResources;
