import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard, Shield, Smartphone, Wallet, Lock, MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getEventById, getWorkspaceTicketProjects } from "@/api/events";
import { addEventAttendees } from "@/api/attendees";
import { sendTicketsEmail } from "@/api/email";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function BookingMobile({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"me" | "others">("me");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  
  // State for attendees dynamic form
  const [attendees, setAttendees] = useState<any[]>([]);
  
  const storageKey = `event_checkout_${eventId}`;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch Event
  const { data: dbEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
  });

  const event = dbEvent;
  const currency = event?.workspaces?.currency || "RWF";

  // Fetch Ticket Projects for PDF generation
  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", event?.workspace_id],
    queryFn: () => getWorkspaceTicketProjects({ data: { workspaceId: event?.workspace_id! } } as any),
    enabled: !!event?.workspace_id,
  });
  
  const eventProject = ticketProjects?.find((p: any) => p.eventId === event.id);

  // Load cart and init attendees
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedCart = JSON.parse(saved);
        setCart(parsedCart);
      }
    } catch { }
    setIsHydrated(true);
  }, [storageKey]);


  // Initialize attendees array based on cart
  useEffect(() => {
    if (!isHydrated || Object.keys(cart).length === 0) return;
    
    if (attendees.length > 0) return; // Prevent re-initialization which causes lag and resets inputs
    
    const initialAttendees: any[] = [];
    Object.entries(cart).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
      const [stopIdx, tierId] = cartKey.split("_");
      for (let i = 0; i < qty; i++) {
        initialAttendees.push({
          cartKey,
          stopIdx: parseInt(stopIdx),
          tierId,
          firstName: "",
          lastName: "",
          email: user?.email || "",
          phone: user?.phone || "",
          country: user?.country || "",
        });
      }
    });

    if (initialAttendees.length > 0 && user) {
      if (!initialAttendees[0].firstName && user.username) {
        initialAttendees[0].firstName = user.username.split(" ")[0] || "";
        initialAttendees[0].lastName = user.username.split(" ").slice(1).join(" ") || "";
      }
    }

    setAttendees(initialAttendees);
  }, [isHydrated, cart, user]);

  const updateAttendee = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const countrySelectItems = useMemo(() => {
    return COUNTRIES.map((c) => (
      <SelectItem key={c.name} value={c.name}>
        {c.name}
      </SelectItem>
    ));
  }, []);

  const getTierDetails = (tierId: string) => {
    return event?.event_tickets?.find((t: any) => t.id === tierId);
  };

  const getStopDetails = (stopIdx: number) => {
    const stops = event?.tour_stops || [];
    return stops[stopIdx] || stops[0] || { city: event?.city || "TBD", date: "TBD" };
  };

  const total = Object.entries(cart).reduce((sum, [key, qty]) => {
    if (qty <= 0) return sum;
    const [, tierId] = key.split("_");
    const tier = getTierDetails(tierId);
    return sum + (tier ? parseFloat(tier.cost || tier.price || 0) * qty : 0);
  }, 0);
  
  const totalTickets = attendees.length;
  const isFormValid = assignMode === "me"
    ? attendees.length > 0 && !!attendees[0].firstName && !!attendees[0].lastName && !!attendees[0].email && !!attendees[0].country
    : attendees.every((a) => a.firstName && a.lastName && a.email && a.country);

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      const attendeesPayload = attendees.map((a, idx) => {
        const otp = Math.random().toString(36).substring(2, 10).toUpperCase();
        const tier = getTierDetails(a.tierId);
        const sourceAttendee = assignMode === "me" 
          ? { ...a, firstName: attendees[0].firstName, lastName: attendees[0].lastName, email: attendees[0].email, phone: attendees[0].phone, country: attendees[0].country } 
          : a;

        return {
          event_id: event.id,
          user_id: user?.id || null,
          names: `${sourceAttendee.firstName} ${sourceAttendee.lastName}`.trim(),
          email: sourceAttendee.email,
          phone: sourceAttendee.phone || "",
          qrcode_number: otp,
          quanity: "1",
          status: "Confirmed",
          ticket_id: a.tierId,
          ticket_type: tier ? tier.type : "General Admission",
          type: "Booking",
          payment_method: paymentMethod,
          custom_fields: { country: sourceAttendee.country, tour_stop_idx: a.stopIdx }
        };
      });

      const res = await addEventAttendees({ data: { objects: attendeesPayload } } as any);
      return { res, attendeesPayload };
    },
    onSuccess: (data: any) => {
      const { res, attendeesPayload } = data;
      const returned = res?.insert_event_attendees?.returning || [];
      const ticketsToIssue = attendees.map((a, idx) => {
        const tier = getTierDetails(a.tierId);
        const sourceAttendee = assignMode === "me" 
          ? { ...a, firstName: attendees[0].firstName, lastName: attendees[0].lastName, email: attendees[0].email, phone: attendees[0].phone, country: attendees[0].country } 
          : a;
        return {
          id: returned[idx]?.id || `temp_${idx}`,
          otp: attendeesPayload[idx].qrcode_number,
          tier: tier ? tier.type : "General Admission",
          attendee: sourceAttendee,
        };
      });

      if (ticketsToIssue.length > 0 && eventProject) {
        setIsGenerating(true);
        setIssuedTickets(ticketsToIssue);
      } else {
        localStorage.removeItem(storageKey);
        setIsSuccess(true);
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Checkout failed");
    }
  });

  const getMergedProjectDesign = (baseProject: any, stopIdx: number, tierId: string) => {
    if (!baseProject) return null;
    const overrides = baseProject.design_overrides?.overrides;
    if (!overrides) return baseProject;

    const stopOverride = overrides.tourStops?.[stopIdx] || {};
    const tierOverride = overrides.tiers?.[tierId] || {};
    const combinationOverride = overrides.combinations?.[`${stopIdx}_${tierId}`] || {};

    return {
      ...baseProject,
      ...stopOverride,
      ...tierOverride,
      ...combinationOverride,
      palette: combinationOverride.palette || tierOverride.palette || stopOverride.palette || baseProject.palette,
      font: combinationOverride.font || tierOverride.font || stopOverride.font || baseProject.font,
    };
  };

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && eventProject) {
      const generatePDFs = async () => {
        try {
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(`ticket-render-${ticket.id}`);
            if (!el) continue;

            await new Promise((r) => setTimeout(r, 100));

            const imgData = await htmlToImage.toPng(el, {
              pixelRatio: 2,
              backgroundColor: "transparent",
              width: 720,
              height: 260,
            });
            
            if (!imgData || imgData === "data:,") {
              throw new Error("htmlToImage returned an empty image. Usually caused by unloaded fonts or images.");
            }

            const width = 720;
            const height = 260;

            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "px",
              format: [width, height],
            });
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            const base64 = pdf.output("datauristring").split(",")[1];

            attachments.push({
              filename: `Ticket_${ticket.tier.replace(/\s+/g, "_")}_${ticket.otp}.pdf`,
              content: base64,
            });
          }

          if (attachments.length > 0) {
            const emailGroups: Record<string, { name: string, attachments: any[] }> = {};
            
            for (let i = 0; i < issuedTickets.length; i++) {
              const email = issuedTickets[i].attendee.email || attendees[0]?.email;
              const name = `${issuedTickets[i].attendee.firstName} ${issuedTickets[i].attendee.lastName}`.trim() || "Guest";
              
              if (!emailGroups[email]) {
                emailGroups[email] = { name, attachments: [] };
              }
              emailGroups[email].attachments.push(attachments[i]);
            }

            for (const [email, group] of Object.entries(emailGroups)) {
              await sendTicketsEmail({
                data: {
                  to: email,
                  customerName: group.name,
                  venueName: event.title,
                  attachments: group.attachments,
                }
              } as any).catch(e => console.error("Failed to email", email, e));
            }
          }
          localStorage.removeItem(storageKey);
          setIsSuccess(true);
        } catch (err) {
          console.error("PDF generation error:", err);
          toast.error("Booking succeeded but ticket PDF generation failed.");
          localStorage.removeItem(storageKey);
          setIsSuccess(true);
        }
      };

      generatePDFs();
    }
  }, [isGenerating, issuedTickets, eventProject, event?.title, attendees, storageKey]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate({ to: "/venues", replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  if (!event || attendees.length === 0) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading cart...</p>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
          Your tickets for {event.title} have been secured. We've sent them to {attendees[0]?.email}.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">Redirecting to venues...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 relative">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 pt-safe-top border-b border-border/40">
        <Link to="/events/$eventId" params={{ eventId }} className="p-2 -ml-2 text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-bold text-lg tracking-tight">Checkout</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-bold mb-4">Order Summary ({totalTickets} items)</h2>
          <div className="flex gap-4 bg-card/60 rounded-3xl p-4 border border-border/40 backdrop-blur mb-4">
            <img src={event.cover} className="h-24 w-20 rounded-xl object-cover" />
            <div className="flex flex-col flex-1 py-1">
              <h3 className="font-bold text-base leading-tight mb-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground mb-auto">
                {(event as any).date} • {(event as any).venue || (event as any).city}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border/40">
            {Object.entries(cart).map(([cartKey, qty]) => {
              if (qty <= 0) return null;
              const [, tierId] = cartKey.split("_");
              const tier = getTierDetails(tierId);
              if (!tier) return null;
              return (
                <div key={cartKey} className="flex justify-between items-center text-sm">
                  <span>{qty}x {tier.type}</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(tier.cost || 0) * qty, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Attendee Details */}
        <div>
          <h1 className="text-2xl font-bold px-1 mb-5">Checkout ({totalTickets})</h1>

          {totalTickets > 1 && (
            <div className="flex bg-muted/50 p-1 rounded-xl mb-6 mx-1 w-fit">
              <button
                onClick={() => setAssignMode("me")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  assignMode === "me"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Assign to Me (Faster)
              </button>
              <button
                onClick={() => setAssignMode("others")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  assignMode === "others"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Assign Individually
              </button>
            </div>
          )}

          <div className="space-y-6">
            {(assignMode === "me" ? [attendees[0]] : attendees).map((attendee, idx) => {
              if (!attendee) return null;
              const tier = getTierDetails(attendee.tierId);
              const stop = getStopDetails(attendee.stopIdx);
              
              return (
                <div key={idx} className="p-5 rounded-3xl border border-border/60 bg-card/40 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        {assignMode === "me" ? "Your Details (Applied to all tickets)" : (tier ? tier.type : "Ticket")}
                      </h3>
                      {assignMode === "others" && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {stop.city} &middot; {stop.date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">First Name</Label>
                        <Input 
                          value={attendee.firstName || ""}
                          onChange={(e) => updateAttendee(idx, "firstName", e.target.value)}
                          placeholder="Alex" 
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Last Name</Label>
                        <Input 
                          value={attendee.lastName || ""}
                          onChange={(e) => updateAttendee(idx, "lastName", e.target.value)}
                          placeholder="Doe" 
                          className="h-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input 
                        type="email" 
                        value={attendee.email || ""}
                        onChange={(e) => updateAttendee(idx, "email", e.target.value)}
                        placeholder="alex@example.com" 
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Number</Label>
                        <Input 
                          type="tel" 
                          value={attendee.phone || ""}
                          onChange={(e) => updateAttendee(idx, "phone", e.target.value)}
                          placeholder="+250 788 123 456" 
                          className="h-10"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Select value={attendee.country} onValueChange={(val) => updateAttendee(idx, "country", val)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countrySelectItems}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-sm font-medium text-muted-foreground">Total to pay</span>
          <span className="text-xl font-bold">
            {formatCurrency(total, currency)}
          </span>
        </div>
        <Button
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={!isFormValid || isCheckingOut || isGenerating}
          className="w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
          style={{ background: "var(--gradient-primary)" }}
        >
          Pay {formatCurrency(total, currency)}
        </Button>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Secure encrypted checkout
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProceed={doCheckout}
        isProcessing={isCheckingOut}
        isGenerating={isGenerating}
      />
      
      {/* Hidden container for PDF rendering */}
      {isGenerating && issuedTickets.length > 0 && eventProject && (
        <div
          className="absolute -z-50 pointer-events-none"
          style={{ top: "-9999px", left: "-9999px" }}
        >
          {issuedTickets.map((ticket: any) => {
            const mergedProject = getMergedProjectDesign(eventProject, ticket.attendee.stopIdx, ticket.attendee.tierId);
            return (
              <div
                key={ticket.id}
                id={`ticket-render-${ticket.id}`}
                className="inline-block bg-white relative w-[720px] h-[260px] overflow-hidden"
              >
                <TicketPreview
                  template={mergedProject.template || "Concert 1"}
                  palette={mergedProject.palette || { from: "#000", to: "#000", name: "Black" }}
                  font={mergedProject.font || { css: "sans-serif", name: "Modern" }}
                  tier={ticket.tier}
                  title={event.title}
                  subtitle={event.venue || ""}
                  date={getStopDetails(ticket.attendee.stopIdx)?.date || ""}
                  time={getStopDetails(ticket.attendee.stopIdx)?.time || "TBA"}
                  seat={`${ticket.attendee.firstName} ${ticket.attendee.lastName}`.trim()}
                  price={getTierDetails(ticket.attendee.tierId)?.cost?.toString() || getTierDetails(ticket.attendee.tierId)?.price?.toString() || "0"}
                  currency={currency === "FRWS" ? "RWF" : currency}
                  cover={mergedProject.coverImage || event.cover || ""}
                  logoText={mergedProject.logoText !== undefined && mergedProject.logoText !== "" ? mergedProject.logoText : (event.organizer || "Agatike")}
                  logoImage={mergedProject.logoImage}
                  logoScale={Number(mergedProject.logoScale || 24)}
                  logoOpacity={Number(mergedProject.logoOpacity ?? 1)}
                  logoColorMode={mergedProject.logoColorMode || "original"}
                  orderId={ticket.otp}
                  qrValue={`${window.location.origin}/v/${ticket.otp}`}
                  previewMode="Front"
                  layout={
                    mergedProject.design_overrides?.layout || {
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
                    mergedProject.design_overrides?.back || {
                      backText: "",
                      backImage: "",
                      backImageOpacity: 0.3,
                    }
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
