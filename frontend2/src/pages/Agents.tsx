import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useCallback, useState } from "react";
import  { ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: "1",
    position: { x: 50, y: 100 },
    data: { label: "Graph Database Agent" },
    style: { background: "#E0F2FE", border: "1px solid #0284C7", padding: 10 },
  },
  {
    id: "2",
    position: { x: 300, y: 100 },
    data: { label: "LLM Context Agent" },
    style: { background: "#F1F5F9", border: "1px solid #475569", padding: 10 },
  },
  {
    id: "3",
    position: { x: 550, y: 100 },
    data: { label: "Query Resolver Agent" },
    style: { background: "#FEF3C7", border: "1px solid #F59E0B", padding: 10 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, label: "sends data" },
  { id: "e2-3", source: "2", target: "3", animated: true, label: "processes" },
];

const Agents = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Agents Workflow</h1>
          <SidebarTrigger />
        </div>

        <div className="h-[80vh] rounded-lg border shadow-sm bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Agents;
