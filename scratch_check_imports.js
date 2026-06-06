const fs = require('fs');
const content = fs.readFileSync('src/routes/dashboard/$workspaceSlug/experiences/$experienceId/index.tsx', 'utf-8');
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
