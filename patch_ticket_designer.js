const fs = require('fs');

const path = '/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/ticket-designer/$projectId.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add getRentableVenues import
content = content.replace(
  'import { getWorkspaceEvents,',
  'import { getRentableVenues } from "@/api/rentable_venues";\nimport {\n  getWorkspaceEvents,'
);

// 2. Add venue queries and state
const venueQueryCode = `
  const { data: venues = [] } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [assignmentType, setAssignmentType] = useState<"event" | "venue">("event");
  const [venueId, setVenueId] = useState("");
`;

content = content.replace(
  'const { data: dbProject, isLoading: isProjectLoading } = useQuery({',
  venueQueryCode + '\n  const { data: dbProject, isLoading: isProjectLoading } = useQuery({'
);

// 3. Update initialization logic
content = content.replace(
  'const [eventId, setEventId] = useState(existingProject?.eventId || initialEventId);',
  `const [eventId, setEventId] = useState(existingProject?.eventId || initialEventId);
  const initialVenueId = searchParams.get("venueId") || "";
  const [venueId, setVenueId] = useState(existingProject?.venueId || initialVenueId);
  const [assignmentType, setAssignmentType] = useState<"event" | "venue">((existingProject?.venueId || initialVenueId) ? "venue" : "event");
  `
);

content = content.replace(
  /const eventMatch = events\.find\(\(e: any\) => e\.id === eventId\);/,
  `const eventMatch = events.find((e: any) => e.id === eventId);
  const venueMatch = venues.find((v: any) => v.id === venueId);`
);

content = content.replace(
  /const allTicketTiers = eventMatch\?\.event_tickets \|\| \[\];/,
  `const allTicketTiers = assignmentType === "event" ? (eventMatch?.event_tickets || []) : (venueMatch?.pricing_tiers?.map((t: any) => ({ ...t, id: t.name, type: t.name, cost: t.amount })) || []);`
);

// Remove duplicate useState and declaration of venueId and assignmentType from step 2 if they conflict
// Actually, I can just write a single replacement.

fs.writeFileSync(path + '.mod', content);
