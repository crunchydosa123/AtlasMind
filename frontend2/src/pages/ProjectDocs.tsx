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

const ProjectDocs = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [prompt, setPrompt] = useState("");
  const [pushingIndex, setPushingIndex] = useState<number | null>(null); // track which message is being pushed

  // Send prompt to backend
  const handleSend = async () => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

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
  const handlePushToGoogleDoc = async (content: string, idx: number) => {
    setPushingIndex(idx);
    try {
      const res = await fetch("http://127.0.0.1:8000/projects/push-to-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "text": content }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      console.log("✅ Successfully pushed:", data);
      setPushingIndex(null);

      // Optional visual feedback
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx ? { ...m, pushed: true } : m
        )
      );
    } catch (err) {
      console.error("Error pushing to Google Doc:", err);
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
                  <CardDescription>https://docs.google.com/document/d/example</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Chat / Edit Card */}
          <div className="col-span-5">
            <Card className="flex flex-col h-[500px]">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Edit Document via Prompt</CardTitle>
                <CardDescription>
                  Interact with your document using AI prompts
                </CardDescription>
              </CardHeader>

              {/* Scrollable message area */}
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

                    {/* Push to Google Doc button only for bot messages */}
                    {msg.role === "bot" && (
                      <div className="mt-1">
                        {msg.pushed ? (
                          <span className="text-green-600 text-xs font-medium">
                            ✅ Pushed to Google Doc
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              handlePushToGoogleDoc(msg.content, idx)
                            }
                            disabled={pushingIndex === idx}
                          >
                            {pushingIndex === idx
                              ? "Pushing..."
                              : "Push to Google Doc"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>

              {/* Input stays fixed at bottom */}
              <CardFooter className="flex gap-2 flex-shrink-0 border-t pt-2">
                <Input
                  placeholder="Type your prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSend}>Send</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProjectDocs;
