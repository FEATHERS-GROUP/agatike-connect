import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";

interface HiddenPDFGeneratorProps {
  issuedTickets: any[];
  eventProject: any;
  event: any;
  currency: string;
  getMergedProjectDesign: (baseProject: any, stopIdx: number, tierId: string) => any;
  getStopDetails: (stopIdx: number) => any;
  formatSeatDisplay: (raw: any, sectionName?: string) => string;
  getTierDetails: (tierId: string) => any;
}

export function HiddenPDFGenerator({
  issuedTickets,
  eventProject,
  event,
  currency,
  getMergedProjectDesign,
  getStopDetails,
  formatSeatDisplay,
  getTierDetails,
}: HiddenPDFGeneratorProps) {
  return (
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
              tier={ticket.tier}
              title={event.title}
              subtitle={event.venue || ""}
              date={getStopDetails(ticket.attendee.stopIdx)?.date || ""}
              time={getStopDetails(ticket.attendee.stopIdx)?.time || "TBA"}
              seat={
                ticket.attendee.seat
                  ? formatSeatDisplay(
                      ticket.attendee.seatName || ticket.attendee.seat,
                      ticket.attendee.sectionName,
                    )
                  : `${ticket.attendee.firstName} ${ticket.attendee.lastName}`.trim()
              }
              price={
                getTierDetails(ticket.attendee.tierId)?.cost?.toString() ||
                getTierDetails(ticket.attendee.tierId)?.price?.toString() ||
                "0"
              }
              currency={currency === "FRWS" ? "RWF" : currency}
              cover={mergedProject.coverImage || event.cover || ""}
              logoText={
                mergedProject.logoText !== undefined && mergedProject.logoText !== null
                  ? mergedProject.logoText
                  : event.organizer || "Agatike"
              }
              logoImage={mergedProject.logoImage}
              logoScale={Number(mergedProject.logoScale || 24)}
              logoOpacity={Number(mergedProject.logoOpacity ?? 1)}
              logoColorMode={mergedProject.logoColorMode || "original"}
              orderId={ticket.otp}
              qrValue={`${typeof window !== "undefined" ? window.location.origin : ""}/v/${ticket.otp}`}
              previewMode="Front"
              layout={
                mergedProject.layout || {
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
                mergedProject.back || {
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
  );
}
