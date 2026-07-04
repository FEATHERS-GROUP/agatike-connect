const fs = require("fs");
const files = ["src/routes/dashboard/login.tsx", "src/routes/dashboard/create-organizer.tsx"];

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Background for the showcase container
  content = content.replace(/bg-\[\#111111\]/g, "bg-gray-100 dark:bg-[#111111]");

  // Background for the insights card
  content = content.replace(/bg-black\/60/g, "bg-white/80 dark:bg-black/60");

  // Background for inactive slider dots
  content = content.replace(/bg-white\/20/g, "bg-gray-300 dark:bg-white/20");

  // Background for the animate-ping cursor dot
  content = content.replace(
    /bg-white\/50 animate-ping/g,
    "bg-gray-900/30 dark:bg-white/50 animate-ping",
  );

  fs.writeFileSync(file, content, "utf8");
});
console.log("Showcase theme styles updated.");
