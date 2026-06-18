const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
doc.text("INVOICE", 14, 18);

const pdfArrayBuffer = doc.output("arraybuffer");
const pdfBuffer = Buffer.from(pdfArrayBuffer);
console.log("PDF size:", pdfBuffer.length);
