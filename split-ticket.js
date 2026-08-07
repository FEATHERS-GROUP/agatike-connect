const fs = require('fs');
const content = fs.readFileSync('src/routes/ticket/$ticketId.tsx', 'utf8');

// Find function declarations
const dynamicPassIdx = content.indexOf('function DynamicPass');
const carouselStackIdx = content.indexOf('function CarouselStack');

const ticketViewerEnd = carouselStackIdx;
const carouselStackEnd = dynamicPassIdx;

const ticketViewerCode = content.slice(0, ticketViewerEnd);
const carouselStackCode = content.slice(carouselStackIdx, carouselStackEnd);
const dynamicPassCode = content.slice(dynamicPassIdx);

fs.mkdirSync('src/components/ticket-viewer', { recursive: true });

// DynamicPass.tsx
const dynamicPassImports = `import { Calendar, Building2, MapPin, Ticket, ShieldCheck, ChevronRight } from "lucide-react";\nimport QRCode from "react-qr-code";\n\n`;
fs.writeFileSync('src/components/ticket-viewer/DynamicPass.tsx', dynamicPassImports + "export " + dynamicPassCode);

// CarouselStack.tsx
const carouselStackImports = `import { useState } from "react";\nimport { Ticket, Gift, Sparkles, Navigation } from "lucide-react";\nimport { DynamicPass } from "./DynamicPass";\n\n`;
fs.writeFileSync('src/components/ticket-viewer/CarouselStack.tsx', carouselStackImports + "export " + carouselStackCode);

console.log("Splitting done");
