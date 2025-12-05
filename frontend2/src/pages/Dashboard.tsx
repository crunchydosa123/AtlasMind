import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectCard } from "@/components/custom/ProjectCard";
import NewProjectPopover from "@/components/custom/NewProjectPopover";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/ProjectContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type Project = {
  id: string;
  name: string;
  description: string;
  doc_url?: string;
  imageUrl?: string;
  avatars?: string[];
};

type Document = {
  id: string;
  name: string;
  modified_time: string;
  owners: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const { setProject } = useProjectContext();

  const selectProjectAndRedirect = (project: Project) => {
    setProject?.({
      id: project.id,
      name: project.name,
      doc_url: project.doc_url || "",
    });
    console.log(project.id);

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
    console.log(res)

    if (!res.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data = await res.json();
    return data;
  };

  const getDocs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please login.");
    }

    const res = await fetch(`${BACKEND_URL}/google-services/docs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch projects: ");
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

    const fetchDocs = async () => {
      try {
        const data = await getDocs();
        const formattedDocs: Document[] = data.documents.files.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          modified_time: doc.modifiedTime,
          owners: doc.owners.map((o: any) => o.displayName).join(", "),
        }));
        setDocs(formattedDocs);
      } catch (err: any) {
        console.error("Error fetching docs:", err);
      }
    };

    fetchProjects();
    fetchDocs();
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

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Google Docs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-500">Modified: {new Date(doc.modified_time).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Owners: {doc.owners}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Dashboard;
