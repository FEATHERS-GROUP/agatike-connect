import * as fs from "fs";

const files = [
  "src/routes/dashboard/$workspaceSlug/ticket-designer/index.tsx",
  "src/routes/dashboard/$workspaceSlug/venue-designer/index.tsx",
  "src/routes/dashboard/$workspaceSlug/badge-designer/index.tsx",
  "src/routes/dashboard/$workspaceSlug/Cinema/movies.tsx",
  "src/routes/dashboard/$workspaceSlug/book/books.tsx",
];

let fixed = 0;
for (const file of files) {
  if (!fs.existsSync(file)) { console.log("SKIP", file); continue; }
  let code = fs.readFileSync(file, "utf8");
  
  // Replace: { filteredItems, handleSelect, selectedIds } with ItemMenu added
  const before = code;
  code = code.replace(
    /\{\s*filteredItems,\s*handleSelect,\s*selectedIds\s*\}/g,
    "{ filteredItems, handleSelect, selectedIds, ItemMenu }"
  );
  
  if (code !== before) {
    fs.writeFileSync(file, code);
    console.log("Updated:", file);
    fixed++;
  } else {
    console.log("No match:", file);
  }
}
console.log(`Done: ${fixed} files updated`);
