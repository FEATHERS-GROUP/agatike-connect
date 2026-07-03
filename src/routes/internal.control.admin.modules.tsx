import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  getPlatformModules,
  createPlatformModule,
  updatePlatformModule,
  type PlatformModule,
} from "@/api/platform-modules";

export const Route = createFileRoute("/internal/control/admin/modules")({
  loader: () => getPlatformModules(),
  component: ModulesPage,
});

const COMMON_ICONS = [
  "Box",
  "Ticket",
  "Video",
  "Users",
  "Calendar",
  "CreditCard",
  "Settings",
  "Shield",
  "Activity",
  "MessageSquare",
  "Bell",
  "Briefcase",
  "Camera",
  "FileText",
  "Folder",
  "Image",
  "Layout",
  "Map",
  "Monitor",
  "ShoppingBag",
  "Star",
  "Tag",
  "Truck",
  "Wifi",
  "Zap",
  "Heart",
  "Home",
  "Link",
  "Package",
  "Store",
  "Globe",
  "Award",
  "Compass",
];

function ModulesPage() {
  const modules = Route.useLoaderData();
  const router = useRouter();
  const [modalState, setModalState] = useState<{ isOpen: boolean; module: PlatformModule | null }>({
    isOpen: false,
    module: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredModules = modules.filter(
    (mod) =>
      mod.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedModules = filteredModules.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            Platform Modules
            <LucideIcons.Package className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-[#888888] mt-1 text-sm">
            Manage all available modules and features across the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] placeholder:text-[#666666]"
            />
          </div>
          <button
            onClick={() => setModalState({ isOpen: true, module: null })}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-lg text-sm font-medium text-white transition-colors w-full sm:w-auto shrink-0"
          >
            <LucideIcons.Plus className="w-4 h-4" />
            Add New Module
          </button>
        </div>
      </div>

      <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cccccc]">
            <thead className="bg-[#252526] text-[#888888] border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 font-medium">Module</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Path (href)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {paginatedModules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">
                    No modules found.{" "}
                    {searchQuery ? "Try a different search query." : "Create one to get started."}
                  </td>
                </tr>
              ) : (
                paginatedModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-[#252526] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#333333]/50 text-white mt-0.5">
                          {/* @ts-ignore */}
                          {LucideIcons[mod.icon] ? (
                            /* @ts-ignore */
                            <DynamicIcon iconName={mod.icon} className="w-4 h-4" />
                          ) : (
                            <LucideIcons.Box className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{mod.label}</div>
                          <div
                            className="text-xs text-[#888888] mt-0.5 max-w-xs truncate"
                            title={mod.desc}
                          >
                            {mod.desc}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#333333] text-xs">
                        {mod.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#aaaaaa]">{mod.href}</td>
                    <td className="px-6 py-4">
                      {mod.mandatory ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                          Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#888888]">
                      {new Date(mod.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setModalState({ isOpen: true, module: mod })}
                        className="p-2 text-[#888888] hover:text-[#f97316] hover:bg-[#f97316]/10 rounded-lg transition-colors"
                        title="Edit Module"
                      >
                        <LucideIcons.Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-[#888888]">
            Showing <span className="font-medium text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredModules.length)}
            </span>{" "}
            of <span className="font-medium text-white">{filteredModules.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#aaaaaa] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {modalState.isOpen && (
        <ModuleModal
          initialData={modalState.module}
          onClose={() => setModalState({ isOpen: false, module: null })}
          onSuccess={() => {
            setModalState({ isOpen: false, module: null });
            router.invalidate();
          }}
        />
      )}
    </div>
  );
}

function DynamicIcon({ iconName, className }: { iconName: string; className?: string }) {
  // @ts-ignore
  const Icon = LucideIcons[iconName];
  if (!Icon) return <LucideIcons.Box className={className} />;
  return <Icon className={className} />;
}

function IconPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] transition-colors hover:border-[#444444]"
      >
        <div className="flex items-center gap-2">
          <DynamicIcon iconName={value} className="w-4 h-4 text-[#aaaaaa]" />
          <span>{value}</span>
        </div>
        <LucideIcons.ChevronDown className="w-4 h-4 text-[#888888]" />
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full left-0 mt-1 w-64 bg-[#1b1b1c] border border-[#333333] rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {COMMON_ICONS.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => {
                onChange(iconName);
                setIsOpen(false);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg gap-1 transition-colors ${
                value === iconName
                  ? "bg-[#f97316]/20 text-[#f97316]"
                  : "text-[#aaaaaa] hover:bg-[#333333] hover:text-white"
              }`}
              title={iconName}
            >
              <DynamicIcon iconName={iconName} className="w-5 h-5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleModal({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData: PlatformModule | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    label: initialData?.label || "",
    desc: initialData?.desc || "",
    category: initialData?.category || "General",
    href: initialData?.href || "/",
    icon: initialData?.icon || "Box",
    mandatory: initialData?.mandatory || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData) {
        await updatePlatformModule({ data: { id: initialData.id, data: formData } });
      } else {
        await createPlatformModule({ data: formData });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${initialData ? "update" : "create"} module`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#1b1b1c] border border-[#333333] rounded-xl shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <h2 className="text-lg font-medium text-white">
            {initialData ? "Edit Module" : "Add New Module"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-white rounded-md hover:bg-[#333333] transition-colors"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#aaaaaa]">Label (Name)</label>
              <input
                required
                type="text"
                value={formData.label}
                onChange={(e) => setFormData((f) => ({ ...f, label: e.target.value }))}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]"
                placeholder="e.g. Ticketing"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#aaaaaa]">Category</label>
              <input
                required
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]"
                placeholder="e.g. Core Features"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#aaaaaa]">Description</label>
            <textarea
              required
              rows={2}
              value={formData.desc}
              onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))}
              className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] resize-none"
              placeholder="Brief description of what this module does..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#aaaaaa]">Path (href)</label>
              <input
                required
                type="text"
                value={formData.href}
                onChange={(e) => setFormData((f) => ({ ...f, href: e.target.value }))}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#f97316]"
                placeholder="/path"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#aaaaaa]">Icon</label>
              <IconPicker
                value={formData.icon}
                onChange={(val) => setFormData((f) => ({ ...f, icon: val }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setFormData((f) => ({ ...f, mandatory: !f.mandatory }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${formData.mandatory ? "bg-[#f97316]" : "bg-[#333333]"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.mandatory ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div>
              <div className="text-sm font-medium text-white">Mandatory Module</div>
              <div className="text-xs text-[#888888]">Users cannot disable this module</div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#333333] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#aaaaaa] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {loading && <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : initialData ? "Save Changes" : "Create Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
