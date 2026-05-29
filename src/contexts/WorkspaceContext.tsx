import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type WorkspaceType = "VENUE" | "EVENT" | "CINEMA" | "EXPERIENCE";

export type Workspace = {
  id: string;
  name: string;
  type: WorkspaceType;
  city: string;
  avatarUrl?: string;
};

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (workspace: Omit<Workspace, "id">) => void;
  isLoaded: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = "agatike_workspaces";
const ACTIVE_KEY = "agatike_active_workspace";

// Seed data
const initialWorkspaces: Workspace[] = [
  { id: "ws-1", name: "Agatike Events", type: "EVENT", city: "Kigali, RW" },
  { id: "ws-2", name: "Kigali Arenas", type: "VENUE", city: "Kigali, RW" },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage
    const storedWorkspaces = localStorage.getItem(STORAGE_KEY);
    const storedActive = localStorage.getItem(ACTIVE_KEY);

    let loadedWorkspaces = storedWorkspaces ? JSON.parse(storedWorkspaces) : initialWorkspaces;
    
    if (!storedWorkspaces) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedWorkspaces));
    }

    setWorkspaces(loadedWorkspaces);

    if (storedActive) {
      const parsed = JSON.parse(storedActive);
      const found = loadedWorkspaces.find((w: Workspace) => w.id === parsed.id);
      if (found) {
        setActiveWorkspaceState(found);
      } else if (loadedWorkspaces.length > 0) {
        setActiveWorkspaceState(loadedWorkspaces[0]);
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(loadedWorkspaces[0]));
      }
    } else if (loadedWorkspaces.length > 0) {
      setActiveWorkspaceState(loadedWorkspaces[0]);
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(loadedWorkspaces[0]));
    }

    setIsLoaded(true);
  }, []);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(workspace));
  };

  const createWorkspace = (workspaceData: Omit<Workspace, "id">) => {
    const newWorkspace = { ...workspaceData, id: crypto.randomUUID() };
    const updated = [...workspaces, newWorkspace];
    setWorkspaces(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActiveWorkspace(newWorkspace);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, isLoaded }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
