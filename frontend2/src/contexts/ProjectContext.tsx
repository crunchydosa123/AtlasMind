import { createContext, useContext, useState } from "react";
import type {ReactNode} from 'react';

export interface Resource {
  id: string;
  name: string;
  type?: string;
  content?: string;
  concepts?: string[];
}

export interface ProjectContextType {
  id: string;
  name: string;
  doc_url: string;
  resources?: Resource[];
  setProject?: (project: ProjectContextType) => void;
  setResources?: (resources: Resource[]) => void;
  addResource?: (resource: Resource) => void;
  getResourceById?: (id: string) => Resource | undefined;
}

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
  resources: [],
};

export const ProjectContext = createContext<ProjectContextType>(defaultProject);

// Provider component
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, setProject] = useState<ProjectContextType>(defaultProject);
  const [resources, setResources] = useState<Resource[]>([]);

  const addResource = (resource: Resource) => {
    setResources(prev => [...prev, resource]);
  };

  const getResourceById = (id: string) => {
    return resources.find(r => r.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        ...project,
        resources,
        setProject,
        setResources,
        addResource,
        getResourceById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};


// Custom hook
export const useProjectContext = () => useContext(ProjectContext);
