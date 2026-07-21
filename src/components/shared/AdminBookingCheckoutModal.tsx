import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, ReceiptText, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface AdminBookingCheckoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facility: any;
  selectedSlots: number[];
  durationMinutes: number;
  slotPrice: number;
  currency: string;
  daysInRange: Date[];
  subTotal: number;
  totalAmount: number;
  amountPaid: string;
  setAmountPaid: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  handleCreateBooking: () => void;
  isPending: boolean;
}

function formatSlot(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function AdminBookingCheckoutModal({
  isOpen,
  onOpenChange,
  facility,
  selectedSlots,
  durationMinutes,
  slotPrice,
  currency,
  daysInRange,
  subTotal,
  totalAmount,
  amountPaid,
  setAmountPaid,
  paymentStatus,
  setPaymentStatus,
  paymentMethod,
  setPaymentMethod,
  handleCreateBooking,
  isPending,
}: AdminBookingCheckoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2 max-h-[80vh] overflow-y-auto">
          <div className="bg-secondary/30 rounded-2xl border border-border/60 p-5 space-y-4">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Invoice</h4>
            
            <div className="space-y-2 min-h-[100px] max-h-[250px] overflow-y-auto pr-2">
              {selectedSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No slots selected</p>
              ) : (
                selectedSlots.map((slot) => (
                  <div key={slot} className="flex justify-between text-sm items-center py-1">
                    <span className="text-foreground font-medium">
                      {facility.name} ({formatSlot(slot)} - {formatSlot(slot + durationMinutes)})
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      {formatCurrency(slotPrice, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-border/60 space-y-2">
              {daysInRange.length > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Days</span>
                  <span className="font-semibold text-foreground">× {daysInRange.length}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Sub Total</span>
                <span className="font-semibold text-foreground">{formatCurrency(subTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-xl text-primary">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/10 p-5 rounded-2xl border border-border/40 space-y-4">
            <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Details
            </h4>
            
            <div className="space-y-3">
              <Label>Amount Paid</Label>
              <Input
                className="h-12 bg-background rounded-xl font-bold text-lg"
                placeholder={totalAmount.toString()}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className={cn("h-12 bg-background rounded-xl font-semibold", paymentStatus === "Paid" ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="font-semibold text-green-600 dark:text-green-400">Paid</SelectItem>
                    <SelectItem value="Unpaid" className="font-semibold text-destructive">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Payment Mode</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12 bg-background rounded-xl font-semibold">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="MoMo">MoMo</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60">
            <Button
              type="button"
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg"
              disabled={isPending}
              onClick={handleCreateBooking}
            >
              {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Confirm & Create Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
