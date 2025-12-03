import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectCard } from "@/components/custom/ProjectCard";
import NewProjectPopover from "@/components/custom/NewProjectPopover";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/ProjectContext";
const BACKEND_URL = import.meta.env.VITE_API_URL;

type Project = {
  id: string;
  name: string;
  description: string;
  doc_url?: string;
  imageUrl?: string;
  avatars?: string[];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const { setProject } = useProjectContext();

  const selectProjectAndRedirect = (project: Project) => {
    setProject?.({
      id: project.id,
      name: project.name,
      doc_url: project.doc_url || "",
    });

    navigate(`/project/${project.id}`);
  };

  // Fetch projects from backend
  const getProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please login.");
    }

    const res = await fetch(`${BACKEND_URL}/projects/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Projects</h1>
          <NewProjectPopover />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.name}
              description={project.description}
              imageUrl={project.imageUrl || "/assets/image1.jpg"}
              onClick={() => selectProjectAndRedirect(project)}
            />
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Dashboard;
