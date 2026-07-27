const fs = require("fs");

let facility = fs.readFileSync("src/components/page-builder/FacilityCheckoutSheet.tsx", "utf8");
facility = facility.replace(/<Footer \/>\n/g, "");
facility = facility.replace(/import \{ Footer \} from "@\/components\/site\/Footer";\n/g, "");
fs.writeFileSync("src/components/page-builder/FacilityCheckoutSheet.tsx", facility);

let venue = fs.readFileSync("src/components/page-builder/VenueCheckoutSheet.tsx", "utf8");
venue = venue.replace(/import \{ Footer \} from "@\/components\/site\/Footer";\n/g, "");
fs.writeFileSync("src/components/page-builder/VenueCheckoutSheet.tsx", venue);
