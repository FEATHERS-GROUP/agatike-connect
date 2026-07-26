const fs = require("fs");

let rv = fs.readFileSync("src/api/rentable_venues.ts", "utf8");
rv = rv.replace(
  /query GetRentableVenues\(\$workspace_id: uuid!\) \{\n    rentable_venues\(where: \{ workspace_id: \{ _eq: \$workspace_id \} \}, order_by: \{ created_at: desc \}\) \{\n      id/g,
  "query GetRentableVenues($workspace_id: uuid!) {\n    rentable_venues(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {\n      id\n      workspace_id",
);
fs.writeFileSync("src/api/rentable_venues.ts", rv);

let sp = fs.readFileSync("src/api/spaces.ts", "utf8");
sp = sp.replace(
  /query GetSpaces\(\$workspace_id: uuid!\) \{\n    spaces\(where: \{ workspace_id: \{ _eq: \$workspace_id \} \}, order_by: \{ created_at: desc \}\) \{\n      id/g,
  "query GetSpaces($workspace_id: uuid!) {\n    spaces(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {\n      id\n      workspace_id",
);
fs.writeFileSync("src/api/spaces.ts", sp);

let ev = fs.readFileSync("src/api/events.ts", "utf8");
ev = ev.replace(
  /query GetWorkspaceEvents\(\$workspace_id: uuid!\) \{\n    events\(where: \{ workspace_id: \{ _eq: \$workspace_id \} \}, order_by: \{ created_at: desc \}\) \{\n      id/g,
  "query GetWorkspaceEvents($workspace_id: uuid!) {\n    events(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {\n      id\n      workspace_id",
);
fs.writeFileSync("src/api/events.ts", ev);

let prod = fs.readFileSync("src/api/products.ts", "utf8");
if (prod) {
  prod = prod.replace(
    /query GetWorkspaceProducts\(\$workspace_id: uuid!\) \{\n    products\(where: \{ workspace_id: \{ _eq: \$workspace_id \} \}, order_by: \{ created_at: desc \}\) \{\n      id/g,
    "query GetWorkspaceProducts($workspace_id: uuid!) {\n    products(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {\n      id\n      workspace_id",
  );
  fs.writeFileSync("src/api/products.ts", prod);
}
