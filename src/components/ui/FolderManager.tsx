import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getWorkspaceFolders,
  createWorkspaceFolder,
  deleteWorkspaceFolder,
} from "@/api/folders";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  FolderMinus,
  Trash2,
  MoveRight,
  Loader2,
  Search,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface FolderManagerProps<T> {
  moduleType: string;
  items: T[];
  getItemId: (item: T) => string;
  getFolderId: (item: T) => string | null | undefined;
  onMoveItems: (itemIds: string[], folderId: string | null) => Promise<void>;
  onDeleteItems?: (itemIds: string[]) => Promise<void>;
  filterItem?: (item: T, search: string) => boolean;
  children: (props: {
    filteredItems: T[];
    folders: any[];
    currentFolderId: string | null;
    selectedIds: Set<string>;
    handleSelect: (id: string, checked: boolean) => void;
    handleSelectAll: (checked: boolean) => void;
    /** Wrap any item card with this to get a per-item right-click context menu */
    ItemMenu: (props: { itemId: string; folderId?: string | null; children: React.ReactNode }) => React.ReactElement;
  }) => React.ReactNode;
}

export function FolderManager<T>({
  moduleType,
  items = [],
  getItemId,
  getFolderId,
  onMoveItems,
  onDeleteItems,
  filterItem,
  children,
}: FolderManagerProps<T>) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { data: folders = [] } = useQuery({
    queryKey: ["workspace-folders", wsId, moduleType],
    queryFn: () => getWorkspaceFolders({ data: { workspace_id: wsId!, module_type: moduleType } } as any),
    enabled: !!wsId,
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createWorkspaceFolder({
        data: { workspace_id: wsId!, name, module_type: moduleType },
      } as any),
    onSuccess: () => {
      toast.success("Folder created");
      queryClient.invalidateQueries({ queryKey: ["workspace-folders", wsId, moduleType] });
      setIsCreateModalOpen(false);
      setNewFolderName("");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspaceFolder({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Folder deleted");
      if (currentFolderId) setCurrentFolderId(null);
      queryClient.invalidateQueries({ queryKey: ["workspace-folders", wsId, moduleType] });
    },
  });

  const handleDeleteFolder = (folderId: string) => {
    const count = items.filter((i) => getFolderId(i) === folderId).length;
    if (count > 0) {
      toast.error("Please move all items out of this folder before deleting it.");
      return;
    }
    deleteFolderMutation.mutate(folderId);
  };

  const handleBulkMove = async (folderId: string | null) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await onMoveItems(ids, folderId);
    setSelectedIds(new Set());
    toast.success("Items moved successfully");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !onDeleteItems) return;
    if (!window.confirm("Are you sure you want to delete the selected items?")) return;
    await onDeleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
    toast.success("Items deleted");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredItems.map(getItemId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const filteredItems = items.filter((item) => {
    const matchFolder = currentFolderId ? getFolderId(item) === currentFolderId : !getFolderId(item);
    const matchSearch = filterItem && search ? filterItem(item, search) : true;
    return matchFolder && matchSearch;
  });

  const currentFolder = folders.find((f: any) => f.id === currentFolderId);

  /** Per-item context menu wrapper component */
  const ItemMenu = ({
    itemId,
    folderId,
    children: itemChildren,
  }: {
    itemId: string;
    folderId?: string | null;
    children: React.ReactNode;
  }): React.ReactElement => {
    const isInFolder = !!folderId;
    const currentFolderName = folders.find((f: any) => f.id === folderId)?.name;

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{itemChildren as React.ReactElement}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {/* Move to folder submenu */}
          {folders.length > 0 ? (
            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-2">
                <FolderInput className="h-4 w-4 text-blue-500" />
                Move to Folder
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {folders.map((f: any) => (
                  <ContextMenuItem
                    key={f.id}
                    disabled={folderId === f.id}
                    onClick={async () => {
                      await onMoveItems([itemId], f.id);
                      toast.success(`Moved to "${f.name}"`);
                    }}
                    className="gap-2"
                  >
                    <Folder className="h-4 w-4 text-blue-500" />
                    {f.name}
                    {folderId === f.id && (
                      <span className="ml-auto text-xs text-muted-foreground">Current</span>
                    )}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          ) : (
            <ContextMenuItem
              className="gap-2 text-muted-foreground"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              Create a folder first
            </ContextMenuItem>
          )}

          {/* Remove from folder */}
          {isInFolder && (
            <ContextMenuItem
              className="gap-2"
              onClick={async () => {
                await onMoveItems([itemId], null);
                toast.success("Removed from folder");
              }}
            >
              <FolderMinus className="h-4 w-4 text-amber-500" />
              Remove from "{currentFolderName}"
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Create new folder */}
          <ContextMenuItem
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FolderPlus className="h-4 w-4 text-green-500" />
            Create New Folder
          </ContextMenuItem>

          {/* Delete item */}
          {onDeleteItems && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={async () => {
                  if (!window.confirm("Delete this item? This cannot be undone.")) return;
                  await onDeleteItems([itemId]);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Item
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <>
      {/* Global area: right-click on empty space */}
      <ContextMenu>
        <ContextMenuTrigger className="block min-h-[50vh]">
          <div className="space-y-4">

            {/* Top Bar: Folder Nav & Create Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {currentFolderId ? (
                  <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-xl border border-border/30 w-fit">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2"
                      onClick={() => setCurrentFolderId(null)}
                    >
                      <Folder className="h-4 w-4 text-blue-500" /> All Folders
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-sm px-2 flex items-center gap-2">
                      {currentFolder?.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive ml-2"
                        onClick={() => handleDeleteFolder(currentFolderId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </span>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight">Folders</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="h-8 w-8 rounded-full bg-secondary text-foreground hover:bg-secondary/80"
                      title="Create new folder"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      right-click anywhere or on a card
                    </span>
                  </>
                )}
              </div>

              {filterItem && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 h-10 rounded-xl w-64 bg-card"
                  />
                </div>
              )}
            </div>

            {/* Folder Grid (Root Level Only) */}
            {!currentFolderId && folders.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {(folders as any[]).map((folder: any) => {
                  const count = items.filter((i) => getFolderId(i) === folder.id).length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group w-[200px]"
                    >
                      <FolderOpen
                        className="h-8 w-8 text-blue-500 shrink-0"
                        fill="currentColor"
                        fillOpacity={0.15}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">{count} items</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-primary">
                    {selectedIds.size} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2 bg-card border-border/50">
                        <MoveRight className="h-4 w-4" /> Move to...
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                        <FolderMinus className="mr-2 h-4 w-4 text-amber-500" />
                        No Folder (Root)
                      </DropdownMenuItem>
                      {folders.length > 0 && <DropdownMenuSeparator />}
                      {(folders as any[]).map((f: any) => (
                        <DropdownMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                          <Folder className="mr-2 h-4 w-4 text-blue-500" /> {f.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
                        <FolderPlus className="mr-2 h-4 w-4 text-green-500" /> New Folder…
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {onDeleteItems && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Render Children */}
            {children({
              filteredItems,
              folders,
              currentFolderId,
              selectedIds,
              handleSelect,
              handleSelectAll,
              ItemMenu,
            })}
          </div>
        </ContextMenuTrigger>

        {/* Global right-click menu (empty space) */}
        <ContextMenuContent className="w-52">
          <ContextMenuItem className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <FolderPlus className="h-4 w-4 text-green-500" />
            Create New Folder
          </ContextMenuItem>
          {selectedIds.size > 0 && (
            <>
              <ContextMenuSeparator />
              {folders.length > 0 && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger className="gap-2">
                    <FolderInput className="h-4 w-4 text-blue-500" />
                    Move {selectedIds.size} selected to…
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuItem onClick={() => handleBulkMove(null)}>
                      <FolderMinus className="mr-2 h-4 w-4 text-amber-500" /> No Folder
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    {(folders as any[]).map((f: any) => (
                      <ContextMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                        <Folder className="mr-2 h-4 w-4 text-blue-500" /> {f.name}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              {onDeleteItems && (
                <ContextMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedIds.size} selected
                </ContextMenuItem>
              )}
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              autoFocus
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim() && !createFolderMutation.isPending) {
                  createFolderMutation.mutate(newFolderName.trim());
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
              onClick={() => createFolderMutation.mutate(newFolderName.trim())}
            >
              {createFolderMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
