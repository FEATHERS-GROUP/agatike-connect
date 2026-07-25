const fs = require('fs');

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace(/<SheetContent([^>]*)>/g, '<SheetContent$1>\n        <SheetTitle className="sr-only">Checkout</SheetTitle>');
  fs.writeFileSync(filename, content);
}

patchFile('src/components/page-builder/VenueCheckoutSheet.tsx');
patchFile('src/components/page-builder/FacilityCheckoutSheet.tsx');
