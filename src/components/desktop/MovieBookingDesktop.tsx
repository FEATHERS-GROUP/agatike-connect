import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronLeft,
  Lock,
  MapPin,
  Calendar,
  CheckCircle2,
  Ticket,
  Clock,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { AuthSuggestionModal } from "@/components/shared/AuthSuggestionModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMovieSchedulesByMovieId } from "@/api/cinemas";
import { createCinemaBooking } from "@/api/cinema_bookings";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import { toast } from "sonner";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { MOCK_MOVIES_MAP } from "@/lib/mock-movies";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkspaceTicketProjects } from "@/api/events";
import { sendTicketsEmail } from "@/api/email";
import { generateFallbackReceipt } from "@/lib/pdf-receipt";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";

export function MovieBookingDesktop({ movieId }: { movieId: string }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [isAuthSuggestionOpen, setIsAuthSuggestionOpen] = useState(false);
  const [hasSkippedAuth, setHasSkippedAuth] = useState(false);
  const { date: searchDate } = useSearch({ from: "/book-movie/$movieId" }) as any;

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  const [attendeeInfo, setAttendeeInfo] = useState({
    firstName: user?.username?.split(" ")[0] || "",
    lastName: user?.username?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const actualMovieId = movieId.substring(0, 36);
  const actualCinemaId = movieId.substring(37);

  const isMock = movieId.startsWith("m") && !movieId.includes("-");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["movie-schedules", actualMovieId, actualCinemaId],
    queryFn: () =>
      getMovieSchedulesByMovieId({
        data: { movieId: actualMovieId, cinemaId: actualCinemaId },
      } as any),
    enabled: !isMock,
  });

  const activeMovie = schedules.length > 0 ? schedules[0].movie : null;
  const cinema = schedules.length > 0 ? schedules[0].cinema : null;
  const currency = schedules.length > 0 ? schedules[0].currency : "RWF";

  const { data: ticketProjects } = useQuery({
    queryKey: ["ticket-projects", cinema?.workspace_id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: cinema?.workspace_id } } as any),
    enabled: !!cinema?.workspace_id,
  });

  const movieProject = ticketProjects?.find(
    (p: any) => p.assigned_entity_id === cinema?.id && p.status === "active",
  ) || {
    template: "movie-1",
    palette: { from: "#1f2937", to: "#0f172a", name: "Slate" },
    font: { css: "sans-serif", name: "Modern" },
    logoText: "Agatike",
    logoColorMode: "original",
    layout: {},
    back: {},
  };

  // Compute unique dates
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(schedules.map((st: any) => st.show_date))).sort() as string[];
  }, [schedules]);

  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      if (searchDate && uniqueDates.includes(searchDate)) {
        setSelectedDate(searchDate);
      } else {
        setSelectedDate(uniqueDates[0]);
      }
    }
  }, [uniqueDates, selectedDate, searchDate]);

  const schedulesForDate = useMemo(() => {
    return schedules.filter((st: any) => st.show_date === selectedDate);
  }, [schedules, selectedDate]);

  const currentSchedule = useMemo(() => {
    if (!selectedScheduleId && schedulesForDate.length > 0) {
      return schedulesForDate[0];
    }
    return schedulesForDate.find((s: any) => s.id === selectedScheduleId) || schedulesForDate[0];
  }, [schedulesForDate, selectedScheduleId]);

  useEffect(() => {
    if (currentSchedule && currentSchedule.id !== selectedScheduleId) {
      setSelectedScheduleId(currentSchedule.id);
      setTicketQuantities({}); // Reset cart on schedule change
    }
  }, [currentSchedule, selectedScheduleId]);

  // Deep merge utility for ticket design overrides
  const getMergedProjectDesign = (baseProject: any, tierId: string) => {
    if (!baseProject) return null;
    const overrides = baseProject.design_overrides?.overrides;
    if (!overrides) return baseProject;

    const tierOverride = overrides.tiers?.[tierId] || {};

    return {
      ...baseProject,
      ...tierOverride,
      palette: tierOverride.palette || baseProject.palette,
      font: tierOverride.font || baseProject.font,
      layout: tierOverride.layout || baseProject.design_overrides?.layout || baseProject.layout,
      back: tierOverride.back || baseProject.design_overrides?.back || baseProject.back,
    };
  };

  const activeTiers = useMemo(() => {
    if (!currentSchedule) return [];
    if (currentSchedule.ticket_tiers && currentSchedule.ticket_tiers.length > 0) {
      return currentSchedule.ticket_tiers.map((t: any) => ({
        id: t.id,
        tierId: t.ticket_tier.id,
        name: t.ticket_tier.name,
        price: t.price_override || t.ticket_tier.price,
      }));
    }
    // Fallback if no tiers
    return [
      {
        id: "default",
        tierId: "default",
        name: "General Admission",
        price: currentSchedule.base_price || 10,
      },
    ];
  }, [currentSchedule]);

  const updateQuantity = (tierId: string, delta: number) => {
    setTicketQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const totalTickets = Object.values(ticketQuantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(ticketQuantities).reduce((sum, [tierId, qty]) => {
    const tier = activeTiers.find((t: any) => t.id === tierId);
    return sum + (tier ? parseFloat(tier.price) * qty : 0);
  }, 0);

  const isFormValid =
    totalTickets > 0 && attendeeInfo.firstName && attendeeInfo.lastName && attendeeInfo.email;

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async (paymentDetails?: {
      phone?: string;
      network?: string;
      currency?: string;
      convertedAmount?: number;
      shortfall?: number;
    }) => {
      const promises = [];
      const fullName = `${attendeeInfo.firstName} ${attendeeInfo.lastName}`.trim();
      const booking_ref = Math.random().toString(36).substring(2, 12).toUpperCase();
      const isPawaPay =
        totalPrice > 0 &&
        paymentMethod === "momo" &&
        paymentDetails?.phone &&
        paymentDetails?.network;

      for (const [tierId, qty] of Object.entries(ticketQuantities)) {
        if (qty <= 0) continue;

        const payload = {
          cinema_id: cinema.id,
          schedule_id: currentSchedule.id,
          user_id: user?.id || null,
          ticket_tier_id:
            tierId === "default" ? null : activeTiers.find((t: any) => t.id === tierId)?.tierId,
          names: fullName,
          email: attendeeInfo.email,
          phone: attendeeInfo.phone,
          quantity: qty,
          total_price: activeTiers.find((t: any) => t.id === tierId)?.price * qty,
          currency: currency,
          payment_method: paymentMethod,
          status: isPawaPay ? "Pending Payment" : "Confirmed",
        };

        promises.push(createCinemaBooking({ data: { object: payload } } as any));
      }

      const res = await Promise.all(promises);
      const tiers = Object.entries(ticketQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([tierId]) => ({
          name:
            tierId === "default"
              ? "Standard Entry"
              : activeTiers.find((t: any) => t.id === tierId)?.name || "Standard Entry",
          tierId:
            tierId === "default"
              ? "default"
              : activeTiers.find((t: any) => t.id === tierId)?.tierId || tierId,
        }));

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: paymentDetails?.convertedAmount || totalPrice,
            baseAmount: totalPrice,
            baseCurrency: currency,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            currency: paymentDetails?.currency || currency,
            type: "movie_ticket",
            referenceId: res
              .map((r: any) => r.id)
              .join(",")
              .substring(0, 255), // Combine all booking IDs as referenceId
            workspaceId: cinema?.workspace_id,
            reason: activeMovie?.title || "Movie Ticket",
            shortfall: paymentDetails?.shortfall || 0,
          },
        } as any);
        return { isPawaPay: true, depositId: pawaRes.depositId, res, tiers };
      }

      return { isPawaPay: false, res, tiers };
    },
    onSuccess: (data: any) => {
      const ticketsToIssue = data.res.map((r: any, idx: number) => ({
        id: r.id,
        otp: r.qrcode_number,
        tierName: data.tiers[idx].name,
        tierId: data.tiers[idx].tierId,
        attendee_name: attendeeInfo.firstName + " " + attendeeInfo.lastName,
      }));
      setIssuedTickets(ticketsToIssue);

      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return;
      }

      if (ticketsToIssue.length > 0) {
        setIsGenerating(true);
      } else {
        setIsSuccess(true);
      }
      setIsPaymentModalOpen(false);
    },
    onError: (e: any) => {
      toast.error(e.message || "Checkout failed");
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Movie ticket booked!");
      const timer = setTimeout(() => {
        navigate({ to: "/movies", replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (!isPollingPawaPay || !pawapayDepositId) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
        if (
          res?.status?.toLowerCase() === "completed" ||
          res?.status?.toLowerCase() === "success"
        ) {
          setIsPollingPawaPay(false);
          if (issuedTickets.length > 0) {
            setIsGenerating(true);
          } else {
            setIsSuccess(true);
          }
        } else if (res?.status?.toLowerCase() === "failed") {
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPollingPawaPay, pawapayDepositId, issuedTickets, movieProject]);

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0) {
      const generatePDFs = async () => {
        try {
          const attachments = [];

          const coverUrl = movieProject.coverImage || activeMovie?.cover_url;
          if (coverUrl) {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve();
              img.onerror = (e) => resolve();
              img.src = coverUrl;
            });
          }

          await new Promise((r) => setTimeout(r, 600));

          if (movieProject) {
            for (const ticket of issuedTickets) {
              const el = document.getElementById(`ticket-render-${ticket.id}`);
              if (!el) continue;

              await new Promise((r) => setTimeout(r, 100));

              const imgData = await htmlToImage.toJpeg(el, {
                pixelRatio: 1.5,
                quality: 0.8,
                backgroundColor: "#ffffff",
                width: 720,
                height: 260,
              });

              if (!imgData || imgData === "data:,")
                throw new Error("Empty image data from htmlToImage");

              const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [720, 260],
              });
              pdf.addImage(imgData, "JPEG", 0, 0, 720, 260);
              const base64 = pdf.output("datauristring").split(",")[1];

              attachments.push({
                filename: `Ticket_${ticket.tierName.replace(/\s+/g, "_")}_${ticket.otp}.pdf`,
                content: base64,
              });
            }
          } else {
            for (const ticket of issuedTickets) {
              const fallbackPdf = generateFallbackReceipt({
                entityName: activeMovie?.title || "Event/Venue",
                ticket,
                bookingRef: ticket.otp,
                customerName: ticket.attendee?.firstName || "Guest",
              });
              attachments.push(fallbackPdf);
            }
          }

          if (attachments.length > 0 && attendeeInfo.email) {
            await sendTicketsEmail({
              data: {
                to: attendeeInfo.email,
                customerName: attendeeInfo.firstName + " " + attendeeInfo.lastName,
                venueName: cinema?.name || "Cinema",
                attachments,
              } as any,
            });
          }
          setIsGenerating(false);
          setIsSuccess(true);
        } catch (e: any) {
          console.error("PDF gen error (caught inside catch block):", e);
          setIsGenerating(false);
          setIsSuccess(true); // fall back to success
        }
      };
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets, movieProject, attendeeInfo, activeMovie, cinema]);

  if (isMock) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
        <div className="max-w-md w-full bg-card border border-border/60 rounded-3xl p-8 shadow-xl flex flex-col items-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Ticket className="h-10 w-10 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {MOCK_MOVIES_MAP[movieId]?.title || "Upcoming Movie"}
          </h2>
          {MOCK_MOVIES_MAP[movieId]?.cover && (
            <img
              src={MOCK_MOVIES_MAP[movieId].cover}
              alt="Movie Poster"
              className="w-32 h-48 object-cover rounded-xl mt-6 shadow-md"
            />
          )}
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Due to incredibly high demand, tickets for this showing are either completely{" "}
            <strong>sold out</strong> or <strong>not yet published</strong> by the cinema.
          </p>
          <Button
            size="lg"
            className="mt-8 w-full rounded-full h-14 font-semibold"
            onClick={() => navigate({ to: "/" })}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !activeMovie) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <Skeleton className="h-4 w-32 mb-8" />
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            <div className="space-y-10">
              <Skeleton className="h-10 w-80 mb-8" />
              <div className="p-6 rounded-3xl border border-border/60 bg-card/40">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="flex justify-end pt-4 border-t border-border/60">
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-24 w-20 rounded-xl" />
                  <div className="flex flex-col space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full rounded-2xl mt-8" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
          Your tickets for {activeMovie.title} have been secured. A confirmation with your QR code
          has been sent to {attendeeInfo.email}.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">Redirecting to movies...</p>
      </div>
    );
  }

  if (isPollingPawaPay) {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <Smartphone className="h-16 w-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-3">Check Your Phone</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            We've sent a payment request to your mobile number. Please enter your PIN to confirm the
            payment.
          </p>
          <div className="flex gap-2 mb-8 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              setIsPollingPawaPay(false);
              if (pawapayDepositId) {
                try {
                  await cancelPendingPayment({ data: { depositId: pawapayDepositId } } as any);
                } catch (e) {
                  console.error("Cancel cleanup failed:", e);
                }
              }
            }}
            className="rounded-2xl h-12 px-8"
          >
            Cancel Payment
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/movies"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Movies
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Left Column: Form & Selection */}
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-bold mb-8">Select Showtime & Tickets</h1>

              <div className="space-y-8">
                {step === 1 && (
                  <div className="p-6 rounded-3xl border border-border/60 bg-card/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Step 1: Select Showtime
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
                      {schedulesForDate.map((st: any) => {
                        const isSelected = st.id === currentSchedule?.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setSelectedScheduleId(st.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-[var(--shadow-glow)] scale-105"
                                : "bg-card/40 border-border/40 hover:border-primary/50 hover:bg-card/80 text-foreground"
                            }`}
                          >
                            <Clock
                              className={`h-6 w-6 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <span className="text-3xl font-black tracking-tight">
                              {st.start_time.substring(0, 5)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && currentSchedule && (
                  <div className="p-6 rounded-3xl border border-border/60 bg-card/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-primary" /> Step 2: Select Tickets
                    </h3>
                    <div className="space-y-4 mb-8">
                      {activeTiers.map((tier: any) => {
                        const qty = ticketQuantities[tier.id] || 0;
                        return (
                          <div
                            key={tier.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/50"
                          >
                            <div>
                              <p className="font-bold">{tier.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(parseFloat(tier.price), currency)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => updateQuantity(tier.id, -1)}
                                disabled={qty === 0}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="font-bold w-4 text-center">{qty}</span>
                              <button
                                onClick={() => updateQuantity(tier.id, 1)}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-start pt-4 border-t border-border/60">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="p-6 rounded-3xl border border-border/60 bg-card/40 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" /> Step 3: Your Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={attendeeInfo.firstName}
                          onChange={(e) =>
                            setAttendeeInfo({ ...attendeeInfo, firstName: e.target.value })
                          }
                          placeholder="Alex"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={attendeeInfo.lastName}
                          onChange={(e) =>
                            setAttendeeInfo({ ...attendeeInfo, lastName: e.target.value })
                          }
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={attendeeInfo.email}
                          onChange={(e) =>
                            setAttendeeInfo({ ...attendeeInfo, email: e.target.value })
                          }
                          placeholder="alex@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone (Optional)</Label>
                        <Input
                          type="tel"
                          value={attendeeInfo.phone}
                          onChange={(e) =>
                            setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })
                          }
                          placeholder="+250 788 123 456"
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border/60">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>

              <div className="flex gap-4 mb-6">
                <img
                  src={activeMovie.cover_url}
                  alt={activeMovie.title}
                  className="h-24 w-20 rounded-xl object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="font-semibold leading-tight">{activeMovie.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cinema?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentSchedule?.show_date} • {currentSchedule?.start_time?.substring(0, 5)}
                  </p>
                </div>
              </div>

              {totalTickets > 0 ? (
                <>
                  <div className="space-y-4 text-sm border-y border-border/60 py-4 mb-4">
                    {Object.entries(ticketQuantities).map(([tierId, qty]) => {
                      if (qty <= 0) return null;
                      const tier = activeTiers.find((t: any) => t.id === tierId);
                      if (!tier) return null;
                      return (
                        <div key={tierId} className="flex justify-between items-center">
                          <span>
                            {qty}x {tier.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(tier.price) * qty, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mb-8">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalPrice, currency)}</span>
                  </div>
                </>
              ) : (
                <div className="border-t border-border/60 py-6 mb-4 text-center text-muted-foreground text-sm">
                  Please select tickets to continue
                </div>
              )}

              <Button
                disabled={
                  (step === 1 && !selectedScheduleId) ||
                  (step === 2 && totalTickets === 0) ||
                  (step === 3 && (!isFormValid || isCheckingOut)) ||
                  isGenerating
                }
                className="w-full h-14 rounded-2xl text-base font-bold shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={() => {
                  if (step === 1) setStep(2);
                  else if (step === 2) setStep(3);
                  else {
                    if (!user && !hasSkippedAuth) {
                      setIsAuthSuggestionOpen(true);
                    } else {
                      setIsPaymentModalOpen(true);
                    }
                  }
                }}
              >
                {step === 1 ? (
                  "Continue to Tickets"
                ) : step === 2 ? (
                  totalTickets > 0 ? (
                    "Continue to Details"
                  ) : (
                    "Select Tickets"
                  )
                ) : isCheckingOut || isPollingPawaPay ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </span>
                ) : isGenerating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Tickets...
                  </span>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Pay {formatCurrency(totalPrice, currency)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                By clicking pay, you agree to our{" "}
                <Link to="/terms" className="underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <AuthSuggestionModal
        isOpen={isAuthSuggestionOpen}
        onOpenChange={setIsAuthSuggestionOpen}
        onSkip={() => {
          setHasSkippedAuth(true);
          setIsPaymentModalOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProceed={doCheckout as any}
        isProcessing={isCheckingOut}
        isGenerating={isGenerating}
        workspaceId={cinema?.workspace_id}
        baseAmount={totalPrice}
        quantity={totalTickets}
        subtotal={totalTickets > 0 ? totalPrice / totalTickets : 0}
        itemLabel="Ticket(s)"
        userPhone={user?.phone || undefined}
      />

      {/* Hidden Ticket Renderer */}
      {isGenerating && issuedTickets.length > 0 && movieProject && (
        <div
          className="absolute -z-50 pointer-events-none"
          style={{ top: "-9999px", left: "-9999px" }}
        >
          {issuedTickets.map((t) => {
            const finalDesign = getMergedProjectDesign(movieProject, t.tierId) || movieProject;
            return (
              <div
                key={t.id}
                id={`ticket-render-${t.id}`}
                className="inline-block bg-white relative w-[720px] h-[260px] overflow-hidden"
              >
                <TicketPreview
                  template={finalDesign.template}
                  palette={finalDesign.palette || { from: "#000", to: "#000", name: "Black" }}
                  font={finalDesign.font || { css: "sans-serif", name: "Modern" }}
                  tier={t.tierName}
                  title={activeMovie.title}
                  subtitle={cinema?.name}
                  date={selectedDate!}
                  time={currentSchedule?.start_time?.substring(0, 5)}
                  seat={t.attendee_name}
                  price={(
                    activeTiers.find((tier: any) => tier.name === t.tierName)?.price || 0
                  ).toString()}
                  currency={currency}
                  cover={finalDesign.coverImage || activeMovie.cover_url}
                  logoText={finalDesign.logoText || "Agatike"}
                  logoImage={finalDesign.logoImage}
                  logoScale={Number(finalDesign.logoScale || 24)}
                  logoOpacity={Number(finalDesign.logoOpacity ?? 1)}
                  logoColorMode={finalDesign.logoColorMode || "original"}
                  orderId={t.otp}
                  qrValue={`${window.location.origin}/c/${t.otp}`}
                  previewMode="Front"
                  layout={
                    finalDesign.layout || {
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
                    finalDesign.back || {
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
