import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useParams } from "react-router-dom";

const SingleProjectPage = () => {
  const { id: projectId } = useParams();
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newResource, setNewResource] = useState({
    name: "",
    description: "",
    link: "",
  });

  // Fetch resources
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/resources/project/${projectId}`)
      .then((res) => {
        console.log(res);
        setResources(res.data)})
      .catch((err) => console.error(err));
  }, []);

  const handleAddResource = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/resources/", {
        ...newResource,
        project_id: projectId,
      });
      // Refresh resources list
      const res = await axios.get(
        `http://127.0.0.1:8000/resources/project/${projectId}`
      );
      setResources(res.data.resources);
      setShowModal(false);
      setNewResource({ name: "", description: "", link: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="w-4/5 h-full bg-gray-100 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Project Name</h2>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition"
            onClick={() => setShowModal(true)}
          >
            Add Resource
          </button>
        </div>

        {/* Resources list */}
        <div className="grid grid-cols-3 gap-4">
          {resources && resources.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold">{r.name}</h4>
              <p className="text-gray-600">{r.description}</p>
              {r.link && (
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Link
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Add Resource</h3>
              <input
                type="text"
                placeholder="Name"
                className="w-full border rounded p-2 mb-2"
                value={newResource.name}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full border rounded p-2 mb-2"
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({ ...newResource, description: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Link (optional)"
                className="w-full border rounded p-2 mb-4"
                value={newResource.link}
                onChange={(e) =>
                  setNewResource({ ...newResource, link: e.target.value })
                }
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                  onClick={handleAddResource}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProjectPage;
