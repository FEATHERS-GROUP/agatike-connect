const fs = require('fs');
let content = fs.readFileSync('src/components/desktop/dashboard/ticket-designer/templates/index.tsx', 'utf-8');

// The format is:
// if (template === "concert") {
//   return ( ... );
// 
// but wait, there might be missing closing braces for the `if`. 
// Actually, since I sliced up to `);`, the `}` is simply missing!
// So let's just close the brace!

content = content.replace(/      \);\n\n  return null;/g, "      );\n    }\n\n  return null;");

fs.writeFileSync('src/components/desktop/dashboard/ticket-designer/templates/index.tsx', content);
