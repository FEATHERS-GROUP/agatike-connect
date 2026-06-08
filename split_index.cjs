const fs = require('fs');

const indexCode = fs.readFileSync('src/components/desktop/dashboard/ticket-designer/templates/index.tsx', 'utf-8');

// The file exports 5 functions sequentially
const extractTemplate = (name, newName) => {
  const startStr = `export function ${name}Template(props: TemplateProps) {`;
  const startIdx = indexCode.indexOf(startStr);
  if (startIdx === -1) return null;
  // find the end of this function. Since they all end with `return null;\n}`, 
  // or `return null;\n}\n\n`
  const nextIdx = indexCode.indexOf('export function', startIdx + 1);
  const endIdx = nextIdx !== -1 ? nextIdx : indexCode.length;
  let code = indexCode.slice(startIdx, endIdx).trim();
  
  // replace export function XTemplate with export function X1
  code = code.replace(`export function ${name}Template`, `export function ${newName}`);
  
  const fileContent = `import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "./types";

${code}
`;
  return fileContent;
};

const templates = [
  { name: 'Concert', newName: 'Concert1' },
  { name: 'Movie', newName: 'Movie1' },
  { name: 'Experience', newName: 'Experience1' },
  { name: 'Conference', newName: 'Conference1' },
  { name: 'Entrance', newName: 'Entrance1' }
];

templates.forEach(t => {
  const content = extractTemplate(t.name, t.newName);
  if (content) {
    fs.writeFileSync(`src/components/desktop/dashboard/ticket-designer/templates/${t.newName}.tsx`, content);
    console.log(`Created ${t.newName}.tsx`);
  }
});

