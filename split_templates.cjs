const fs = require("fs");
const content = fs.readFileSync(
  "src/components/desktop/dashboard/ticket-designer/TicketPreview.tsx",
  "utf-8",
);

// I will use regex to extract the blocks!
// Desktop blocks:
const desktopConcert = content.match(
  /if \(template === "concert"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)Perf}\n\s*{Stub}\n\s*<\/div>\n\s*\);\n\s*}/,
)[0];

const desktopMovie = content.match(
  /if \(template === "movie"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={96} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const desktopExperience = content.match(
  /if \(template === "experience"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={100} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const desktopConference = content.match(
  /if \(template === "conference"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={52} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const desktopEntrance = content.match(
  /if \(template === "entrance"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={84} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

// Mobile blocks:
const mobileRegex =
  /if \(previewMode === "Mobile"\) {([\s\S]*?)\/\/ Fallback \(shouldn't hit\)\n    return null;\n  }/;
const mobileBlock = content.match(mobileRegex)[1];

const mobileConcert = mobileBlock.match(
  /if \(template === "concert"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={140} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const mobileMovie = mobileBlock.match(
  /if \(template === "movie"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={140} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const mobileExperience = mobileBlock.match(
  /if \(template === "experience"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={140} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const mobileConference = mobileBlock.match(
  /if \(template === "conference"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={140} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

const mobileEntrance = mobileBlock.match(
  /if \(template === "entrance"\) {([\s\S]*?)return \(\n\s*<div\n\s*id="ticket-preview-container"([\s\S]*?)qrValue \|\| orderId} size={140} \/>\n\s*<\/div>([\s\S]*?)<\/div>\n\s*\);\n\s*}/,
)[0];

function makeTemplate(name, desktop, mobile) {
  return `export function ${name}Template(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

  if (previewMode === "Mobile") {
    ${mobile.replace(/\n/g, "\n    ")}
  }

  ${desktop.replace(/\n/g, "\n  ")}

  return null;
}
`;
}

let indexContent = `import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps, DEFAULT_TERMS_HTML, DEFAULT_EXPERIENCE_BACK_HTML } from "./types";
import { Ticket as TicketIcon, Crown, Film, Mountain, Briefcase, Calendar, MapPin, Clock } from "lucide-react";

${makeTemplate("Concert", desktopConcert, mobileConcert)}
${makeTemplate("Movie", desktopMovie, mobileMovie)}
${makeTemplate("Experience", desktopExperience, mobileExperience)}
${makeTemplate("Conference", desktopConference, mobileConference)}
${makeTemplate("Entrance", desktopEntrance, mobileEntrance)}
`;

fs.writeFileSync(
  "src/components/desktop/dashboard/ticket-designer/templates/index.tsx",
  indexContent,
);
console.log("Done");
