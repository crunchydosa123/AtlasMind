import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import ProjectResources from "./pages/ProjectResources";
import ProjectDocs from "./pages/ProjectDocs";
import AllResources from "./pages/AllResources";
import { ProjectProvider } from "./contexts/ProjectContext";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserProvider>
    <ProjectProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Resources */}
          <Route path="/resources" element={<AllResources />} />

          {/* Projects */}
          <Route path="/projects" element={<Dashboard />} />

          {/* Single Project Routes */}
          <Route path="/project/:id" element={<Project />} />
          <Route path="/project/:id/resources" element={<ProjectResources />} />
          <Route path="/project/:id/write-doc" element={<ProjectDocs />} />
          <Route path="/project/:id/edit-sheet" element={<Project />} />
          <Route path="/project/:id/llm-query" element={<Project />} />
        </Routes>
      </Router>
    </ProjectProvider>
    </UserProvider>
  );
}

export default App;
