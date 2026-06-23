import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getWorkspaceVipPrivileges } from "@/api/vip";
import { getEventById, getWorkspaceTicketProjects } from "@/api/events";
import { addEventAttendees, getEventAttendees } from "@/api/attendees";
import { sendTicketsEmail } from "@/api/email";
import { initiatePawaPayDeposit, getPawaPayDepositStatus } from "@/api/pawapay";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { PaymentModal } from "@/components/shared/PaymentModal";

import { CheckoutSkeleton } from "@/components/desktop/booking/CheckoutSkeleton";
import { SuccessState } from "@/components/desktop/booking/SuccessState";
import { OrderSummary } from "@/components/desktop/booking/OrderSummary";
import { BookingForm } from "@/components/desktop/booking/BookingForm";
import { HiddenPDFGenerator } from "@/components/desktop/booking/HiddenPDFGenerator";

export function BookingDesktop({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"me" | "others">("me");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [pawapayError, setPawapayError] = useState<string | null>(null);

  // State for attendees dynamic form
  const [attendees, setAttendees] = useState<any[]>([]);

  const storageKey = `event_checkout_${eventId}`;
  const [cart, setCart] = useState<Record<string, number>>({});
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
  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", event?.workspace_id],
    queryFn: () =>
      getWorkspaceTicketProjects({ data: { workspaceId: event?.workspace_id! } } as any),
    enabled: !!event?.workspace_id,
  });

  const eventProject = ticketProjects?.find((p: any) => p.eventId === event.id);

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

  // Fetch VIP Privileges
  const { data: vipPrivileges = [] } = useQuery({
    queryKey: ["workspace-vip-privileges", event?.workspace_id],
    queryFn: () =>
      getWorkspaceVipPrivileges({ data: { workspace_id: event?.workspace_id! } } as any),
    enabled: !!event?.workspace_id,
  });

  // Load cart and init attendees
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
    } catch {}
    setIsHydrated(true);
  }, [storageKey, eventId]);

  // Initialize attendees array based on cart
  useEffect(() => {
    if (!isHydrated || Object.keys(cart).length === 0) return;

    if (attendees.length > 0) return; // Prevent re-initialization which causes lag and resets inputs

    const availableSeats = [...selectedSeats];
    const initialAttendees: any[] = [];

    // Flatten cart into individual ticket records
    Object.entries(cart).forEach(([cartKey, qty]) => {
      if (qty <= 0) return;
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
          dynamic_fields: {}, // Store dynamically generated vip privilege answers here
        });
      }
    });

    // Pre-fill first attendee name if user is logged in
    if (initialAttendees.length > 0 && user) {
      if (!initialAttendees[0].firstName && user.username) {
        initialAttendees[0].firstName = user.username.split(" ")[0] || "";
        initialAttendees[0].lastName = user.username.split(" ").slice(1).join(" ") || "";
      }
    }

    setAttendees(initialAttendees);
  }, [isHydrated, cart, user, selectedSeats]);

  const updateAttendee = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const updateDynamicField = (index: number, fieldId: string, value: string) => {
    const newAttendees = [...attendees];
    const currentDynamics = newAttendees[index].dynamic_fields || {};
    newAttendees[index] = {
      ...newAttendees[index],
      dynamic_fields: { ...currentDynamics, [fieldId]: value },
    };
    setAttendees(newAttendees);
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

  const totalTickets = attendees.length;

  const validateAttendeeDynamicFields = (a: any) => {
    const tier = getTierDetails(a.tierId);
    const tierPrivileges =
      tier?.vip_privilege_ids
        ?.map((pid: string) => vipPrivileges.find((vp: any) => vp.id === pid))
        .filter(Boolean) || [];
    const requiredFields = tierPrivileges
      .flatMap((p: any) => p.fields || [])
      .filter((f: any) => f.required);

    return requiredFields.every((f: any) => {
      const val = a.dynamic_fields?.[f.id];
      return val && val.trim() !== "";
    });
  };

  const isFormValid =
    (assignMode === "me"
      ? attendees.length > 0 &&
        !!attendees[0].firstName &&
        !!attendees[0].lastName &&
        !!attendees[0].email &&
        !!attendees[0].country &&
        validateAttendeeDynamicFields(attendees[0])
      : attendees.every(
          (a) =>
            a.firstName && a.lastName && a.email && a.country && validateAttendeeDynamicFields(a),
        )) &&
    attendees.every((a) => {
      const projectForStop = stopsWithVenues.find((s) => s.stopIdx === a.stopIdx)?.project;
      const isSeatRequired = projectForStop?.sections_data?.some(
        (s: any) => s.ticketId === a.tierId,
      );
      return !isSeatRequired || !!a.seat;
    });

  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async (paymentDetails?: { phone?: string; network?: string }) => {
      const booking_ref = Math.random().toString(36).substring(2, 12).toUpperCase();
      const isPawaPay = total > 0 && paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network;

      // Map attendees to Hasura table payload
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
                dynamic_fields: attendees[0].dynamic_fields,
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
            ...sourceAttendee.dynamic_fields,
          },
        };
      });

      const res = await addEventAttendees({ data: { objects: attendeesPayload } } as any);

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: total,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            type: "event_ticket",
            referenceId: booking_ref
          }
        } as any);
        return { res, attendeesPayload, isPawaPay: true, depositId: pawaRes.depositId };
      }

      return { res, attendeesPayload, isPawaPay: false };
    },
    onSuccess: (data: any) => {
      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return;
      }

      const { res, attendeesPayload } = data;
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
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPollingPawaPay && pawapayDepositId) {
      interval = setInterval(async () => {
        try {
          const status = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
          if (status?.status === "completed") {
            setIsPollingPawaPay(false);
            toast.success("Payment completed successfully!");
            localStorage.removeItem(storageKey);
            setIsSuccess(true);
          } else if (status?.status === "failed") {
            setIsPollingPawaPay(false);
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
      palette:
        combinationOverride.palette ||
        tierOverride.palette ||
        stopOverride.palette ||
        baseProject.palette,
      font: combinationOverride.font || tierOverride.font || stopOverride.font || baseProject.font,
    };
  };

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && eventProject) {
      const generatePDFs = async () => {
        try {
          await new Promise((r) => setTimeout(r, 500)); // Wait for DOM to render
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(`ticket-render-${ticket.id}`);
            if (!el) {
              toast.error(`DOM Element missing for ticket ${ticket.id}`);
              continue;
            }

            await new Promise((r) => setTimeout(r, 100));

            const imgData = await htmlToImage.toJpeg(el, {
              pixelRatio: 1.5,
              quality: 0.8,
              backgroundColor: "#ffffff",
              width: 720,
              height: 260,
            });

            if (!imgData || imgData === "data:,") {
              throw new Error(
                "htmlToImage returned an empty image. Usually caused by unloaded fonts or images.",
              );
            }

            const width = 720;
            const height = 260;

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

          if (attachments.length > 0) {
            // Group tickets by email address so each friend gets their own tickets if changed!
            const emailGroups: Record<string, { name: string; attachments: any[] }> = {};

            for (let i = 0; i < issuedTickets.length; i++) {
              const email = issuedTickets[i].attendee.email || attendees[0]?.email;
              const name =
                `${issuedTickets[i].attendee.firstName} ${issuedTickets[i].attendee.lastName}`.trim() ||
                "Guest";

              if (!emailGroups[email]) {
                emailGroups[email] = { name, attachments: [] };
              }
              emailGroups[email].attachments.push(attachments[i]);
            }

            // Send out emails to all unique addresses
            for (const [email, group] of Object.entries(emailGroups)) {
              await sendTicketsEmail({
                data: {
                  to: email,
                  customerName: group.name,
                  venueName: event.title,
                  attachments: group.attachments,
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
    if (isSuccess) {
      toast.success("Ticket purchase successful!");
      const timer = setTimeout(() => {
        navigate({ to: "/events/$eventId", params: { eventId }, replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate, eventId]);

  if (!event || attendees.length === 0) {
    return <CheckoutSkeleton />;
  }

  if (isPollingPawaPay) {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <Smartphone className="h-16 w-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-3">Check Your Phone</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            We've sent a payment request to your mobile number. Please enter your PIN to confirm the payment.
          </p>
          <div className="flex gap-2 mb-8 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
          <Button variant="outline" onClick={() => setIsPollingPawaPay(false)} className="rounded-2xl h-12 px-8">
            Cancel Payment
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return <SuccessState eventTitle={event.title} recipientEmail={attendees[0]?.email} />;
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
          <BookingForm
            attendees={attendees}
            assignMode={assignMode}
            setAssignMode={setAssignMode}
            updateAttendee={updateAttendee}
            updateDynamicField={updateDynamicField}
            getTierDetails={getTierDetails}
            getStopDetails={getStopDetails}
            stopsWithVenues={stopsWithVenues}
            vipPrivileges={vipPrivileges}
            formatSeatDisplay={formatSeatDisplay}
          />

          {/* Right Column: Summary */}
          <div>
            <OrderSummary
              event={event}
              cart={cart}
              total={total}
              currency={currency}
              issuedTicketsLength={issuedTickets.length}
              isGenerating={isGenerating}
              isCheckingOut={isCheckingOut}
              isFormValid={isFormValid}
              getTierDetails={getTierDetails}
              onRetryGeneration={() => {
                setIsGenerating(true);
                setIsPaymentModalOpen(true);
              }}
              onPay={() => setIsPaymentModalOpen(true)}
            />
          </div>
        </div>
      </main>

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
        <HiddenPDFGenerator
          issuedTickets={issuedTickets}
          eventProject={eventProject}
          event={event}
          currency={currency}
          getMergedProjectDesign={getMergedProjectDesign}
          getStopDetails={getStopDetails}
          formatSeatDisplay={formatSeatDisplay}
          getTierDetails={getTierDetails}
        />
      )}

      <Footer />
    </div>
  );
}
