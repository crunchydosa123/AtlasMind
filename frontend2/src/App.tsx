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
import Homepage from "./pages/Homepage";
import Agents from "./pages/Agents";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
    <UserProvider>
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* All Resources */}
          <Route path="/resources" element={<AllResources />} />

          {/* Projects */}
          <Route path="/projects" element={<Dashboard />} />

          <Route path="/project/:id" element={<Project />} />
          <Route path="/project/:id/resources" element={<ProjectResources />} />
          <Route path="/project/:id/write-doc" element={<ProjectDocs />} />
          <Route path="/project/:id/edit-sheet" element={<Project />} />
          <Route path="/project/:id/llm-query" element={<Project />} />
          <Route path="/project/:id/agents" element={<Agents />} />


          <Route path="/agents" element={<Agents />} />

          {/* Single Project Routes */}
          
        </Routes>
      </Router>
    </ProjectProvider>
    </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
