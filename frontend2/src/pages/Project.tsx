import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import KnowledgeGraph from "@/components/custom/KnowlegdeGraph";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useEffect } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Project = () => {
  const { id, name, resources, setResources } = useProjectContext();
  const params = useParams();
  const navigate = useNavigate();
  console.log("projectId from context: ", id);

  useEffect(() => {
    const fetchResources = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BACKEND_URL}/resources/project/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log(data)
        setResources?.(data || []);
        console.log("resources: ", resources)
      } catch (err) {
        console.error("Error fetching project resources:", err);
        setResources?.([]);
      }
    };

    fetchResources();
  }, [id]);

  useEffect(() => {
    console.log("resources updated: ", resources);
  }, [resources]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">{name}</h1>

          </div>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add a Resource</CardTitle>
                  <CardDescription>Add documents, Excel sheets, PDFs to project memory</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => navigate(`/project/${id}/resources?addResource=true`)}>Add Resource</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Write a Document</CardTitle>
                  <CardDescription>Create a new document in project memory</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => navigate(`/project/${id}/write-doc`)}>Write Document</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edit a Spreadsheet</CardTitle>
                  <CardDescription>Update Excel sheets or CSVs in the project</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" disabled={true}>WIP</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Query with LLM</CardTitle>
                  <CardDescription>Chat with the project using AI (Large Language Models)</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" disabled={true}>Work in Progress</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Knowledge Graph and Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <KnowledgeGraph project_id={params.id} />

            <Card className="h-100 overflow-y-auto">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Track recent changes, uploads, and actions for this project</CardDescription>
              </CardHeader>

              <div className="p-4 space-y-3">
                {resources?.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                )}

                {resources?.map((res: any) => (
                  <div
                    key={res.id}
                    className="flex flex-col border-b pb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => navigate(`/project/${id}/resources/${res.id}`)}
                  >
                    <span className="font-medium text-sm">{res.file_name}</span>
                    <span className="text-xs text-gray-500">{res.file_type}</span>

                    {res.updated_at && (
                      <span className="text-xs text-gray-400">
                        Updated: {new Date(res.updated_at).toLocaleString()}
                      </span>
                    )}
                    {res.created_at && (
                      <span className="text-xs text-gray-400">
                        Created: {new Date(res.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

          </section>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Project;
