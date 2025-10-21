import { createContext, useContext, useState } from "react";
import type {ReactNode} from 'react';

export interface ProjectContextType {
  id: string;
  name: string;
  doc_url: string;
  setProject?: (project: ProjectContextType) => void; // optional setter
}

// Default/fallback project
const defaultProject: ProjectContextType = {
  id: "123",
  name: "Project 123",
  doc_url:
    "https://docs.google.com/document/d/1vtMczJJVY0IRsqAawL-ORcBS9Bbc2wv0TaAPrjaU92g/edit",
};

export const ProjectContext = createContext<ProjectContextType>(defaultProject);

// Provider component
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, setProject] = useState<ProjectContextType>(defaultProject);

  return (
    <ProjectContext.Provider value={{ ...project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook
export const useProjectContext = () => useContext(ProjectContext);
