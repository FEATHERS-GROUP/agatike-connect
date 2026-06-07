const fs = require('fs');

const path = '/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/ticket-designer/$projectId.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add getRentableVenues import
content = content.replace(
  'import { useWorkspace } from "@/contexts/WorkspaceContext";',
  'import { useWorkspace } from "@/contexts/WorkspaceContext";\nimport { getRentableVenues } from "@/api/rentable_venues";'
);

// 2. Add venue query
const venueQueryCode = `
  const { data: venues = [] } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });
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

content = content.replace(
  /const dynamicDefaults = \{/,
  `const dynamicDefaults = {
    title: assignmentType === "event" ? (eventMatch?.title || "Event Title") : (venueMatch?.name || "Venue Ticket"),
    subtitle: assignmentType === "event" 
      ? (activeStop?.venue ? \`\${activeStop.venue} · \${activeStop.city}\${activeStop.address ? \`\\n\${activeStop.address}\` : ""}\` : eventMatch?.category || "Event")
      : (venueMatch?.address || "Location TBD"),
    date: assignmentType === "event" ? (activeStop?.date || "TBD") : "Valid for 1 Day",
    time: assignmentType === "event" ? (activeStop?.time || "TBD") : "Anytime during opening hours",`
);

// Remove the old dynamicDefaults assignments that we just replaced
content = content.replace(
  /title: eventMatch\?\.title \|\| "Event Title",[\s\S]*?time: activeStop\?\.time \|\| "TBD",/,
  '' // Already added them in the replacement above
);


// 4. In handleSave, pass venueId instead of just eventId
content = content.replace(
  'eventId: eventId || null,',
  'eventId: assignmentType === "event" ? (eventId || null) : null,\n      venueId: assignmentType === "venue" ? (venueId || null) : null,'
);

// 5. In useEffect isInitialized, set venueId
content = content.replace(
  'setEventId(dbProject.eventId || "");',
  'setEventId(dbProject.eventId || "");\n      setVenueId(dbProject.venueId || "");\n      setAssignmentType(dbProject.venueId ? "venue" : "event");'
);

// 6. Assignment UI Toggle
const assignmentUI = `
                  <div className="flex bg-secondary/40 p-1 rounded-xl">
                    <button
                      onClick={() => setAssignmentType("event")}
                      className={\`flex-1 text-sm font-medium py-1.5 rounded-lg \${assignmentType === "event" ? "bg-background shadow text-foreground" : "text-muted-foreground"}\`}
                    >Event</button>
                    <button
                      onClick={() => setAssignmentType("venue")}
                      className={\`flex-1 text-sm font-medium py-1.5 rounded-lg \${assignmentType === "venue" ? "bg-background shadow text-foreground" : "text-muted-foreground"}\`}
                    >Venue</button>
                  </div>
                  
                  {assignmentType === "event" ? (
                    <Field label="Assign to Event">
                      <select
                        value={eventId}
                        onChange={(e) => {
                          setEventId(e.target.value);
                          setIsDirty(true);
                        }}
                        disabled={!!dbProject?.eventId || !!dbProject?.venueId}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary/20"
                      >
                        <option value="">-- No Event Assigned --</option>
                        {events.map((ev: any) => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </Field>
                  ) : (
                    <Field label="Assign to Venue">
                      <select
                        value={venueId}
                        onChange={(e) => {
                          setVenueId(e.target.value);
                          setIsDirty(true);
                        }}
                        disabled={!!dbProject?.eventId || !!dbProject?.venueId}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary/20"
                      >
                        <option value="">-- No Venue Assigned --</option>
                        {venues.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
`;

content = content.replace(
  /<Field label="Assign to Event">[\s\S]*?<\/Field>/,
  assignmentUI
);


fs.writeFileSync(path, content);
