const fs = require('fs');

const path = '/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/ticket-designer/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add getRentableVenues import
content = content.replace(
  'import { getWorkspaceEvents, saveTicketProject, getWorkspaceTicketProjects } from "@/api/events";',
  'import { getWorkspaceEvents, saveTicketProject, getWorkspaceTicketProjects } from "@/api/events";\nimport { getRentableVenues } from "@/api/rentable_venues";'
);

// Add venues query and state
const venueQueryCode = `
  const { data: venues = [] } = useQuery({
    queryKey: ["rentable_venues", activeWorkspace?.id],
    queryFn: () => getRentableVenues({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });
`;

content = content.replace(
  'const { data: events = [] } = useQuery({',
  venueQueryCode + '\n  const { data: events = [] } = useQuery({'
);

content = content.replace(
  'const [selectedEventId, setSelectedEventId] = useState("");',
  'const [selectedAssignment, setSelectedAssignment] = useState("");'
);

// Update handleCreateNew
const createNewCode = `
  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedAssignment) {
      toast.error("Please select a template and an event or venue.");
      return;
    }

    let eventId = null;
    let venueId = null;
    if (selectedAssignment.startsWith("event:")) eventId = selectedAssignment.replace("event:", "");
    if (selectedAssignment.startsWith("venue:")) venueId = selectedAssignment.replace("venue:", "");

    createMutation.mutate({
      name: newProjectName,
      eventId: eventId,
      venueId: venueId,
      template: selectedTemplate,
      workspaceId: activeWorkspace?.id || "",
      updated_on: new Date().toISOString(),
    });
  };
`;

content = content.replace(/const handleCreateNew = \([\s\S]*?\}\;/m, createNewCode);

// Update openSetupModal
content = content.replace(
  'setSelectedEventId("");',
  'setSelectedAssignment("");'
);

// Update the select UI
const selectUI = `
              <div className="space-y-2">
                <Label htmlFor="eventSelect">Assign to Event or Venue *</Label>
                <select
                  id="eventSelect"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select Event or Venue --</option>
                  {events.length > 0 && (
                    <optgroup label="Events">
                      {events.map((ev: any) => (
                        <option key={ev.id} value={\`event:\${ev.id}\`}>
                          {ev.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {venues.length > 0 && (
                    <optgroup label="Venues">
                      {venues.map((v: any) => (
                        <option key={v.id} value={\`venue:\${v.id}\`}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
`;

content = content.replace(/<div className="space-y-2">[\s\n]*<Label htmlFor="eventSelect">Select Event \*<\/Label>[\s\S]*?<\/div>/m, selectUI);

fs.writeFileSync(path, content);
