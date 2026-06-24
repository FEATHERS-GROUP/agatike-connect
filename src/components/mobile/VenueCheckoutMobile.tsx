import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Calendar,
  Users,
  CheckCircle2,
  Ticket,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createVenueBooking } from "@/api/venue_bookings";
import { initiatePawaPayDeposit, getPawaPayDepositStatus } from "@/api/pawapay";
import { getWorkspaceTicketProjects } from "@/api/events";
import { sendTicketsEmail } from "@/api/email";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PaymentModal } from "@/components/shared/PaymentModal";

import { COUNTRIES } from "@/lib/countries";

const countries = COUNTRIES.map((c) => c.name).sort();

export function VenueCheckoutMobile({ venue }: { venue: any }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const storageKey = `venue_checkout_mobile_${venue?.id}`;
  const [date, setDate] = useState("");
  const [ticketsData, setTicketsData] = useState<Record<string, number>>({});
  const [attendees, setAttendees] = useState<{ name: string; id_document: string }[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idPassport, setIdPassport] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);

  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", venue?.workspace_id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: venue?.workspace_id! } } as any),
    enabled: !!venue?.workspace_id,
  });
  const venueProject = ticketProjects?.find((p: any) => p.venueId === venue.id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date) setDate(parsed.date);
        if (parsed.ticketsData) setTicketsData(parsed.ticketsData);
        if (parsed.attendees) setAttendees(parsed.attendees);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.idPassport) setIdPassport(parsed.idPassport);
        if (parsed.nationality) setNationality(parsed.nationality);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.step) setStep(parsed.step);
      } else {
        // Default first ticket tier to 1 if no saved session
        const firstTierName = venue?.pricing_tiers?.[0]?.name || "Standard Entry";
        setTicketsData({ [firstTierName]: 1 });
      }
    } catch {
      setTicketsData({ "Standard Entry": 1 });
    }
    setIsHydrated(true);
  }, [storageKey, venue]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      if (!name && user.username) setName(user.username);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
      if (!nationality && user.country) setNationality(user.country);
    }
  }, [user, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        date,
        ticketsData,
        attendees,
        name,
        email,
        idPassport,
        nationality,
        phone,
        step,
      }),
    );
  }, [
    date,
    ticketsData,
    attendees,
    name,
    email,
    idPassport,
    nationality,
    phone,
    step,
    storageKey,
    isHydrated,
  ]);

  if (!venue) return null;

  const totalTickets = Object.values(ticketsData).reduce((a, b) => a + (Number(b) || 0), 0) || 0;
  const isStep1Valid = date !== "" && totalTickets > 0;
  const isStep2Valid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    idPassport.trim() !== "" &&
    nationality.trim() !== "" &&
    phone.trim() !== "" &&
    attendees.every((att) => att.name.trim() !== "");

  const total =
    (venue.pricing_tiers?.length > 0
      ? venue.pricing_tiers
      : [{ name: "Standard Entry", amount: 0 }]
    ).reduce((acc: number, tier: any) => {
      const qty = ticketsData[tier.name || "Standard Entry"] || 0;
      return acc + qty * (Number(tier.amount) || 0);
    }, 0) || 0;

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async (paymentDetails?: { phone?: string; network?: string; currency?: string; convertedAmount?: number }) => {
      const totalAttendees = 1 + attendees.length;
      const booking_ref = Math.random().toString(36).substring(2, 12).toUpperCase();
      const isPawaPay = total > 0 && paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network;

      const payload = {
        workspace_id: venue.workspace_id,
        venue_id: venue.id,
        user_id: user?.id || null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_id_document: idPassport,
        start_time: new Date(date).toISOString(),
        end_time: new Date(date).toISOString(),
        status: "Confirmed",
        payment_status: isPawaPay ? "Pending" : "Paid",
        amount: Number(total),
        number_of_attendees: totalAttendees,
        tickets_data: ticketsData,
        attendees_info: attendees.length > 0 ? attendees : null,
        internal_notes: null,
        venue_name: venue.name,
        venue_currency: venue.currency,
      };

      const res = await createVenueBooking({ data: payload });

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: paymentDetails?.convertedAmount || total,
            baseAmount: total,
            baseCurrency: venue.currency,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            currency: paymentDetails?.currency || venue.currency,
            type: "venue_booking",
            referenceId: booking_ref,
            workspaceId: venue.workspace_id,
          }
        } as any);
        return { res, isPawaPay: true, depositId: pawaRes.depositId };
      }

      return { res, isPawaPay: false };
    },
    onSuccess: (data: any) => {
      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return;
      }
      
      const res = data.res;
      const td = res.tickets_data;
      if (td?.issued && td.issued.length > 0 && venueProject) {
        setIsGenerating(true);
        setIssuedTickets(td.issued);
      } else {
        localStorage.removeItem(storageKey);
        setIsSuccess(true);
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Checkout failed");
    },
  });

  useEffect(() => {
    if (!isPollingPawaPay || !pawapayDepositId) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
        if (res.status === "COMPLETED" || res.status === "SUCCESS") {
          setIsPollingPawaPay(false);
          localStorage.removeItem(storageKey);
          setIsSuccess(true);
        } else if (res.status === "FAILED") {
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPollingPawaPay, pawapayDepositId, storageKey]);

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && venueProject) {
      const generatePDFs = async () => {
        try {
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(`ticket-render-${ticket.id}`);
            if (!el) continue;

            // Wait a tiny bit more for React to flush the DOM
            await new Promise((r) => setTimeout(r, 100));

            const rectDebug = el.getBoundingClientRect();
            console.log("Ticket element dimensions:", rectDebug.width, rectDebug.height);

            const imgData = await htmlToImage.toJpeg(el, {
              pixelRatio: 1.5,
              quality: 0.8,
              backgroundColor: "#ffffff",
              width: 720,
              height: 260,
            });
            console.log("Generated imgData length:", imgData?.length);
            if (!imgData || imgData === "data:,") {
              throw new Error(
                "htmlToImage returned an empty image. Usually caused by unloaded fonts or images.",
              );
            }

            const rect = el.getBoundingClientRect();
            const width = rect.width || 720;
            const height = rect.height || 260;

            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "px",
              format: [width, height],
            });
            pdf.addImage(imgData, "JPEG", 0, 0, width, height);
            const base64 = pdf.output("datauristring").split(",")[1];

            attachments.push({
              filename: `Ticket_${ticket.tier.replace(/\s+/g, "_")}_${ticket.otp}.pdf`,
              content: base64,
            });
          }

          if (attachments.length > 0 && email) {
            await sendTicketsEmail({
              data: {
                to: email,
                customerName: name,
                venueName: venue.name || "the Venue",
                attachments,
              } as any,
            });
            toast.success("Booking confirmed and tickets emailed!");
          } else {
            toast.success("Booking confirmed!");
          }
          setIsGenerating(false);
          localStorage.removeItem(storageKey);
          setIsSuccess(true);
        } catch (e: any) {
          console.error("PDF generation error:", e);
          toast.error(
            `Ticket generation failed: ${e.message || "Unknown error"}. Please try again.`,
          );
          setIsGenerating(false);
          // Don't set isSuccess(true) so they can try again
        }
      };
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets, venueProject, email, name, venue?.name, storageKey]);

  useEffect(() => {
    const requiredAttendees = Math.max(0, totalTickets - 1);
    setAttendees((prev) => {
      if (prev.length === requiredAttendees) return prev;
      if (prev.length > requiredAttendees) return prev.slice(0, requiredAttendees);
      const newAttendees = [...prev];
      while (newAttendees.length < requiredAttendees) {
        newAttendees.push({ name: "", id_document: "" });
      }
      return newAttendees;
    });
  }, [totalTickets]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid) return;
    if (!user) {
      navigate({ to: "/signin", search: { redirect: `/venues/checkout/${venue.id}` } as any });
      return;
    }
    setIsPaymentModalOpen(true);
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate({ to: "/venues" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-8 px-4">
          Your ticket for {venue.name} has been secured.
        </p>
        <div className="bg-secondary/30 p-4 rounded-2xl mb-8 flex items-center justify-center gap-2 font-mono text-xl border border-border/40">
          <Ticket className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-widest">
            {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Redirecting to venues...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img src={venue.cover_url} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/25 to-black/55" />

        {/* Back Button */}
        <Link
          to="/venues/$venueId"
          params={{ venueId: venue.id }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>

        {/* Venue Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/95 text-primary-foreground px-2 py-0.5 rounded-full">
            Checkout
          </span>
          <h1 className="text-xl font-bold tracking-tight mt-1.5 drop-shadow-sm">{venue.name}</h1>
          <p className="text-xs text-white/80 font-medium mt-0.5 line-clamp-1 drop-shadow-sm">
            {venue.location || venue.address}
          </p>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="px-4 pt-6 space-y-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            1
          </div>
          <div className={`h-1 w-8 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Ticket Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Date of Visit
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }}
                    onFocus={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }}
                    className="h-12 w-full bg-secondary/30 border border-border/80 rounded-xl pl-11 pr-4 focus-visible:ring-1 focus-visible:ring-primary/50 cursor-pointer text-sm font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/80 mt-1.5">
                  Tap anywhere on the field above to open the calendar and choose a date.
                </p>
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Select Tickets
                </label>
                <p className="text-xs text-muted-foreground mb-3 leading-normal">
                  Specify how many tickets you'd like to purchase for this visit using the selector
                  buttons.
                </p>
                <div className="space-y-3">
                  {(venue?.pricing_tiers?.length > 0
                    ? venue.pricing_tiers
                    : [{ name: "Standard Entry", amount: 0 }]
                  ).map((tier: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border/40 hover:bg-secondary/40 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-sm tracking-tight">
                          {tier.name || "Standard Entry"}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          {tier.amount > 0
                            ? `${venue.currency} ${Number(tier.amount).toLocaleString()}`
                            : "Free"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-background border border-border/40 rounded-xl p-1 shadow-sm">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={(ticketsData[tier.name || "Standard Entry"] || 0) <= 0}
                          onClick={() => {
                            const val = ticketsData[tier.name || "Standard Entry"] || 0;
                            if (val > 0) {
                              setTicketsData((p) => ({
                                ...p,
                                [tier.name || "Standard Entry"]: val - 1,
                              }));
                            }
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition-all active:scale-95"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-bold text-sm tracking-tight">
                          {ticketsData[tier.name || "Standard Entry"] || 0}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const val = ticketsData[tier.name || "Standard Entry"] || 0;
                            setTicketsData((p) => ({
                              ...p,
                              [tier.name || "Standard Entry"]: val + 1,
                            }));
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">Primary Attendee</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground"
                >
                  Edit Tickets
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!!user}
                    className="h-12 bg-secondary/30 border border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-secondary/30 border border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    ID or Passport Number
                  </label>
                  <Input
                    required
                    placeholder="Enter ID/Passport"
                    value={idPassport}
                    onChange={(e) => setIdPassport(e.target.value)}
                    className="h-12 bg-secondary/30 border border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Nationality
                  </label>
                  <select
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    disabled={!!user?.country}
                    className="flex h-12 w-full rounded-md border border-border/80 bg-secondary/30 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="" disabled>
                      Select Country
                    </option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Phone Number
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. 0780000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!!user}
                    className="h-12 bg-secondary/30 border border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Additional Attendees */}
            {totalTickets > 1 && (
              <div className="space-y-4 border-t border-border/40 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold tracking-tight">Additional Attendees</h2>
                  <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                    {totalTickets - 1} left
                  </span>
                </div>

                <div className="space-y-6">
                  {attendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 bg-secondary/10 p-4 rounded-xl border border-border/20"
                    >
                      <div className="font-medium text-sm border-b border-border/40 pb-2 mb-2">
                        Attendee {idx + 2}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Name
                        </label>
                        <Input
                          required
                          placeholder="Full Name"
                          value={att.name}
                          onChange={(e) => {
                            const newArr = [...attendees];
                            newArr[idx].name = e.target.value;
                            setAttendees(newArr);
                          }}
                          className="h-10 text-sm bg-secondary/30 border border-border/80"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          ID / Passport (Optional)
                        </label>
                        <Input
                          placeholder="Optional"
                          value={att.id_document}
                          onChange={(e) => {
                            const newArr = [...attendees];
                            newArr[idx].id_document = e.target.value;
                            setAttendees(newArr);
                          }}
                          className="h-10 text-sm bg-secondary/30 border border-border/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fixed Bottom Action Bar */}
        {(step === 1 || step === 2) && (
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/95 backdrop-blur-xl border-t border-border/50 z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
            <div className="max-w-md mx-auto">
              <div
                className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground font-medium">Order Summary</span>
                  <ChevronUp
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isSummaryExpanded ? "rotate-180" : ""}`}
                  />
                </div>
                <span className="text-xl font-bold text-foreground">
                  {total > 0
                    ? `${venue.currency} ${total.toLocaleString()}`
                    : totalTickets > 0
                      ? "Free"
                      : `${venue.currency} 0`}
                </span>
              </div>

              {isSummaryExpanded && (
                <div className="mb-4 border-t border-border/40 pt-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="flex gap-4 mb-4 pb-4 border-b border-border/20">
                    <img
                      src={venue.cover_url}
                      alt={venue.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-2">{venue.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {venue.location || venue.address}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{date ? date : "Not selected"}</span>
                    </div>
                    {Object.entries(ticketsData)
                      .filter(([_, qty]) => qty > 0)
                      .map(([name, qty], i) => {
                        const tier = venue.pricing_tiers?.find((t: any) => t.name === name) || {
                          amount: 0,
                        };
                        return (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {name} <span className="text-xs opacity-70">x{qty}</span>
                            </span>
                            <span className="font-medium">
                              {tier.amount > 0
                                ? `${venue.currency} ${(qty * tier.amount).toLocaleString()}`
                                : "Free"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Continue to Details
                </Button>
              ) : isGenerating || isCheckingOut ? (
                <Button
                  type="button"
                  disabled
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isCheckingOut ? "Processing..." : "Generating Tickets..."}
                  </span>
                </Button>
              ) : issuedTickets.length > 0 ? (
                <Button
                  type="button"
                  onClick={() => setIsGenerating(true)}
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Retry Ticket Generation
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={totalTickets === 0 || !isStep2Valid}
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Pay{" "}
                  {total > 0
                    ? `${venue.currency} ${total.toLocaleString()}`
                    : totalTickets > 0
                      ? "Free"
                      : `${venue.currency} 0`}
                </Button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Hidden Ticket Renderer */}
      {isGenerating && issuedTickets.length > 0 && venueProject && (
        <div
          className="absolute -z-50 pointer-events-none"
          style={{ top: "-9999px", left: "-9999px" }}
        >
          {issuedTickets.map((t) => (
            <div
              key={t.id}
              id={`ticket-render-${t.id}`}
              className="inline-block bg-white relative w-[720px] h-[260px] overflow-hidden"
            >
              <TicketPreview
                template={venueProject.template}
                palette={venueProject.palette || { from: "#000", to: "#000", name: "Black" }}
                font={venueProject.font || { css: "sans-serif", name: "Modern" }}
                tier={t.tier}
                title={venue.name}
                subtitle={venue.address || t.attendee_name || name}
                date={date}
                time="Opening Hours"
                seat={t.attendee_name || name || "General"}
                price={total.toString()}
                currency={venue.currency}
                cover={venueProject.coverImage || ""}
                logoText={venueProject.logoText || "Agatike"}
                logoImage={venueProject.logoImage}
                logoScale={Number(venueProject.logoScale || 24)}
                logoOpacity={Number(venueProject.logoOpacity ?? 1)}
                logoColorMode={venueProject.logoColorMode || "original"}
                orderId={t.otp}
                qrValue={`${window.location.origin}/v/${t.otp}`}
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
    </div>
  );
}
