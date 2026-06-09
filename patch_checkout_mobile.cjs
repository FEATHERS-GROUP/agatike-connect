const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "src/components/mobile/VenueCheckoutMobile.tsx");
let content = fs.readFileSync(target, "utf-8");

// 1. Add Imports
content = content.replace(
  `import { useUserAuth } from "@/contexts/UserAuthContext";`,
  `import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createVenueBooking } from "@/api/venue_bookings";
import { getWorkspaceTicketProjects } from "@/api/events";
import { sendTicketsEmail } from "@/api/email";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";`,
);

// 2. Add new states and Ticket Query
content = content.replace(
  `const [countries, setCountries] = useState<string[]>([]);`,
  `const [countries, setCountries] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", venue?.workspace_id],
    queryFn: () => getWorkspaceTicketProjects({ data: { workspaceId: venue?.workspace_id! } } as any),
    enabled: !!venue?.workspace_id,
  });
  const venueProject = ticketProjects?.find((p: any) => p.venueId === venue.id);`,
);

// 3. Booking Logic
const newTotalCalc = `  const total = (venue.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).reduce((acc: number, tier: any) => {
    const qty = ticketsData[tier.name || "Standard Entry"] || 0;
    return acc + qty * (Number(tier.amount) || 0);
  }, 0) || 0;`;

content = content.replace(
  newTotalCalc,
  newTotalCalc +
    `\n
  const { mutate: doCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      const totalAttendees = 1 + attendees.length;
      return createVenueBooking({
        data: {
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
          payment_status: "Paid",
          amount: Number(total),
          number_of_attendees: totalAttendees,
          tickets_data: ticketsData,
          attendees_info: attendees.length > 0 ? attendees : null,
          internal_notes: null,
          venue_name: venue.name,
          venue_currency: venue.currency,
        },
      });
    },
    onSuccess: (res) => {
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
    }
  });

  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && venueProject) {
      const generatePDFs = async () => {
        try {
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(\`ticket-render-\${ticket.id}\`);
            if (!el) continue;

            const imgData = await htmlToImage.toPng(el, {
              pixelRatio: 2,
              backgroundColor: "transparent",
            });

            const rect = el.getBoundingClientRect();
            const width = rect.width || 720;
            const height = rect.height || 260;

            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "px",
              format: [width, height],
            });
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            const base64 = pdf.output("datauristring").split(",")[1];

            attachments.push({
              filename: \`Ticket_\${ticket.tier.replace(/\\s+/g, "_")}_\${ticket.otp}.pdf\`,
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
          console.error(e);
          toast.error("Ticket generation failed. Please try checking out again.");
          setIsGenerating(false);
          // Don't set isSuccess(true) so they can try again
        }
      };
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets, venueProject, email, name, venue?.name, storageKey]);`,
);

content = content.replace(
  `const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/signin", search: { redirect: \`/venues/checkout/\${venue.id}\` } as any });
      return;
    }
    setIsSuccess(true);
    localStorage.removeItem(storageKey);
    setTimeout(() => {
      navigate({ to: "/venues" });
    }, 3000);
  };`,
  `const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/signin", search: { redirect: \`/venues/checkout/\${venue.id}\` } as any });
      return;
    }
    doCheckout();
  };`,
);

// 4. Update Button in Form
content = content.replace(
  `<Button
                type="submit"
                disabled={totalTickets === 0}
                className="flex-1 h-12 text-base font-bold rounded-xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Pay {total > 0 ? \`\${venue.currency} \${total.toLocaleString()}\` : (totalTickets > 0 ? "Free" : \`\${venue.currency} 0\`)}
              </Button>`,
  `<Button
                type="submit"
                disabled={totalTickets === 0 || isCheckingOut || isGenerating}
                className="flex-1 h-12 text-base font-bold rounded-xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isCheckingOut || isGenerating ? (
                  <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /></span>
                ) : (
                  <>Pay {total > 0 ? \`\${venue.currency} \${total.toLocaleString()}\` : (totalTickets > 0 ? "Free" : \`\${venue.currency} 0\`)}</>
                )}
              </Button>`,
);

// 5. Hidden TicketPreview
content = content.replace(
  `</div>
    </div>
  );`,
  `</div>
      {/* Hidden Ticket Renderer */}
      {isGenerating && issuedTickets.length > 0 && venueProject && (
        <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
          {issuedTickets.map((t) => (
            <div key={t.id} id={\`ticket-render-\${t.id}\`} className="inline-block bg-white relative">
              <TicketPreview
                  tier={t.tier}
                  title={venue.name}
                  subtitle={venue.address || t.attendee_name || name}
                  date={date}
                  time="Opening Hours"
                  seat={t.attendee_name || name || "General"}
                  price={total.toString()}
                  currency={venue.currency}
                  cover={venueProject.coverImage || ""}
                  logoText={
                    venueProject.logoText || "agatiike"
                  }
                  logoImage={venueProject.logoImage}
                  logoScale={Number(venueProject.logoScale || 24)}
                  logoOpacity={Number(venueProject.logoOpacity ?? 1)}
                  logoColorMode={venueProject.logoColorMode || "original"}
                  orderId={t.otp}
                  qrValue={\`\${window.location.origin}/v/\${t.otp}\`}
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
  );`,
);

fs.writeFileSync(target, content);
console.log("Mobile patched successfully!");
