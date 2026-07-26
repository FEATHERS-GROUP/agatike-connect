const fs = require("fs");

let desktop = fs.readFileSync("src/components/desktop/VenueDetailsDesktop.tsx", "utf8");
desktop = desktop.replace(/venue: any;\n\}\) \{/, "venue: any;\n  hideLayout?: boolean;\n}) {");
desktop = desktop.replace(
  /\{!isSubdomain && <Navbar \/>\}/,
  "{!hideLayout && !isSubdomain && <Navbar />}",
);
desktop = desktop.replace(
  /\{!isSubdomain && <Footer \/>\}/,
  "{!hideLayout && !isSubdomain && <Footer />}",
);
fs.writeFileSync("src/components/desktop/VenueDetailsDesktop.tsx", desktop);

let mobile = fs.readFileSync("src/components/mobile/VenueDetailsMobile.tsx", "utf8");
mobile = mobile.replace(/venue: any;\n\}\) \{/, "venue: any;\n  hideLayout?: boolean;\n}) {");
mobile = mobile.replace(
  /\{!isSubdomain && \(\n[ \t]*<div\n[ \t]*className=\{`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 \$\{/g,
  "{!hideLayout && !isSubdomain && (\n        <div\n          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 ${",
);
fs.writeFileSync("src/components/mobile/VenueDetailsMobile.tsx", mobile);

let route = fs.readFileSync("src/routes/venues/$venueId.tsx", "utf8");
route = route.replace(
  /<VenueDetailsMobile venue=\{venue\} \/>/,
  "<VenueDetailsMobile venue={venue} hideLayout={!!subdomainSlug} />",
);
route = route.replace(
  /<VenueDetailsDesktop venue=\{venue\} \/>/,
  "<VenueDetailsDesktop venue={venue} hideLayout={!!subdomainSlug} />",
);
fs.writeFileSync("src/routes/venues/$venueId.tsx", route);
