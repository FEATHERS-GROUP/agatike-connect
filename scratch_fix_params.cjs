const fs = require('fs');
const path = require('path');

const destDir = 'src/routes/dashboard/$workspaceSlug/experiences/$experienceId';

const filesToFix = [
  'attendees.tsx',
  'planning.tsx',
  'staff.tsx',
  'products&add-ons.tsx',
  'experience.tsx'
];

filesToFix.forEach(file => {
  const destPath = path.join(destDir, file);
  
  if (fs.existsSync(destPath)) {
    let content = fs.readFileSync(destPath, 'utf8');
    
    // Convert all `experienceId` back to `eventId` first because we messed it up earlier:
    content = content.replace(/\bexperienceId\b/g, 'eventId');
    
    // Now fix the Route definition correctly:
    content = content.replace(
      /createFileRoute\((['"])\/dashboard\/\$workspaceSlug\/experiences\/\$eventId/g,
      'createFileRoute($1/dashboard/$workspaceSlug/experiences/$experienceId'
    );
    
    // Now fix the useParams destructuring:
    content = content.replace(/const\s*{\s*([^}]*)\beventId\b([^}]*)\s*}\s*=\s*(Route\.useParams|useParams)/g, 'const { $1experienceId: eventId$2 } = $3');
    
    // And for any manual passing like <SomeComponent eventId={eventId} /> it will still work because we extracted it as `eventId`.
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
