import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPublicAgatikeBooksByWorkspace, createPublicAgatikeBookRecord } from "@/api/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function SpreadsheetEntryForm({ workspace_id, themeColor, comp }: { workspace_id: string; themeColor: string; comp: any }) {
  const [formData, setFormData] = useState({
    Title: "",
    "Requested By": "",
    Details: "",
  });
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const [importedData, setImportedData] = useState<any[]>([]);
  const [importedHeaders, setImportedHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [showMappingModal, setShowMappingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: books = [] } = useQuery({
    queryKey: ["public-books", workspace_id],
    queryFn: () => getPublicAgatikeBooksByWorkspace({ data: { workspace_id } } as any),
    enabled: !!workspace_id && workspace_id !== "preview",
  });

  const financeBook = (books as any[]).find((b: any) => b.name === "__finance_requests");
  const isPreview = workspace_id === "preview" || (typeof window !== "undefined" && window.location.search.includes("preview=true"));
  const columns = comp.columns || [];
  const formType = comp.type === "damage_report" ? "Damage Report" : "Budget Request";

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!financeBook) {
        throw new Error("Requests book not configured for this workspace yet.");
      }
      
      // Calculate total amount if there is an amount/price/cost column
      let totalAmount = 0;
      const amountCol = columns.find((c: any) => c.name.toLowerCase().includes("amount") || c.name.toLowerCase().includes("cost") || c.name.toLowerCase().includes("price"));
      if (amountCol) {
        totalAmount = lineItems.reduce((sum, item) => sum + (Number(item[amountCol.name]) || 0), 0);
      }

      return createPublicAgatikeBookRecord({
        data: {
          book_id: financeBook.id,
          record_data: {
            Type: formType,
            Title: formData.Title,
            "Requested By": formData["Requested By"],
            Details: formData.Details,
            Amount: totalAmount,
            LineItems: lineItems,
            Status: "Pending"
          },
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Request submitted successfully");
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["workspace-books"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Title || !formData["Requested By"]) {
      toast.error("Please fill in the main details.");
      return;
    }
    if (columns.length > 0 && lineItems.length === 0) {
      toast.error("Please add at least one line item to the table.");
      return;
    }
    if (isPreview) {
      toast.success("Preview Mode: Request submitted successfully");
      setIsSubmitted(true);
      return;
    }
    submitMutation.mutate();
  };

  const addRow = () => {
    const newRow: any = {};
    columns.forEach((c: any) => {
      newRow[c.name] = c.type === "number" ? "" : "";
    });
    setLineItems([...lineItems, newRow]);
  };

  const updateRow = (idx: number, colName: string, val: string) => {
    const newItems = [...lineItems];
    newItems[idx][colName] = val;
    setLineItems(newItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) {
          toast.error("File appears to be empty or has no rows.");
          return;
        }

        const rawHeaders = data[0].map((h: any, idx: number) => String(h || `Column_${idx + 1}`));
        
        // Ensure unique headers to prevent overwriting or duplicate React keys
        const headers: string[] = [];
        const counts: Record<string, number> = {};
        rawHeaders.forEach(h => {
          if (counts[h]) {
            counts[h]++;
            headers.push(`${h} (${counts[h]})`);
          } else {
            counts[h] = 1;
            headers.push(h);
          }
        });

        const rows = data.slice(1).map((row) => {
          const rowData: any = {};
          headers.forEach((h, idx) => {
            rowData[h] = row[idx] !== undefined ? row[idx] : "";
          });
          return rowData;
        });

        setImportedHeaders(headers);
        setImportedData(rows);

        // Auto-map columns if names match exactly (case-insensitive)
        const newMap: Record<string, string> = {};
        columns.forEach((c: any) => {
          const match = headers.find(h => h.toLowerCase() === c.name.toLowerCase());
          if (match) newMap[c.name] = match;
        });
        setColumnMap(newMap);
        setShowMappingModal(true);
      } catch (err) {
        toast.error("Error reading file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmMapping = () => {
    const newRows = importedData.map(row => {
      const newRow: any = {};
      columns.forEach((c: any) => {
        const mappedHeader = columnMap[c.name];
        newRow[c.name] = mappedHeader ? row[mappedHeader] : "";
      });
      return newRow;
    });

    // We append the new rows to the existing line items (as chosen by the user)
    setLineItems([...lineItems, ...newRows]);
    setShowMappingModal(false);
    setImportedData([]);
    toast.success(`${newRows.length} rows imported successfully!`);
  };

  const removeRow = (idx: number) => {
    const newItems = [...lineItems];
    newItems.splice(idx, 1);
    setLineItems(newItems);
  };

  if (isSubmitted) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm max-w-3xl mx-auto my-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${themeColor}20`, color: themeColor }}>
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Request Submitted</h3>
        <p className="text-muted-foreground mb-6">
          Thank you! Your request has been sent to the finance team for review.
        </p>
        <Button onClick={() => {
          setIsSubmitted(false);
          setFormData({ Title: "", Details: "", "Requested By": "" });
          setLineItems([]);
        }} variant="outline">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto my-8 overflow-hidden">
      <h3 className="text-xl md:text-2xl font-bold mb-2">{comp.title || "Request Form"}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {comp.description || "Submit your details below."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <Label className="text-xs">Title / Subject *</Label>
            <Input
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              placeholder="e.g. Stage Equipment Fix"
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label className="text-xs">Your Name / Email *</Label>
            <Input
              value={formData["Requested By"]}
              onChange={(e) => setFormData({ ...formData, "Requested By": e.target.value })}
              placeholder="e.g. John Doe"
              className="h-11 rounded-lg"
            />
          </div>
        </div>

        {columns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Line Items</Label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-1 h-8">
                  <FileSpreadsheet className="w-3 h-3" /> Import Excel/CSV
                </Button>
                <Button type="button" size="sm" onClick={addRow} variant="outline" className="gap-1 h-8">
                  <Plus className="w-3 h-3" /> Add Row
                </Button>
              </div>
            </div>
            
            <div className="border border-border/60 rounded-xl overflow-x-auto bg-background">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50 border-b border-border/60">
                  <tr>
                    {columns.map((c: any, i: number) => (
                      <th key={i} className="px-4 py-3 font-semibold text-muted-foreground">{c.name}</th>
                    ))}
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/40 last:border-0 hover:bg-secondary/10">
                      {columns.map((c: any, colIdx: number) => (
                        <td key={colIdx} className="px-2 py-2">
                          <Input
                            type={c.type === "number" ? "number" : "text"}
                            value={item[c.name] || ""}
                            onChange={(e) => updateRow(idx, c.name, e.target.value)}
                            placeholder={`Enter ${c.name.toLowerCase()}`}
                            className="h-9 border-none bg-transparent shadow-none focus-visible:ring-1"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground italic">
                        No items added. Click "Add Row" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Additional Details</Label>
          <textarea
            value={formData.Details}
            onChange={(e) => setFormData({ ...formData, Details: e.target.value })}
            placeholder="Any extra context or details for this request..."
            className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button
          type="submit"
          disabled={submitMutation.isPending || (!financeBook && !isPreview)}
          className="w-full rounded-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
          style={{ background: themeColor, color: "#fff", opacity: (!financeBook && !isPreview) ? 0.5 : 1 }}
        >
          {submitMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit {formType}
        </Button>
        {!financeBook && !isPreview && (
          <p className="text-xs text-destructive text-center mt-2 font-medium">
            The finance team has not set up the Requests book yet. Go to Finance Dashboard to enable it.
          </p>
        )}
      </form>

      {/* Column Mapping Modal */}
      <Dialog open={showMappingModal} onOpenChange={setShowMappingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Map Columns</DialogTitle>
            <DialogDescription>
              Match the columns from your Excel file to the required fields for this form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columns.map((c: any) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold">{c.name}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={columnMap[c.name] || ""}
                  onChange={(e) => setColumnMap({ ...columnMap, [c.name]: e.target.value })}
                >
                  <option value="">-- Ignore this column --</option>
                  {importedHeaders.map((h, idx) => (
                    <option key={`hdr-${idx}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappingModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmMapping}>Import {importedData.length} Rows</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
