const fs = require('fs');

const path = '/Users/apple/Desktop/agatike-connect/src/components/desktop/dashboard/ManualBookingDialog.tsx';
let content = fs.readFileSync(path, 'utf8');

const imports = `import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getWorkspaceTicketProjects } from "@/api/events";
import { sendTicketsEmail } from "@/api/email";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
`;

content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\n' + imports);

// Add the query for ticket projects
const queryCode = `
  const { data: ticketProjects } = useQuery({
    queryKey: ["workspace-ticket-projects", activeWorkspace?.id],
    queryFn: () => getWorkspaceTicketProjects({ data: { workspaceId: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });
  
  const venueProject = ticketProjects?.find((p: any) => p.venueId === venue.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [bookingRes, setBookingRes] = useState<any>(null);
`;

content = content.replace('const [step, setStep] = useState(1);', queryCode + '\n  const [step, setStep] = useState(1);');

// Update mutate success
const successCode = `
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["venue_bookings", venue.id] });
      
      const ticketsData = res.tickets_data;
      if (ticketsData?.issued && ticketsData.issued.length > 0 && formData.customer_email && venueProject) {
        setIsGenerating(true);
        setIssuedTickets(ticketsData.issued);
        setBookingRes(res);
        // Generation will happen in a useEffect once the DOM elements render
      } else {
        toast.success("Booking created successfully");
        handleClose();
      }
    },
`;

content = content.replace(/onSuccess: \(\) => \{[\s\S]*?handleClose\(\);\n    \},/m, successCode);

// Add useEffect for PDF generation
const genEffectCode = `
  useEffect(() => {
    if (isGenerating && issuedTickets.length > 0 && venueProject) {
      const generatePDFs = async () => {
        try {
          const attachments = [];
          for (const ticket of issuedTickets) {
            const el = document.getElementById(\`ticket-render-\${ticket.id}\`);
            if (!el) continue;
            
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL("image/png");
            
            const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            const base64 = pdf.output("datauristring").split(",")[1];
            
            attachments.push({
              filename: \`Ticket_\${ticket.tier.replace(/\\s+/g, "_")}_\${ticket.otp}.pdf\`,
              content: base64
            });
          }
          
          if (attachments.length > 0) {
            await sendTicketsEmail({
              data: {
                to: formData.customer_email,
                customerName: formData.customer_name,
                venueName: venue.name || "the Venue",
                attachments
              } as any
            });
            toast.success("Booking created and tickets emailed!");
          } else {
            toast.success("Booking created!");
          }
        } catch (e: any) {
          console.error(e);
          toast.error("Booking created, but failed to email custom tickets.");
        } finally {
          setIsGenerating(false);
          handleClose();
        }
      };
      
      // small delay to ensure DOM is fully rendered
      setTimeout(generatePDFs, 1000);
    }
  }, [isGenerating, issuedTickets]);
`;

content = content.replace('const handleClose = () => {', genEffectCode + '\n  const handleClose = () => {');

// Update close logic to reset state
content = content.replace('setTicketsData({});', 'setTicketsData({});\n      setIsGenerating(false);\n      setIssuedTickets([]);');

// Add hidden ticket rendering at the bottom of the DialogContent
const rendererCode = `
        {/* Hidden Renderer for PDFs */}
        {isGenerating && (
          <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none" style={{ left: '-9999px' }}>
            {issuedTickets.map((t: any) => (
              <div key={t.id} id={\`ticket-render-\${t.id}\`} className="inline-block p-4 bg-background">
                <TicketPreview
                  template={venueProject.template}
                  palette={venueProject.palette || { from: "#000", to: "#000", name: "Black" }}
                  font={venueProject.font || { css: "sans-serif", name: "Modern" }}
                  tier={t.tier}
                  title={venue.name}
                  subtitle={venue.address || ""}
                  date="Valid for 1 Day"
                  time="Opening Hours"
                  seat="General"
                  price={formData.amount}
                  currency={venue.currency}
                  cover={venueProject.coverImage || ""}
                  logoText={venueProject.logoText || ""}
                  logoImage={venueProject.logoImage}
                  logoScale={Number(venueProject.logoScale || 24)}
                  logoOpacity={Number(venueProject.logoOpacity ?? 1)}
                  logoColorMode={venueProject.logoColorMode || "original"}
                  orderId={t.otp}
                  previewMode="Front"
                  layout={venueProject.design_overrides?.layout || {
                    titleSize: 30, subtitleSize: 14, metaSize: 11, titleAlign: "left", titleOffsetY: 0, subtitleOffsetY: 0, metaOffsetY: 0
                  }}
                  back={venueProject.design_overrides?.back || { backText: "", backImage: "", backImageOpacity: 0.3 }}
                />
              </div>
            ))}
          </div>
        )}
`;

content = content.replace('</DialogContent>', rendererCode + '\n      </DialogContent>');

// Add a spinner state to the button
content = content.replace(
  '{isPending ? "Confirming..." : "Confirm & Pay"}',
  '{isPending ? "Confirming..." : isGenerating ? "Generating Tickets..." : "Confirm & Pay"}'
);
content = content.replace(
  'disabled={isPending || !formData.status}',
  'disabled={isPending || isGenerating || !formData.status}'
);

fs.writeFileSync(path, content);
