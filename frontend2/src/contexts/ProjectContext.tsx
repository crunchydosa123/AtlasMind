import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Resource {
  id: string;
  name: string;
  type?: string;
  content?: string;
  concepts?: string[];
  file_name: string;
  file_type: string;
}

export interface ProjectContextType {
  id: string;
  name: string;
  doc_url: string;
  resources: Resource[];
  setProject: (project: Partial<ProjectContextType>) => void;
  setResources: (resources: Resource[]) => void;
  addResource: (resource: Resource) => void;
  getResourceById: (id: string) => Resource | undefined;
}

const LS_KEY = "atlas_project_context";

const defaultProject: ProjectContextType = {
  id: "",
  name: "",
  doc_url: "",
  resources: [],
  setProject: () => {},
  setResources: () => {},
  addResource: () => {},
  getResourceById: () => undefined,
};

export const ProjectContext = createContext<ProjectContextType>(defaultProject);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, _setProject] = useState<ProjectContextType>(defaultProject);

  // Load from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        _setProject(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to parse saved project:", e);
      }
    }
  }, []);

  // Persist to localStorage whenever project changes
  useEffect(() => {
    if (project.id) {
      localStorage.setItem(LS_KEY, JSON.stringify(project));
    }
  }, [project]);

  const setProject = (partial: Partial<ProjectContextType>) => {
    _setProject((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const setResources = (resources: Resource[]) => {
    _setProject((prev) => ({ ...prev, resources }));
  };

  const addResource = (resource: Resource) => {
    _setProject((prev) => ({
      ...prev,
      resources: [...(prev.resources || []), resource],
    }));
  };

  const getResourceById = (id: string) => {
    return project.resources?.find((r) => r.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        ...project,
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

export const useProjectContext = () => useContext(ProjectContext);
