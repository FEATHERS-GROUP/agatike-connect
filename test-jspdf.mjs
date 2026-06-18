import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
doc.text("INVOICE", 14, 18);

// try arraybuffer
const pdfArrayBuffer = doc.output("arraybuffer");
const pdfBuffer = Buffer.from(pdfArrayBuffer);
console.log("PDF size arraybuffer:", pdfBuffer.length);
