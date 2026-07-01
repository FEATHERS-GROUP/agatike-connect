import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgatikeBooksByWorkspace, createAgatikeBook, createAgatikeBookRecord } from "@/api/book";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Find or derive finance book
  const incomeBook = (books as any[]).find((b: any) => b.name === "__finance_income__");
  const expenseBook = (books as any[]).find((b: any) => b.name === "__finance_expense__");

  // ── Aggregate financials ────────────────────────────────────────────────────
  const { totalIncome, totalExpense, netBalance, incomeEntries, expenseEntries } = useMemo(() => {
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
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, incomeEntries, expenseEntries };
  }, [incomeBook, expenseBook]);

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
        data: { book_id: vars.book_id, record_data: { Description: form.description, Amount: Number(form.amount), Category: form.category || (entryType === "income" ? "Revenue" : "Expense") } },
      } as any),
    onSuccess: () => {
      toast.success(`${entryType === "income" ? "Income" : "Expense"} entry added!`);
      setAddOpen(false);
      setForm({ description: "", amount: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
    onError: () => toast.error("Failed to add entry"),
  });

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

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-card border ${s.border} rounded-3xl p-6 flex items-center gap-4 shadow-sm`}
          >
            <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
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
              Add Entry
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
          <div className={`h-9 w-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
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
          <div key={r.id || i} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20 text-sm">
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
