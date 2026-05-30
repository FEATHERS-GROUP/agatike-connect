import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserWorkspaces, createDatabaseWorkspace } from "@/api/workspaces";

export type WorkspaceType = "VENUE" | "EVENT" | "CINEMA" | "EXPERIENCE" | string;

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  city: string;
  country?: string;
  address?: string;
  logo?: string;
  moduls: any;
  orgnizer_id: string;
  created_at: string;
  updated_at: string;
  icon?: string;
  modules?: string[];
};

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (workspace: Partial<Workspace>) => Promise<Workspace>;
  isLoaded: boolean;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ACTIVE_KEY = "agatike_active_workspace_v3";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeWorkspaceState, setActiveWorkspaceState] = useState<Workspace | null>(null);

  const { data: workspacesData, isLoading, isSuccess } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const data = await getUserWorkspaces();
      return data.map((w: any) => ({
        ...w,
        slug: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        icon: w.logo || "🏢",
        modules: w.moduls ? (Array.isArray(w.moduls) ? w.moduls : Object.keys(w.moduls)) : ["dashboard", "settings"],
      })) as Workspace[];
    },
    retry: false, 
  });

  const workspaces = workspacesData || [];

  useEffect(() => {
    if (isSuccess && workspaces.length > 0) {
      const storedActive = localStorage.getItem(ACTIVE_KEY);
      if (storedActive) {
        try {
          const parsed = JSON.parse(storedActive);
          const found = workspaces.find((w) => w.id === parsed.id);
          if (found) {
            setActiveWorkspaceState(found);
          } else {
            setActiveWorkspaceState(workspaces[0]);
            localStorage.setItem(ACTIVE_KEY, JSON.stringify(workspaces[0]));
          }
        } catch {
          setActiveWorkspaceState(workspaces[0]);
        }
      } else {
        setActiveWorkspaceState(workspaces[0]);
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(workspaces[0]));
      }
    } else if (isSuccess && workspaces.length === 0) {
      setActiveWorkspaceState(null);
    }
  }, [isSuccess, workspaces]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(workspace));
  };

  const createMutation = useMutation({
    mutationFn: async (workspaceData: Partial<Workspace>) => {
      const payload = {
        name: workspaceData.name,
        type: workspaceData.type || "EVENT",
        city: workspaceData.city || "",
        country: workspaceData.country || "",
        address: workspaceData.address || "",
        logo: workspaceData.icon || "", // mapping UI icon to DB logo
        moduls: workspaceData.modules || ["dashboard", "settings"],
      };
      
      const newWorkspace = await createDatabaseWorkspace({ data: payload });
      return {
        ...newWorkspace,
        slug: newWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        icon: newWorkspace.logo || "🏢",
        modules: newWorkspace.moduls ? (Array.isArray(newWorkspace.moduls) ? newWorkspace.moduls : Object.keys(newWorkspace.moduls)) : ["dashboard", "settings"],
      } as Workspace;
    },
    onSuccess: (newWorkspace) => {
      queryClient.setQueryData(["workspaces"], (old: Workspace[] | undefined) => {
        return old ? [...old, newWorkspace] : [newWorkspace];
      });
      setActiveWorkspace(newWorkspace);
    }
  });

  const createWorkspace = async (workspaceData: Partial<Workspace>) => {
    return await createMutation.mutateAsync(workspaceData);
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      activeWorkspace: activeWorkspaceState, 
      setActiveWorkspace, 
      createWorkspace, 
      isLoaded: !isLoading && isSuccess,
      isLoading 
    }}>
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
