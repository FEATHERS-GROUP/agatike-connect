const fs = require('fs');

const code = fs.readFileSync('src/components/desktop/dashboard/ticket-designer/TicketPreview.tsx', 'utf-8');

// The file has:
// 1. imports and constants (lines 1-89)
// 2. Shared components BackSide, Stub, Perf (lines 90-166)
// 3. The 5 templates (lines 168-944)
// 4. Fallback + Cell (lines 946-959)

const lines = code.split('\n');

const concert = lines.slice(170, 253).join('\n');
const movie = lines.slice(257, 431).join('\n');
const experience = lines.slice(435, 621).join('\n');
const conference = lines.slice(625, 789).join('\n');
const entrance = lines.slice(793, 943).join('\n');

function makeTemplate(name, body) {
  return `export function ${name}Template(props: TemplateProps) {
  const {
    palette, font, tier, title, subtitle, date, time, seat, price, currency,
    cover, logoText, logoImage, logoScale, logoOpacity, logoColorMode, orderId,
    qrValue, previewMode, onLogoClick, layout, back, isBack, BackSide, Stub, Perf, Cell
  } = props;

  ${body}

  return null;
}
`;
}

let indexContent = `import React from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { TemplateProps } from "./types";
import { DEFAULT_TERMS_HTML, DEFAULT_EXPERIENCE_BACK_HTML } from "./types";

${makeTemplate('Concert', concert)}
${makeTemplate('Movie', movie)}
${makeTemplate('Experience', experience)}
${makeTemplate('Conference', conference)}
${makeTemplate('Entrance', entrance)}
`;

fs.writeFileSync('src/components/desktop/dashboard/ticket-designer/templates/index.tsx', indexContent);

// Now recreate TicketPreview.tsx
const newTicketPreview = lines.slice(0, 170).join('\n') + `
    const templateProps = {
      ...props,
      isBack,
      BackSide,
      Stub,
      Perf,
      Cell
    };

    if (template === "concert") return <ConcertTemplate {...templateProps} />;
    if (template === "movie") return <MovieTemplate {...templateProps} />;
    if (template === "experience") return <ExperienceTemplate {...templateProps} />;
    if (template === "conference") return <ConferenceTemplate {...templateProps} />;
    if (template === "entrance") return <EntranceTemplate {...templateProps} />;

    return null;
  }
  return null;
}

` + lines.slice(950).join('\n');

const importLines = `import { ConcertTemplate, MovieTemplate, ExperienceTemplate, ConferenceTemplate, EntranceTemplate } from "./templates";\nimport { DEFAULT_TERMS_HTML } from "./templates/types";\n`;
// Put imports at top
let finalPreview = newTicketPreview.replace('import React from "react";', 'import React from "react";\n' + importLines);

fs.writeFileSync('src/components/desktop/dashboard/ticket-designer/TicketPreview.tsx', finalPreview);
