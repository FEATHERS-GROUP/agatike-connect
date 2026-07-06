import jsPDF from "jspdf";

export const generateFallbackReceipt = (options: {
  entityName: string;
  ticket: any;
  bookingRef?: string;
  customerName?: string;
}) => {
  const { entityName, ticket, bookingRef, customerName } = options;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [300, 400],
  });
  
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, 300, 400, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(24);
  pdf.text("RECEIPT / TICKET", 150, 40, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.text(entityName || "Event/Venue", 150, 70, { align: "center", maxWidth: 280 });
  
  pdf.setFontSize(12);
  let y = 110;
  if (bookingRef) {
    pdf.text(`Booking Ref: ${bookingRef}`, 20, y);
    y += 20;
  }
  pdf.text(`Ticket ID: ${ticket.otp || ticket.id}`, 20, y);
  y += 20;
  pdf.text(`Tier: ${ticket.tier || "General Admission"}`, 20, y);
  y += 20;
  
  const attendeeName = customerName || (ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}`.trim() : "Guest");
  if (attendeeName !== "Guest") {
    pdf.text(`Name: ${attendeeName}`, 20, y);
    y += 20;
  }
  
  pdf.setLineDash([2, 2]);
  pdf.line(20, y + 20, 280, y + 20);
  pdf.setLineDash([]);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Thank you for your booking!", 150, y + 60, { align: "center" });
  
  const base64 = pdf.output("datauristring").split(",")[1];
  return {
    filename: `Receipt_${(ticket.tier || "Pass").replace(/\s+/g, "_")}_${ticket.otp || ticket.id}.pdf`,
    content: base64,
  };
};
