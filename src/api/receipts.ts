export async function generateProductReceiptPdf(
  orders: any[],
  orgDetails: any,
  customerDetails: any,
  customerFee: number = 0
): Promise<any> {
  const { jsPDF } = await import("jspdf");
  const { Buffer } = await import("buffer");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210;
  const H = 297;
  
  // Default primary color is orange, but use themeColor if provided (convert hex to rgb)
  let primaryColor: [number, number, number] = [242, 87, 29]; // #F2571D
  if (orgDetails?.themeColor && orgDetails.themeColor.startsWith("#")) {
    const hex = orgDetails.themeColor.replace("#", "");
    if (hex.length === 6) {
      primaryColor = [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16),
      ];
    }
  }

  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];

  // Random receipt number
  const rand = Math.floor(100000 + Math.random() * 900000);
  const receiptNumber = `RCT-${rand}`;

  // ── Watermark ──────────────────────────────────────────────
  doc.setTextColor(245, 245, 245); // Very light grey
  doc.setFontSize(80);
  doc.setFont("helvetica", "bold");
  doc.text("agatike", W / 2, H / 2 + 30, { align: "center", angle: 45 });

  // ── PAID Stamp ──────────────────────────────────────────────
  doc.setTextColor(220, 252, 231); // Very light green for background text stamp
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text("PAID", W - 60, H / 2 - 30, { align: "center", angle: 30 });

  // ── Header bar ─────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(orgDetails?.name || "Organizer", 14, 27);
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

  // ── Info Blocks ──────────────────────────────────────────
  let startY = 55;
  
  // Billed To (Customer Info)
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, startY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(customerDetails?.name || "Customer", 14, startY + 8);
  let custY = startY + 14;
  if (customerDetails?.phone) {
    doc.text(`Phone: ${customerDetails.phone}`, 14, custY);
    custY += 6;
  }
  if (customerDetails?.email) {
    doc.text(`Email: ${customerDetails.email}`, 14, custY);
  }

  // From (Organizer Info)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("From:", 120, startY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(orgDetails?.name || "Organizer", 120, startY + 8);
  let orgY = startY + 14;
  if (orgDetails?.phone) {
    doc.text(`Phone: ${orgDetails.phone}`, 120, orgY);
    orgY += 6;
  }
  if (orgDetails?.email) {
    doc.text(`Email: ${orgDetails.email}`, 120, orgY);
    orgY += 6;
  }
  if (orgDetails?.city || orgDetails?.address) {
    const addr = [orgDetails?.address, orgDetails?.city].filter(Boolean).join(", ");
    doc.text(addr, 120, orgY);
  }

  // ── Order Items Table ───────────────────────────────────────
  startY += 40;
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
  let subtotalAmount = 0;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);

  orders.forEach((order) => {
    const productName = order.product?.name || "Product Item";
    const qty = order.qty || 1;
    const total = order.amount_paid || 0;
    const price = total / qty;
    
    subtotalAmount += total;

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
  doc.setFontSize(10);
  
  // Subtotal
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal", 130, cursorY, { align: "right" });
  doc.setTextColor(...darkColor);
  doc.text(`RWF ${subtotalAmount.toLocaleString()}`, W - 18, cursorY, { align: "right" });
  
  // Fees
  cursorY += 8;
  doc.setTextColor(...mutedColor);
  doc.text("Platform Fees", 130, cursorY, { align: "right" });
  doc.setTextColor(...darkColor);
  doc.text(`RWF ${customerFee.toLocaleString()}`, W - 18, cursorY, { align: "right" });

  // Total
  cursorY += 6;
  doc.line(120, cursorY, W - 14, cursorY);
  
  cursorY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL PAID", 130, cursorY, { align: "right" });
  
  doc.setTextColor(...primaryColor);
  const finalTotal = subtotalAmount + customerFee;
  doc.text(`RWF ${finalTotal.toLocaleString()}`, W - 18, cursorY, { align: "right" });

  // ── Footer ───────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text("Thank you for your purchase!", W / 2, 280, { align: "center" });

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBuffer = Buffer.from(pdfArrayBuffer);
  return pdfBuffer;
}
