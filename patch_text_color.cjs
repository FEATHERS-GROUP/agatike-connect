const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/style=\{\{ background: themeColor \|\| "var\(--gradient-primary\)" \}\}/g, 'style={{ background: themeColor || "var(--gradient-primary)", color: "#ffffff" }}');
  fs.writeFileSync(file, content);
}

patch('src/components/page-builder/FacilityCheckoutSheet.tsx');
patch('src/components/page-builder/VenueCheckoutSheet.tsx');

