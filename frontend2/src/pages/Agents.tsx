import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useCallback, useEffect, useState } from "react";

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState
} from "@xyflow/react";
import type { Node as FlowNode, Edge as FlowEdge, OnConnect, Connection } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useProjectContext } from "@/contexts/ProjectContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Map actions to output rules
const actionOutputMap: Record<string, { mode: "locked" | "filtered" | "free"; type?: string }> = {
  summarise: { mode: "filtered", type: "google doc" },
  detail: { mode: "filtered", type: "google doc" },
  paraphrase: { mode: "filtered", type: "google doc" },

  add_event: { mode: "locked", type: "calendar" },
  update_event: { mode: "locked", type: "calendar" },

  add_task: { mode: "locked", type: "google doc" },
  mark_done: { mode: "locked", type: "google doc" },
  assign_to_user: { mode: "locked", type: "task" },

  create_contact: { mode: "locked", type: "contact" },
};

const Agents = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  const { resources } = useProjectContext();

  const [input, setInput] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  console.log(selectedWorkflow)
  const onConnect: OnConnect = useCallback(
    (params: Connection | FlowEdge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleActionChange = (a: string) => {
    setAction(a);
    const rule = actionOutputMap[a];
    setOutput(rule?.mode === "locked" ? rule.type || null : null);
  };

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/agents/workflows/list`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data)
      setWorkflows(data);
    } catch (err) {
      console.error("Error fetching workflows:", err);
    }
  };

  // Convert a single workflow to React Flow nodes/edges
  const convertWorkflowToFlow = (wf: any) => {
    if (!wf) return { nodes: [], edges: [] };
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    console.log("wf:", wf)
    const inputId = wf.input;
    const outputId = wf.output;
    const llm = wf.llm;
    const action = wf.action;
    const actionId = `ac-${wf.workflow_id}`;

    nodes.push({
      id: inputId,
      type: "default",
      data: { label: `Resource: ${inputId}` },
      position: { x: 20, y: 100 },
    });

    nodes.push({
      id: actionId,
      type: "default",
      data: { label: `Action: ${llm} and Action: ${action}` },
      position: { x: 300, y: 100 },
      connectable: true
    });


    nodes.push({
      id: outputId,
      type: "default",
      data: { label: `Resource: ${outputId}` },
      position: { x: 550, y: 100 },
    });

    edges.push({ id: `e-${inputId}-${actionId}`, source: inputId, target: actionId, animated: true });
    edges.push({ id: `e-${actionId}-${outputId}`, source: actionId, target: outputId, animated: true });
    
    
    //edges.push({ id: `e-${workflowNodeId}-${outputId}`, source: workflowNodeId, target: outputId, animated: true });

    return { nodes, edges };
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    // Render selected workflow
    const wf = workflows.find((w) => `wf-${w.workflow_id}` === selectedWorkflow);
    const { nodes, edges } = convertWorkflowToFlow(wf);
    setNodes(nodes);
    setEdges(edges);
  }, [selectedWorkflow, workflows]);

  const handleCreateWorkflow = async () => {
    if (!input || !action) return alert("Please select input and action");

    const body = { input, llm: prompt || action, output: output === "auto" ? null : output, action };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/agents/create-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log(data);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
      alert("Error creating workflow");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Agents Workflow</h1>
          <SidebarTrigger />
        </div>

        <div className="flex gap-4">
          {/* Graph */}
          <div className="flex-1 h-[80vh] rounded-lg border shadow-sm bg-white">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
              <MiniMap />
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>

          {/* Workflow Builder */}
          <div className="w-96 bg-white border rounded-lg shadow-sm p-4 h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create / Run Workflow</h2>

            {/* Create Workflow */}
            <label className="text-sm font-medium">Input Resource</label>
            <Select onValueChange={setInput}>
              <SelectTrigger className="w-full mt-1 mb-4"><SelectValue placeholder="Select resource" /></SelectTrigger>
              <SelectContent>
                {resources?.map((r) => <SelectItem key={r.id} value={r.id}>{r.file_name}</SelectItem>)}
              </SelectContent>
            </Select>

            <label className="text-sm font-medium">LLM Action</label>
            <Select onValueChange={handleActionChange}>
              <SelectTrigger className="w-full mt-1 mb-4"><SelectValue placeholder="Select action" /></SelectTrigger>
              <SelectContent>{Object.keys(actionOutputMap).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-sm font-medium">Prompt</label>
            <Input className="mt-1 mb-4" placeholder="Enter custom LLM prompt..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />

            <div className="mt-4">
              <label className="text-sm font-medium">Output Resource</label>
              {action && actionOutputMap[action]?.mode === "locked" ? (
                <div className="p-2 mt-2 rounded bg-green-100 text-green-900 border border-green-300">
                  Output locked to: <b>{actionOutputMap[action].type}</b> by action "{action}"
                </div>
              ) : (
                <Select onValueChange={setOutput}>
                  <SelectTrigger className="w-full mt-1 mb-4"><SelectValue placeholder="Select output resource" /></SelectTrigger>
                  <SelectContent>
                    {action && actionOutputMap[action]?.mode === "filtered"
                      ? resources?.filter((r) => r.file_type === actionOutputMap[action].type).map((r) => <SelectItem key={r.id} value={r.id}>{r.file_name}</SelectItem>)
                      : <>
                          <SelectItem value="auto">Create new</SelectItem>
                          {resources?.map((r) => <SelectItem key={r.id} value={r.id}>{r.file_name}</SelectItem>)}
                        </>
                    }
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button className="w-full mt-4" onClick={handleCreateWorkflow}>Create Workflow</Button>

            {/* Run Existing Workflow */}
            <div className="mt-6">
              <label className="text-sm font-medium">Select Existing Workflow</label>
              <Select onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="w-full mt-1 mb-4"><SelectValue placeholder="Choose workflow" /></SelectTrigger>
                <SelectContent>
                  {workflows.map((w) => (
                    <SelectItem key={w.workflow_id} value={`${w.workflow_id}`}>
                      {w.action.toUpperCase()} ({w.input} → {w.output})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full mt-2"
                onClick={async () => {
                  if (!selectedWorkflow) return alert("Select a workflow first");
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${BACKEND_URL}/agents/workflows/run?workflow_id=${selectedWorkflow}`, {
                      method: "GET",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    alert(`Workflow ${selectedWorkflow} executed successfully!`);
                    console.log("Run Workflow Result:", data);
                  } catch (err) {
                    console.error(err);
                    alert("Error running workflow");
                  }
                }}
              >
                Run Workflow
              </Button>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Agents;
