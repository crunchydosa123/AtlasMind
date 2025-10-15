import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Project from "./pages/Project"
import ProjectResources from "./pages/ProjectResources"
import ProjectDocs from "./pages/ProjectDocs"
import AllResources from "./pages/AllResources"

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/projects" element={<Dashboard />} />
        <Route path="/resources" element={<AllResources />} />

        {/*Single Project Routes*/}
        <Route path="/project/:id" element={<Project />} />
        <Route path="/project/:id/resources" element={<ProjectResources />} />
        <Route path="/project/:id/write-doc" element={<ProjectDocs />} />
        <Route path="/project/:id/edit-sheet" element={<Project />} />
        <Route path="/project/:id/llm-query" element={<Project />} />
      </Routes>
    </Router>
    </>
  )
}

export default App