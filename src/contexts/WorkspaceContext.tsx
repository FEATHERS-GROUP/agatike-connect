import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserWorkspaces, createDatabaseWorkspace } from "@/api/workspaces";

export type WorkspaceType =
  | "VENUE"
  | "EVENT"
  | "CINEMA"
  | "EXPERIENCE"
  | "SPACES"
  | "OFFICES"
  | "TRANSPORT"
  | string;

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  city: string;
  country?: string;
  country_code?: string;
  address?: string;
  logo?: string;
  moduls: any;
  orgnizer_id: string;
  created_at: string;
  updated_at: string;
  icon?: string;
  modules?: string[];
  currency?: string;
  business?: boolean;
  wallet?: {
    currency: string;
    [key: string]: any;
  };
};

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentUser: any;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (workspace: Partial<Workspace>) => Promise<Workspace>;
  isLoaded: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ACTIVE_KEY = "agatike_active_workspace_v3";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeWorkspaceState, setActiveWorkspaceState] = useState<Workspace | null>(null);

  const {
    data: workspacesData,
    isLoading,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { workspaces: data, currentUser } = await getUserWorkspaces();
      const mappedWorkspaces = data.map((w: any) => ({
        ...w,
        slug: w.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        icon: w.logo || "🏢",
        modules: w.moduls
          ? Array.isArray(w.moduls)
            ? w.moduls
            : Object.keys(w.moduls)
          : ["dashboard", "settings", "Support"],
        currency: w.currency,
      })) as Workspace[];
      return { workspaces: mappedWorkspaces, currentUser };
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const workspaces = workspacesData?.workspaces || [];
  const currentUser = workspacesData?.currentUser || null;

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
            setActiveWorkspaceState(null);
          }
        } catch {
          setActiveWorkspaceState(null);
        }
      } else {
        setActiveWorkspaceState(null);
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
        moduls: workspaceData.modules || ["dashboard", "settings", "Support"],
        currency: workspaceData.currency,
      };

      const newWorkspace = await createDatabaseWorkspace({ data: payload } as any);
      return {
        ...newWorkspace,
        slug: newWorkspace.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        icon: newWorkspace.logo || "🏢",
        modules: newWorkspace.moduls
          ? Array.isArray(newWorkspace.moduls)
            ? newWorkspace.moduls
            : Object.keys(newWorkspace.moduls)
          : ["dashboard", "settings", "Support"],
        currency: newWorkspace.currency,
      } as Workspace;
    },
    onSuccess: (newWorkspace) => {
      queryClient.setQueryData(["workspaces"], (old: { workspaces: Workspace[]; currentUser: any } | undefined) => {
        if (!old) return old;
        return { ...old, workspaces: [...old.workspaces, newWorkspace] };
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setActiveWorkspace(newWorkspace);
    },
  });

  const createWorkspace = async (workspaceData: Partial<Workspace>) => {
    return await createMutation.mutateAsync(workspaceData);
  };

  // Sort workspaces so the active one is always first
  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    if (activeWorkspaceState && a.id === activeWorkspaceState.id) return -1;
    if (activeWorkspaceState && b.id === activeWorkspaceState.id) return 1;
    return 0;
  });

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: sortedWorkspaces,
        currentUser,
        activeWorkspace: activeWorkspaceState,
        setActiveWorkspace,
        createWorkspace,
        isLoaded: !isLoading && isSuccess,
        isLoading,
        refetch,
      }}
    >
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
