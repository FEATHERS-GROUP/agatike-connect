const fs = require("fs");
let content = fs.readFileSync("src/components/shared/PaymentModal.tsx", "utf8");

// 1. Fix supported networks fallback
content = content.replace(
  "const supportedNetworks = wallet?.supported_networks || [];",
  "const supportedNetworks = wallet?.supported_networks?.length > 0 ? wallet.supported_networks : ALL_NETWORKS.map(n => n.value);",
);

// 2. Fix Pay button color
// The old style was:
// style={
//   themeColor
//     ? { backgroundColor: "#fff", color: themeColor }
//     : { background: "var(--gradient-primary)", color: "#fff" }
// }
// Let's replace it.
content = content.replace(
  /style=\{\s*themeColor\s*\?\s*\{ backgroundColor: "#fff", color: themeColor \}\s*:\s*\{ background: "var\(--gradient-primary\)", color: "#fff" \}\s*\}/,
  'style={{ background: themeColor || "var(--gradient-primary)", color: "#fff" }}',
);

fs.writeFileSync("src/components/shared/PaymentModal.tsx", content);
