import { createFileRoute } from "@tanstack/react-router";
import { Plus, FileText, BookOpen, ChevronLeft, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAgatikeBooksByWorkspace,
  createAgatikeBook,
  createAgatikeBookRecord,
  deleteAgatikeBook,
  deleteAgatikeBookRecord,
} from "@/api/book";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import React from "react";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/books")({
  component: BooksPage,
});

const TEMPLATES = [
  {
    id: "expense",
    label: "Expenses & Payouts",
    icon: "💸",
    fields: [
      { name: "Description", type: "text" },
      { name: "Amount", type: "number" },
      { name: "Paid", type: "boolean" },
    ],
  },
  {
    id: "staff",
    label: "Staff Roster",
    icon: "👥",
    fields: [
      { name: "Name", type: "text" },
      { name: "Role", type: "text" },
      { name: "Daily Rate", type: "number" },
      { name: "Paid", type: "boolean" },
    ],
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: "✅",
    fields: [
      { name: "Task", type: "text" },
      { name: "Assigned To", type: "text" },
      { name: "Completed", type: "boolean" },
    ],
  },
  {
    id: "sponsor",
    label: "Sponsor Deliverables",
    icon: "🤝",
    fields: [
      { name: "Sponsor", type: "text" },
      { name: "Deliverable", type: "text" },
      { name: "Value", type: "number" },
      { name: "Delivered", type: "boolean" },
    ],
  },
  { id: "custom", label: "Custom Book", icon: "📋", fields: [{ name: "Name", type: "text" }] },
];

function BooksPage() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const [activeBook, setActiveBook] = useState<any | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [bookName, setBookName] = useState("");
  const [schemaFields, setSchemaFields] = useState<any[]>([{ name: "Name", type: "text" }]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordData, setRecordData] = useState<any>({});

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["workspace-books", wsId],
    queryFn: () => getAgatikeBooksByWorkspace({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  // Filter out system books (finance)
  const visibleBooks = (books as any[]).filter((b: any) => !b.name.startsWith("__finance_"));

  const createBookMutation = useMutation({
    mutationFn: () =>
      createAgatikeBook({
        data: { workspace_id: wsId, name: bookName, schema_fields: schemaFields },
      } as any),
    onSuccess: () => {
      toast.success("Book created!");
      setShowBuilder(false);
      setBookName("");
      setSchemaFields([{ name: "Name", type: "text" }]);
      setBuilderStep(1);
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: () =>
      createAgatikeBookRecord({ data: { book_id: activeBook.id, record_data: recordData } } as any),
    onSuccess: () => {
      toast.success("Record added!");
      setShowAddRecord(false);
      setRecordData({});
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => deleteAgatikeBook({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Book deleted");
      setActiveBook(null);
      queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => deleteAgatikeBookRecord({ data: { id } } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-books", wsId] }),
  });

  React.useEffect(() => {
    if (activeBook && (books as any[]).length > 0) {
      const updated = (books as any[]).find((b: any) => b.id === activeBook.id);
      if (updated) setActiveBook(updated);
    }
  }, [books]);

  if (activeBook) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveBook(null)}
              className="h-9 w-9 rounded-full bg-secondary/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{activeBook.name}</h1>
              <p className="text-sm text-muted-foreground">
                {activeBook.records?.length || 0} records
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddRecord(true)}
            className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
              <tr>
                {activeBook.schema_fields.map((f: any, i: number) => (
                  <th key={i} className="px-5 py-3 font-medium">
                    {f.name}
                  </th>
                ))}
                <th className="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(!activeBook.records || activeBook.records.length === 0) && (
                <tr>
                  <td
                    colSpan={activeBook.schema_fields.length + 1}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No records yet.
                  </td>
                </tr>
              )}
              {activeBook.records?.map((record: any) => (
                <tr key={record.id} className="hover:bg-secondary/10 transition-colors">
                  {activeBook.schema_fields.map((f: any, i: number) => (
                    <td key={i} className="px-5 py-3">
                      {f.type === "boolean"
                        ? record.record_data[f.name]
                          ? "✓ Yes"
                          : "✗ No"
                        : record.record_data[f.name]}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-40 hover:opacity-100"
                      onClick={() => deleteRecordMutation.mutate(record.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add to {activeBook.name}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRecordMutation.mutate();
              }}
              className="space-y-4 mt-4"
            >
              {activeBook.schema_fields.map((f: any, i: number) => (
                <div key={i} className="space-y-2">
                  <Label>{f.name}</Label>
                  {f.type === "boolean" ? (
                    <div className="flex items-center gap-2 h-11 border rounded-xl px-3">
                      <Checkbox
                        checked={!!recordData[f.name]}
                        onCheckedChange={(c) => setRecordData({ ...recordData, [f.name]: c })}
                      />
                      <label className="text-sm cursor-pointer">{f.name}</label>
                    </div>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      placeholder={f.name}
                      value={recordData[f.name] || ""}
                      onChange={(e) =>
                        setRecordData({
                          ...recordData,
                          [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="h-11 rounded-xl"
                    />
                  )}
                </div>
              ))}
              <Button
                type="submit"
                disabled={createRecordMutation.isPending}
                className="w-full h-11 rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {createRecordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Add Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Books</h1>
          <p className="text-muted-foreground mt-1">
            Spreadsheet-style tracking for your workspace.
          </p>
        </div>
        <Button
          onClick={() => setShowBuilder(true)}
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> New Book
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : visibleBooks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 py-20 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No books yet</p>
          <p className="text-sm mt-1">Create a custom book to start tracking anything.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleBooks.map((book: any) => {
            const numericField = book.schema_fields?.find((f: any) => f.type === "number");
            const total = numericField
              ? book.records?.reduce(
                  (s: number, r: any) => s + (Number(r.record_data?.[numericField.name]) || 0),
                  0,
                )
              : null;
            return (
              <div
                key={book.id}
                onClick={() => setActiveBook(book)}
                className="cursor-pointer group rounded-3xl border border-border/60 bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBookMutation.mutate(book.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-bold text-lg">{book.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {book.records?.length || 0} records · {book.schema_fields?.length || 0} columns
                </p>
                {total !== null && (
                  <p className="text-primary font-bold mt-2">{total.toLocaleString()}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Book builder dialog */}
      <Dialog
        open={showBuilder}
        onOpenChange={(o) => {
          setShowBuilder(o);
          if (!o) {
            setBuilderStep(1);
            setBookName("");
            setSchemaFields([{ name: "Name", type: "text" }]);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {builderStep === 1 ? "Choose a Template" : "Configure Your Book"}
            </DialogTitle>
          </DialogHeader>
          {builderStep === 1 ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setBookName(t.id === "custom" ? "" : t.label);
                    setSchemaFields(t.fields);
                    setBuilderStep(2);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-left transition-colors"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-semibold text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Book Name *</Label>
                <Input
                  placeholder="e.g. Event Expenses"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Columns</Label>
                {schemaFields.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Column name"
                      value={f.name}
                      onChange={(e) => {
                        const n = [...schemaFields];
                        n[i] = { ...n[i], name: e.target.value };
                        setSchemaFields(n);
                      }}
                      className="h-10 rounded-xl flex-1"
                    />
                    <select
                      value={f.type}
                      onChange={(e) => {
                        const n = [...schemaFields];
                        n[i] = { ...n[i], type: e.target.value };
                        setSchemaFields(n);
                      }}
                      className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Checkbox</option>
                    </select>
                    {schemaFields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-destructive"
                        onClick={() => setSchemaFields(schemaFields.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setSchemaFields([...schemaFields, { name: "", type: "text" }])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setBuilderStep(1)}
                  className="flex-1 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  disabled={!bookName.trim() || createBookMutation.isPending}
                  onClick={() => createBookMutation.mutate()}
                  className="flex-1 rounded-xl"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {createBookMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Create Book
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
