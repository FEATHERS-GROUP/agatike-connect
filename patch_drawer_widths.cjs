const fs = require('fs');

function patchFile(filename, oldClass, newClass) {
  if (fs.existsSync(filename)) {
    let content = fs.readFileSync(filename, 'utf8');
    content = content.replace(new RegExp(oldClass, 'g'), newClass);
    fs.writeFileSync(filename, content);
  }
}

// Facility and Venue checkouts have a complex UI with columns, so they need more space.
const facilityVenueOld = 'className="w-full sm:max-w-xl ';
const facilityVenueNew = 'className="!w-full !max-w-[100vw] sm:!w-[90vw] sm:!max-w-[1000px] ';

patchFile('src/components/page-builder/FacilityCheckoutSheet.tsx', facilityVenueOld, facilityVenueNew);
patchFile('src/components/page-builder/VenueCheckoutSheet.tsx', facilityVenueOld, facilityVenueNew);

