import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProjectsPage from "./pages/ProjectsPage"
import SingleProjectPage from "./pages/SingleProjectPage"
import { UserProvider } from "./contexts/UserContext"
import HomePage from "./pages/HomePage"

function App() {

  return (
    <>
      <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:id" element={<SingleProjectPage />} />
        </Routes>
      </BrowserRouter>
      </UserProvider>
      </>
    
  );
}

export default App
