const fs = require('fs');
const path = require('path');

const srcDir = 'src/routes/dashboard/$workspaceSlug/events/$eventId';
const destDir = 'src/routes/dashboard/$workspaceSlug/experiences/$experienceId';

const filesToCopy = [
  'attendees.tsx',
  'planning.tsx',
  'staff.tsx',
  'products&add-ons.tsx',
  'experience.tsx'
];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace Route definition
    content = content.replace(
      /createFileRoute\((['"])\/dashboard\/\$workspaceSlug\/events\/\$eventId/g,
      'createFileRoute($1/dashboard/$workspaceSlug/experiences/$experienceId'
    );
    
    // Replace 'eventId' with 'experienceId' in Route.useParams() destructuring
    content = content.replace(/const\s*{\s*([^}]*)\beventId\b([^}]*)\s*}\s*=\s*Route\.useParams/g, 'const { $1experienceId$2 } = Route.useParams');
    content = content.replace(/const\s*{\s*([^}]*)\beventId\b([^}]*)\s*}\s*=\s*useParams/g, 'const { $1experienceId$2 } = useParams');
    
    // When passing eventId to queries
    content = content.replace(/eventId:\s*eventId/g, 'eventId: experienceId');
    // For string interpolations
    content = content.replace(/\$\{eventId\}/g, '${experienceId}');
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Copied and modified ${file}`);
  } else {
    console.log(`File not found: ${srcPath}`);
  }
});
