import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getAdminOrganizerModulesData,
  updateAdminWorkspaceModules,
} from "@/api/admin_organizer_control";
import {
  Blocks,
  Building2,
  Check,
  X,
  RefreshCw,
  LayoutGrid,
  CheckSquare,
  Square,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/modules")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerModulesData({
      data: { organizerId: params.organizerId },
    } as any);
    return data;
  },
  component: OrganizerModules,
});

function OrganizerModules() {
  const { platformModules, workspaces } = Route.useLoaderData();
  const router = useRouter();

  const [editingWs, setEditingWs] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Group modules by category
  const categorizedModules = platformModules.reduce((acc: any, mod: any) => {
    const cat = mod.category || "UNCATEGORIZED";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  const startEditing = (wsId: string, currentModules: any) => {
    setEditingWs(wsId);
    let parsed: string[] = [];
    if (Array.isArray(currentModules)) {
      parsed = currentModules;
    } else if (typeof currentModules === "string") {
      try {
        parsed = JSON.parse(currentModules);
      } catch {
        /* ignore */
      }
    }
    setSelectedModules(parsed);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );
  };

  const saveModules = async () => {
    if (!editingWs) return;
    setLoading(true);
    try {
      await updateAdminWorkspaceModules({
        data: { workspaceId: editingWs, moduls: selectedModules },
      } as any);
      toast.success("Workspace modules updated successfully");
      setEditingWs(null);
      router.invalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to update modules");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-sm pb-10">
      <div className="flex items-center gap-2 py-4 px-0 border-b border-[#333333] mb-5">
        <Blocks className="h-5 w-5 text-[#dcdcaa]" />
        <h2 className="text-base font-medium text-white">Workspace Modules</h2>
      </div>

      <p className="text-[#797775] text-xs mb-6 max-w-2xl">
        Manage which platform modules are enabled for each workspace. Enabling a module grants
        access to its features in the workspace dashboard.
      </p>

      <div className="space-y-6">
        {workspaces.map((ws: any) => {
          const isEditing = editingWs === ws.id;

          let activeModuleIds: string[] = [];
          if (isEditing) {
            activeModuleIds = selectedModules;
          } else {
            if (Array.isArray(ws.moduls)) activeModuleIds = ws.moduls;
            else if (typeof ws.moduls === "string") {
              try {
                activeModuleIds = JSON.parse(ws.moduls);
              } catch {
                /* ignore */
              }
            }
          }

          return (
            <div key={ws.id} className="bg-[#1a1a1a] border border-[#333333] overflow-hidden">
              {/* Header */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333333] bg-[#252526]">
                <h3 className="text-white font-medium flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-[#569cd6]" />
                  {ws.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#797775] bg-[#111111] px-2 py-1 border border-[#333333] rounded-sm">
                    {activeModuleIds.length} modules active
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(ws.id, ws.moduls)}
                      className="px-3 py-1.5 text-xs bg-[#569cd6]/10 text-[#569cd6] border border-[#569cd6]/30 hover:bg-[#569cd6]/20 transition-colors flex items-center gap-1.5 rounded-sm"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" /> Manage Modules
                    </button>
                  )}
                </div>
              </div>

              {/* Module Grid */}
              <div className="p-5 space-y-6">
                {Object.keys(categorizedModules).map((category) => (
                  <div key={category}>
                    <h4 className="text-[#797775] text-[10px] uppercase tracking-widest mb-3 font-semibold border-b border-[#333333] pb-1">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categorizedModules[category].map((mod: any) => {
                        const isActive = activeModuleIds.includes(mod.id);

                        if (isEditing) {
                          return (
                            <button
                              key={mod.id}
                              onClick={() => toggleModule(mod.id)}
                              className={`text-left p-3 border rounded-sm transition-colors flex items-start gap-2 ${
                                isActive
                                  ? "bg-[#84c87e]/10 border-[#84c87e]/40 text-white"
                                  : "bg-[#111111] border-[#333333] text-[#797775] hover:border-[#555555] hover:text-[#cccccc]"
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isActive ? (
                                  <CheckSquare className="h-4 w-4 text-[#84c87e]" />
                                ) : (
                                  <Square className="h-4 w-4 text-[#555555]" />
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-medium ${isActive ? "text-[#84c87e]" : "text-[#cccccc]"}`}
                                >
                                  {mod.label}
                                </p>
                              </div>
                            </button>
                          );
                        }

                        // View mode
                        if (!isActive) return null; // Only show active modules in view mode to save space
                        return (
                          <div
                            key={mod.id}
                            className="p-2 border border-[#333333] bg-[#2d2d30]/50 rounded-sm flex items-center gap-2"
                          >
                            <Check className="h-3.5 w-3.5 text-[#84c87e] shrink-0" />
                            <span className="text-[#cccccc] text-xs">{mod.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!isEditing && activeModuleIds.length === 0 && (
                  <div className="text-center py-6 text-[#797775] italic">
                    No modules are assigned to this workspace.
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {isEditing && (
                <div className="p-4 border-t border-[#333333] bg-[#252526] flex items-center justify-end gap-3">
                  <button
                    onClick={() => setEditingWs(null)}
                    disabled={loading}
                    className="px-4 py-2 text-xs border border-[#333333] text-[#797775] hover:text-white transition-colors flex items-center gap-1.5 rounded-sm disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    onClick={saveModules}
                    disabled={loading}
                    className="px-4 py-2 text-xs bg-[#84c87e] text-black font-medium hover:bg-[#72ad6c] transition-colors flex items-center gap-1.5 rounded-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Save Module Configuration
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {workspaces.length === 0 && (
          <div className="text-center py-10 text-[#797775] italic bg-[#1a1a1a] border border-[#333333]">
            No workspaces found for this organizer.
          </div>
        )}
      </div>
    </div>
  );
}
