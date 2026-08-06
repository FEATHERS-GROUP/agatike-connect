const fs = require("fs");

const files = [
  "src/components/mobile/BookingMobile.tsx",
  "src/components/desktop/BookingDesktop.tsx",
  "src/components/mobile/VenueCheckoutMobile.tsx",
  "src/components/desktop/VenueCheckoutDesktop.tsx",
  "src/components/mobile/MovieBookingMobile.tsx",
  "src/components/desktop/MovieBookingDesktop.tsx",
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");

  // Match the early return block
  const earlyReturnRegex =
    /if\s*\(\s*isPollingPawaPay\s*\|\|\s*\(\(\s*isCheckingOut\s*\|\|\s*isGenerating\s*\)\s*&&\s*paymentMethod\s*===\s*"momo"\)\)\s*\{\s*return\s*\(\s*(?:<div[^>]*>\s*(?:{!isSubdomain[^}]*}|)\s*)?<CheckYourPhone[\s\S]*?\/>\s*(?:<\/div>\s*)?\);\s*\}/;

  const match = content.match(earlyReturnRegex);
  if (match) {
    // Extract the CheckYourPhone component block precisely
    const cypMatch = match[0].match(/<CheckYourPhone[\s\S]*?\/>/);
    if (cypMatch) {
      const cypBlock = cypMatch[0];

      // Remove the early return
      content = content.replace(match[0], "");

      // Append it at the end, just before the last </div>
      // We will look for the last </div> in the file
      const lastDivIndex = content.lastIndexOf("</div>");
      if (lastDivIndex !== -1) {
        const insertion = `
      {(isPollingPawaPay || ((isCheckingOut || isGenerating) && paymentMethod === "momo")) && (
        ${cypBlock}
      )}
`;
        content = content.substring(0, lastDivIndex) + insertion + content.substring(lastDivIndex);
        fs.writeFileSync(file, content);
        console.log("Fixed " + file);
      }
    }
  } else {
    // Try the one without the isGenerating (in case it wasn't updated)
    const earlyReturnRegex2 =
      /if\s*\(\s*isPollingPawaPay\s*\|\|\s*\(\s*isCheckingOut\s*&&\s*paymentMethod\s*===\s*"momo"\)\)\s*\{\s*return\s*\(\s*(?:<div[^>]*>\s*(?:{!isSubdomain[^}]*}|)\s*)?<CheckYourPhone[\s\S]*?\/>\s*(?:<\/div>\s*)?\);\s*\}/;
    const match2 = content.match(earlyReturnRegex2);
    if (match2) {
      const cypMatch = match2[0].match(/<CheckYourPhone[\s\S]*?\/>/);
      if (cypMatch) {
        const cypBlock = cypMatch[0];
        content = content.replace(match2[0], "");
        const lastDivIndex = content.lastIndexOf("</div>");
        if (lastDivIndex !== -1) {
          const insertion = `
        {(isPollingPawaPay || ((isCheckingOut || isGenerating) && paymentMethod === "momo")) && (
          ${cypBlock}
        )}
  `;
          content =
            content.substring(0, lastDivIndex) + insertion + content.substring(lastDivIndex);
          fs.writeFileSync(file, content);
          console.log("Fixed " + file);
        }
      }
    } else {
      console.log("No match found for " + file);
    }
  }
}
