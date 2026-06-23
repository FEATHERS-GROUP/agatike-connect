const fs = require('fs');
let content = fs.readFileSync('src/components/site/movies/DesktopMoviesView.tsx', 'utf8');
content = content.replace(/\/\/\s*-+\n\/\/\s*MOBILE VIEW\n\}\n\n\/\/\s*-+/g, '');
fs.writeFileSync('src/components/site/movies/DesktopMoviesView.tsx', content);
