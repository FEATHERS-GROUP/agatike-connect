const fs = require('fs');
const path = '/Users/apple/Desktop/agatike-connect/src/routes/dashboard/$workspaceSlug/experiences/$experienceId/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Icons
content = content.replace(
  'CheckCircle2',
  'CheckCircle2,\n  CheckCircle,\n  PackagePlus,\n  ShoppingBag,\n  User'
);

// 2. Add TabsTrigger
content = content.replace(
  '<TabsTrigger value="schedules" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Upcoming Schedules</TabsTrigger>',
  '<TabsTrigger value="schedules" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Upcoming Schedules</TabsTrigger>\n              <TabsTrigger value="addons" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Products & Add-ons</TabsTrigger>'
);

// 3. Add Included section in Overview
const reqEnd = `                  </ul>
                </div>
              )}`;
const includedSection = `

              {/* INCLUDED SECTION */}
              {experience.included && experience.included.length > 0 && (
                <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                  <h3 className="text-xl font-semibold mb-1">What's Included</h3>
                  <p className="text-sm text-muted-foreground mb-6">Items and perks included in your ticket price.</p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {experience.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/90 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}`;
content = content.replace(reqEnd, reqEnd + includedSection);

// 4. Add Addons Tab
const addonsTab = `

          <TabsContent value="addons" className="space-y-6 mt-0">
            <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Products & Add-ons</h3>
                  <p className="text-sm text-muted-foreground">Optional rentals and merchandise for attendees.</p>
                </div>
                <Button className="rounded-full shadow-sm" style={{ background: "var(--gradient-primary)" }}>
                  <PackagePlus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </div>

              {experience.addons && experience.addons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {experience.addons.map((addon) => (
                    <div key={addon.id} className="rounded-2xl border border-border/60 p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-foreground line-clamp-2">{addon.name}</h4>
                          <span className="font-bold text-primary shrink-0">
                            {formatCurrency(addon.price, experience.currency || activeWorkspace?.currency)}
                          </span>
                        </div>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                            {addon.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-border/60 rounded-2xl">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">No add-ons available.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Offer optional extras for your attendees.</p>
                </div>
              )}
            </div>
          </TabsContent>`;

content = content.replace(
  `            )}
          </TabsContent>
        </Tabs>`,
  `            )}
          </TabsContent>${addonsTab}
        </Tabs>`
);

// 5. Replace Sidebar Organizer with Team
const sidebarOriginal = `<h3 className="font-semibold text-lg mb-4">Organizer</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border-2 border-border">
                {/* Fallback avatar */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-lg">
                  {experience.host.charAt(0)}
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">{experience.host}</p>
                <p className="text-xs text-muted-foreground">Host & Guide</p>
              </div>
            </div>`;

const sidebarTeam = `<h3 className="font-semibold text-lg mb-4">Meet the Team</h3>
            {experience.team && experience.team.length > 0 ? (
              <div className="space-y-4 mb-6">
                {experience.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border-2 border-border/50 shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-sm">
                        {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">No team members assigned.</p>
            )}`;

content = content.replace(sidebarOriginal, sidebarTeam);

fs.writeFileSync(path, content);
console.log('done!');
