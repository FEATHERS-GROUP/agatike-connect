const fs = require('fs');
console.log("== LINEUP ==");
console.log(fs.readFileSync('src/routes/dashboard/$workspaceSlug/events/$eventId/lineup.tsx', 'utf-8').slice(0, 300));
console.log("== STAFF ==");
console.log(fs.readFileSync('src/routes/dashboard/$workspaceSlug/events/$eventId/staff.tsx', 'utf-8').slice(0, 300));
