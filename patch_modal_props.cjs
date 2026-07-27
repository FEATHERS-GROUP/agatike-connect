const fs = require("fs");

let fac = fs.readFileSync("src/components/page-builder/FacilityCheckoutSheet.tsx", "utf8");
fac = fac.replace(
  /baseCurrency=\{currency\}\n        userPhone=\{phone\}\n      \/>/g,
  "baseCurrency={currency}\n        userPhone={phone}\n        themeColor={themeColor}\n      />",
);
fs.writeFileSync("src/components/page-builder/FacilityCheckoutSheet.tsx", fac);

let ven = fs.readFileSync("src/components/page-builder/VenueCheckoutSheet.tsx", "utf8");
ven = ven.replace(
  /baseCurrency=\{currency\}\n        userPhone=\{phone\}\n      \/>/g,
  "baseCurrency={currency}\n        userPhone={phone}\n        themeColor={themeColor}\n      />",
);
fs.writeFileSync("src/components/page-builder/VenueCheckoutSheet.tsx", ven);
