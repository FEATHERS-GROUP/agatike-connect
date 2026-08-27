import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  MoreVertical,
  Check,
  ChevronDown,
  CreditCard,
  Shield,
  Smartphone,
  Wallet,
  Lock,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  User,
  Tag,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { CheckYourPhone } from "@/components/shared/CheckYourPhone";
import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { AuthSuggestionModal } from "@/components/shared/AuthSuggestionModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEventById, getTicketProjectPublic } from "@/api/events";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { addEventAttendees, getEventAttendees } from "@/api/attendees";
import { sendTicketsEmail } from "@/api/email";
import { generateFallbackReceipt } from "@/lib/pdf-receipt";
import { getEventProducts, createProductOrders } from "@/api/products";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { COUNTRIES } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { VenueSeatSelector } from "@/components/shared/VenueSeatSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StorefrontFooter } from "@/components/page-builder/StorefrontFooter";

export function BookingMobile({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserAuth();
  const [isAuthSuggestionOpen, setIsAuthSuggestionOpen] = useState(false);
  const [hasSkippedAuth, setHasSkippedAuth] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSub =
        window.location.hostname.split(".").length >
          (window.location.hostname.includes("localhost") ? 1 : 2) &&
        window.location.hostname.split(".")[0] !== "www";
      setIsSubdomain(isSub);
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"me" | "others">("me");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [pawapayError, setPawapayError] = useState<string | null>(null);
  const [checkoutContext, setCheckoutContext] = useState<any>(null);

  // State for attendees dynamic form
  const [attendees, setAttendees] = useState<any[]>([]);

  const storageKey = `event_checkout_${eventId}`;
  const [cart, setCart] = useState<Record<string, number>>({});
  const hasMerchInCart = Object.keys(cart).some((k) => k.startsWith("merch_") && cart[k] > 0);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch Event
  const { data: dbEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
  });

  const event = dbEvent;
  const currency = event?.workspaces?.currency || "RWF";

  // Fetch Ticket Projects for PDF generation
  const { data: eventProject } = useQuery({
    queryKey: ["event-ticket-project", eventId],
    queryFn: () => getTicketProjectPublic({ data: { eventId } } as any),
    enabled: !!eventId,
  });

  // Fetch venue projects and booked attendees
  const { data: venueProjects } = useQuery({
    queryKey: ["workspace-venues", event?.workspace_id],
    queryFn: () =>
      getWorkspaceVenueProjects({ data: { workspace_id: event?.workspace_id! } } as any),
    enabled: !!event?.workspace_id,
  });

  const { data: bookedAttendees } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  // Fetch event products (merchandise)
  const { data: eventProducts = [] } = useQuery({
    queryKey: ["event-products", eventId],
    queryFn: () => getEventProducts({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  // Load cart, selected seats, and session-persisted form inputs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedCart = JSON.parse(saved);
        setCart(parsedCart);
      }
      const savedSeats = localStorage.getItem(`event_checkout_seats_${eventId}`);
      if (savedSeats) {
        setSelectedSeats(JSON.parse(savedSeats));
      }

      // Restore form inputs if user accidentally refreshed the page
      const savedAttendees = sessionStorage.getItem(`event_checkout_attendees_${eventId}`);
      if (savedAttendees) {
        setAttendees(JSON.parse(savedAttendees));
      }
      const savedAssignMode = sessionStorage.getItem(`event_checkout_assignMode_${eventId}`);
      if (savedAssignMode) {
        setAssignMode(savedAssignMode as "me" | "others");
      }
    } catch {}
    setIsHydrated(true);
  }, [storageKey, eventId]);

  // Initialize attendees array based on cart
  useEffect(() => {
    if (!isHydrated || Object.keys(cart).length === 0) return;

    // If we loaded attendees from session storage and the quantity matches the cart, don't wipe them out!
    // Only count ticket entries (not merch) for attendees comparison
    const totalTicketsInCart = Object.entries(cart).reduce(
      (sum, [key, qty]) => (key.startsWith("merch_") ? sum : sum + qty),
      0,
    );
    if (attendees.length === totalTicketsInCart && totalTicketsInCart > 0) return;

    const availableSeats = [...selectedSeats];
    const initialAttendees: any[] = [];

    Object.entries(cart).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
      if (cartKey.startsWith("merch_")) return; // merchandise is not a ticket attendee
      const [stopIdxStr, tierId] = cartKey.split("_");
      const stopIdx = parseInt(stopIdxStr);

      for (let i = 0; i < qty; i++) {
        // Assign pre-selected seat for this tier if available
        const seatIdx = availableSeats.findIndex((s) => s.ticketId === tierId);
        let assignedSeat = undefined;
        let assignedSeatName = undefined;
        let assignedSectionName = undefined;
        if (seatIdx !== -1) {
          assignedSeat = availableSeats[seatIdx].code;
          assignedSeatName = availableSeats[seatIdx].seatName;
          assignedSectionName = availableSeats[seatIdx].sectionName;
          availableSeats.splice(seatIdx, 1);
        }

        initialAttendees.push({
          cartKey,
          stopIdx,
          tierId,
          seat: assignedSeat,
          seatName: assignedSeatName,
          sectionName: assignedSectionName,
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
  }, [isHydrated, cart, user, selectedSeats]);

  // Persist attendees and assignMode to sessionStorage whenever they change
  useEffect(() => {
    if (attendees.length > 0) {
      sessionStorage.setItem(`event_checkout_attendees_${eventId}`, JSON.stringify(attendees));
    }
    sessionStorage.setItem(`event_checkout_assignMode_${eventId}`, assignMode);
  }, [attendees, assignMode, eventId]);

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
    if (key.startsWith("merch_")) {
      const id = key.split("_")[1];
      let merch = eventProducts.find((p: any) => String(p.id) === id);
      if (!merch && event?.merchandises) {
        merch = event.merchandises.find((m: any) => String(m.id) === id);
      }
      return sum + (merch ? parseFloat(merch.price || 0) * qty : 0);
    }
    const [, tierId] = key.split("_");
    const tier = getTierDetails(tierId);
    return sum + (tier ? parseFloat(tier.cost || tier.price || 0) * qty : 0);
  }, 0);

  // SEATING LOGIC
  const activeStopIndices = useMemo(() => {
    const stops = new Set<number>();
    Object.keys(cart).forEach((key) => {
      if (cart[key] > 0) stops.add(parseInt(key.split("_")[0]));
    });
    return Array.from(stops);
  }, [cart]);

  const stopsWithVenues = useMemo(() => {
    return activeStopIndices
      .map((stopIdx) => {
        const project = venueProjects?.find(
          (v) => v.event_id === event?.id && v.tour_stop_idx === stopIdx,
        );
        return { stopIdx, project };
      })
      .filter((s) => s.project);
  }, [activeStopIndices, venueProjects, event?.id]);

  const handleSeatSelect = (stopIdx: number, seat: { code: string; ticketId: string }) => {
    const attendeeIdx = attendees.findIndex(
      (a) => a.stopIdx === stopIdx && a.tierId === seat.ticketId && !a.seat,
    );
    if (attendeeIdx === -1) {
      toast.error(
        `All ${getTierDetails(seat.ticketId)?.type || "selected"} tickets in your cart already have seats assigned.`,
      );
      return;
    }
    const newAttendees = [...attendees];
    newAttendees[attendeeIdx] = { ...newAttendees[attendeeIdx], seat: seat.code };
    setAttendees(newAttendees);
  };

  const handleSeatDeselect = (stopIdx: number, code: string) => {
    const attendeeIdx = attendees.findIndex((a) => a.stopIdx === stopIdx && a.seat === code);
    if (attendeeIdx !== -1) {
      const newAttendees = [...attendees];
      delete newAttendees[attendeeIdx].seat;
      setAttendees(newAttendees);
    }
  };

  const formatSeatDisplay = (raw: any, sectionName?: string) => {
    if (!raw) return "";
    if (typeof raw !== "string") raw = String(raw);
    let str = raw.trim();
    if (str.includes("-R") && str.includes("-C")) {
      const match = str.match(/-R(\d+)-C(\d+)/);
      if (match) str = `Row ${match[1]}, Seat ${match[2]}`;
    }
    if (sectionName && !str.includes(sectionName)) {
      return `${sectionName}, ${str}`;
    }
    return str;
  };

  const totalTickets = attendees.length;
  const isFormValid =
    (assignMode === "me"
      ? attendees.length > 0 &&
        !!attendees[0].firstName &&
        !!attendees[0].lastName &&
        !!attendees[0].email &&
        !!attendees[0].country
      : attendees.every((a) => a.firstName && a.lastName && a.email && a.country)) &&
    attendees.every((a) => {
      const projectForStop = stopsWithVenues.find((s) => s.stopIdx === a.stopIdx)?.project;
      const isSeatRequired = projectForStop?.sections_data?.some(
        (s: any) => s.ticketId === a.tierId,
      );
      return !isSeatRequired || !!a.seat;
    });

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async (paymentDetails?: {
      phone?: string;
      network?: string;
      currency?: string;
      convertedAmount?: number;
      shortfall?: number;
    }) => {
      const booking_ref = Math.random().toString(36).substring(2, 12).toUpperCase();
      const isPawaPay =
        total > 0 &&
        ((paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network) ||
          paymentMethod === "card");

      const attendeesPayload = attendees.map((a, idx) => {
        const otp = Math.random().toString(36).substring(2, 10).toUpperCase();
        const tier = getTierDetails(a.tierId);
        const sourceAttendee =
          assignMode === "me"
            ? {
                ...a,
                firstName: attendees[0].firstName,
                lastName: attendees[0].lastName,
                email: attendees[0].email,
                phone: attendees[0].phone,
                country: attendees[0].country,
              }
            : a;

        return {
          event_id: event.id,
          user_id: user?.id || null,
          names: `${sourceAttendee.firstName} ${sourceAttendee.lastName}`.trim(),
          email: sourceAttendee.email,
          phone: sourceAttendee.phone || "",
          qrcode_number: otp,
          quanity: "1",
          status: isPawaPay ? "Pending Payment" : "Confirmed",
          ticket_id: a.tierId,
          ticket_type: tier ? tier.type : "General Admission",
          type: "Booking",
          payment_method: paymentMethod,
          custom_fields: {
            booking_ref,
            country: sourceAttendee.country,
            tour_stop_idx: a.stopIdx,
            seat: a.seat,
            seat_display: a.seat
              ? formatSeatDisplay(a.seatName || a.seat, a.sectionName)
              : undefined,
            name: `${sourceAttendee.firstName} ${sourceAttendee.lastName}`.trim(),
          },
        };
      });

      const res = await addEventAttendees({ data: { objects: attendeesPayload } } as any);
      const returned = res?.insert_event_attendees?.returning || [];

      // Insert product_orders for any merchandise in the cart
      const primaryAttendee = attendees[0] || { phone: paymentDetails?.phone };
      const buyerPhone = primaryAttendee?.phone || paymentDetails?.phone || "";
      const qrBase = Math.random().toString(36).substring(2, 10).toUpperCase();

      const productOrderObjects = Object.entries(cart)
        .filter(([key, qty]) => key.startsWith("merch_") && qty > 0)
        .map(([key, qty], index) => {
          const parts = key.split("_");
          const productId = parts[1];
          let merch = eventProducts.find((p: any) => String(p.id) === productId);
          if (!merch && event?.merchandises) {
            merch = event.merchandises.find((m: any) => String(m.id) === productId);
          }
          const size = parts[2] !== "NONE" ? parts[2] : null;
          const color = parts[3] !== "NONE" ? parts[3] : null;
          const variantString = [size, color].filter(Boolean).join(" - ");
          return {
            product_id: productId,
            qty: String(qty),
            amount_paid: merch ? parseFloat(merch.price || 0) * qty : 0,
            status: isPawaPay ? "Pending Payment" : "Confirmed",
            phone: buyerPhone,
            qr_code_string: `${qrBase}-${productId.substring(0, 4)}-${index}`,
            ticket_id: attendees[0]?.tierId || null,
            decrptions: booking_ref,
            buyer_id: user?.id || null,
            picked: false,
            ...(variantString ? { size: variantString } : {}),
          };
        });

      if (productOrderObjects.length > 0) {
        try {
          await createProductOrders({ data: { objects: productOrderObjects } } as any);
        } catch (e: any) {
          console.error("Failed to create product orders:", e);
          throw new Error("Failed to secure merchandise inventory. Please try again.");
        }
      }

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: paymentDetails?.convertedAmount || total,
            baseAmount: total,
            baseCurrency: currency,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            currency: paymentDetails?.currency || "RWF",
            type: "portal_event_ticket",
            referenceId: booking_ref,
            workspaceId: event?.workspace_id,
            reason: event?.title || "Event Ticket",
            shortfall: paymentDetails?.shortfall || 0,
          },
        } as any);
        return {
          res,
          attendeesPayload,
          isPawaPay: true,
          depositId: pawaRes.depositId,
          redirectUrl: (pawaRes as any).redirectUrl,
          paymentDetails,
          booking_ref,
        };
      }

      return { res, attendeesPayload, isPawaPay: false, paymentDetails, booking_ref };
    },
    onSuccess: (data: any) => {
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      const { res, attendeesPayload, paymentDetails } = data;
      const returned = res?.insert_event_attendees?.returning || [];
      const ticketsToIssue = attendees.map((a, idx) => {
        const tier = getTierDetails(a.tierId);
        const sourceAttendee =
          assignMode === "me"
            ? {
                ...a,
                firstName: attendees[0].firstName,
                lastName: attendees[0].lastName,
                email: attendees[0].email,
                phone: attendees[0].phone,
                country: attendees[0].country,
              }
            : a;
        return {
          id: returned[idx]?.id || `temp_${idx}`,
          otp: attendeesPayload[idx].qrcode_number,
          tier: tier ? tier.type : "General Admission",
          attendee: sourceAttendee,
        };
      });

      setCheckoutContext({
        paymentDetails: data.paymentDetails,
        bookingRef: data.booking_ref,
      });

      if (ticketsToIssue.length > 0) {
        setIssuedTickets(ticketsToIssue);
      }

      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return;
      }

      if (ticketsToIssue.length > 0) {
        setIsGenerating(true);
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
    let interval: NodeJS.Timeout;
    if (isPollingPawaPay && pawapayDepositId) {
      interval = setInterval(async () => {
        try {
          const status = await getPawaPayDepositStatus({
            data: { depositId: pawapayDepositId },
          } as any);
          if (status?.status === "completed") {
            setIsPollingPawaPay(false);
            toast.success("Payment completed successfully!");
            if (issuedTickets.length > 0) {
              setIsGenerating(true);
            } else {
              localStorage.removeItem(storageKey);
              setIsSuccess(true);
            }
          } else if (status?.status === "failed") {
            setIsPollingPawaPay(false);
            if (pawapayDepositId) {
              try {
                await cancelPendingPayment({ data: { depositId: pawapayDepositId } } as any);
                queryClient.invalidateQueries({ queryKey: ["event-attendees", eventId] });
                queryClient.invalidateQueries({ queryKey: ["public-event", eventId] });
              } catch (e) {
                console.error("Cancel cleanup failed:", e);
              }
            }
            setPawapayError("Payment failed or was cancelled.");
            toast.error("Payment failed. Please try again.");
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPollingPawaPay, pawapayDepositId, storageKey]);

  const getMergedProjectDesign = (baseProject: any, stopIdx: number, tierId: string) => {
    if (!baseProject) return null;
    const overrides = baseProject.design_overrides?.overrides;
    if (!overrides) return baseProject;

    const stopOverride = overrides.tourStops?.[stopIdx] || {};
    const tierOverride = overrides.tiers?.[tierId] || {};
    const combinationOverride = overrides.combinations?.[`${stopIdx}_${tierId}`] || {};

    const safeParse = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    return {
      ...baseProject,
      ...stopOverride,
      ...tierOverride,
      ...combinationOverride,
      palette: safeParse(
        combinationOverride.palette ||
          tierOverride.palette ||
          stopOverride.palette ||
          baseProject.palette,
      ),
      font: safeParse(
        combinationOverride.font || tierOverride.font || stopOverride.font || baseProject.font,
      ),
      layout: safeParse(
        combinationOverride.layout ||
          tierOverride.layout ||
          stopOverride.layout ||
          baseProject.design_overrides?.layout ||
          baseProject.layout,
      ),
      back: safeParse(
        combinationOverride.back ||
          tierOverride.back ||
          stopOverride.back ||
          baseProject.design_overrides?.back ||
          baseProject.back,
      ),
    };
  };

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && checkoutContext) {
      const generatePDFs = async () => {
        const { paymentDetails, bookingRef } = checkoutContext;
        try {
          await new Promise((r) => setTimeout(r, 500)); // Wait for DOM to render
          const attachments: any[] = [];
          if (eventProject) {
            const chunkSize = 5;
            for (let i = 0; i < issuedTickets.length; i += chunkSize) {
              const chunk = issuedTickets.slice(i, i + chunkSize);
              const chunkPromises = chunk.map(async (ticket: any) => {
                const el = document.getElementById(`ticket-render-${ticket.id}`);
                if (!el) {
                  toast.error(`DOM Element missing for ticket ${ticket.id}`);
                  return null;
                }
                try {
                  const imgData = await htmlToImage.toJpeg(el, {
                    pixelRatio: 1.5,
                    quality: 0.8,
                    backgroundColor: "#ffffff",
                    width: 720,
                    height: 260,
                    imagePlaceholder:
                      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                  });
                  if (!imgData || imgData === "data:,") {
                    throw new Error("htmlToImage returned an empty image.");
                  }
                  const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "px",
                    format: [720, 260],
                  });
                  pdf.addImage(imgData, "JPEG", 0, 0, 720, 260);
                  const base64 = pdf.output("datauristring").split(",")[1];
                  return {
                    filename: `Ticket_${ticket.tier.replace(/\s+/g, "_")}_${ticket.otp}.pdf`,
                    content: base64,
                  };
                } catch (e) {
                  console.warn(`[Ticket ${ticket.id}] Custom PDF failed, falling back...`, e);
                  const stop =
                    event?.tour_stops?.[ticket.attendee?.stopIdx] || event?.tour_stops?.[0];
                  return await generateFallbackReceipt({
                    entityName: event?.title || "Event",
                    ticket,
                    bookingRef: ticket.otp,
                    customerName: ticket.attendee?.firstName || "Guest",
                    type: "event",
                    dateStr: stop?.date || "",
                    timeStr: stop?.time || "",
                    locationStr: stop?.city || "",
                    durationStr: event?.duration || "",
                    tierName: ticket.tier,
                    quantity: 1,
                  });
                }
              });
              const results = await Promise.all(chunkPromises);
              attachments.push(...results.filter(Boolean));
            }
          } else {
            const chunkSize = 5;
            for (let i = 0; i < issuedTickets.length; i += chunkSize) {
              const chunk = issuedTickets.slice(i, i + chunkSize);
              const chunkPromises = chunk.map(async (ticket: any) => {
                const stop =
                  event?.tour_stops?.[ticket.attendee?.stopIdx] || event?.tour_stops?.[0];
                return await generateFallbackReceipt({
                  entityName: event?.title || "Event/Venue",
                  ticket,
                  bookingRef: ticket.otp,
                  customerName: ticket.attendee?.firstName || "Guest",
                  type: "event",
                  dateStr: stop?.date || "",
                  timeStr: stop?.time || "",
                  locationStr: stop?.city || "",
                  durationStr: event?.duration || "",
                  tierName: ticket.tier,
                  quantity: 1,
                });
              });
              const results = await Promise.all(chunkPromises);
              attachments.push(...results.filter(Boolean));
            }
          }

          if (attachments.length > 0) {
            const emailGroups: Record<
              string,
              { name: string; attachments: any[]; phone: string; ticketCodes: string[] }
            > = {};

            for (let i = 0; i < issuedTickets.length; i++) {
              const email = issuedTickets[i].attendee.email || attendees[0]?.email;
              const phone = issuedTickets[i].attendee.phone || attendees[0]?.phone;
              const name =
                `${issuedTickets[i].attendee.firstName} ${issuedTickets[i].attendee.lastName}`.trim() ||
                "Guest";

              if (!emailGroups[email]) {
                emailGroups[email] = { name, attachments: [], phone, ticketCodes: [] };
              }
              emailGroups[email].attachments.push(attachments[i]);
              if (issuedTickets[i].otp) {
                emailGroups[email].ticketCodes.push(issuedTickets[i].otp);
              }
            }

            for (const [email, group] of Object.entries(emailGroups)) {
              await sendTicketsEmail({
                data: {
                  to: email,
                  customerName: group.name,
                  venueName: event.title,
                  attachments: group.attachments,
                  hasMerch: hasMerchInCart,
                  workspaceId: event?.workspace_id,
                  phone: group.phone,
                  isVenue: false,
                  totalPaid: Number(
                    paymentDetails?.convertedAmount ||
                      paymentDetails?.amount ||
                      (hasMerchInCart ? Number(event.cost || 0) : Number(event.cost || 0)),
                  ),
                  ticketCodes: group.ticketCodes.join(", "),
                  bookingRef: bookingRef,
                  isPortal: !isSubdomain,
                },
              } as any).catch((e) => {
                console.error("Failed to email", email, e);
                toast.error(`Failed to email ${email}: ${e.message || "API Error"}`);
              });
            }
          }
          localStorage.removeItem(storageKey);
          setIsSuccess(true);
        } catch (err) {
          console.error("PDF generation error:", err);
          toast.error("Ticket PDF generation failed. You can retry generating.");
          setIsGenerating(false);
          setIsPaymentModalOpen(false);
        }
      };

      generatePDFs();
    }
  }, [isGenerating, issuedTickets, eventProject, event?.title, attendees, storageKey]);

  useEffect(() => {
    let tm: any;
    if (isSuccess) {
      tm = setTimeout(() => {
        navigate({ to: "/events/$eventId", params: { eventId } });
      }, 5000);
    }
    return () => clearTimeout(tm);
  }, [isSuccess, navigate, eventId]);

  const hiddenTicketRenderer = isGenerating && issuedTickets.length > 0 && eventProject && (
    <div className="absolute -z-50 pointer-events-none" style={{ top: "-9999px", left: "-9999px" }}>
      {issuedTickets.map((ticket: any) => {
        const mergedProject = getMergedProjectDesign(
          eventProject,
          ticket.attendee.stopIdx,
          ticket.attendee.tierId,
        );
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
              layout={mergedProject.layout || "Standard"}
              back={mergedProject.back || { style: "Standard", text: "" }}
              tier={ticket.tier}
              title={event?.title || "Event"}
              subtitle={event?.subtitle || ""}
              date={event?.tour_stops?.[ticket.attendee.stopIdx]?.date || (event as any)?.date || ""}
              time={event?.tour_stops?.[ticket.attendee.stopIdx]?.time || (event as any)?.time || ""}
              seat={ticket.attendee?.seat || "General"}
              seatLabel={ticket.attendee?.seatName || ""}
              price={getTierDetails(ticket.attendee.tierId)?.price || getTierDetails(ticket.attendee.tierId)?.cost || "0"}
              currency={currency}
              cover={event?.cover_url || ""}
              logoText={event?.workspaces?.name || ""}
              logoImage={event?.workspaces?.logo_url || ""}
              logoScale={100}
              logoOpacity={100}
              logoColorMode="normal"
              orderId={ticket.otp}
              qrValue={ticket.otp}
              previewMode="Front"
            />
          </div>
        );
      })}
    </div>
  );

  if (!event || attendees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-background text-foreground pb-40 relative font-sans">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-[#f4f5f7] dark:bg-background z-30 pt-safe-top">
        <Link to="/events/$eventId" params={{ eventId }} className="h-10 w-10 flex items-center justify-center bg-white dark:bg-secondary rounded-full shadow-sm text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-[17px] tracking-tight">Booking Confirmation</h1>
        <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-secondary rounded-full shadow-sm text-foreground">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 py-2 space-y-5">
        {/* Order Summary */}
        <div className="bg-white dark:bg-card p-5 rounded-3xl shadow-sm">
          <div className="space-y-4">
            {Object.entries(cart).map(([cartKey, qty]) => {
              if (qty <= 0) return null;
              if (cartKey.startsWith("merch_")) {
                const parts = cartKey.split("_");
                const productId = parts[1];
                let merch = eventProducts.find((p: any) => String(p.id) === productId) || event?.merchandises?.find((m: any) => String(m.id) === productId);
                const lineTotal = merch ? parseFloat(merch.price || 0) * qty : 0;
                return (
                  <div key={cartKey} className="flex justify-between items-center text-[15px]">
                    <span className="text-muted-foreground">{qty}x {merch?.name || "Merchandise"}</span>
                    <span className="font-medium">{formatCurrency(lineTotal, currency)}</span>
                  </div>
                );
              }
              const [, tierId] = cartKey.split("_");
              const tier = getTierDetails(tierId);
              if (!tier) return null;
              return (
                <div key={cartKey} className="flex justify-between items-center text-[15px]">
                  <span className="text-muted-foreground">{qty}x {tier.type}</span>
                  <span className="font-medium text-foreground">{formatCurrency(parseFloat(tier.cost || tier.price || 0) * qty, currency)}</span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-5 pt-4 border-t border-border/40 flex justify-between items-center text-[17px]">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Trip Details (Event Details) */}
        <div className="bg-white dark:bg-card p-5 rounded-3xl shadow-sm">
           <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-[15px]">Event Details</h2>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
           </div>
           <div className="relative pl-6 space-y-6">
              <div className="absolute left-1.5 top-2 bottom-2 w-[1.5px] border-l-2 border-dashed border-border/60"></div>
              
              <div className="relative">
                 <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-white"></div>
                 <div className="flex justify-between items-start">
                    <p className="text-sm font-medium pr-4">{event.title}</p>
                    <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">{((event as any).time || event.tour_stops?.[0]?.time)}</p>
                 </div>
              </div>
              
              <div className="relative">
                 <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary border-[2.5px] border-white shadow-sm ring-1 ring-primary/20"></div>
                 <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground pr-4 line-clamp-2">{[ (event as any).venue || event.tour_stops?.[0]?.venue, (event as any).city || event.tour_stops?.[0]?.city].filter(Boolean).join(", ")}</p>
                    <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">{((event as any).date || event.tour_stops?.[0]?.date)}</p>
                 </div>
              </div>
           </div>
           
           {(event.duration || event.workspaces?.organizer?.name || event.workspaces?.name) && (
             <div className="mt-5 pt-4 border-t border-border/40 text-[11px] text-muted-foreground font-medium flex gap-4">
               {event.duration && <span>{event.duration}</span>}
               {(event.workspaces?.organizer?.name || event.workspaces?.name) && <span>Hosted by {event.workspaces?.organizer?.name || event.workspaces?.name}</span>}
             </div>
           )}
        </div>

        {/* Attendee Details Form styled cleanly */}
        <div className="bg-white dark:bg-card p-5 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-[15px]">Attendee Details</h2>
              {totalTickets > 1 && (
                <div className="flex gap-2">
                   <button onClick={() => setAssignMode("me")} className={`text-[11px] px-2 py-1 rounded-md font-medium ${assignMode === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>Me</button>
                   <button onClick={() => setAssignMode("others")} className={`text-[11px] px-2 py-1 rounded-md font-medium ${assignMode === 'others' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>Others</button>
                </div>
              )}
          </div>
          
          <div className="space-y-6">
            {(assignMode === "me" ? [attendees[0]] : attendees).map((attendee, idx) => {
              if (!attendee) return null;
              const tier = getTierDetails(attendee.tierId);
              return (
                <div key={idx} className="space-y-4">
                  {assignMode === 'others' && (
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{tier?.type || "Ticket"} {idx + 1}</h3>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground px-1">First Name</Label>
                      <Input value={attendee.firstName || ""} onChange={(e) => updateAttendee(idx, "firstName", e.target.value)} placeholder="Alex" className="h-11 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground px-1">Last Name</Label>
                      <Input value={attendee.lastName || ""} onChange={(e) => updateAttendee(idx, "lastName", e.target.value)} placeholder="Doe" className="h-11 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground px-1">Email</Label>
                    <Input type="email" value={attendee.email || ""} onChange={(e) => updateAttendee(idx, "email", e.target.value)} placeholder="alex@example.com" className="h-11 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground px-1">Phone Number</Label>
                    <Input type="tel" value={attendee.phone || ""} onChange={(e) => updateAttendee(idx, "phone", e.target.value)} placeholder="+250 788 123 456" className="h-11 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground px-1">Country</Label>
                    <Select value={attendee.country} onValueChange={(val) => updateAttendee(idx, "country", val)}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-0 focus:ring-1 focus:ring-primary/50">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>{countrySelectItems}</SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 pb-safe bg-[#f4f5f7]/90 dark:bg-background/90 backdrop-blur-md z-40">
        {issuedTickets.length > 0 ? (
          <Button
            onClick={() => { setIsGenerating(true); setIsPaymentModalOpen(true); }}
            disabled={isGenerating}
            className="w-full h-14 rounded-full text-lg font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Retry Ticket Generation
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (!user && !hasSkippedAuth) {
                setIsAuthSuggestionOpen(true);
              } else {
                setIsPaymentModalOpen(true);
              }
            }}
            disabled={!isFormValid || isCheckingOut || isGenerating}
            className="w-full h-[52px] rounded-full text-[17px] font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            Next
          </Button>
        )}
      </div>

      <AuthSuggestionModal
        isOpen={isAuthSuggestionOpen}
        onOpenChange={setIsAuthSuggestionOpen}
        onSkip={() => {
          setHasSkippedAuth(true);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProceed={doCheckout}
        isProcessing={isCheckingOut}
        isGenerating={isGenerating}
        workspaceId={event?.workspace_id || ""}
        baseAmount={total}
        quantity={totalTickets}
        itemLabel="Ticket(s)"
        baseCurrency={currency}
        userPhone={user?.phone || undefined}
      />

      {hiddenTicketRenderer}
    </div>
  );
}
