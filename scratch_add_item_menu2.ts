import * as fs from "fs";

const files = [
  "src/routes/dashboard/$workspaceSlug/ticket-designer/index.tsx",
  "src/routes/dashboard/$workspaceSlug/badge-designer/index.tsx",
  "src/routes/dashboard/$workspaceSlug/Cinema/movies.tsx",
  "src/routes/dashboard/$workspaceSlug/book/books.tsx",
  "src/routes/dashboard/$workspaceSlug/page-builder/index.tsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log("SKIP", file);
    continue;
  }
  let code = fs.readFileSync(file, "utf8");

  // Pattern: ({ filteredItems, folders, handleSelect, selectedIds })
  const patterns = [
    /\(\{\s*filteredItems,\s*folders,\s*handleSelect,\s*selectedIds\s*\}\)/g,
    /\(\{\s*filteredItems,\s*handleSelect,\s*selectedIds\s*\}\)/g,
    /\(\{\s*filteredItems,\s*folders,\s*currentFolderId,\s*selectedIds,\s*handleSelect,\s*handleSelectAll\s*\}\)/g,
  ];

  const replacements = [
    "({ filteredItems, folders, handleSelect, selectedIds, ItemMenu })",
    "({ filteredItems, handleSelect, selectedIds, ItemMenu })",
    "({ filteredItems, folders, currentFolderId, selectedIds, handleSelect, handleSelectAll, ItemMenu })",
  ];

  let changed = false;
  for (let i = 0; i < patterns.length; i++) {
    const before = code;
    code = code.replace(patterns[i], replacements[i]);
    if (code !== before) {
      changed = true;
      console.log(`  Matched pattern ${i + 1} in ${file}`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log("Updated:", file);
  } else {
    // Show what we actually have
    const match = code.match(/\(\{[^}]*filteredItems[^}]*\}\)/);
    console.log("No match in:", file, "Found:", match ? match[0].slice(0, 80) : "nothing");
  }
}
