import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const NewResourcePopover = () => {
  const token = localStorage.getItem("token");
  const { id: projectId } = useParams<{ id: string }>();
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadResource = async () => {
    if (files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("project_id", projectId!);
    formData.append("file", files[0]);

    try {
      const res = await fetch("http://127.0.0.1:8000/resources/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData
      });

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      console.log('file uploaded successfully', data)
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    }
  }

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline">Add Resource to this Project</Button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent className="w-80 z-50">
          <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Resource</CardTitle>
                <CardDescription>Add documents or sheets to this project</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input placeholder="Resource Name" />
                </div>

                {/* File Drop Area */}
                <div className="my-4 grid gap-2">
                  <Label>Upload Files</Label>
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-gray-400"
                  >
                    <span>Drag & drop files here or click to select</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {files.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700">
                      {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" variant="default" onClick={uploadResource}>
                  Create Resource
                </Button>
              </CardFooter>
            </Card>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default NewResourcePopover;
