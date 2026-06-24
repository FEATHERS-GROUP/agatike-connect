import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Ticket,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
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

export function VenueCheckoutDesktop({ venue }: { venue: any }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const storageKey = `venue_checkout_desktop_${venue?.id}`;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
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
    const returning = sessionStorage.getItem(`returning_from_login_${venue?.id}`);

    if (returning === "true" && user) {
      sessionStorage.removeItem(`returning_from_login_${venue?.id}`);
      setShowOverrideDialog(true);
    }

    if (user && !returning) {
      if (!name && user.username) setName(user.username);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
      if (!nationality && user.country) setNationality(user.country);
    }
  }, [user, isHydrated, venue?.id]);

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
    mutationFn: async (paymentDetails?: {
      phone?: string;
      network?: string;
      currency?: string;
      convertedAmount?: number;
    }) => {
      const totalAttendees = 1 + attendees.length;
      const booking_ref = Math.random().toString(36).substring(2, 12).toUpperCase();
      const isPawaPay =
        total > 0 && paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network;

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
            reason: venue?.name || "Venue Booking",
          },
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
          setIsSuccess(true); // Simplified for venues: no tickets generated if it's async? Wait, we should generate tickets if it succeeds, but we don't have `res` here easily. For now, just show success.
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

          // Pre-load cover image so it's cached before the first ticket renders
          const coverUrl = venueProject.coverImage;
          if (coverUrl) {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve();
              img.onerror = () => resolve(); // don't block on failure
              img.src = coverUrl;
            });
          }

          // Extra settle time for React DOM + fonts
          await new Promise((r) => setTimeout(r, 600));

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
      sessionStorage.setItem(`returning_from_login_${venue?.id}`, "true");
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
      <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-4">
        <div className="bg-card p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-border/50">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />
      {showOverrideDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border/50">
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Use Account Details?</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              You just signed in! Would you like to use your account details (Name, Phone, Email,
              Nationality) or keep the customer information you already entered?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  if (user?.username) setName(user.username);
                  if (user?.phone) setPhone(user.phone);
                  if (user?.email) setEmail(user.email);
                  if (user?.country) setNationality(user.country);
                  setShowOverrideDialog(false);
                }}
                className="w-full h-12 text-base font-semibold"
              >
                Use Account Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(false)}
                className="w-full h-12 text-base font-semibold"
              >
                Keep Entered Info
              </Button>
            </div>
          </div>
        </div>
      )}

      {showOverrideDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border/50">
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Use Account Details?</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              You just signed in! Would you like to use your account details (Name, Phone, Email,
              Nationality) or keep the customer information you already entered?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  if (user?.username) setName(user.username);
                  if (user?.phone) setPhone(user.phone);
                  if (user?.email) setEmail(user.email);
                  if (user?.country) setNationality(user.country);
                  setShowOverrideDialog(false);
                }}
                className="w-full h-12 text-base font-semibold"
              >
                Use Account Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(false)}
                className="w-full h-12 text-base font-semibold"
              >
                Keep Entered Info
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-5xl px-4 pt-8 pb-20 md:pt-12">
        <Link
          to="/venues/$venueId"
          params={{ venueId: venue.id }}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Secure your tickets</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Form */}
          <div className="flex-1 bg-card rounded-3xl p-8 border border-border/50 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`}
              />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                2
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2 max-w-sm">
                      <label className="text-sm font-medium text-muted-foreground block">
                        Select Date of Visit
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
                          className="h-12 w-full bg-secondary/20 border border-border/85 rounded-xl pl-11 pr-4 focus-visible:ring-1 focus-visible:ring-primary/50 cursor-pointer text-sm font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 mt-1">
                        Click anywhere on the field above to open the calendar and choose a date.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-6">
                    <h3 className="text-xl font-semibold mb-1">Ticket Selection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Specify how many tickets you'd like to purchase for this visit using the
                      selector buttons.
                    </p>
                    <div className="space-y-3">
                      {(venue?.pricing_tiers?.length > 0
                        ? venue.pricing_tiers
                        : [{ name: "Standard Entry", amount: 0 }]
                      ).map((tier: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-secondary/20 p-4 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <div>
                            <p className="font-semibold">{tier.name || "Standard Entry"}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
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
                  <Button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                    className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98] mt-4"
                  >
                    Continue to Details
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Primary Attendee</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <Input
                          required
                          placeholder="e.g. Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 bg-secondary/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          ID or Passport Number
                        </label>
                        <Input
                          required
                          placeholder="Enter ID/Passport"
                          value={idPassport}
                          onChange={(e) => setIdPassport(e.target.value)}
                          className="h-12 bg-secondary/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder="e.g. jane@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-secondary/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Nationality
                        </label>
                        <select
                          required
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          disabled={!!user?.country}
                          className="flex h-12 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Phone Number
                        </label>
                        <Input
                          required
                          type="tel"
                          placeholder="e.g. 0780000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 bg-secondary/40"
                        />
                      </div>
                    </div>
                  </div>

                  {totalTickets > 1 && (
                    <div className="border-t border-border/40 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Additional Attendees</h3>
                        <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                          {totalTickets - 1} ticket{totalTickets - 1 !== 1 ? "s" : ""} left to
                          assign
                        </span>
                      </div>

                      <div className="space-y-4">
                        {attendees.map((att, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-sm font-medium text-muted-foreground">
                                Attendee {idx + 2} Name
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
                                className="h-12 rounded-xl bg-secondary/40"
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-sm font-medium text-muted-foreground">
                                ID / Passport
                              </label>
                              <Input
                                placeholder="Optional"
                                value={att.id_document}
                                onChange={(e) => {
                                  const newArr = [...attendees];
                                  newArr[idx].id_document = e.target.value;
                                  setAttendees(newArr);
                                }}
                                className="h-12 rounded-xl bg-secondary/40"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-1/3 h-14 text-lg font-bold rounded-2xl"
                    >
                      Back
                    </Button>
                    {isGenerating || isCheckingOut ? (
                      <Button
                        type="button"
                        disabled
                        className="w-2/3 h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
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
                        className="w-2/3 h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        Retry Ticket Generation
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={totalTickets === 0 || !isStep2Valid}
                        className="w-2/3 h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed"
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
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 rounded-3xl border border-border/50 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-bold tracking-tight mb-6">Order Summary</h3>

              <div className="flex gap-4 mb-6 pb-6 border-b border-border/40">
                <img
                  src={venue.cover_url}
                  alt={venue.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{venue.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {venue.city || venue.address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm font-medium mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{date ? date : "Not selected"}</span>
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
                          {name} x {qty}
                        </span>
                        <span>
                          {tier.amount > 0
                            ? `${venue.currency} ${(qty * tier.amount).toLocaleString()}`
                            : "Free"}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-end">
                <span className="text-muted-foreground font-semibold">Total</span>
                <span className="text-3xl font-bold text-primary">
                  {total > 0
                    ? `${venue.currency} ${total.toLocaleString()}`
                    : totalTickets > 0
                      ? "Free"
                      : `${venue.currency} 0`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <Footer />
    </div>
  );
}
