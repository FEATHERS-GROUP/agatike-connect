const fs = require("fs");
let content = fs.readFileSync("src/components/mobile/EventDetailsMobile.tsx", "utf8");
content = content.replace(
  /  eventId: string;\n  event\?: any;\n\}\) \{/,
  "  eventId: string;\n  event?: any;\n  hideLayout?: boolean;\n}) {",
);
content = content.replace(
  /\{!isSubdomain && \(\n[ \t]*<div\n[ \t]*className=\{`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 \$\{/g,
  "{!hideLayout && !isSubdomain && (\n        <div\n          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 ${",
);
fs.writeFileSync("src/components/mobile/EventDetailsMobile.tsx", content);
