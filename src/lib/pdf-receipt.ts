

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
}) => {
  const {
    entityName = "Event/Venue",
    ticket,
    bookingRef,
    customerName,
    dateStr = "TBD",
    timeStr = "TBD",
    locationStr = "TBD",
    durationStr,
    tierName = "General Admission",
    quantity = 1,
  } = options;

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [300, 480],
  });

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 300, 480, "F");

  // "Passenger" -> Customer Name
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Customer", 20, 30);

  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  const attendeeName =
    customerName ||
    (ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}`.trim() : "Guest");
  pdf.text(attendeeName, 20, 50, { maxWidth: 260 });

  // Times row
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Start Time", 20, 80);
  pdf.text("Duration", 150, 80, { align: "center" });
  pdf.text("Date", 280, 80, { align: "right" });

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(timeStr, 20, 95);
  pdf.text(durationStr || "-", 150, 95, { align: "center" });
  pdf.text(dateStr, 280, 95, { align: "right" });

  // Divider line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(1);
  pdf.line(20, 115, 280, 115);
  pdf.setFillColor(255, 255, 255);
  pdf.circle(150, 115, 6, "FD");

  // Locations / Entity
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(entityName, 20, 140, { maxWidth: 120 });
  pdf.text(locationStr, 280, 140, { align: "right", maxWidth: 120 });

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Organizer / Event", 20, 155);
  pdf.text("Location / Venue", 280, 155, { align: "right" });

  // Booking Reference
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Booking Reference", 20, 190);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  const refCode = bookingRef || ticket.otp || ticket.id;
  pdf.text(refCode, 20, 210);

  // Details Row
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Ticket Tier", 20, 240);
  pdf.text("Qty", 150, 240, { align: "center" });
  pdf.text("Status", 280, 240, { align: "right" });

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(tierName, 20, 260);
  pdf.text(quantity.toString(), 150, 260, { align: "center" });
  pdf.text("Confirmed", 280, 260, { align: "right" });

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
