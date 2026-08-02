export const generateFallbackReceipt = async (options: {
  entityName: string;
  ticket: any;
  bookingRef?: string;
  customerName?: string;
  dateStr?: string;
  timeStr?: string;
  locationStr?: string;
  durationStr?: string;
  tierName?: string;
  quantity?: number;
  type?: "venue" | "facility" | "event" | "movie" | "default";
}) => {
  const {
    entityName = "Event/Venue",
    ticket,
    bookingRef,
    customerName,
    dateStr,
    timeStr,
    locationStr,
    durationStr,
    tierName = "General Admission",
    quantity = 1,
    type = "default",
  } = options;

  let displayDate =
    dateStr && dateStr !== "TBD" && dateStr.trim() !== "" ? dateStr : "Valid Anytime";
  let displayTime = timeStr && timeStr !== "TBD" && timeStr.trim() !== "" ? timeStr : "Open Hours";
  let displayLocation =
    locationStr && locationStr !== "TBD" && locationStr.trim() !== ""
      ? locationStr
      : "Location on file";

  if (type === "event" || type === "movie") {
    displayDate = dateStr && dateStr !== "TBD" && dateStr.trim() !== "" ? dateStr : "TBA";
    displayTime = timeStr && timeStr !== "TBD" && timeStr.trim() !== "" ? timeStr : "TBA";
  } else if (type === "facility") {
    displayDate = dateStr && dateStr !== "TBD" && dateStr.trim() !== "" ? dateStr : "Date Not Set";
    displayTime = timeStr && timeStr !== "TBD" && timeStr.trim() !== "" ? timeStr : "Time Not Set";
  }

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [300, 480],
  });

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 300, 480, "F");

  // Top colored bar depending on type
  if (type === "event" || type === "movie")
    pdf.setFillColor(236, 72, 153); // pink-500
  else if (type === "facility")
    pdf.setFillColor(59, 130, 246); // blue-500
  else if (type === "venue")
    pdf.setFillColor(16, 185, 129); // emerald-500
  else pdf.setFillColor(100, 116, 139); // slate-500

  pdf.rect(0, 0, 300, 8, "F");

  // Ticket Type Header
  const typeLabel =
    type === "venue"
      ? "VENUE ENTRANCE PASS"
      : type === "facility"
        ? "FACILITY BOOKING"
        : type === "movie"
          ? "CINEMA TICKET"
          : "EVENT TICKET";

  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(typeLabel, 150, 25, { align: "center" });

  // "Passenger" -> Customer Name
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Customer", 20, 50);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  const attendeeName =
    customerName ||
    (ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}`.trim() : "Guest");
  pdf.text(attendeeName, 20, 65, { maxWidth: 260 });

  // Times row
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const timeLabel =
    type === "facility" ? "Booking Time" : type === "venue" ? "Valid Hours" : "Start Time";
  pdf.text(timeLabel, 20, 95);
  pdf.text("Duration", 150, 95, { align: "center" });
  const dateLabel = type === "facility" ? "Booking Date" : "Date";
  pdf.text(dateLabel, 280, 95, { align: "right" });

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(displayTime, 20, 110, { maxWidth: 100 });
  pdf.text(durationStr || "-", 150, 110, { align: "center" });
  pdf.text(displayDate, 280, 110, { align: "right", maxWidth: 100 });

  // Divider line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(1);
  pdf.line(20, 130, 280, 130);
  pdf.setFillColor(255, 255, 255);
  pdf.circle(150, 130, 6, "FD");

  // Locations / Entity
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(entityName, 20, 155, { maxWidth: 120 });
  pdf.text(displayLocation, 280, 155, { align: "right", maxWidth: 120 });

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const entityLabel =
    type === "facility" ? "Facility Name" : type === "venue" ? "Venue Name" : "Event / Movie";
  pdf.text(entityLabel, 20, 170);
  const locLabel = type === "facility" ? "Venue Location" : "Location";
  pdf.text(locLabel, 280, 170, { align: "right" });

  // Booking Reference
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Booking Reference", 20, 205);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  const refCode = bookingRef || ticket.otp || ticket.id;
  pdf.text(refCode, 20, 220);

  // Details Row
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  const tierLabel =
    type === "facility" ? "Access Type" : type === "venue" ? "Pass Type" : "Ticket Tier";
  pdf.text(tierLabel, 20, 250);
  pdf.text("Qty", 150, 250, { align: "center" });
  pdf.text("Status", 280, 250, { align: "right" });

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(tierName, 20, 265, { maxWidth: 100 });
  pdf.text(quantity.toString(), 150, 265, { align: "center" });
  pdf.text("Confirmed", 280, 265, { align: "right" });

  // Cutouts
  pdf.setFillColor(20, 20, 20);
  pdf.circle(0, 300, 10, "F");
  pdf.circle(300, 300, 10, "F");

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineDashPattern([4, 4], 0);
  pdf.line(15, 300, 285, 300);
  pdf.setLineDashPattern([], 0);

  // QR Code
  try {
    const qrRes = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${refCode}&margin=2`,
    );
    if (qrRes.ok) {
      const arrayBuffer = await qrRes.arrayBuffer();
      let base64Str = "";
      if (typeof Buffer !== "undefined") {
        base64Str = Buffer.from(arrayBuffer).toString("base64");
      } else {
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          base64Str += String.fromCharCode(bytes[i]);
        }
        base64Str = btoa(base64Str);
      }
      pdf.addImage(`data:image/png;base64,${base64Str}`, "PNG", 75, 315, 150, 150);
    }
  } catch (e) {
    console.error("Failed to fetch QR Code", e);
  }

  const base64 = pdf.output("datauristring").split(",")[1];
  return {
    filename: `Ticket_${(tierName || "Pass").replace(/\s+/g, "_")}_${refCode}.pdf`,
    content: base64,
  };
};
