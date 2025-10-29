import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import KnowledgeGraph from "@/components/custom/KnowlegdeGraph";
import { useProjectContext } from "@/contexts/ProjectContext";

const Project = () => {
  const { id, name } = useProjectContext()
  const params = useParams()
  const navigate = useNavigate();
  console.log("projectId: ", params.id);
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
                  <Button className="w-full" onClick={()=> navigate(`/project/${id}/resources?addResource=true`)}>Add Resource</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Write a Document</CardTitle>
                  <CardDescription>Create a new document in project memory</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={()=> navigate(`/project/${id}/write-doc`)}>Write Document</Button>
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
                  <Button className="w-full" disabled={true}>Work in Process</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Knowledge Graph and Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <KnowledgeGraph project_id={params.id} />

            <Card className="h-64">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track recent changes, uploads, and actions in this project</CardDescription>
              </CardHeader>
            </Card>
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Project;
