const fs = require("fs");
const file = "src/components/profile/subscription/SubscriberPortalDesktop.tsx";
let content = fs.readFileSync(file, "utf8");

// Remove TanStack Router stuff and data fetching
content = content.replace(/export const Route = createFileRoute.*?\n\}\);\n/s, "");
content = content.replace(
  /import \{ createFileRoute, useNavigate, Link \} from "@tanstack\/react-router";\n/,
  'import { useNavigate, Link } from "@tanstack/react-router";\n',
);

content = content.replace(
  /function SubscriberPortal\(\) \{/,
  `export function SubscriberPortalDesktop({
  subscriptionId,
  user,
  subscription,
  space,
  spaceId,
  resources,
  classes,
  resourceBookings,
  sessions,
  calendarEvents,
  createBooking
}: any) {`,
);

// Remove data fetching from the component
content = content.replace(
  /const \{ subscriptionId \} = Route.useParams\(\);\n  const \{ user \} = useUserAuth\(\);\n/,
  "",
);
content = content.replace(/const \{ data: subscription.*?\n  \}\);\n/s, "");
content = content.replace(/const spaceId = subscription\?.space_id;\n/, "");
content = content.replace(/const \{ data: resources.*?\n  \}\);\n/s, "");
content = content.replace(/const \{ data: classes.*?\n  \}\);\n/s, "");
content = content.replace(/const \{ data: resourceBookings.*?\n  \}\);\n/s, "");
content = content.replace(/const \{ data: sessions.*?\n  \}\);\n/s, "");
content = content.replace(
  /const calendarEvents = React.useMemo.*?\n  \}, \[sessions, resourceBookings, user\?\.id\]\);\n/s,
  "",
);

// Remove the loading and not found states as they will be handled by the parent
content = content.replace(
  /if \(isSubLoading \|\| isResourcesLoading \|\| isClassesLoading \|\| isResourceBookingsLoading \|\| !sessions\) \{.*?return \(.*?\}\);\n  \}\n/s,
  "",
);
content = content.replace(/if \(!subscription\) \{.*?return \(.*?\}\);\n  \}\n/s, "");

// Rename class to avoid conflicts? No, it's fine.
// Modify the outer div to have hidden md:flex
content = content.replace(
  /<div className="min-h-screen flex flex-col bg-background\/50">/,
  '<div className="hidden md:flex min-h-screen flex-col bg-background/50">',
);

fs.writeFileSync(file, content);
