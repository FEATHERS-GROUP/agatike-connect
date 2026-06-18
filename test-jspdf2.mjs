import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
const logoBuffer = fs.readFileSync("public/agatike-logo.png");
const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
doc.addImage(logoBase64, "PNG", 14, 10, 36, 12);
doc.text("INVOICE", 56, 18);

const pdfArrayBuffer = doc.output("arraybuffer");
const pdfBuffer = Buffer.from(pdfArrayBuffer);
console.log("PDF size arraybuffer:", pdfBuffer.length);
