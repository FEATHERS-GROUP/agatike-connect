import { createServerFn } from "@tanstack/react-start";
import { sendVisitorPassEmail } from "./email";

export interface VisitorPassData {
  visitorName: string;
  visitorId: string;
  spaceName: string;
  visitDate: string;
  hostedBy: string;
}

async function generateVisitorPassPdf(data: VisitorPassData, qrBase64: string): Promise<any> {
  const { jsPDF } = await import("jspdf");
  const { Buffer } = await import("buffer");

  // Use a small ticket format: 80mm x 150mm
  const doc = new jsPDF({ unit: "mm", format: [80, 150], orientation: "portrait" });
  const W = 80;
  const primaryColor: [number, number, number] = [225, 29, 72]; // rose-600
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VISITOR PASS", W / 2, 16, { align: "center" });

  let y = 35;
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.text(data.visitorName, W / 2, y, { align: "center" });

  y += 8;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(18);
  doc.setFont("courier", "bold");
  doc.text(data.visitorId, W / 2, y, { align: "center" });

  y += 12;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Space", 10, y);
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.text(data.spaceName, 10, y + 5);

  y += 14;
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("Visit Date", 10, y);
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.text(data.visitDate, 10, y + 5);

  y += 14;
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("Hosted By", 10, y);
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.text(data.hostedBy, 10, y + 5);

  // QR Code
  y += 15;
  if (qrBase64) {
    try {
      doc.addImage(qrBase64, "PNG", (W - 35) / 2, y, 35, 35);
    } catch (_) { }
  }

  y += 42;
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("Scan to verify this pass", W / 2, y, { align: "center" });

  const pdfArrayBuffer = doc.output("arraybuffer");
  return Buffer.from(pdfArrayBuffer);
}

export const processVisitorPass = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, visitorName, visitorId, spaceName, visitDate, hostedBy } = ctx.data as any;
    const { Buffer } = await import("buffer");

    const verificationUrl = `https://agatike.rw/verify/visitor/${visitorId}`;
    let qrBase64 = "";

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&format=png&data=${encodeURIComponent(verificationUrl)}`;
      const qrRes = await fetch(qrUrl);
      if (qrRes.ok) {
        const qrBuffer = await qrRes.arrayBuffer();
        qrBase64 = `data:image/png;base64,${Buffer.from(qrBuffer).toString("base64")}`;
      }
    } catch (err) {
      console.warn("Visitor QR fetch failed:", err);
    }

    const pdfBuffer = await generateVisitorPassPdf({
      visitorName,
      visitorId,
      spaceName,
      visitDate,
      hostedBy
    }, qrBase64);

    const pdfBase64 = pdfBuffer.toString("base64");

    if (to && !to.includes("@noemail.local")) {
      await sendVisitorPassEmail({
        data: {
          to,
          visitorName,
          visitorId,
          spaceName,
          visitDate,
          hostedBy,
          pdfBase64
        }
      });
    }

    return { success: true, visitorId, pdfBase64 };
  });
