export async function generateProductReceiptPdf(orders: any[], organizerName: string): Promise<any> {
  const { jsPDF } = await import("jspdf");
  const { Buffer } = await import("buffer");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210;
  const primaryColor: [number, number, number] = [242, 87, 29]; // #F2571D
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];

  // Random receipt number
  const rand = Math.floor(100000 + Math.random() * 900000);
  const receiptNumber = `RCT-${rand}`;

  // ── Header bar ─────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(organizerName, 14, 27);
  doc.text("Powered by Agatike Connect", 14, 33);

  // Receipt number & date (top-right)
  doc.setFontSize(9);
  doc.text(`Receipt #: ${receiptNumber}`, W - 14, 18, { align: "right" });
  doc.text(
    `Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    W - 14,
    25,
    { align: "right" }
  );

  // ── Customer Info ──────────────────────────────────────────
  let startY = 55;
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, startY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let guestPhone = "";
  if (orders.length > 0 && orders[0].phone) guestPhone = orders[0].phone;

  doc.text(`Customer (Guest)`, 14, startY + 8);
  if (guestPhone) doc.text(`Phone: ${guestPhone}`, 14, startY + 14);

  // ── Order Items Table ───────────────────────────────────────
  startY += 30;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, W - 28, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text("ITEM DESCRIPTION", 18, startY + 6.5);
  doc.text("QTY", 120, startY + 6.5, { align: "center" });
  doc.text("PRICE", 150, startY + 6.5, { align: "center" });
  doc.text("TOTAL", W - 18, startY + 6.5, { align: "right" });

  let cursorY = startY + 16;
  let totalAmount = 0;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);

  orders.forEach((order) => {
    const productName = order.product?.name || "Product Item";
    const qty = order.qty || 1;
    const total = order.amount_paid || 0;
    const price = total / qty;
    
    totalAmount += total;

    doc.setFont("helvetica", "bold");
    doc.text(productName, 18, cursorY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    
    if (order.size) {
      // Don't show the email hack inside the size field
      let cleanSize = order.size;
      if (cleanSize.includes("| email:")) cleanSize = cleanSize.split("| email:")[0].trim();
      if (cleanSize.startsWith("email:")) cleanSize = "";
      
      if (cleanSize) {
        doc.text(`Variant: ${cleanSize}`, 18, cursorY + 5);
      }
    }

    doc.setTextColor(...darkColor);
    doc.text(qty.toString(), 120, cursorY, { align: "center" });
    doc.text(price.toLocaleString(), 150, cursorY, { align: "center" });
    doc.text(total.toLocaleString(), W - 18, cursorY, { align: "right" });

    cursorY += 14;
  });

  // ── Total Section ──────────────────────────────────────────
  cursorY += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, cursorY, W - 14, cursorY);

  cursorY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL PAID", 130, cursorY, { align: "right" });
  
  doc.setTextColor(...primaryColor);
  doc.text(`RWF ${totalAmount.toLocaleString()}`, W - 18, cursorY, { align: "right" });

  // ── Footer ───────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text("Thank you for your purchase!", W / 2, 280, { align: "center" });

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBuffer = Buffer.from(pdfArrayBuffer);
  return pdfBuffer;
}
