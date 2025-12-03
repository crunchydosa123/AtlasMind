import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type GraphNode = {
  id: number | string;
  label: string;
  group: string;
  x?: number;
  y?: number;
};

type GraphLink = {
  source: number | string;
  target: number | string;
  type?: string;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

type Props = {
  project_id?: string;
};

const KnowledgeGraph = (props: Props) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  const getProjectGraph = async () => {
    if (!props.project_id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/graph?project_id=${props.project_id}`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error("Failed to fetch graph:", err);
    }
  };

  useEffect(() => {
    getProjectGraph();
  }, []);

  return (
    <Card className="h-96 w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Knowledge Graph</CardTitle>
        <CardDescription>
          Visual representation of project entities and relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div>
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="group"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={() => "#000000"}
          linkWidth={2}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeCanvasObject={(node, ctx, globalScale) => {
  const n = node as GraphNode;

  // Draw the node circle
  const radius = 8; // adjust size
  ctx.beginPath();
  ctx.arc(n.x!, n.y!, radius, 0, 2 * Math.PI, false);

  // Color based on group
  if (n.group === "Project") ctx.fillStyle = "#1f77b4"; // blue
  else if (n.group === "Resource") ctx.fillStyle = "#ff7f0e"; // orange
  else ctx.fillStyle = "#2ca02c"; // green for Concept

  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw the label
  const fontSize = 12 / globalScale;
  ctx.font = `${fontSize}px Sans-Serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(n.label, n.x!, n.y! + radius + 10);
}}

        />
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraph;
