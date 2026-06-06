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
    
    // We want to capture the useParams destructuring and replace experienceId with `experienceId: eventId`
    content = content.replace(/\bexperienceId\b/g, 'eventId');
    
    // But wait! The route definition uses experienceId:
    content = content.replace(
      /createFileRoute\((['"])\/dashboard\/\$workspaceSlug\/experiences\/\$eventId/g,
      'createFileRoute($1/dashboard/$workspaceSlug/experiences/$experienceId'
    );
    
    // So the file will just use `eventId` for the parameter everywhere, BUT we need the useParams to extract it correctly if the route param is actually $experienceId. 
    // TanStack router will inject `experienceId` into useParams because of the route path.
    // So we need to say `const { experienceId: eventId ... } = Route.useParams()`
    content = content.replace(/const\s*{\s*([^}]*)\beventId\b([^}]*)\s*}\s*=\s*(Route\.useParams|useParams)/g, 'const { $1experienceId: eventId$2 } = $3');
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
