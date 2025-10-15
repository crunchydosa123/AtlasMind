import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";

type Props = {}

const NewProjectPopover = (props: Props) => {
  const token = localStorage.getItem("token");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Project title is required");

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: title,
          description,
          sheet_id: sheetId || undefined,
          doc_id: docId || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      const data = await res.json();
      console.log("Project created:", data);
      alert("Project created successfully!");
      // Optionally reset form
      setTitle("");
      setDescription("");
      setSheetId("");
      setDocId("");

    } catch (err: any) {
      console.error(err);
      alert("Error creating project: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button variant={'outline'}>New project</Button>
      </PopoverTrigger>

      <PopoverContent>
        <div className="space-y-2 w-80">
          <Card>
            <CardHeader>
              <CardTitle>Make a new project</CardTitle>
              <CardDescription>Create a new project here</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={addProject} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-title">Name</Label>
                  <Input
                    id="project-title"
                    type="text"
                    placeholder="Mera Joota hai Japani"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Input
                    id="project-description"
                    type="text"
                    placeholder="Project description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="doc-id">Document ID (optional)</Label>
                  <Input
                    id="doc-id"
                    type="text"
                    placeholder="docs.google.com/..."
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sheet-id">Sheet ID (optional)</Label>
                  <Input
                    id="sheet-id"
                    type="text"
                    placeholder="docs.google.com/..."
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                  />
                </div>

                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    variant={'default'}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Project"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NewProjectPopover;
