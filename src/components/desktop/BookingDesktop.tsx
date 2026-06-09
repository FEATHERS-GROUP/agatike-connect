import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard, Shield, Smartphone, Wallet, Lock, MapPin, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getEventById, getWorkspaceTicketProjects } from "@/api/events";
import { addEventAttendees } from "@/api/attendees";
import { sendTicketsEmail } from "@/api/email";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BookingDesktop({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  
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

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.map((c: any) => c.name.common).sort();
        setCountries(sorted);
      })
      .catch(() => setCountries([]));
  }, []);

  // Initialize attendees array based on cart
  useEffect(() => {
    if (!isHydrated || Object.keys(cart).length === 0) return;
    
    // Flatten cart into individual ticket records
    const initialAttendees: any[] = [];
    Object.entries(cart).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
      const [stopIdx, tierId] = cartKey.split("_");
      for (let i = 0; i < qty; i++) {
        initialAttendees.push({
          cartKey,
          stopIdx: parseInt(stopIdx),
          tierId,
          names: "",
          email: "",
          phone: "",
          country: "",
        });
      }
    });

    // Pre-fill first attendee if user is logged in
    if (initialAttendees.length > 0 && user) {
      if (!initialAttendees[0].names && user.username) initialAttendees[0].names = user.username;
      if (!initialAttendees[0].email && user.email) initialAttendees[0].email = user.email;
      if (!initialAttendees[0].phone && user.phone) initialAttendees[0].phone = user.phone;
      if (!initialAttendees[0].country && user.country) initialAttendees[0].country = user.country;
    }

    setAttendees(initialAttendees);
  }, [isHydrated, cart, user]);

  const updateAttendee = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

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
  const isFormValid = attendees.every(a => a.names && a.email && a.country);

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      // Map attendees to Hasura table payload
      const attendeesPayload = attendees.map(a => {
        const otp = Math.random().toString(36).substring(2, 10).toUpperCase();
        const tier = getTierDetails(a.tierId);
        return {
          event_id: event.id,
          user_id: user?.id || null,
          names: a.names,
          email: a.email,
          phone: a.phone || "",
          qrcode_number: otp,
          quanity: 1,
          status: "Confirmed",
          ticket_id: a.tierId,
          ticket_type: tier ? tier.type : "General Admission",
          type: "Booking",
          payment_method: paymentMethod,
          custom_fields: { country: a.country, tour_stop_idx: a.stopIdx }
        };
      });

      return addEventAttendees({ data: { objects: attendeesPayload } } as any);
    },
    onSuccess: (res: any) => {
      // res returns { affected_rows, returning }
      const returned = res?.insert_event_attendees?.returning || [];
      // We need to attach the full attendee data we just sent so we can render PDFs!
      const issued = attendees.map((a, idx) => {
        const tier = getTierDetails(a.tierId);
        const otp = res.config?.data ? JSON.parse(res.config.data).variables?.objects?.[idx]?.qrcode_number : Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
          id: returned[idx]?.id || `temp_${idx}`,
          otp: otp,
          tier: tier ? tier.type : "General Admission",
          attendee: a,
        };
      });

      if (issued.length > 0 && eventProject) {
        setIsGenerating(true);
        setIssuedTickets(issued);
      } else {
        localStorage.removeItem(storageKey);
        setIsSuccess(true);
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Checkout failed");
    }
  });

  // Deep merge utility for ticket design overrides
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

          if (attachments.length > 0 && attendees[0]?.email) {
            await sendTicketsEmail({
              data: {
                to: attendees[0].email,
                customerName: attendees[0].names,
                eventTitle: event.title,
                attachments: attachments,
              }
            } as any);
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
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/events/$eventId"
          params={{ eventId }}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to event
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Left Column: Form & Payment */}
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-bold mb-6">Checkout ({totalTickets} Tickets)</h1>

              <div className="space-y-8">
                {attendees.map((attendee, idx) => {
                  const tier = getTierDetails(attendee.tierId);
                  const stop = getStopDetails(attendee.stopIdx);
                  
                  return (
                    <div key={idx} className="p-6 rounded-3xl border border-border/60 bg-card/40 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-border/60">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{tier ? tier.type : "Ticket"}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> {stop.city} &middot; <Calendar className="h-3 w-3" /> {stop.date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input 
                            value={attendee.names.split(" ")[0] || ""}
                            onChange={(e) => updateAttendee(idx, "names", `${e.target.value} ${attendee.names.split(" ").slice(1).join(" ")}`.trim())}
                            placeholder="Alex" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input 
                            value={attendee.names.split(" ").slice(1).join(" ") || ""}
                            onChange={(e) => updateAttendee(idx, "names", `${attendee.names.split(" ")[0] || ""} ${e.target.value}`.trim())}
                            placeholder="Doe" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email" 
                          value={attendee.email}
                          onChange={(e) => updateAttendee(idx, "email", e.target.value)}
                          placeholder="alex@example.com" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input 
                            type="tel" 
                            value={attendee.phone}
                            onChange={(e) => updateAttendee(idx, "phone", e.target.value)}
                            placeholder="+250 788 123 456" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Select value={attendee.country} onValueChange={(val) => updateAttendee(idx, "country", val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-8 border-t border-border/40">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              <div className="grid gap-4">
                <button
                  onClick={() => setPaymentMethod("apple")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "apple"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-foreground text-background rounded-full flex items-center justify-center shrink-0">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Apple Pay</p>
                    <p className="text-sm text-muted-foreground">Fast, secure checkout</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "apple" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Credit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "card" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("momo")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "momo"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">MTN MoMo, Airtel Money</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "momo" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <img src={event.cover} className="h-24 w-20 rounded-xl object-cover" />
                <div className="flex flex-col">
                  <h3 className="font-semibold leading-tight">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(event as any).date} • {(event as any).venue || (event as any).city}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm border-y border-border/60 py-4 mb-4">
                {Object.entries(cart).map(([cartKey, qty]) => {
                  if (qty <= 0) return null;
                  const [, tierId] = cartKey.split("_");
                  const tier = getTierDetails(tierId);
                  if (!tier) return null;
                  return (
                    <div key={cartKey} className="flex justify-between items-center">
                      <span>{qty}x {tier.type}</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(tier.cost || 0) * qty, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(total, currency)}
                </span>
              </div>

              <Button
                onClick={() => doCheckout()}
                disabled={isCheckingOut || isGenerating || !isFormValid}
                className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isGenerating
                  ? "Generating Tickets..."
                  : isCheckingOut
                    ? "Processing..."
                    : `Pay ${formatCurrency(total, currency)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" /> SSL Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Hidden container for PDF rendering */}
      {isGenerating && issuedTickets.length > 0 && eventProject && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px", visibility: "hidden" }}>
          {issuedTickets.map((ticket: any) => {
            const mergedProject = getMergedProjectDesign(eventProject, ticket.attendee.stopIdx, ticket.attendee.tierId);
            return (
              <div
                key={ticket.id}
                id={`ticket-render-${ticket.id}`}
                className="w-[720px] h-[260px] overflow-hidden"
              >
                <TicketPreview
                  project={mergedProject}
                  event={event}
                  venue={null}
                  tier={ticket.tier}
                  otp={ticket.otp}
                  date={getStopDetails(ticket.attendee.stopIdx).date}
                  ticketOwner={ticket.attendee.names}
                />
              </div>
            );
          })}
        </div>
      )}

      <Footer />
    </div>
  );
}
