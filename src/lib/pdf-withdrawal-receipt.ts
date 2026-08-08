export const generateWithdrawalReceipt = async (options: {
  amount: number;
  netAmount: number;
  currency: string;
  payoutMethod: string;
  payoutAccount: string;
  referenceId: string;
  date: Date;
  organizerName: string;
}) => {
  const {
    amount,
    netAmount,
    currency,
    payoutMethod,
    payoutAccount,
    referenceId,
    date,
    organizerName,
  } = options;

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [300, 480],
  });

  pdf.setFillColor("#ffffff");
  pdf.rect(0, 0, 300, 480, "F");

  // Top colored bar
  pdf.setFillColor("#F2571D"); // Agatike brand color
  pdf.rect(0, 0, 300, 8, "F");

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("WITHDRAWAL RECEIPT", 150, 25, { align: "center" });

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Organizer", 20, 50);

  pdf.setFontSize(16);
  pdf.setTextColor("#000000");
  pdf.text(organizerName, 20, 65, { maxWidth: 260 });

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Date", 20, 95);
  pdf.text("Status", 280, 95, { align: "right" });

  pdf.setFontSize(12);
  pdf.setTextColor("#000000");
  pdf.text(date.toLocaleDateString(), 20, 110, { maxWidth: 100 });
  pdf.text("Completed", 280, 110, { align: "right", maxWidth: 100 });

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(1);
  pdf.line(20, 130, 280, 130);

  pdf.setFontSize(14);
  pdf.setTextColor("#000000");
  pdf.text(payoutMethod.toUpperCase(), 20, 155, { maxWidth: 120 });
  pdf.text(payoutAccount, 280, 155, { align: "right", maxWidth: 120 });

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Payout Method", 20, 170);
  pdf.text("Account", 280, 170, { align: "right" });

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Transaction Reference", 20, 205);

  pdf.setFontSize(16);
  pdf.setTextColor("#000000");
  pdf.text(referenceId, 20, 220);

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Gross Amount", 20, 250);
  pdf.text("Processing Fee", 280, 250, { align: "right" });

  pdf.setFontSize(14);
  pdf.setTextColor("#000000");
  pdf.text(`${amount} ${currency}`, 20, 265, { maxWidth: 100 });
  pdf.text(`${(amount - netAmount).toFixed(2)} ${currency}`, 280, 265, { align: "right" });

  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Net Payout", 20, 295);
  
  pdf.setFontSize(18);
  pdf.setTextColor("#10b981"); // green for success payout
  pdf.text(`${netAmount} ${currency}`, 20, 310);

  // Cutouts
  pdf.setFillColor(20, 20, 20);
  pdf.circle(0, 340, 10, "F");
  pdf.circle(300, 340, 10, "F");

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineDashPattern([4, 4], 0);
  pdf.line(15, 340, 285, 340);
  pdf.setLineDashPattern([], 0);

  // Bottom text
  pdf.setFontSize(10);
  pdf.setTextColor("#64748b");
  pdf.text("Thank you for using Agatike Connect.", 150, 370, { align: "center" });
  pdf.text("If you have any questions, please contact support.", 150, 385, { align: "center" });

  const base64 = pdf.output("datauristring").split(",")[1];
  return {
    filename: `Withdrawal_Receipt_${referenceId}.pdf`,
    content: base64,
  };
};
