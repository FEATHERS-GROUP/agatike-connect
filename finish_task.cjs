const fs = require('fs');
let data = fs.readFileSync('.gemini/antigravity-ide/brain/3646f67a-f589-4edb-8f8f-46dc4307b10b/task.md', 'utf8');
data = data.replace(/- \[ \]/g, '- [x]');
fs.writeFileSync('.gemini/antigravity-ide/brain/3646f67a-f589-4edb-8f8f-46dc4307b10b/task.md', data);
