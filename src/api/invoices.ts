import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  spaceName: string;
  planName: string;
  amount: string;
  currency: string;
  billingCycle: string;
  startDate: string;
  spaceId?: string;
  referenceId?: string; // space_subscription id
}

// Generate a unique invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `AGT-${year}${month}-${rand}`;
}

// Generate PDF buffer server-side using jsPDF
async function generateInvoicePdf(data: InvoiceData, qrBase64: string): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210;
  const primaryColor: [number, number, number] = [242, 87, 29]; // #F2571D
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];

  // ── Header bar ─────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  
  // Try to load and add the logo
  try {
    const logoPath = path.join(process.cwd(), "public", "agatike-logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    doc.addImage(logoBase64, "PNG", 14, 10, 36, 12);
    // If logo added, move the INVOICE text to the right
    doc.text("INVOICE", 56, 18);
  } catch (err) {
    // Fallback if logo not found
    doc.text("INVOICE", 14, 18);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Agatike Connect", 14, 27);
  doc.text("hello@agatike.rw  |  agatike.rw", 14, 33);

  // Invoice number & date (top-right)
  doc.setFontSize(9);
  doc.text(`Invoice #: ${data.invoiceNumber}`, W - 14, 18, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, W - 14, 24, { align: "right" });
  doc.text(`Status: PAID`, W - 14, 30, { align: "right" });

  // ── Bill To section ─────────────────────────────────────────
  let y = 50;
  doc.setTextColor(...darkColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 6;
  doc.text(data.customerName, 14, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(data.customerEmail, 14, y);

  // Space info (right side)
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SPACE", W - 80, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(data.spaceName, W - 80, 56);
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(`Start Date: ${data.startDate}`, W - 80, 62);

  // ── Divider ─────────────────────────────────────────────────
  y = 78;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, y, W - 14, y);

  // ── Line items table header ─────────────────────────────────
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y - 5, W - 28, 10, 2, 2, "F");
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DESCRIPTION", 18, y + 1);
  doc.text("BILLING CYCLE", 120, y + 1);
  doc.text("AMOUNT", W - 18, y + 1, { align: "right" });

  // ── Line item row ───────────────────────────────────────────
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(data.planName, 18, y);
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(`Membership plan for ${data.spaceName}`, 18, y + 5);

  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text(data.billingCycle, 120, y);

  doc.setFont("helvetica", "bold");
  doc.text(`${data.currency} ${data.amount}`, W - 18, y, { align: "right" });

  // ── Totals ──────────────────────────────────────────────────
  y += 22;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal", W - 60, y);
  doc.setTextColor(...darkColor);
  doc.text(`${data.currency} ${data.amount}`, W - 18, y, { align: "right" });

  y += 6;
  doc.text("Tax / VAT", W - 60, y);
  doc.setTextColor(...mutedColor);
  doc.text("Included", W - 18, y, { align: "right" });

  y += 8;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(W - 80, y - 6, 66, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", W - 76, y + 2);
  doc.text(`${data.currency} ${data.amount}`, W - 18, y + 2, { align: "right" });

  // ── QR Code section ─────────────────────────────────────────
  y += 22;
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SCAN TO VERIFY", 14, y);

  y += 3;
  if (qrBase64) {
    try {
      doc.addImage(qrBase64, "PNG", 14, y, 32, 32);
    } catch (_) {
      // fallback: just show verification text
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(`Verification ID: ${data.invoiceNumber}`, 50, y + 6);
  doc.text(`This invoice was generated by Agatike Connect.`, 50, y + 11);
  doc.text(`To verify authenticity, scan the QR code or visit agatike.rw/verify`, 50, y + 16);

  // ── Footer bar ──────────────────────────────────────────────
  const footerY = 275;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY, W, 22, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(0, footerY, W, footerY);
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing Agatike Connect.", W / 2, footerY + 8, { align: "center" });
  doc.text("hello@agatike.rw  |  agatike.rw  |  Rwanda", W / 2, footerY + 14, { align: "center" });

  const pdfArrayBuffer = doc.output("arraybuffer");
  return Buffer.from(pdfArrayBuffer);
}

export const createInvoiceAndGeneratePdf = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const {
    spaceName,
    customerName,
    customerEmail,
    planName,
    amount,
    currency,
    billingCycle,
    startDate,
    spaceId,
    referenceId,
  } = ctx.data as any;

  const invoiceNumber = generateInvoiceNumber();
  const verificationUrl = `https://agatike.rw/invoices/verify/${invoiceNumber}`;

  // 1. Fetch QR code image as base64 from public API
  let qrBase64 = "";
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&format=png&data=${encodeURIComponent(verificationUrl)}`;
    const qrRes = await fetch(qrUrl);
    if (qrRes.ok) {
      const qrBuffer = await qrRes.arrayBuffer();
      qrBase64 = `data:image/png;base64,${Buffer.from(qrBuffer).toString("base64")}`;
    }
  } catch (_) {
    // QR generation failed — continue without it
  }

  // 2. Generate PDF
  const invoiceData: InvoiceData = {
    invoiceNumber,
    customerName,
    customerEmail,
    spaceName,
    planName,
    amount,
    currency: currency || "RWF",
    billingCycle,
    startDate: startDate ? new Date(startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString(),
    spaceId,
    referenceId,
  };

  const pdfBuffer = await generateInvoicePdf(invoiceData, qrBase64);
  const pdfBase64 = pdfBuffer.toString("base64");

  // 3. Save invoice record to DB
  const query = `
    mutation CreateInvoice(
      $invoice_number: String!
      $type: String!
      $reference_id: uuid
      $space_id: uuid
      $customer_name: String!
      $customer_email: String!
      $amount: String!
      $currency: String!
      $plan_name: String
      $billing_cycle: String
      $status: String!
    ) {
      insert_invoices_one(object: {
        invoice_number: $invoice_number
        type: $type
        reference_id: $reference_id
        space_id: $space_id
        customer_name: $customer_name
        customer_email: $customer_email
        amount: $amount
        currency: $currency
        plan_name: $plan_name
        billing_cycle: $billing_cycle
        status: $status
      }) {
        id
        invoice_number
      }
    }
  `;

  try {
    await hasuraRequest(query, {
      invoice_number: invoiceNumber,
      type: "space_subscription",
      reference_id: referenceId || null,
      space_id: spaceId || null,
      customer_name: customerName,
      customer_email: customerEmail,
      amount: String(amount),
      currency: currency || "RWF",
      plan_name: planName,
      billing_cycle: billingCycle,
      status: "paid",
    });
  } catch (dbErr) {
    console.error("Failed to save invoice to DB:", dbErr);
    // Continue — PDF is more important than DB record failing
  }

  return {
    invoiceNumber,
    pdfBase64,
  };
});

// Generates a PDF table listing all team members with their membership IDs
export async function generateMemberRosterPdf(params: {
  companyName: string;
  spaceName: string;
  planName: string;
  startDate: string;
  members: Array<{ name: string; email: string; phone?: string; membership_id?: string }>;
}): Promise<string> {
  const { companyName, spaceName, planName, startDate, members } = params;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210;
  const primaryColor: [number, number, number] = [242, 87, 29];
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, W, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MEMBER ROSTER", 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${spaceName}  ·  ${planName}`, 14, 24);
  doc.text(`Start Date: ${startDate}`, 14, 30);

  // Company name
  let y = 48;
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(companyName, 14, y);

  // Table header
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y - 5, W - 28, 10, 2, 2, "F");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("#", 18, y + 1);
  doc.text("FULL NAME", 26, y + 1);
  doc.text("EMAIL", 90, y + 1);
  doc.text("MEMBERSHIP ID", W - 18, y + 1, { align: "right" });

  // Rows
  y += 10;
  doc.setFont("helvetica", "normal");
  members.forEach((member, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const isEven = i % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 252, 253);
      doc.rect(14, y - 4, W - 28, 9, "F");
    }
    doc.setTextColor(...darkColor);
    doc.setFontSize(9);
    doc.text(String(i + 1), 18, y + 1);
    doc.text(member.name || "—", 26, y + 1, { maxWidth: 60 });
    doc.setTextColor(...mutedColor);
    doc.text(member.email || "—", 90, y + 1, { maxWidth: 60 });
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(member.membership_id || "—", W - 18, y + 1, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 10;
  });

  // Divider & footer note
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);
  y += 6;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.text(`Total members: ${members.length}`, 14, y);
  doc.text("Generated by Agatike Connect · agatike.rw", W - 14, y, { align: "right" });

  const buf = doc.output("arraybuffer");
  return Buffer.from(buf).toString("base64");
}

