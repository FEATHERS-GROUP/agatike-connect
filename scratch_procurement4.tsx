import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  FileText,
  Loader2,
  Search,
  Download,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FilePlus,
  ArrowLeft,
  Folder,
  FolderPlus,
  MoreVertical,
  MoveRight,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProcurementInvoices,
  deleteProcurementInvoice,
  updateProcurementInvoice,
  getProcurementFolders,
  createProcurementFolder,
  deleteProcurementFolder,
} from "@/api/procurement";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/procurement")({
  component: ProcurementPage,
});

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type InvoiceType = "proforma" | "invoice";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  draft: {
    label: "Draft",
    color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    icon: FileText,
  },
  sent: { label: "Sent", color: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Send },
  paid: {
    label: "Paid",
    color: "bg-green-500/15 text-green-600 border-green-500/30",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-500/15 text-red-500 border-red-500/30",
    icon: AlertCircle,
  },
};

function calcInvoiceTotal(invoice: any) {
  const subtotal = (invoice.items || []).reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  );
  const tax = subtotal * (Number(invoice.tax_rate || 0) / 100);
  return subtotal + tax;
}

function ProcurementPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "RWF";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [filterType, setFilterType] = useState<InvoiceType | "all">("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["procurement-invoices", wsId],
    queryFn: () => getProcurementInvoices({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const { data: folders = [], isLoading: loadingFolders } = useQuery({
    queryKey: ["procurement-folders", wsId],
    queryFn: () => getProcurementFolders({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createProcurementFolder({ data: { workspace_id: wsId, name } } as any),
    onSuccess: () => {
      toast.success("Folder created");
      queryClient.invalidateQueries({ queryKey: ["procurement-folders", wsId] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteProcurementFolder({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Folder deleted");
      if (currentFolderId) setCurrentFolderId(null);
      queryClient.invalidateQueries({ queryKey: ["procurement-folders", wsId] });
      queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => deleteProcurementInvoice({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: (vars: { id: string; status?: InvoiceStatus; folder_id?: string | null }) => {
      const setPayload: any = {};
      if (vars.status) setPayload.status = vars.status;
      if (vars.folder_id !== undefined) setPayload.folder_id = vars.folder_id;
      return updateProcurementInvoice({ data: { id: vars.id, ...setPayload } } as any);
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["procurement-invoices", wsId] });
    },
  });

  const handleCreateFolder = () => {
    const name = window.prompt("Folder name:");
    if (name) createFolderMutation.mutate(name);
  };

  const filtered = (invoices as any[]).filter((inv) => {
    const matchSearch =
      !search ||
      inv.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    const matchType = filterType === "all" || inv.invoice_type === filterType;
    const matchFolder = currentFolderId ? inv.folder_id === currentFolderId : !inv.folder_id;
    return matchSearch && matchStatus && matchType && matchFolder;
  });

  const totalPaid = (invoices as any[])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + calcInvoiceTotal(i), 0);
  const totalPending = (invoices as any[])
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + calcInvoiceTotal(i), 0);

  const currentFolder = folders.find((f: any) => f.id === currentFolderId);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="block min-h-[80vh]">
        <div className="space-y-6 pb-12">
          <div className="mb-2">
            <Link
              to={`/dashboard/${wsId ? activeWorkspace?.slug : ""}/book`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 hover:bg-secondary px-3 py-1.5 rounded-full border border-border/30"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Agatike Book
            </Link>
          </div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
              <p className="text-muted-foreground mt-1">
                Right-click anywhere to organize your documents in folders.
              </p>
            </div>
            <Link to={`/dashboard/${workspaceSlug}/book/procurement/create` as any}>
              <Button
                className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <FilePlus className="h-4 w-4" /> New Document
              </Button>
            </Link>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Documents",
                value: (invoices as any[]).length,
                color: "text-foreground",
                bg: "bg-secondary",
              },
              {
                label: "Draft",
                value: (invoices as any[]).filter((i) => i.status === "draft").length,
                color: "text-slate-500",
                bg: "bg-slate-500/10",
              },
              {
                label: "Paid / Cleared",
                value: `${totalPaid.toLocaleString()} ${currency}`,
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
              {
                label: "Outstanding",
                value: `${totalPending.toLocaleString()} ${currency}`,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3"
              >
                <div
                  className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
                >
                  <FileText className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
                  <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Folder Navigation */}
          {currentFolderId ? (
            <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-xl border border-border/30 w-fit mb-4">
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
                  onClick={() => deleteFolderMutation.mutate(currentFolderId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </span>
            </div>
          ) : (
            folders.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {folders.map((folder: any) => {
                  const count = (invoices as any[]).filter((i) => i.folder_id === folder.id).length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all w-[200px]"
                    >
                      <Folder
                        className="h-8 w-8 text-blue-500 shrink-0"
                        fill="currentColor"
                        fillOpacity={0.2}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">{count} items</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client or number..."
                className="pl-9 h-10 rounded-xl w-64"
              />
            </div>
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
              {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                    filterStatus === s
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice list */}
          {loadingInvoices ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 py-20 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No documents here</p>
              <p className="text-sm mt-1">
                Right-click to create a folder, or create a new document.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv: any) => {
                const sc = STATUS_CONFIG[inv.status as InvoiceStatus] || STATUS_CONFIG.draft;
                const total = calcInvoiceTotal(inv);
                return (
                  <ContextMenu key={inv.id}>
                    <ContextMenuTrigger asChild>
                      <div
                        onClick={() =>
                          navigate({
                            to: `/dashboard/${workspaceSlug}/book/procurement/${inv.id}` as any,
                          })
                        }
                        className="bg-card border border-border/60 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{inv.invoice_number}</span>
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                                sc.color,
                              )}
                            >
                              {sc.label}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              {inv.invoice_type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {inv.client_name}
                            {inv.client_company ? ` · ${inv.client_company}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-base">
                            {total.toLocaleString()} {currency}
                          </p>
                          {inv.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due{" "}
                              {new Date(inv.due_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          )}
                        </div>
                        <div
                          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()} // Prevent nav when clicking buttons
                        >
                          {inv.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500"
                              title="Mark as Paid"
                              onClick={() =>
                                updateInvoiceMutation.mutate({ id: inv.id, status: "paid" })
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {inv.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500"
                              title="Mark as Sent"
                              onClick={() =>
                                updateInvoiceMutation.mutate({ id: inv.id, status: "sent" })
                              }
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteInvoiceMutation.mutate(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() =>
                          navigate({
                            to: `/dashboard/${workspaceSlug}/book/procurement/${inv.id}` as any,
                          })
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Preview
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <MoveRight className="mr-2 h-4 w-4" /> Move to Folder
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <ContextMenuItem
                            onClick={() =>
                              updateInvoiceMutation.mutate({ id: inv.id, folder_id: null })
                            }
                          >
                            Root (No Folder)
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          {folders.map((f: any) => (
                            <ContextMenuItem
                              key={f.id}
                              onClick={() =>
                                updateInvoiceMutation.mutate({ id: inv.id, folder_id: f.id })
                              }
                            >
                              <Folder className="mr-2 h-4 w-4" /> {f.name}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => deleteInvoiceMutation.mutate(inv.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Document
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleCreateFolder}>
          <FolderPlus className="mr-2 h-4 w-4" /> Create New Folder
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate({ to: `/dashboard/${workspaceSlug}/book/procurement/create` as any })
          }
        >
          <FilePlus className="mr-2 h-4 w-4" /> Create Document
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
