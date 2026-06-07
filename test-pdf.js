const { jsPDF } = require('jspdf');

function generateTicketPDF(venueName, customerName, tier, otp) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 80] // Ticket size
  });

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 200, 80, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text(venueName, 10, 20);

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Ticket Type: ${tier}`, 10, 40);
  doc.text(`Admit: ${customerName}`, 10, 50);

  doc.setFontSize(16);
  doc.setTextColor(242, 87, 29); // Agatike orange
  doc.text(`OTP Verification: ${otp}`, 10, 70);

  const b64 = doc.output('datauristring').split(',')[1];
  console.log("Generated base64 of length:", b64.length);
  return b64;
}

generateTicketPDF("Planet Events", "John Doe", "VIP", "123456");
