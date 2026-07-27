const fs = require("fs");

function replaceColor(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    /style=\{\{ background: "var\(--gradient-primary\)" \}\}/g,
    'style={{ background: themeColor || "var(--gradient-primary)" }}',
  );
  fs.writeFileSync(file, content);
}

replaceColor("src/components/page-builder/FacilityCheckoutSheet.tsx");
replaceColor("src/components/page-builder/VenueCheckoutSheet.tsx");
