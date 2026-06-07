const fs = require("fs");

const sourcePath =
  "/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/ticket-designer/$projectId.tsx";
const targetPath =
  "/Users/apple/Desktop/agatike-connect/src/components/desktop/dashboard/ticket-designer/TicketPreview.tsx";

const content = fs.readFileSync(sourcePath, "utf8");

// We need the types: Template, TicketLayout, TicketBack
const typesRegex = /type Template = [^;]+;[\s\S]*?type TicketBack = \{[\s\S]*?\};/m;
const typesMatch = content.match(typesRegex);

// We need the TicketPreview function
const functionStart = content.indexOf("function TicketPreview(props: {");
let functionEnd = content.indexOf("function Section", functionStart);
if (functionEnd === -1) {
  functionEnd = content.indexOf("export const Route", functionStart); // just in case
}
if (functionEnd === -1) {
  functionEnd = content.length;
}

const functionBody = content.substring(functionStart, functionEnd);

const imports = `import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import {
  Ticket as TicketIcon,
  Crown,
  Film,
  Mountain,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

export type Template = "concert" | "movie" | "experience" | "conference" | "entrance";

export type TicketLayout = {
  titleSize: number;
  subtitleSize: number;
  metaSize: number;
  titleAlign: "left" | "center" | "right";
  titleOffsetY: number;
  subtitleOffsetY: number;
  metaOffsetY: number;
};

export type TicketBack = {
  backText: string;
  backImage: string;
  backImageOpacity: number;
};
`;

const fileContent =
  imports +
  "\n\n" +
  functionBody.replace("function TicketPreview", "export function TicketPreview");

fs.mkdirSync(
  "/Users/apple/Desktop/agatike-connect/src/components/desktop/dashboard/ticket-designer",
  { recursive: true },
);
fs.writeFileSync(targetPath, fileContent);

// Also remove it from $projectId.tsx and import it
const newContent = content.substring(0, functionStart) + content.substring(functionEnd);
const withImport = newContent.replace(
  'import { Button } from "@/components/ui/button";',
  'import { Button } from "@/components/ui/button";\nimport { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";',
);

fs.writeFileSync(sourcePath, withImport);
