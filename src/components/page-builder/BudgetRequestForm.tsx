import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPublicAgatikeBooksByWorkspace, createPublicAgatikeBookRecord } from "@/api/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function BudgetRequestForm({ workspace_id, themeColor, comp }: { workspace_id: string; themeColor: string; comp: any }) {
  const [formData, setFormData] = useState({
    Type: "Damage Report",
    Title: "",
    Details: "",
    Amount: "",
    "Requested By": "",
    Status: "Pending",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: books = [] } = useQuery({
    queryKey: ["public-books", workspace_id],
    queryFn: () => getPublicAgatikeBooksByWorkspace({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  const financeBook = (books as any[]).find((b: any) => b.name === "__finance_requests");

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!financeBook) {
        throw new Error("Budget requests book not configured for this workspace yet.");
      }
      return createPublicAgatikeBookRecord({
        data: {
          book_id: financeBook.id,
          record_data: formData,
        },
      } as any);
    },
    onSuccess: () => {
      toast.success("Request submitted successfully");
      setIsSubmitted(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Title || !formData.Details || !formData.Amount || !formData["Requested By"]) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate();
  };

  if (isSubmitted) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm max-w-lg mx-auto my-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${themeColor}20`, color: themeColor }}>
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Request Submitted</h3>
        <p className="text-muted-foreground mb-6">
          Thank you! Your request has been sent to the finance team for review.
        </p>
        <Button onClick={() => {
          setIsSubmitted(false);
          setFormData({ Type: "Damage Report", Title: "", Details: "", Amount: "", "Requested By": "", Status: "Pending" });
        }} variant="outline">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm max-w-lg mx-auto my-8">
      <h3 className="text-xl md:text-2xl font-bold mb-2">{comp.title || "Budget & Damage Request"}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {comp.description || "Submit a request to the finance team for approval."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Request Type *</Label>
          <Select value={formData.Type} onValueChange={(v) => setFormData({ ...formData, Type: v })}>
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Damage Report">Damage Report</SelectItem>
              <SelectItem value="Budget Request">Budget Request</SelectItem>
              <SelectItem value="Purchase Request">Purchase Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Title / Subject *</Label>
          <Input
            value={formData.Title}
            onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
            placeholder="e.g. Broken Main Stage Speaker"
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Estimated Amount *</Label>
          <Input
            type="number"
            value={formData.Amount}
            onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
            placeholder="e.g. 50000"
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Your Name / Email *</Label>
          <Input
            value={formData["Requested By"]}
            onChange={(e) => setFormData({ ...formData, "Requested By": e.target.value })}
            placeholder="e.g. John Doe (john@example.com)"
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <Label className="text-xs">Full Details *</Label>
          <textarea
            value={formData.Details}
            onChange={(e) => setFormData({ ...formData, Details: e.target.value })}
            placeholder="Please provide all necessary details about this request..."
            className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button
          type="submit"
          disabled={submitMutation.isPending || !financeBook}
          className="w-full rounded-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
          style={{ background: themeColor, color: "#fff" }}
        >
          {submitMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Submit Request
        </Button>
        {!financeBook && books.length > 0 && (
          <p className="text-xs text-destructive text-center mt-2">
            The finance team has not set up the Requests book yet.
          </p>
        )}
      </form>
    </div>
  );
}
