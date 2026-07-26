const fs = require("fs");
let content = fs.readFileSync("src/components/page-builder/RenderedPage.tsx", "utf8");

// Replace the pt-16
content = content.replace(
  '<div className="flex-1 w-full relative z-10 flex flex-col pt-16">',
  '<div className={`flex-1 w-full relative z-10 flex flex-col ${hideComponents ? "" : "pt-16"}`}>',
);

// Enhance Venue Card Details
// First, find the venue rendering block and add location details
content = content.replace(
  /<h4 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">\n[ \t]*\{item\.name \|\| item\.title\}\n[ \t]*<\/h4>/g,
  `<h4 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">\n                                    {item.name || item.title}\n                                  </h4>\n                                  {isVenueType && (item.city || item.address) && (\n                                    <div className="flex items-center text-xs text-muted-foreground mb-1 gap-1">\n                                      <MapPin className="h-3 w-3" />\n                                      <span>{item.city}{item.city && item.address ? ", " : ""}{item.address}</span>\n                                    </div>\n                                  )}`,
);

fs.writeFileSync("src/components/page-builder/RenderedPage.tsx", content);
