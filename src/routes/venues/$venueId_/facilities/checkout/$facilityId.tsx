import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { getRentableVenueById } from "@/api/rentable_venues";
import { createVenueBooking, getVenueBookings } from "@/api/venue_bookings";
import { sendVenueBookingEmail } from "@/api/email";
import { sendSMS } from "@/api/pindo";
import { getUserSession } from "@/api/auth";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { PaymentModal } from "@/components/shared/PaymentModal";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import { useEffect } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { sendTicketsEmail } from "@/api/email";
import { generateFallbackReceipt } from "@/lib/pdf-receipt";
import { getWorkspaceTicketProjects } from "@/api/events";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { Ticket, Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/venues/$venueId_/facilities/checkout/$facilityId")({
  beforeLoad: async ({ location }) => {
    const session = await getUserSession();
    if (!session) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href } as any,
      });
    }
    return { session };
  },
  loader: async ({ params }) => {
    return await getRentableVenueById({
      data: { id: (params as any).venueId || (params as any).venueId_ },
    });
  },
  component: FacilityCheckoutPage,
});

function FacilityCheckoutPage() {
  const { session } = Route.useRouteContext();
  const venue = Route.useLoaderData();
  const params = Route.useParams() as any;
  const venueId = params.venueId || params.venueId_;
  const facilityId = params.facilityId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const facility = venue?.facilities_data?.find((f: any) => f.id === facilityId);
  const isSharedAccess = facility?.type === "shared_access";
  const isSharedSlot = facility?.type === "shared_slot";
  const isActivity = facility?.category === "activity";
  const durationMinutes = Number(facility?.duration_minutes) || 60;
  const perSessionRate = Number(facility?.pricing?.per_session_rate) || 0;

  const DYNAMIC_SLOTS = useMemo(() => {
    const slots = [];
    const startMins = 6 * 60; // 06:00
    const endMins = 23 * 60; // 23:00
    for (let m = startMins; m < endMins; m += durationMinutes) {
      slots.push(m);
    }
    return slots;
  }, [durationMinutes]);

  const groupedSlots = useMemo(() => {
    const morning = DYNAMIC_SLOTS.filter((s) => s < 12 * 60);
    const afternoon = DYNAMIC_SLOTS.filter((s) => s >= 12 * 60 && s < 17 * 60);
    const evening = DYNAMIC_SLOTS.filter((s) => s >= 17 * 60);
    return { morning, afternoon, evening };
  }, [DYNAMIC_SLOTS]);

  const formatSlot = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", venue?.workspace_id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: venue?.workspace_id } } as any),
    enabled: !!venue?.workspace_id,
  });
  const venueProject =
    ticketProjects?.find((p: any) => p.venueId === venue?.id) || ticketProjects?.[0];

  const [date, setDate] = useState<DateRange | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [name, setName] = useState(session?.username || "");
  const [email, setEmail] = useState(session?.email || "");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const hourlyRate = Number(facility?.pricing?.hourly_rate) || 0;
  const dailyRate = Number(facility?.pricing?.daily_rate) || hourlyRate;
  const currency = venue?.currency || "RWF";

  const { data: bookings = [] } = useQuery({
    queryKey: ["venue_bookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
  });

  const facilityBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (b.status === "Cancelled") return false;
      return b.facility_id === facilityId || (!b.facility_id && b.status === "Blocked");
    });
  }, [bookings, facilityId]);

  const getSlotStatus = (dateToCheck: Date, slotStartMins: number) => {
    if (isSharedSlot) {
      const slotStart = new Date(dateToCheck);
      slotStart.setHours(Math.floor(slotStartMins / 60), slotStartMins % 60, 0, 0);

      let hasBlock = false;

      const totalBooked = facilityBookings.filter((b: any) => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        const slotEnd = new Date(dateToCheck);
        const endMins = slotStartMins + durationMinutes;
        slotEnd.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

        if (bStart < slotEnd.getTime() && slotStart.getTime() < bEnd) {
          if (b.status === "Blocked" || (!b.facility_id && b.status === "Blocked")) {
            hasBlock = true;
          }
          return true;
        }
        return false;
      }).reduce((sum: number, b: any) => {
        if (!b.facility_id && b.status === "Blocked") return Infinity;
        return sum + (b.tickets_data?.["Facility Access"] || 1);
      }, 0);

      const maxCap = Number(facility?.max_capacity);
      if (isNaN(maxCap) || maxCap === -1) return { isBooked: hasBlock, bookedCount: totalBooked, maxCapacity: Infinity, isBlockedByAdmin: hasBlock };
      return { isBooked: hasBlock || totalBooked + quantity > maxCap, bookedCount: totalBooked, maxCapacity: maxCap, isBlockedByAdmin: hasBlock };
    }

    const booking = facilityBookings.find((b: any) => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();

      const slotStart = new Date(dateToCheck);
      slotStart.setHours(Math.floor(slotStartMins / 60), slotStartMins % 60, 0, 0);

      const slotEnd = new Date(dateToCheck);
      const endMins = slotStartMins + durationMinutes;
      slotEnd.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

      return bStart < slotEnd.getTime() && slotStart.getTime() < bEnd;
    });

    if (booking) {
      const isBlock = booking.status === "Blocked" || (!booking.facility_id && booking.status === "Blocked");
      return { isBooked: true, bookedCount: 1, maxCapacity: 1, isBlockedByAdmin: isBlock };
    }
    return { isBooked: false, bookedCount: 0, maxCapacity: 1, isBlockedByAdmin: false };
  };

  const getBookedPassesForDate = (dateToCheck: Date) => {
    return facilityBookings.filter((b: any) => {
      const bDate = new Date(b.start_time);
      return bDate.getDate() === dateToCheck.getDate() &&
        bDate.getMonth() === dateToCheck.getMonth() &&
        bDate.getFullYear() === dateToCheck.getFullYear();
    }).reduce((sum: number, b: any) => sum + (b.tickets_data?.["Facility Access"] || 1), 0);
  };

  const isDateFullyBooked = (dateToCheck: Date) => {
    if (isSharedAccess) {
      const maxCap = Number(facility?.max_capacity);
      if (isNaN(maxCap) || maxCap === -1) return false;
      return getBookedPassesForDate(dateToCheck) >= maxCap;
    }
    return DYNAMIC_SLOTS.every((slot) => getSlotStatus(dateToCheck, slot).isBooked);
  };

  const daysInRange = useMemo(() => {
    const days = [];
    if (date?.from) {
      let current = new Date(date.from);
      const end = date.to || date.from;
      let safety = 0;
      while (current <= end && safety < 365) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        safety++;
      }
    }
    return days;
  }, [date]);

  const getSlotStatusAcrossRange = (slotMins: number) => {
    let finalIsBooked = false;
    let finalIsBlocked = false;
    let maxBookedCount = 0;
    let capacity = 1;

    for (const d of daysInRange) {
      const res = getSlotStatus(d, slotMins);
      capacity = res.maxCapacity;
      if (res.bookedCount > maxBookedCount) maxBookedCount = res.bookedCount;
      if (res.isBlockedByAdmin) finalIsBlocked = true;
      if (res.isBooked) finalIsBooked = true;
    }
    return { isBooked: finalIsBooked, bookedCount: maxBookedCount, maxCapacity: capacity, isBlockedByAdmin: finalIsBlocked };
  };

  const availableCapacity = useMemo(() => {
    if (!isSharedAccess && !isSharedSlot) return 1;
    const maxCap = Number(facility?.max_capacity);
    if (isNaN(maxCap) || maxCap === -1) return Infinity; // Unlimited

    if (isSharedSlot) return maxCap; // For slots, capacity depends on the slot, so max stepper limit is maxCap

    if (daysInRange.length === 0) return maxCap;

    let maxBooked = 0;
    for (const d of daysInRange) {
      const booked = getBookedPassesForDate(d);
      if (booked > maxBooked) maxBooked = booked;
    }

    return Math.max(0, maxCap - maxBooked);
  }, [daysInRange, facilityBookings, facility?.max_capacity, isSharedAccess, isSharedSlot]);

  useEffect(() => {
    if ((isSharedAccess || isSharedSlot) && quantity > availableCapacity && availableCapacity > 0) {
      setQuantity(availableCapacity);
    }
  }, [availableCapacity, isSharedAccess, isSharedSlot, quantity]);

  const totalAmount = useMemo(() => {
    if (daysInRange.length === 0) return 0;
    if (isSharedAccess) {
      return daysInRange.length * quantity * dailyRate;
    }
    if (selectedSlots.length === 0) return 0;

    if (isSharedSlot) {
      return daysInRange.length * selectedSlots.length * quantity * (perSessionRate > 0 ? perSessionRate : hourlyRate * (durationMinutes / 60));
    }

    if (isActivity && perSessionRate > 0) {
      return daysInRange.length * selectedSlots.length * perSessionRate;
    }

    return daysInRange.length * selectedSlots.length * hourlyRate * (durationMinutes / 60);
  }, [daysInRange.length, selectedSlots.length, hourlyRate, isSharedAccess, isSharedSlot, quantity, dailyRate, isActivity, perSessionRate, durationMinutes]);

  const sendSmsAlert = async (bRef: string) => {
    try {
      if (!phone) return;
      const dateRangeStr = date?.from
        ? date.to
          ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
          : format(date.from, "LLL dd, y")
        : "";
      const timeRangeStr = (isSharedAccess || selectedSlots.length === 0)
        ? "Full Day"
        : `${formatSlot(Math.min(...selectedSlots))} - ${formatSlot(Math.max(...selectedSlots) + durationMinutes)}`;

      const msg = `Booking Confirmed: ${facility?.name || "Facility"} at ${venue.name}. Code: ${bRef}. Time: ${dateRangeStr} ${timeRangeStr}. Location: ${venue.address || venue.city || "Venue Location"}`;
      await sendSMS(phone, msg);
    } catch (e) {
      console.error("Failed to send SMS:", e);
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (paymentDetails?: {
      phone?: string;
      network?: string;
      currency?: string;
      convertedAmount?: number;
      shortfall?: number;
    }) => {
      const minSlot = Math.min(...selectedSlots);
      const maxSlot = Math.max(...selectedSlots);

      const bookingStatus = facility?.requires_approval ? "Pending" : "Confirmed";
      const isPawaPay =
        totalAmount > 0 &&
        paymentMethod === "momo" &&
        paymentDetails?.phone &&
        paymentDetails?.network;
      const paymentRef = isPawaPay
        ? Math.random().toString(36).substring(2, 12).toUpperCase()
        : undefined;
      const currentRef = Math.random().toString(36).substring(2, 8).toUpperCase();
      setBookingRef(currentRef);

      const basePayload = {
        workspace_id: venue.workspace_id,
        venue_id: venue.id,
        user_id: session?.id,
        facility_id: facilityId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        status: isPawaPay ? "Pending" : bookingStatus,
        payment_status: isPawaPay ? "Pending" : totalAmount > 0 ? "Pending" : "Paid",
        amount: totalAmount,
        total_amount: totalAmount,
        venue_name: venue.name,
        venue_currency: currency,
        booking_type: "facility",
        tickets_data: {
          "Facility Access": (isSharedAccess || isSharedSlot) ? quantity : 1,
          booking_ref: currentRef,
          payment_ref: paymentRef,
        },
      };

      const payloads = daysInRange.map((d) => {
        const startDateTime = new Date(d);
        startDateTime.setHours(isSharedAccess ? 6 : Math.floor(minSlot / 60), isSharedAccess ? 0 : minSlot % 60, 0, 0);
        const endDateTime = new Date(d);
        const endMins = maxSlot + durationMinutes;
        endDateTime.setHours(isSharedAccess ? 23 : Math.floor(endMins / 60), isSharedAccess ? 0 : endMins % 60, 0, 0);

        return {
          ...basePayload,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        };
      });

      const results = [];
      for (const data of payloads) {
        results.push(await createVenueBooking({ data }));
      }

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: paymentDetails?.convertedAmount || totalAmount,
            baseAmount: totalAmount,
            baseCurrency: currency,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            currency: paymentDetails?.currency || currency,
            type: "venue_booking",
            referenceId: results.map((r: any) => r.id).join(","),
            workspaceId: venue.workspace_id,
            reason: `${facility?.name} Booking`,
            shortfall: paymentDetails?.shortfall || 0,
          },
        } as any);
        return { results, isPawaPay: true, depositId: pawaRes.depositId, bookingRef: currentRef };
      }

      return { results, isPawaPay: false, bookingRef: currentRef };
    },
    onSuccess: async (data: any) => {
      const res = data.results?.[0];
      const td = res?.tickets_data;
      if (td?.issued) {
        setIssuedTickets(td.issued);
      }
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venueId] });

      const sendEmail = async (bRef: string) => {
        try {
          const dateRangeStr = date?.from
            ? date.to
              ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
              : format(date.from, "LLL dd, y")
            : "";
          const timeRangeStr = (isSharedAccess || selectedSlots.length === 0)
            ? "Full Day"
            : `${formatSlot(Math.min(...selectedSlots))} - ${formatSlot(Math.max(...selectedSlots) + durationMinutes)}`;

          await sendVenueBookingEmail({
            data: {
              to: email,
              customerName: name,
              facilityName: facility?.name || "Facility",
              venueName: venue.name,
              venueLocation: venue.address || venue.city || "Venue Location",
              dateRange: dateRangeStr,
              timeRange: timeRangeStr,
              bookingRef: bRef,
            },
          } as any);
        } catch (e) {
          console.error("Failed to send booking confirmation email:", e);
        }
      };

      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return;
      }

      if (isSharedAccess && td?.issued && td.issued.length > 0) {
        setIsGenerating(true);
      } else {
        setIsSuccess(true);
        await sendSmsAlert(data.bookingRef || bookingRef);
        await sendEmail(data.bookingRef || bookingRef);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create booking.");
    },
  });

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
          if (isSharedAccess && issuedTickets.length > 0) {
            setIsGenerating(true);
          } else {
            setIsSuccess(true);
            const dateRangeStr = date?.from
              ? date.to
                ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                : format(date.from, "LLL dd, y")
              : "";
            const timeRangeStr = (isSharedAccess || selectedSlots.length === 0)
              ? "Full Day"
              : `${formatSlot(Math.min(...selectedSlots))} - ${formatSlot(Math.max(...selectedSlots) + durationMinutes)}`;

            await sendSmsAlert(bookingRef);

            await sendVenueBookingEmail({
              data: {
                to: email,
                customerName: name,
                facilityName: facility?.name || "Facility",
                venueName: venue.name,
                venueLocation: venue.address || venue.city || "Venue Location",
                dateRange: dateRangeStr,
                timeRange: timeRangeStr,
                bookingRef: bookingRef,
              },
            } as any).catch(console.error);
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
  }, [
    isPollingPawaPay,
    pawapayDepositId,
    issuedTickets,
    venueProject,
    isSharedAccess,
    date,
    selectedSlots,
    email,
    name,
    facility,
    venue,
    bookingRef,
  ]);

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0) {
      const generatePDFs = async () => {
        try {
          const attachments = [];

          const coverUrl = venueProject.coverImage;
          if (coverUrl) {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = coverUrl;
            });
          }

          await new Promise<void>((r) => setTimeout(r, 600));

          if (venueProject) {
            for (const ticket of issuedTickets) {
              const el = document.getElementById(`ticket-render-${ticket.id}`);
              if (!el) continue;

              await new Promise<void>((r) => setTimeout(r, 100));

              const imgData = await htmlToImage.toJpeg(el, {
                pixelRatio: 1.5,
                quality: 0.8,
                backgroundColor: "#ffffff",
                width: 720,
                height: 260,
              });
              if (!imgData || imgData === "data:,") {
                throw new Error("htmlToImage returned an empty image.");
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
                filename: `Ticket_${ticket.tier?.replace(/\s+/g, "_") || "Pass"}_${ticket.otp}.pdf`,
                content: base64,
              });
            }
          } else {
            for (const ticket of issuedTickets) {
              const fallbackPdf = generateFallbackReceipt({
                entityName: venue?.name || "Event/Venue",
                ticket,
                bookingRef: ticket.booking_ref || bookingRef,
                customerName: name,
              });
              attachments.push(fallbackPdf);
            }
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
            await sendSmsAlert(bookingRef);

            toast.success("Booking confirmed and tickets emailed!");
          } else {
            toast.success("Booking confirmed!");
          }
          setIsGenerating(false);
          setIsSuccess(true);
        } catch (e) {
          console.error("PDF generation error:", e);
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          toast.error(`Ticket generation failed: ${errorMessage}. Please try again.`);
          setIsGenerating(false);
        }
      };
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets, venueProject, email, name, venue?.name]);

  const handleSlotClick = (slotMins: number) => {
    if (selectedSlots.includes(slotMins)) {
      const newSlots = selectedSlots.filter((s) => s !== slotMins).sort((a, b) => a - b);
      const isContiguous = newSlots.every((s, i) => i === 0 || s === newSlots[i - 1] + durationMinutes);
      if (isContiguous) {
        setSelectedSlots(newSlots);
      } else {
        setSelectedSlots([slotMins]);
      }
    } else {
      const newSlots = [...selectedSlots, slotMins].sort((a, b) => a - b);
      const isContiguous = newSlots.every((s, i) => i === 0 || s === newSlots[i - 1] + durationMinutes);
      if (isContiguous) {
        setSelectedSlots(newSlots);
      } else {
        setSelectedSlots([slotMins]);
      }
    }
  };

  const handlePaymentStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSharedAccess) {
      if (!date?.from || quantity < 1 || !name || !email) {
        toast.error("Please fill in all required fields.");
        return;
      }
    } else {
      if (!date?.from || selectedSlots.length === 0 || !name || !email) {
        toast.error("Please fill in all required fields.");
        return;
      }
    }

    if (totalAmount > 0) {
      setIsPaymentModalOpen(true);
    } else {
      bookingMutation.mutate(undefined);
    }
  };

  if (!venue || !facility) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Facility not found.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Submitted!</h1>

          <div className="bg-secondary/30 border border-border/60 rounded-2xl p-6 mb-8 w-full max-w-sm">
            <p className="text-sm text-muted-foreground mb-2">Your Booking Reference (OTP)</p>
            <p className="text-4xl font-mono font-bold tracking-widest text-primary">
              {bookingRef}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Please show this code at the facility.
            </p>
          </div>

          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {facility.requires_approval
              ? "Your request has been sent to the venue for approval. You will receive an email once it is confirmed."
              : "Your booking is confirmed! We have sent the details to your email address."}
          </p>
          <Button
            onClick={() => navigate({ to: "/venues/$venueId", params: { venueId } })}
            className="rounded-xl h-12 px-8"
          >
            Return to Venue
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const OrderSummaryContent = () => (
    <>
      <div className="space-y-4 mb-6">
        {facility.image_url && (
          <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
            <img
              src={facility.image_url}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Facility</span>
          <span className="font-medium text-right">{facility.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Venue</span>
          <span className="font-medium text-right">{venue.name}</span>
        </div>
        {date?.from && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date Range</span>
            <span className="font-medium text-right">
              {date.to && date.to > date.from
                ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`
                : format(date.from, "MMM d, yyyy")}
            </span>
          </div>
        )}
        {date?.from && selectedSlots.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time (Daily)</span>
            <span className="font-medium text-right">
              {formatSlot(Math.min(...selectedSlots))} - {formatSlot(Math.max(...selectedSlots) + durationMinutes)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-4 space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Hourly Rate</span>
          <span>{formatCurrency(hourlyRate, currency)} / hr</span>
        </div>
        {daysInRange.length > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Days</span>
            <span>{daysInRange.length} days</span>
          </div>
        )}
        <div className="flex justify-between items-end">
          <span className="font-bold text-lg">Total Due</span>
          <span className="text-2xl font-black text-primary">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-0">
      <Navbar />
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/venues/$venueId"
          params={{ venueId }}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Venue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Book {facility.name}</h1>
              <p className="text-muted-foreground">
                Select your date(s), time, and enter your details to complete your booking.
              </p>
            </div>

            <form id="booking-form" onSubmit={handlePaymentStart} className="space-y-8">
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">1. Date & Time</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Select Date (Click to pick a single day or a range)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal rounded-xl bg-secondary/30",
                            !date?.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d);
                            setSelectedSlots([]);
                          }}
                          disabled={(d) =>
                            isBefore(d, startOfDay(new Date())) || isDateFullyBooked(d)
                          }
                          initialFocus
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {date?.from && (isSharedAccess || isSharedSlot) && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label>Quantity (Passes)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isSharedSlot ? "Select the number of passes you need per session." : "Select the number of passes you need per day."}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={quantity >= availableCapacity}
                          onClick={() => setQuantity((q) => Math.min(availableCapacity, q + 1))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {availableCapacity !== Infinity && availableCapacity > 0 && (
                          <span className="text-sm font-medium text-orange-500">
                            Only {availableCapacity} left for selected date(s)
                          </span>
                        )}
                        {availableCapacity === 0 && (
                          <span className="text-sm font-bold text-red-500">
                            Sold Out for selected date(s)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {date?.from && !isSharedAccess && (() => {
                    const isWholeDayAvailable = DYNAMIC_SLOTS.length > 0 && DYNAMIC_SLOTS.every((slot) => !getSlotStatusAcrossRange(slot).isBooked);

                    const renderSlotGrid = (label: string, slots: number[]) => {
                      if (slots.length === 0) return null;
                      return (
                        <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0">
                          <div className="w-24 shrink-0 font-medium text-muted-foreground mt-2">{label}</div>
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {slots.map((slotMins) => {
                              const { isBooked, bookedCount, maxCapacity, isBlockedByAdmin } = getSlotStatusAcrossRange(slotMins);
                              const isSelected = selectedSlots.includes(slotMins);
                              const timeString = formatSlot(slotMins);

                              let dynamicClass = "";

                              if (isBlockedByAdmin) {
                                dynamicClass = "opacity-40 cursor-not-allowed line-through bg-secondary/20 hover:bg-secondary/20";
                              } else if (bookedCount > 0) {
                                const fillPercentage = maxCapacity === Infinity ? 0 : Math.min(100, Math.round((bookedCount / maxCapacity) * 100));
                                
                                if (fillPercentage >= 100 || isBooked) {
                                   if (fillPercentage >= 100 || maxCapacity === 1) {
                                      dynamicClass = "opacity-80 cursor-not-allowed bg-primary text-primary-foreground border-primary";
                                   } else {
                                      if (fillPercentage < 25) {
                                        dynamicClass = "opacity-80 cursor-not-allowed bg-primary/20 text-primary border-primary/30";
                                      } else if (fillPercentage < 50) {
                                        dynamicClass = "opacity-80 cursor-not-allowed bg-primary/40 text-primary-foreground border-primary/50";
                                      } else if (fillPercentage < 75) {
                                        dynamicClass = "opacity-80 cursor-not-allowed bg-primary/60 text-primary-foreground border-primary/70";
                                      } else {
                                        dynamicClass = "opacity-80 cursor-not-allowed bg-primary/80 text-primary-foreground border-primary/90";
                                      }
                                   }
                                } else if (fillPercentage > 0) {
                                   if (fillPercentage < 25) {
                                     dynamicClass = "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
                                   } else if (fillPercentage < 50) {
                                     dynamicClass = "bg-primary/40 text-primary-foreground border-primary/50 hover:bg-primary/50";
                                   } else if (fillPercentage < 75) {
                                     dynamicClass = "bg-primary/60 text-primary-foreground border-primary/70 hover:bg-primary/70";
                                   } else {
                                     dynamicClass = "bg-primary/80 text-primary-foreground border-primary/90 hover:bg-primary/90";
                                   }
                                }
                              } else if (isBooked) {
                                dynamicClass = "opacity-40 cursor-not-allowed bg-secondary/30";
                              }

                              return (
                                <Button
                                  key={slotMins}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                    "h-10 rounded-xl transition-all font-medium text-sm border-border/60",
                                    dynamicClass,
                                    isSelected && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 border-transparent",
                                  )}
                                  disabled={isBooked}
                                  onClick={() => handleSlotClick(slotMins)}
                                >
                                  {timeString}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <Label>Available Time Slots</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Select continuous slots. These will be booked for <strong>every day</strong> in your selected range.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-xl"
                            disabled={!isWholeDayAvailable}
                            onClick={() => setSelectedSlots(DYNAMIC_SLOTS)}
                          >
                            Book Whole Day
                          </Button>
                        </div>

                        <div className="bg-background/50 rounded-2xl p-4 sm:p-6 border border-border/60 shadow-inner mt-4">
                          {renderSlotGrid("Morning", groupedSlots.morning)}
                          {renderSlotGrid("Afternoon", groupedSlots.afternoon)}
                          {renderSlotGrid("Evening", groupedSlots.evening)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">2. Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number (Optional)</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 700 000 000"
                      className="h-12 rounded-xl bg-secondary/30"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block bg-card border border-border/60 rounded-3xl p-6 shadow-[var(--shadow-card)] sticky top-24">
            <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
            <OrderSummaryContent />
            <Button
              type="submit"
              form="booking-form"
              disabled={
                bookingMutation.isPending ||
                !date?.from ||
                (!isSharedAccess && selectedSlots.length === 0) ||
                (isSharedAccess && (quantity < 1 || quantity > availableCapacity || availableCapacity === 0))
              }
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {bookingMutation.isPending
                ? "Processing..."
                : facility.requires_approval
                  ? "Request Booking"
                  : "Proceed to Payment"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {facility.requires_approval && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                This facility requires manual approval from the venue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-transform duration-300">
        <div className="max-w-md mx-auto p-4">
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setSummaryExpanded(!summaryExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">Order Summary</span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${summaryExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!summaryExpanded && (
              <span className="font-bold text-primary text-sm">
                {formatCurrency(totalAmount, currency)}
              </span>
            )}
          </div>

          {summaryExpanded && (
            <div className="mb-4 text-sm animate-in slide-in-from-bottom-2 fade-in duration-200 border-t border-border/40 pt-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
              <OrderSummaryContent />
            </div>
          )}

          <Button
            type="submit"
            form="booking-form"
            disabled={
              bookingMutation.isPending ||
              !date?.from ||
              (!isSharedAccess && selectedSlots.length === 0) ||
              (isSharedAccess && (quantity < 1 || quantity > availableCapacity || availableCapacity === 0))
            }
            className="w-full h-12 text-md font-bold rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : facility.requires_approval ? (
              "Request Booking"
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        baseAmount={totalAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProceed={(details) => bookingMutation.mutate(details)}
        isProcessing={bookingMutation.isPending || isPollingPawaPay}
        isGenerating={false}
        workspaceId={venue.workspace_id}
        itemLabel={
          isSharedAccess
            ? `${daysInRange.length} day(s) × ${quantity} pass(es)`
            : `${daysInRange.length} day(s) × ${selectedSlots.length} hour(s)`
        }
        baseCurrency={currency}
        userPhone={phone}
      />

      {isPollingPawaPay && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <Smartphone className="h-16 w-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-3">Check Your Phone</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
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
            className="rounded-xl h-12 px-8"
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
          >
            Cancel Payment
          </Button>
        </div>
      )}

      <Footer />
      {isGenerating && issuedTickets.length > 0 && venueProject && (
        <div style={{ position: "absolute", left: "-9999px", top: 0, opacity: 0 }}>
          {issuedTickets.map((ticket: any) => (
            <div
              key={ticket.id}
              id={`ticket-render-${ticket.id}`}
              style={{ display: "inline-block" }}
            >
              <TicketPreview
                template={venueProject.template}
                palette={venueProject.palette || { from: "#000", to: "#000", name: "Black" }}
                font={venueProject.font || { css: "sans-serif", name: "Modern" }}
                tier={ticket.tier || "Facility Access"}
                title={venue.name}
                subtitle={facility.name}
                date={date?.from ? format(date.from, "LLL dd, yyyy") : ""}
                time="Full Day Access"
                seat={name || "General"}
                price={totalAmount.toString()}
                currency={currency}
                cover={venueProject.coverImage || ""}
                logoText={venueProject.logoText || "Agatike"}
                logoImage={venueProject.logoImage}
                logoScale={Number(venueProject.logoScale || 24)}
                logoOpacity={Number(venueProject.logoOpacity ?? 1)}
                logoColorMode={venueProject.logoColorMode || "original"}
                orderId={ticket.otp || bookingRef}
                qrValue={`${window.location.origin}/v/${ticket.otp}`}
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
                    showQr: true,
                    showBarcode: false,
                    showTerms: true,
                    termsText: venueProject.terms || "Standard venue terms apply.",
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
