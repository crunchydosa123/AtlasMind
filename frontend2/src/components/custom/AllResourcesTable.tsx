import { Card } from "@/components/ui/card";
import { KnowledgeGraph } from "KnowledgeGraph";

interface Resource {
  id: string;
  project_id: string;
  Projects: {
    name: string;
  };
}

const AllResourcesTable = ({ resources }: { resources: Resource[] }) => {
  if (!resources || resources.length === 0) {
    return <p className="text-gray-500">No resources found.</p>;
  }

  return (
    <Card className="p-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left">Resource ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Project Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Project ID</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((res) => (
            <tr key={res.id}>
              <td className="border border-gray-300 px-4 py-2">{res.id}</td>
              <td className="border border-gray-300 px-4 py-2">{res.Projects?.name || "N/A"}</td>
              <td className="border border-gray-300 px-4 py-2">{res.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default AllResourcesTable;
