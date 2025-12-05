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
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjectContext } from "@/contexts/ProjectContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

type Document = {
  id: string;
  name: string;
  modified_time: string;
  owners: string;
};

const ProjectResources = () => {
  const token = localStorage.getItem("token");
  const { id: projectId } = useParams<{ id: string }>();
  const { id:pID, name } = useProjectContext();
  
  console.log("id: ", pID);

  const [resources, setResources] = useState<Resource[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);

  // --- NEW: selected Google Docs ---
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const toggleDocSelection = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === docs.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(docs.map((d) => d.id));
    }
  };

  // -------- Fetch Project Resources --------
  const getProjectResources = async () => {
    if (!projectId || !token) return [];

    const res = await fetch(`${BACKEND_URL}/resources/project/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch resources:", res.status);
      return [];
    }

    return res.json();
  };

  // -------- Fetch Google Docs --------
  const getDocs = async () => {
    if (!token) throw new Error("No token found. Please login.");

    const res = await fetch(`${BACKEND_URL}/google-services/docs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch docs.");

    //const data = await res.json();
    //console.log(data);
    return res.json();
  };

  const importSelectedDocs = async () => {
    if (!token || !projectId) return;

    // Prepare the docs we are sending
    const selected = docs
      .filter((doc) => selectedDocs.includes(doc.id))
      .map((doc) => ({
        id: doc.id,
        name: doc.name,
        modified_time: doc.modified_time,
      }));

    const res = await fetch(
      `${BACKEND_URL}/google-services/import-docs?project_id=${projectId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ docs: selected }),
      }
    );

    if (!res.ok) {
      console.error("Failed to import docs", res);
      return;
    }

    const data = await res.json();
    console.log("Import results:", data);

    // Refresh project resources
    const updatedRes = await getProjectResources();
    setResources(updatedRes);

    // Clear selections
    setSelectedDocs([]);
  };


  useEffect(() => {
    const fetchProjectResources = async () => {
      try {
        const res = await getProjectResources();
        setResources(res);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchGoogleDocs = async () => {
      try {
        const data = await getDocs();

        const formattedDocs: Document[] = data.documents.files.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          modified_time: doc.modifiedTime,
          owners: doc.owners.map((o: any) => o.displayName).join(", "),
        }));

        setDocs(formattedDocs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjectResources();
    fetchGoogleDocs();
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

          {/* ----------- Resources Section ----------- */}
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
                      {res.parsed_text
                        ? `${res.parsed_text.slice(0, 30)}${res.parsed_text.length > 30 ? "..." : ""
                        }`
                        : "-"}
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

          {/* --------------------------------------------- */}
          {/* GOOGLE DOCUMENTS TABLE */}
          {/* --------------------------------------------- */}

          <div className="mt-12">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold">Documents from Google Drive</h1>

              {selectedDocs.length > 0 && (
                <Button variant="default" onClick={importSelectedDocs}>
                  Import {selectedDocs.length} Document
                  {selectedDocs.length > 1 ? "s" : ""}
                </Button>
              )}

            </div>

            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedDocs.length === docs.length && docs.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>

                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Owners</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {docs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          onCheckedChange={() => toggleDocSelection(doc.id)}
                        />
                      </TableCell>

                      <TableCell className="font-medium">{doc.name}</TableCell>

                      <TableCell>
                        {new Date(doc.modified_time).toLocaleString()}
                      </TableCell>

                      <TableCell>{doc.owners}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProjectResources;
