const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "src/components/desktop/VenueCheckoutDesktop.tsx");
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
import { Loader2 } from "lucide-react";`
);

// 2. Add new states
content = content.replace(
  `const [name, setName] = useState("");\n  const [idPassport, setIdPassport] = useState("");`,
  `const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idPassport, setIdPassport] = useState("");`
);

content = content.replace(
  `const [isHydrated, setIsHydrated] = useState(false);`,
  `const [isHydrated, setIsHydrated] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", venue?.workspace_id],
    queryFn: () => getWorkspaceTicketProjects({ data: { workspaceId: venue?.workspace_id! } } as any),
    enabled: !!venue?.workspace_id,
  });
  const venueProject = ticketProjects?.find((p: any) => p.venueId === venue.id);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.map((c: any) => c.name.common).sort();
        setCountries(sorted);
      })
      .catch(() => setCountries([]));
  }, []);`
);

// 3. Update Hydration
content = content.replace(
  `if (parsed.name) setName(parsed.name);`,
  `if (parsed.name) setName(parsed.name);\n        if (parsed.email) setEmail(parsed.email);`
);

content = content.replace(
  `  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      if (!name && user.username) setName(user.username);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user, isHydrated]);`,
  `  useEffect(() => {
    if (!isHydrated) return;
    const returning = sessionStorage.getItem(\`returning_from_login_\${venue?.id}\`);
    
    if (returning === "true" && user) {
      sessionStorage.removeItem(\`returning_from_login_\${venue?.id}\`);
      setShowOverrideDialog(true);
    }
    
    if (user && !returning) {
      if (!name && user.username) setName(user.username);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
      if (!nationality && user.country) setNationality(user.country);
    }
  }, [user, isHydrated, venue?.id]);`
);

content = content.replace(
  `date, ticketsData, attendees, name, idPassport, nationality, phone, step`,
  `date, ticketsData, attendees, name, email, idPassport, nationality, phone, step`
);
content = content.replace(
  `[date, ticketsData, attendees, name, idPassport, nationality, phone, step, storageKey, isHydrated]`,
  `[date, ticketsData, attendees, name, email, idPassport, nationality, phone, step, storageKey, isHydrated]`
);

// 4. Booking Logic
const newTotalCalc = `  const total = (venue.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).reduce((acc: number, tier: any) => {
    const qty = ticketsData[tier.name || "Standard Entry"] || 0;
    return acc + qty * (Number(tier.amount) || 0);
  }, 0) || 0;`;

content = content.replace(
  newTotalCalc,
  newTotalCalc + `\n
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
          // Don't set isSuccess(true) so they can try again as requested
        }
      };
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets, venueProject, email, name, venue?.name, storageKey]);`
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
      sessionStorage.setItem(\`returning_from_login_\${venue?.id}\`, "true");
      navigate({ to: "/signin", search: { redirect: \`/venues/checkout/\${venue.id}\` } as any });
      return;
    }
    doCheckout();
  };`
);

// 5. Desktop UI fixes
content = content.replace(
  `<Navbar />`,
  `<Navbar />
      {showOverrideDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border/50">
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Use Account Details?</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              You just signed in! Would you like to use your account details (Name, Phone, Email, Nationality) or keep the customer information you already entered?
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
      )}`
);

// Adding Email and Select
const oldNamePhone = `<div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <Input
                      required
                      placeholder="e.g. Rwandan"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="h-12 bg-secondary/40"
                    />
                  </div>`;

const newInputs = `<div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
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
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <select
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      disabled={!!user?.country}
                      className="flex h-12 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select Country</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>`;
                  
content = content.replace(oldNamePhone, newInputs);

content = content.replace(
  `<Button
                type="submit"
                disabled={totalTickets === 0}
                className="w-2/3 h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Pay {total > 0 ? \`\${venue.currency} \${total.toLocaleString()}\` : (totalTickets > 0 ? "Free" : \`\${venue.currency} 0\`)}
              </Button>`,
  `<Button
                type="submit"
                disabled={totalTickets === 0 || isCheckingOut || isGenerating}
                className="w-2/3 h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isCheckingOut || isGenerating ? (
                  <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</span>
                ) : (
                  <>Pay {total > 0 ? \`\${venue.currency} \${total.toLocaleString()}\` : (totalTickets > 0 ? "Free" : \`\${venue.currency} 0\`)}</>
                )}
              </Button>`
);

content = content.replace(
  `</section>

      <Footer />`,
  `</section>
      
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

      <Footer />`
);

fs.writeFileSync(target, content);
console.log("Patched successfully!");
