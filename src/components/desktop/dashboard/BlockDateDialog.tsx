import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVenueBooking } from "@/api/venue_bookings";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function BlockDateDialog({
  open,
  onOpenChange,
  venue,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  venue: any;
}) {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "23:59",
    internal_notes: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!formData.start_date || !formData.end_date) throw new Error("Dates are required");
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);

      if (start >= end) {
        throw new Error("End time must be after start time");
      }

      return createVenueBooking({
        data: {
          workspace_id: activeWorkspace?.id,
          venue_id: venue.id,
          customer_name: "Blocked",
          customer_email: null,
          customer_phone: null,
          customer_id_document: null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: "Blocked",
          payment_status: "Paid",
          amount: 0,
          number_of_attendees: 0,
          tickets_data: null,
          attendees_info: null,
          internal_notes: formData.internal_notes,
        },
      });
    },
    onSuccess: () => {
      toast.success("Dates blocked successfully");
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venue.id] });
      onOpenChange(false);
      setFormData({
        start_date: "",
        start_time: "00:00",
        end_date: "",
        end_time: "23:59",
        internal_notes: "",
      });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to block dates");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/60">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl">Block Dates</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Block out dates to prevent any bookings.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Reason for Blocking (Internal)</Label>
            <Input
              required
              value={formData.internal_notes}
              onChange={(e) => setFormData((p) => ({ ...p, internal_notes: e.target.value }))}
              placeholder="e.g. Maintenance, Private Event, Emergency Closure"
              className="h-10 rounded-xl bg-secondary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                className="h-10 rounded-xl bg-secondary/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                className="h-10 rounded-xl bg-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))}
                className="h-10 rounded-xl bg-secondary/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))}
                className="h-10 rounded-xl bg-secondary/50"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              type="submit"
              variant="destructive"
              className="flex-1 rounded-xl"
            >
              {isPending ? "Blocking..." : "Block Dates"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
