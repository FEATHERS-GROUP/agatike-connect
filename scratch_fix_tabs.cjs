const fs = require('fs');
const path = '/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/experiences/$experienceId/index.tsx';

let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('{/* ITINERARY & MAP SECTION */}'));
// find the Right Column comment after the tabs content
let endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('{/* RIGHT COLUMN (Sidebar) */}'));

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `          {/* ITINERARY & MAP SECTION */}
          {experience.itinerary && experience.itinerary.length > 0 && (
            <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Route & Schedule</h3>
                  <p className="text-sm text-muted-foreground">Interactive map and timeline of the experience.</p>
                </div>
                {Number(totalDistance) > 0 && (
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                    <Navigation className="h-4 w-4" />
                    <span className="font-semibold text-sm">{totalDistance} km total route</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Map */}
                <div className="rounded-2xl overflow-hidden border border-border/60 h-[400px] z-10 relative">
                  {isMounted ? (
                    <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-secondary/50">Loading map...</div>}>
                      <ExperienceMap 
                        itinerary={experience.itinerary} 
                        bounds={bounds} 
                        mapCenter={mapCenter} 
                        polylinePositions={polylinePositions} 
                      />
                    </Suspense>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                      <div className="text-center text-muted-foreground">
                        <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Timeline */}
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-2">
                  {experience.itinerary.map((stop) => (
                    <div key={stop.id} className="relative flex items-start group is-active py-4">
                      {/* Marker */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary shadow-sm shrink-0 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      {/* Content */}
                      <div className="ml-4 bg-secondary/30 w-full p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:bg-secondary/50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground">{stop.title}</h4>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{stop.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{stop.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6 mt-0">
            {/* UPCOMING SCHEDULES */}
            {experience.schedules && experience.schedules.length > 0 ? (
              <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-semibold mb-1">Upcoming Schedules</h3>
                <p className="text-sm text-muted-foreground mb-6">Manage bookings for your upcoming scheduled dates.</p>
                
                <div className="space-y-4">
                  {experience.schedules.map((schedule) => {
                    const percentage = Math.round((schedule.spotsFilled / schedule.totalSpots) * 100);
                    const isFull = schedule.spotsFilled >= schedule.totalSpots;
                    return (
                      <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground">{schedule.date}</h4>
                            {isFull && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-500">
                                Sold Out
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">{schedule.spotsFilled} / {schedule.totalSpots} booked</span>
                            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                              <div 
                                className={\`h-full rounded-full \${isFull ? 'bg-amber-500' : 'bg-primary'}\`} 
                                style={{ width: \`\${percentage}%\` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="secondary"
                          className="rounded-xl shrink-0"
                          onClick={() => navigate({ 
                            to: "/dashboard/$workspaceSlug/events/$eventId/attendees", 
                            params: { workspaceSlug: workspaceSlug || "workspace", eventId: experienceId } 
                          })}
                        >
                          <Users className="mr-2 h-4 w-4" /> Manage Attendees
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-border/60 bg-card p-12 text-center shadow-[var(--shadow-card)]">
                <p className="text-muted-foreground">No upcoming schedules found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT COLUMN (Sidebar) */}`;

  const newLines = [
    ...lines.slice(0, startIndex),
    replacement,
    ...lines.slice(endIndex + 1)
  ];
  
  fs.writeFileSync(path, newLines.join('\n'));
  console.log('Fixed Tabs layout successfully');
} else {
  console.error('Could not find markers');
}
