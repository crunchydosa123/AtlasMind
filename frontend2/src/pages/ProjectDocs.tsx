import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import NewResourcePopover from "@/components/custom/NewResourcePopover";
import { useProjectContext } from "@/contexts/ProjectContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type Message = {
  role: "user" | "bot";
  content: string;
  pushed?: boolean; // optional
  selectedDoc?: string; // optional for dropdown
};

const ProjectDocs = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [pushingIndex, setPushingIndex] = useState<number | null>(null); // track which message is being pushed
  const { id } = useProjectContext();
  const { resources } = useProjectContext();

  const toggleResourceSelection = (res: any) => {
    setSelectedResources((prev) => {
      const exists = prev.find((r) => r.file_name === res.file_name);
      if (exists) {
        return prev.filter((r) => r.file_name !== res.file_name); // remove
      } else {
        return [...prev, res]; // add
      }
    });
  };

  // Send prompt to backend
  const handleSend = async () => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const res = await fetch(`${BACKEND_URL}/chat/llm?project_id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: prompt,
          selected_resources: selectedResources.map((r) => r.file_name),
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("Response from backend:", data);

      // Append bot response
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.llm_response || "No response from AI." },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error: Failed to reach the server." },
      ]);
    }

    setPrompt("");
  };

  // Push AI message to Google Doc
  const handlePushToGoogleDoc = async (
    content: string,
    idx: number,
    docId: string
  ) => {
    if (!docId) return;

    setPushingIndex(idx);
    try {
      const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please login.");
    }
      const res = await fetch(`${BACKEND_URL}/projects/push-to-docs`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
        body: JSON.stringify({ text: content, doc_url: `https://docs.google.com/document/d/${docId}/edit`
 }),
      });

      console.log(res)

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      console.log("✅ Successfully pushed:", data);
      setPushingIndex(null);

      setMessages((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, pushed: true } : m))
      );
    } catch (err) {
      console.error("Error pushing to Google Doc:", (err as any).detail);
      setPushingIndex(null);
      alert("⚠️ Failed to push to Google Doc");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Project: 123</h1>
          </div>

          {/* Resource / Document Popover */}
          <div className="flex justify-between">
            <h1>Document</h1>
            <NewResourcePopover />
          </div>

          {/* Linked Doc Card */}
          <div className="grid grid-cols-5">
            <div className="col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Linked Google Doc</CardTitle>
                  <CardDescription>
                    https://docs.google.com/document/d/example
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Chat / Edit Card */}
            <div className="col-span-2">
              <Card className="h-100 overflow-y-auto">
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Track recent changes, uploads, and actions for this project
                  </CardDescription>
                </CardHeader>

                <div className="p-4 space-y-3">
                  {resources?.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No recent activity found.
                    </p>
                  )}

                  {resources?.map((res: any) => {
                    const selected = selectedResources.some((r) => r.id === res.id);
                    return (
                      <div
                        key={res.id}
                        className={`flex flex-col border-b pb-2 cursor-pointer p-2 rounded
        hover:bg-gray-100
        ${selected ? "bg-blue-50 border-blue-300" : ""}
      `}
                        onClick={() => toggleResourceSelection(res)}
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
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Messages / AI Card */}
            <div className="col-span-3">
              <Card className="flex flex-col h-[500px]">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Edit Document via Prompt</CardTitle>
                  <CardDescription>
                    Interact with your document using AI prompts
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-3 px-4">
                  {messages.length === 0 && (
                    <p className="text-gray-400 text-center mt-4">
                      No messages yet. Start by typing a prompt below.
                    </p>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-100 text-right"
                            : "bg-gray-200 text-left"
                        } max-w-xs break-words`}
                      >
                        {msg.content}
                      </div>

                      {/* Push to Google Doc with dropdown */}
                      {msg.role === "bot" && (
                        <div className="mt-1 flex flex-col gap-1">
                          {msg.pushed ? (
                            <span className="text-green-600 text-xs font-medium">
                              ✅ Pushed to Google Doc
                            </span>
                          ) : (
                            <>
                              <select
                                className="border px-1 py-0.5 text-xs rounded"
                                value={msg.selectedDoc || ""}
                                onChange={(e) => {
                                  const selectedDoc = e.target.value;
                                  setMessages((prev) =>
                                    prev.map((m, i) =>
                                      i === idx ? { ...m, selectedDoc } : m
                                    )
                                  );
                                }}
                              >
                                <option value="">Select document</option>
                                {selectedResources.map((res) => (
                                  <option
                                    key={res.doc_id}
                                    value={res.doc_id}
                                  >
                                    {res.file_name}
                                  </option>
                                ))}
                              </select>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() =>
                                  handlePushToGoogleDoc(
                                    msg.content,
                                    idx,
                                    msg.selectedDoc || ""
                                  )
                                }
                                disabled={pushingIndex === idx || !msg.selectedDoc}
                              >
                                {pushingIndex === idx ? "Pushing..." : "Push to Google Doc"}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="flex flex-col flex gap-2 flex-shrink-0 border-t pt-2">
                  {/* Selected resources chips */}
                  {selectedResources.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pb-2 border-b">
                      {selectedResources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {res.file_name}
                          <button
                            className="ml-1 text-blue-600 hover:text-blue-800"
                            onClick={() => toggleResourceSelection(res)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="w-full flex justify-between">
                    <Input
                      placeholder="Type your prompt..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSend}>Send</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProjectDocs;
