import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAgatikeBooksByWorkspace,
  createAgatikeBook,
  createAgatikeBookRecord,
  updateAgatikeBookRecord,
  updateAgatikeBookName,
} from "@/api/book";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/finance")({
  component: FinancePage,
});

type EntryType = "income" | "expense";

function FinancePage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "RWF";
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("income");
  const [form, setForm] = useState({ description: "", amount: "", category: "" });
  const [periodFilter, setPeriodFilter] = useState<"month" | "quarter" | "year">("month");

  // ── Load workspace-level finance books ─────────────────────────────────────
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["workspace-books", wsId],
    queryFn: () => getAgatikeBooksByWorkspace({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["workspace-pages", wsId],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const activeRequestPages = useMemo(() => {
    return pages.filter((p: any) => {
      if (!p.components || !Array.isArray(p.components)) return false;
      return p.components.some((c: any) => c.type === "budget_request");
    });
  }, [pages]);

  // Find or derive finance books
  const incomeBook = (books as any[]).find((b: any) => b.name === "__finance_income__");
  const expenseBook = (books as any[]).find((b: any) => b.name === "__finance_expense__");
  const requestsBook = (books as any[]).find((b: any) => b.name === "__finance_requests");
  const disabledRequestsBook = (books as any[]).find((b: any) => b.name === "__finance_requests_disabled");

  // ── Aggregate financials ────────────────────────────────────────────────────
  const { totalIncome, totalExpense, netBalance, incomeEntries, expenseEntries, requestEntries } = useMemo(() => {
    const incomeEntries: any[] = incomeBook?.records || [];
    const expenseEntries: any[] = expenseBook?.records || [];

    const totalIncome = incomeEntries.reduce(
      (sum: number, r: any) => sum + (Number(r.record_data?.Amount) || 0),
      0,
    );
    const totalExpense = expenseEntries.reduce(
      (sum: number, r: any) => sum + (Number(r.record_data?.Amount) || 0),
      0,
    );
    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      incomeEntries,
      expenseEntries,
      requestEntries: requestsBook?.records || [],
    };
  }, [incomeBook, expenseBook, requestsBook]);

  // ── Create system finance books if they don't exist ────────────────────────
  const ensureBookMutation = useMutation({
    mutationFn: async (bookName: string) =>
      createAgatikeBook({
        data: {
          workspace_id: wsId,
          name: bookName,
          schema_fields: [
            { name: "Description", type: "text" },
            { name: "Amount", type: "number" },
            { name: "Category", type: "text" },
          ],
        },
      } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] }),
  });

  const addRecordMutation = useMutation({
    mutationFn: async (vars: { book_id: string }) =>
      createAgatikeBookRecord({
        data: {
          book_id: vars.book_id,
          record_data: {
            Description: form.description,
            Amount: Number(form.amount),
            Category: form.category || (entryType === "income" ? "Revenue" : "Expense"),
          },
        },
      } as any),
    onSuccess: () => {
      toast.success(`${entryType === "income" ? "Income" : "Expense"} entry added!`);
      setAddOpen(false);
      setForm({ description: "", amount: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus, recordData, autoExpense }: any) => {
      // Update status
      await updateAgatikeBookRecord({
        data: {
          id,
          record_data: { ...recordData, Status: newStatus },
        },
      } as any);

      // Optionally insert into finance expense if approved
      if (newStatus === "Approved" && autoExpense && expenseBook) {
        await createAgatikeBookRecord({
          data: {
            book_id: expenseBook.id,
            record_data: {
              Description: `Approved Request: ${recordData.Title}`,
              Amount: Number(recordData.Amount) || 0,
              Category: "Budget/Damage Approval",
            },
          },
        } as any);
      }
    },
    onSuccess: () => {
      toast.success("Request status updated");
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
  });

  const disableSystemMutation = useMutation({
    mutationFn: async () => {
      if (!requestsBook) return;
      return updateAgatikeBookName({
        data: { id: requestsBook.id, name: "__finance_requests_disabled" }
      } as any);
    },
    onSuccess: () => {
      toast.success("Requests system disabled");
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    }
  });

  const setupRequestsSystem = async () => {
    try {
      if (disabledRequestsBook) {
        await updateAgatikeBookName({
          data: { id: disabledRequestsBook.id, name: "__finance_requests" }
        } as any);
        toast.success("Requests system re-enabled!");
      } else {
        await ensureBookMutation.mutateAsync("__finance_requests");
        toast.success("Requests system initialized. Add the Request Block in the Page Builder!");
      }
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    } catch (err) {
      toast.error("Failed to initialize system");
    }
  };

  const handleAddEntry = async () => {
    if (!form.description || !form.amount) return;
    const bookName = entryType === "income" ? "__finance_income__" : "__finance_expense__";
    let book = entryType === "income" ? incomeBook : expenseBook;
    if (!book) {
      await ensureBookMutation.mutateAsync(bookName);
      const freshBooks = await queryClient.fetchQuery({
        queryKey: ["workspace-books", wsId],
        queryFn: () => getAgatikeBooksByWorkspace({ data: { workspace_id: wsId! } } as any),
      });
      book = (freshBooks as any[]).find((b: any) => b.name === bookName);
    }
    if (!book) return toast.error("Could not find or create finance book");
    addRecordMutation.mutate({ book_id: book.id });
  };

  const stats = [
    {
      label: "Total Income",
      value: totalIncome,
      icon: ArrowUpRight,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      prefix: "+",
    },
    {
      label: "Total Expenses",
      value: totalExpense,
      icon: ArrowDownRight,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      prefix: "-",
    },
    {
      label: "Net Balance",
      value: Math.abs(netBalance),
      icon: Wallet,
      color: netBalance >= 0 ? "text-primary" : "text-destructive",
      bg: netBalance >= 0 ? "bg-primary/10" : "bg-destructive/10",
      border: netBalance >= 0 ? "border-primary/20" : "border-destructive/20",
      prefix: netBalance >= 0 ? "+" : "-",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
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
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-1">
            Workspace-wide income & expense overview for{" "}
            <span className="font-semibold text-foreground">{activeWorkspace?.name}</span>.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 h-12 w-full justify-start bg-secondary/50 rounded-2xl p-1 gap-1">
          <TabsTrigger value="overview" className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="requests" className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm relative">
            Requests & Approvals
            {requestEntries.filter((r: any) => r.record_data?.Status === "Pending").length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0 border-none outline-none">
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`bg-card border ${s.border} rounded-3xl p-6 flex items-center gap-4 shadow-sm`}
              >
                <div
                  className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    {s.label}
                  </p>
                  <p className={`text-2xl font-black mt-0.5 ${s.color}`}>
                    {s.prefix}
                    {s.value.toLocaleString()} {currency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income table */}
              <EntryTable
                title="Income"
                icon={TrendingUp}
                iconColor="text-green-500"
                iconBg="bg-green-500/10"
                entries={incomeEntries}
                currency={currency}
                emptyLabel="No income entries yet."
              />
              {/* Expense table */}
              <EntryTable
                title="Expenses"
                icon={TrendingDown}
                iconColor="text-red-500"
                iconBg="bg-red-500/10"
                entries={expenseEntries}
                currency={currency}
                emptyLabel="No expense entries yet."
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-0 border-none outline-none">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm min-h-[400px]">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Main Requests List */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">All Requests</h3>
                  <Button size="sm" asChild className="gap-2 rounded-full">
                    <Link to={`/dashboard/${wsId ? activeWorkspace?.slug : ""}/book/new-finance-request`}>
                      <Plus className="h-4 w-4" /> New Request
                    </Link>
                  </Button>
                </div>
                {!requestsBook ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Budget & Damage Requests</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Allow your team to submit damage reports and request budget directly from your public portals using the Page Builder.
                    </p>
                    <Button onClick={setupRequestsSystem} disabled={ensureBookMutation.isPending || disableSystemMutation.isPending}>
                      {(ensureBookMutation.isPending || disableSystemMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Enable Requests System
                    </Button>
                  </div>
                ) : requestEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mb-4 opacity-20" />
                    <p>No requests submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requestEntries.map((req: any) => {
                      const data = req.record_data || {};
                      const isPending = data.Status === "Pending";
                      return (
                        <div key={req.id} className="p-4 border border-border/60 rounded-xl hover:bg-secondary/20 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  data.Type === "Damage Report" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                }`}>
                                  {data.Type}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  data.Status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                                  data.Status === "Approved" ? "bg-green-500/10 text-green-500" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {data.Status || "Pending"}
                                </span>
                              </div>
                              <h4 className="font-semibold">{data.Title || "Untitled"}</h4>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                By {data["Requested By"]} • {Number(data.Amount || 0).toLocaleString()} {currency}
                              </p>
                            </div>
                            {isPending && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                  onClick={() => updateRequestStatusMutation.mutate({
                                    id: req.id,
                                    newStatus: "Rejected",
                                    recordData: data,
                                    autoExpense: false
                                  })}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => updateRequestStatusMutation.mutate({
                                    id: req.id,
                                    newStatus: "Approved",
                                    recordData: data,
                                    autoExpense: true
                                  })}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  Approve & Record Expense
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-sm bg-secondary/30 p-3 rounded-lg text-foreground/80">
                            {data.Details}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Active Pages */}
              <div className="w-full md:w-72 border-l border-border/60 pl-6 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Active Public Portals</h3>
                {activeRequestPages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No public pages have the Request block enabled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {activeRequestPages.map((page: any) => (
                      <div key={page.id} className="p-3 border border-border/60 rounded-xl hover:border-primary/50 transition-colors bg-secondary/10 group relative">
                        <p className="font-semibold text-sm">{page.title || page.slug}</p>
                        <a 
                          href={`/p/${page.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                        >
                          View Form <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Want to collect requests externally? Add the Request block to any Page Builder portal.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/dashboard/${wsId ? activeWorkspace?.slug : ""}/page-builder`}>
                      Open Page Builder
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => disableSystemMutation.mutate()}
                    disabled={disableSystemMutation.isPending}
                  >
                    {disableSystemMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    Disable System
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Entry Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add Financial Entry</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as EntryType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setEntryType(t)}
                  className={`h-10 rounded-xl font-semibold text-sm capitalize transition-colors ${
                    entryType === t
                      ? t === "income"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t === "income" ? "＋ Income" : "－ Expense"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="e.g. Ticket sales — Night 1"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount ({currency}) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder={entryType === "income" ? "e.g. Ticket Sales" : "e.g. Venue Rental"}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddEntry}
              disabled={addRecordMutation.isPending || !form.description || !form.amount}
              className="w-full h-11 rounded-xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              {addRecordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryTable({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  entries,
  currency,
  emptyLabel,
}: {
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  entries: any[];
  currency: string;
  emptyLabel: string;
}) {
  const total = entries.reduce((sum, r) => sum + (Number(r.record_data?.Amount) || 0), 0);
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <span className={`font-black text-lg ${iconColor}`}>
          {total.toLocaleString()} {currency}
        </span>
      </div>
      <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
        {entries.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        )}
        {entries.map((r: any, i: number) => (
          <div
            key={r.id || i}
            className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20 text-sm"
          >
            <div>
              <p className="font-medium">{r.record_data?.Description}</p>
              {r.record_data?.Category && (
                <p className="text-xs text-muted-foreground">{r.record_data.Category}</p>
              )}
            </div>
            <span className="font-semibold">
              {Number(r.record_data?.Amount || 0).toLocaleString()} {currency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
