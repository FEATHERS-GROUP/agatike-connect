const fs = require("fs");

const path =
  "/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/ticket-designer/$projectId.tsx";
let content = fs.readFileSync(path, "utf8");

// Replace the Assignment Section
const newAssignmentSection = `
              <Section title="Assignment" icon={Calendar}>
                <div className="space-y-3">
                  <Field label="Assign to Event or Venue">
                    <select
                      value={assignmentType === "event" && eventId ? \`event:\${eventId}\` : assignmentType === "venue" && venueId ? \`venue:\${venueId}\` : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setAssignmentType("event");
                          setEventId("");
                          setVenueId("");
                        } else if (val.startsWith("event:")) {
                          setAssignmentType("event");
                          setEventId(val.replace("event:", ""));
                          setVenueId("");
                        } else if (val.startsWith("venue:")) {
                          setAssignmentType("venue");
                          setVenueId(val.replace("venue:", ""));
                          setEventId("");
                        }
                        setIsDirty(true);
                      }}
                      disabled={!!dbProject?.eventId || !!dbProject?.venueId}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary/20"
                    >
                      <option value="">-- No Assignment --</option>
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
                  </Field>
                </div>
              </Section>
`;

// Replace the old assignment section block.
content = content.replace(
  /<Section title="Assignment" icon=\{Calendar\}>[\s\S]*?<\/Section>/m,
  newAssignmentSection.trim(),
);

fs.writeFileSync(path, content);
