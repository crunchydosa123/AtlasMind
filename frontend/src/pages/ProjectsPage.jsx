import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useUser } from "../contexts/UserContext";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
  if (!user) return;

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/projects/", {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  fetchProjects();
}, [user]);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSave = async () => {
  if (!user) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/projects/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`, // send token
      },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription,
      }),
    });

    if (!res.ok) throw new Error("Failed to add project");

    const data = await res.json();
    setProjects((prev) => [...prev, ...data.data]);
    closeModal();
    setProjectName("");
    setProjectDescription("");
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="h-screen w-screen">
      <div className="h-full w-full flex">
        <Sidebar />

        <div className="w-4/5 h-full bg-gray-100 p-6">
        <Navbar />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">Projects</h3>
            <button
              onClick={openModal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
            >
              + Add Project
            </button>
          </div>

          <div className="grid grid-cols-4 grid-rows-2 gap-4">
            {projects.map((project, index) => (
              <div
                key={project.id || index}
                className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between hover:shadow-xl transition cursor-pointer"
              >
                <h4 className="text-lg font-semibold mb-2">{project.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <button className="self-start bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500 transition" onClick={()=> navigate(`/project/${project.id}`)}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-25 z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Project</h3>
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
