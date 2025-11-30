import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewResourcePopover from "@/components/custom/NewResourcePopover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjectContext } from "@/contexts/ProjectContext";

type Resource = {
  id: string;
  created_by: string;
  project_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  parsed_text: string;
  created_at: string;
};

const ProjectResources = () => {
  //checking vercel, ignore comment
  const token = localStorage.getItem("token");
  const { id: projectId } = useParams<{ id: string }>();
  const { name } = useProjectContext()
  const [resources, setResources] = useState<Resource[]>([]);

  const getProjectResources = async () => {
    if (!projectId || !token) return [];

    const res = await fetch(`https://atlasmind.onrender.com/resources/project/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch resources:", res.status);
      return [];
    }

    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const fetchProjectResources = async () => {
      try {
        const projResources = await getProjectResources();
        setResources(projResources);
      } catch (error: any) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchProjectResources();
  }, [projectId, token]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Project: {name}</h1>
          </div>

          <div className="flex justify-between">
            <h1 className="text-lg font-semibold">Resources</h1>
            <NewResourcePopover />
          </div>

          <Table>
            <TableCaption>A list of your project resources.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Uploaded on</TableHead>
                <TableHead className="text-right">Uploaded by</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {resources.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} className="text-center">
        No resources found
      </TableCell>
    </TableRow>
  ) : (
    resources.map((res) => (
      <TableRow key={res.id}>
        <TableCell className="font-medium">{res.file_name}</TableCell>
        <TableCell>{res.file_type}</TableCell>
        <TableCell>
          {res.parsed_text ? `${res.parsed_text.slice(0, 30)}${res.parsed_text.length > 30 ? "..." : ""}` : "-"}
        </TableCell>
        <TableCell className="text-right">
          {new Date(res.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">{res.created_by}</TableCell>
      </TableRow>
    ))
  )}
</TableBody>

          </Table>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProjectResources;
