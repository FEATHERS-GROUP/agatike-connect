import fs from 'fs';

const path = './src/routeTree.gen.ts';
let content = fs.readFileSync(path, 'utf8');

// If already added, skip
if (!content.includes("AboutRouteImport")) {
  // Add imports
  content = content.replace(
    "import { Route as TermsRouteImport } from './routes/terms'",
    "import { Route as TermsRouteImport } from './routes/terms'\nimport { Route as AboutRouteImport } from './routes/about'\nimport { Route as ContactRouteImport } from './routes/contact'"
  );

  // Add route updates
  content = content.replace(
    "const TermsRoute = TermsRouteImport.update({",
    "const AboutRoute = AboutRouteImport.update({\n  id: '/about',\n  path: '/about',\n  getParentRoute: () => rootRouteImport,\n} as any)\nconst ContactRoute = ContactRouteImport.update({\n  id: '/contact',\n  path: '/contact',\n  getParentRoute: () => rootRouteImport,\n} as any)\nconst TermsRoute = TermsRouteImport.update({"
  );

  // Add to FileRoutesByFullPath
  content = content.replace(
    "'/terms': typeof TermsRoute",
    "'/about': typeof AboutRoute\n  '/contact': typeof ContactRoute\n  '/terms': typeof TermsRoute"
  );

  // Add to FileRoutesByTo
  content = content.replace(
    "'/terms': typeof TermsRoute",
    "'/about': typeof AboutRoute\n  '/contact': typeof ContactRoute\n  '/terms': typeof TermsRoute"
  );

  // Add to FileRoutesById
  content = content.replace(
    "'/terms': typeof TermsRoute",
    "'/about': typeof AboutRoute\n  '/contact': typeof ContactRoute\n  '/terms': typeof TermsRoute"
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("Injected About and Contact into routeTree.gen.ts");
} else {
  console.log("Already exists");
}
