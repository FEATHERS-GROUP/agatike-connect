const fs = require("fs");

const files = [
  "src/routes/explore.tsx",
  "src/routes/experiences.tsx",
  "src/routes/movies.tsx",
  "src/components/site/EventCard.tsx",
  "src/components/desktop/HomeDesktop.tsx",
  "src/components/desktop/EventDetailsDesktop.tsx",
  "src/components/desktop/BookingDesktop.tsx",
  "src/components/mobile/HomeMobile.tsx",
  "src/components/mobile/EventDetailsMobile.tsx",
  "src/components/mobile/BookingMobile.tsx",
];

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Replace \$\${var.price} with \${var.currency || '$'}\${var.price} (template literal)
  content = content.replace(/\$\$\{([a-zA-Z]+)\.price\}/g, "\\${$1.currency || '$'}\\${$1.price}");

  // JSX replacements:
  // >${var.price}< -> >{var.currency || '$'}{var.price}<
  content = content.replace(/>\$([a-zA-Z]+)\.price</g, ">{$1.currency || '$'}{$1.price}<");
  content = content.replace(/\$\{([a-zA-Z]+)\.price\}/g, "{$1.currency || '$'}{$1.price}");

  // Replace >${total}< in EventDetails -> >{event.currency || '$'}{total}<
  content = content.replace(/>\$total</g, ">{event.currency || '$'}{total}<");
  // EventDetails ticket tier
  content = content.replace(/>\$(\{t\.price\})</g, ">{event.currency || '$'}$1<");
  content = content.replace(/>\$(\{m\.price\})</g, ">{event.currency || '$'}$1<");
  content = content.replace(/>\$(\{ticketTiers\[0\]\.price\})</g, ">{event.currency || '$'}$1<");

  // "From $${x.price}" -> "From ${x.currency || '$'}${x.price}"
  content = content.replace(
    /From \$\$\{([a-zA-Z]+)\.price\}/gi,
    "From \\${$1.currency || '$'}\\${$1.price}",
  );
  content = content.replace(
    /from \$\$\{([a-zA-Z]+)\.price\}/gi,
    "from \\${$1.currency || '$'}\\${$1.price}",
  );

  fs.writeFileSync(file, content);
});
console.log("Replacements completed.");
