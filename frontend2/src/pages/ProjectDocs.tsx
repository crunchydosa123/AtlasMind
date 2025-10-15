import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // optional for chat input
import { useState } from "react";
import NewResourcePopover from "@/components/custom/NewResourcePopover";

const ProjectDocs = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    if (!prompt.trim()) return;
    setMessages([...messages, { role: "user", content: prompt }]);
    setMessages(prev => [
      ...prev,
      { role: "user", content: prompt },
      { role: "bot", content: `AI Response to: "${prompt}"` }
    ]);
    setPrompt("");
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
                  <CardDescription>https://sheets.google.com</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Chat / Edit Card */}
          <div className="col-span-5">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Edit Document via Prompt</CardTitle>
                <CardDescription>Interact with your document using AI prompts</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 && <p className="text-gray-400">No messages yet. Start by typing a prompt below.</p>}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-md ${msg.role === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"} max-w-xs`}
                  >
                    {msg.content}
                  </div>
                ))}
              </CardContent>

              <CardFooter className="flex gap-2">
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
