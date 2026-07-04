const fs = require('fs');
const files = [
  'src/components/desktop/CreateEventDesktop.tsx',
  'src/routes/dashboard/$workspaceSlug/venue-designer/index.tsx',
  'src/routes/dashboard/$workspaceSlug/ticket-designer/index.tsx',
  'src/routes/dashboard/$workspaceSlug/Cinema/ticket-tiers.tsx',
  'src/routes/dashboard/$workspaceSlug/Cinema/movies.tsx',
  'src/routes/dashboard/$workspaceSlug/Cinema/$cinemaId/screens.tsx',
  'src/routes/dashboard/$workspaceSlug/Cinema/$cinemaId/integrations.tsx',
  'src/routes/dashboard/$workspaceSlug/page-builder/index.tsx',
  'src/routes/dashboard/$workspaceSlug/spaces/$spaceId/integrations.tsx',
  'src/routes/dashboard/$workspaceSlug/rsvps/index.tsx',
  'src/routes/dashboard/$workspaceSlug/users/index.tsx',
  'src/routes/dashboard/$workspaceSlug/book/tasks.tsx',
  'src/routes/dashboard/$workspaceSlug/book/finance.tsx',
  'src/routes/dashboard/$workspaceSlug/products&add-ons.tsx',
  'src/routes/dashboard/$workspaceSlug/events/index.tsx',
  'src/routes/dashboard/$workspaceSlug/events/$eventId/edit.tsx',
  'src/routes/dashboard/$workspaceSlug/badge-designer/index.tsx'
];
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/useSubscriptionLimits\(activeWorkspace\?\.orgnizer_id\)/g, 'useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id)');
  fs.writeFileSync(f, content);
}
console.log("Done");
