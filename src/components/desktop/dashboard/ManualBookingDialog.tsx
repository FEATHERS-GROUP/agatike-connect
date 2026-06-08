import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createVenueBooking } from "@/api/venue_bookings";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ArrowLeft, ArrowRight, Check, Plus, Trash, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getWorkspaceTicketProjects } from "@/api/events";
import { sendTicketsEmail } from "@/api/email";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";

export function ManualBookingDialog({
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

  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const venueProject = ticketProjects?.find((p: any) => p.venueId === venue.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [bookingRes, setBookingRes] = useState<any>(null);

  const [step, setStep] = useState(1);
  const isEntranceOnly =
    venue?.rental_model === "ENTRANCE_ONLY" ||
    venue?.rental_model === "HYBRID" ||
    venue?.type?.toLowerCase() === "park";

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_id_document: "",
    start_date: "",
    start_time: "09:00",
    end_date: "",
    end_time: "18:00",
    status: "Confirmed",
    amount: "0",
    internal_notes: "",
  });

  const [ticketsData, setTicketsData] = useState<Record<string, number>>({});
  const [selectedPricingTier, setSelectedPricingTier] = useState<string>("");

  const [attendees, setAttendees] = useState<{ name: string; id_document: string }[]>([]);

  // Auto-calculate amount
  useEffect(() => {
    if (isEntranceOnly && venue?.pricing_tiers) {
      let total = 0;
      venue.pricing_tiers.forEach((tier: any) => {
        const qty = ticketsData[tier.name] || 0;
        total += qty * (Number(tier.amount) || 0);
      });
      setFormData((p) => ({ ...p, amount: total.toString() }));
    } else if (selectedPricingTier && venue?.pricing_tiers) {
      const tier = venue.pricing_tiers.find((t: any) => t.name === selectedPricingTier);
      if (tier) {
        setFormData((p) => ({ ...p, amount: tier.amount.toString() }));
      }
    }
  }, [ticketsData, selectedPricingTier, venue, isEntranceOnly]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!formData.start_date) throw new Error("Start date is required");

      let start = new Date(
        `${formData.start_date}T${isEntranceOnly ? "00:00" : formData.start_time}`,
      );
      let end = isEntranceOnly
        ? new Date(`${formData.start_date}T23:59`)
        : new Date(`${formData.end_date || formData.start_date}T${formData.end_time}`);

      if (start >= end) {
        throw new Error("End time must be after start time");
      }

      const totalAttendees = 1 + attendees.length; // 1 primary customer + additional attendees

      // If not ENTRANCE_ONLY, tickets_data should store the selected tier
      const finalTicketsData = isEntranceOnly
        ? ticketsData
        : { selected_tier: selectedPricingTier };

      return createVenueBooking({
        data: {
          workspace_id: activeWorkspace?.id,
          venue_id: venue.id,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email || null,
          customer_phone: formData.customer_phone || null,
          customer_id_document: formData.customer_id_document || null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: formData.status,
          payment_status: "Paid", // Hardcoded per requirements
          amount: Number(formData.amount) || 0,
          number_of_attendees: totalAttendees,
          tickets_data: finalTicketsData,
          attendees_info: attendees.length > 0 ? attendees : null,
          internal_notes: formData.internal_notes || null,
          venue_name: venue.name,
          venue_currency: venue.currency,
        },
      });
    },

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venue.id] });

      const ticketsData = res.tickets_data;
      if (
        ticketsData?.issued &&
        ticketsData.issued.length > 0 &&
        formData.customer_email &&
        venueProject
      ) {
        setIsGenerating(true);
        setIssuedTickets(ticketsData.issued);
        setBookingRes(res);
        // Generation will happen in a useEffect once the DOM elements render
      } else {
        toast.success("Booking created successfully");
        handleClose();
      }
    },

    onError: (e: any) => {
      toast.error(e.message || "Failed to create booking");
    },
  });

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && venueProject) {
      const generatePDFs = async () => {
        try {
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(`ticket-render-${ticket.id}`);
            if (!el) continue;

            const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "px",
              format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            const base64 = pdf.output("datauristring").split(",")[1];

            attachments.push({
              filename: `Ticket_${ticket.tier.replace(/\s+/g, "_")}_${ticket.otp}.pdf`,
              content: base64,
            });
          }

          if (attachments.length > 0) {
            await sendTicketsEmail({
              data: {
                to: formData.customer_email,
                customerName: formData.customer_name,
                venueName: venue.name || "the Venue",
                attachments,
              } as any,
            });
            toast.success("Booking created and tickets emailed!");
          } else {
            toast.success("Booking created!");
          }
        } catch (e: any) {
          console.error(e);
          toast.error("Booking created, but failed to email custom tickets.");
        } finally {
          setIsGenerating(false);
          handleClose();
        }
      };

      // small delay to ensure DOM is fully rendered
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_id_document: "",
        start_date: "",
        start_time: "09:00",
        end_date: "",
        end_time: "18:00",
        status: "Confirmed",
        amount: "0",
        internal_notes: "",
      });
      setTicketsData({});
      setIsGenerating(false);
      setIssuedTickets([]);
      setSelectedPricingTier("");
      setAttendees([]);
    }, 300);
  };

  const nextStep = () => {
    if (step === 1) {
      if (isEntranceOnly) {
        const totalTickets = Object.values(ticketsData).reduce((a, b) => a + b, 0);
        if (totalTickets === 0) return toast.error("Please select at least one ticket.");
      } else {
        if (!selectedPricingTier && venue?.pricing_tiers?.length > 0)
          return toast.error("Please select a pricing tier.");
      }
    }
    if (step === 2) {
      if (!formData.start_date) return toast.error("Please select a date.");
      if (!isEntranceOnly && (!formData.end_date || !formData.start_time || !formData.end_time)) {
        return toast.error("Please complete the time selection.");
      }
    }
    if (step === 3) {
      if (!formData.customer_name) return toast.error("Customer name is required.");
    }
    if (step === 4) {
      return mutate();
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <Dialog open={open} onOpenChange={open ? undefined : handleClose}>
      <DialogContent className="sm:max-w-4xl bg-card border-border/60 max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 border-b border-border/60 flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <DialogTitle className="text-xl">Manual Booking - Step {step} of 4</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Record a reservation manually.</p>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Pricing & Tickets</h3>

              {isEntranceOnly ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {venue?.pricing_tiers?.map((tier: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden flex justify-between items-center bg-secondary/30 p-5 rounded-2xl border-2 border-border/50 border-dashed"
                    >
                      <Ticket className="absolute -right-4 -bottom-4 h-24 w-24 text-muted-foreground/5 rotate-[-15deg] pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg tracking-tight">{tier.name}</p>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {venue.currency} {Number(tier.amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <Input
                          type="number"
                          min="0"
                          value={ticketsData[tier.name] || ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setTicketsData((p) => ({ ...p, [tier.name]: val }));
                          }}
                          className="w-24 h-12 text-center font-bold text-lg rounded-xl border-2"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                  {(!venue?.pricing_tiers || venue.pricing_tiers.length === 0) && (
                    <div className="col-span-2 p-6 text-center text-muted-foreground bg-secondary/30 rounded-2xl border-2 border-dashed">
                      No pricing tiers configured for this venue.
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {venue?.pricing_tiers?.map((tier: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPricingTier(tier.name)}
                      className={cn(
                        "relative overflow-hidden flex flex-col text-left p-6 rounded-3xl border-2 transition-all duration-200",
                        selectedPricingTier === tier.name
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                          : "border-border/60 border-dashed bg-secondary/20 hover:bg-secondary/40 hover:border-primary/50",
                      )}
                    >
                      <Ticket className="absolute -right-6 -bottom-6 h-32 w-32 text-muted-foreground/5 rotate-[-15deg] pointer-events-none" />

                      <div className="relative z-10 mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Ticket className="h-6 w-6 text-primary" />
                      </div>
                      <span className="relative z-10 font-bold text-xl mb-1 tracking-tight">
                        {tier.name}
                      </span>
                      <span className="relative z-10 text-muted-foreground font-semibold">
                        {venue.currency} {Number(tier.amount).toLocaleString()}
                      </span>

                      {selectedPricingTier === tier.name && (
                        <div className="absolute top-5 right-5 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-sm">
                          <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                  {(!venue?.pricing_tiers || venue.pricing_tiers.length === 0) && (
                    <div className="col-span-full p-6 text-center text-muted-foreground bg-secondary/30 rounded-2xl border-2 border-dashed">
                      No pricing tiers configured for this venue.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 max-w-xl mx-auto py-8">
              <h3 className="text-lg font-semibold border-b pb-2 text-center">Date & Time</h3>

              {isEntranceOnly ? (
                <div className="space-y-2">
                  <Label>Date of Visit *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                    className="h-12 rounded-xl bg-secondary/50 text-lg px-4"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                      className="h-12 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))}
                      className="h-12 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                      className="h-12 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time *</Label>
                    <Input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))}
                      className="h-12 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-6">Primary Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Full Name / Organization *</Label>
                    <Input
                      required
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customer_name: e.target.value }))
                      }
                      placeholder="e.g. John Doe or Tech Summit"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ID / Passport Number</Label>
                    <Input
                      value={formData.customer_id_document}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customer_id_document: e.target.value }))
                      }
                      placeholder="Optional"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customer_email: e.target.value }))
                      }
                      placeholder="customer@example.com"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customer_phone: e.target.value }))
                      }
                      placeholder="+1 234 567 8900"
                      className="h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold">Additional Attendees (Optional)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAttendees([...attendees, { name: "", id_document: "" }])}
                    className="rounded-full h-8 gap-1 text-xs"
                  >
                    <Plus className="h-3 w-3" /> Add Person
                  </Button>
                </div>

                {attendees.length === 0 ? (
                  <div className="text-center p-6 bg-secondary/20 rounded-xl border border-dashed border-border/60 text-muted-foreground text-sm">
                    No additional attendees added. They are optional.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendees.map((att, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-1.5">
                          <Input
                            placeholder={`Attendee ${idx + 1} Name`}
                            value={att.name}
                            onChange={(e) => {
                              const newArr = [...attendees];
                              newArr[idx].name = e.target.value;
                              setAttendees(newArr);
                            }}
                            className="h-10 rounded-xl bg-secondary/50"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <Input
                            placeholder={`ID / Passport`}
                            value={att.id_document}
                            onChange={(e) => {
                              const newArr = [...attendees];
                              newArr[idx].id_document = e.target.value;
                              setAttendees(newArr);
                            }}
                            className="h-10 rounded-xl bg-secondary/50"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAttendees(attendees.filter((_, i) => i !== idx))}
                          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Review Booking</h3>
                <p className="text-muted-foreground">Verify the details below before confirming.</p>
              </div>

              <div className="bg-secondary/20 p-6 rounded-2xl border border-border/60 space-y-6">
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {venue.currency} {Number(formData.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-500 font-bold tracking-wider uppercase">
                      <Check className="h-3.5 w-3.5" /> PAID
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Customer Name</p>
                    <p className="font-medium">{formData.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Contact</p>
                    <p className="font-medium">
                      {formData.customer_phone || formData.customer_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Date</p>
                    <p className="font-medium">
                      {formData.start_date} {isEntranceOnly ? "" : `to ${formData.end_date}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Total People</p>
                    <p className="font-medium">{1 + attendees.length} Attendee(s)</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Internal Notes (Optional)</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-xl bg-background border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Add any internal notes..."
                    value={formData.internal_notes}
                    onChange={(e) => setFormData((p) => ({ ...p, internal_notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/60 flex items-center justify-between bg-card sticky bottom-0">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 1 ? handleClose : prevStep}
            className="rounded-xl px-6"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={nextStep}
            className="rounded-xl px-8 shadow-[var(--shadow-glow)] gap-2"
            style={{ background: step === 4 ? "var(--gradient-primary)" : undefined }}
          >
            {isPending ? "Confirming..." : step === 4 ? "Confirm & Pay" : "Next Step"}
            {step < 4 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Hidden Renderer for PDFs */}
        {isGenerating && (
          <div
            className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none"
            style={{ left: "-9999px" }}
          >
            {issuedTickets.map((t: any) => (
              <div
                key={t.id}
                id={`ticket-render-${t.id}`}
                className="inline-block p-4 bg-background"
              >
                <TicketPreview
                  template={venueProject.template}
                  palette={venueProject.palette || { from: "#000", to: "#000", name: "Black" }}
                  font={venueProject.font || { css: "sans-serif", name: "Modern" }}
                  tier={t.tier}
                  title={venue.name}
                  subtitle={venue.address || ""}
                  date="Valid for 1 Day"
                  time="Opening Hours"
                  seat="General"
                  price={formData.amount}
                  currency={venue.currency}
                  cover={venueProject.coverImage || ""}
                  logoText={venueProject.logoText || ""}
                  logoImage={venueProject.logoImage}
                  logoScale={Number(venueProject.logoScale || 24)}
                  logoOpacity={Number(venueProject.logoOpacity ?? 1)}
                  logoColorMode={venueProject.logoColorMode || "original"}
                  orderId={t.otp}
                  previewMode="Front"
                  layout={
                    venueProject.design_overrides?.layout || {
                      titleSize: 30,
                      subtitleSize: 14,
                      metaSize: 11,
                      titleAlign: "left",
                      titleOffsetY: 0,
                      subtitleOffsetY: 0,
                      metaOffsetY: 0,
                    }
                  }
                  back={
                    venueProject.design_overrides?.back || {
                      backText: "",
                      backImage: "",
                      backImageOpacity: 0.3,
                    }
                  }
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
