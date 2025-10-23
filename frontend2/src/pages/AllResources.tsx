import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewProjectPopover from "@/components/custom/NewProjectPopover";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import NewResourcePopover from "@/components/custom/NewResourcePopover";

const AllResources = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const getResources = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");

    const res = await fetch("http://127.0.0.1:8000/resources/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch resources");
    return await res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getResources();
        setResources(data);
        console.log(data)
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    })();
  }, []);

  // Filter based on search input (case-insensitive)
  const filteredResources = resources.filter(
    (r) =>
      r.file_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.Projects?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Resources</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search resources or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Resource Name</th>
                <th className="py-3 px-4 text-left">Project Name</th>
                <th className="py-3 px-4 text-left">Project ID</th>
                <th className="py-3 px-4 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{r.file_name || "—"}</td>
                  <td className="py-3 px-4">{r.Projects?.name || "—"}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{r.project_id}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AllResources;
