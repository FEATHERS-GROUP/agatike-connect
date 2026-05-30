import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Ticket, Film, Mountain, Briefcase, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ticketProjects } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceEvents } from "@/api/events";

export const Route = createFileRoute("/dashboard/$workspaceSlug/ticket-designer/")({
  component: TicketDesignerIndex,
});

const templates = [
  { id: "concert", label: "Concert / Event", icon: Ticket, desc: "Classic stub for live shows and general admission events.", bg: "bg-orange-500/10 text-orange-500" },
  { id: "movie", label: "Movie / Cinema", icon: Film, desc: "Tear-off stub design for screenings and premieres.", bg: "bg-red-500/10 text-red-500" },
  { id: "experience", label: "Experience", icon: Mountain, desc: "Clean and visual for outdoor activities and tours.", bg: "bg-green-500/10 text-green-500" },
  { id: "conference", label: "Conference", icon: Briefcase, desc: "Badge-style with attendee details for corporate events.", bg: "bg-blue-500/10 text-blue-500" },
];

function TicketDesignerIndex() {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/ticket-designer/" });
  const { activeWorkspace } = useWorkspace();

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("Untitled Project");
  const [selectedEventId, setSelectedEventId] = useState("");

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedEventId) return;
    
    // Generate a random ID for the new project
    const newId = "proj-" + Math.random().toString(36).substring(2, 9);
    
    const search: any = { template: selectedTemplate };
    if (selectedEventId) search.eventId = selectedEventId;
    if (newProjectName) search.name = newProjectName;

    navigate({ 
      to: "/dashboard/$workspaceSlug/ticket-designer/$projectId", 
      params: {
        workspaceSlug,
        projectId: newId,
      },
      search 
    });
    setIsModalOpen(false);
  };

  const openSetupModal = (templateId: string) => {
    setSelectedTemplate(templateId);
    setNewProjectName("Untitled Project");
    setSelectedEventId("");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Dashboard / Tools</p>
            <h1 className="text-lg font-semibold">Ticket Projects</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 lg:p-10 space-y-12">
        {/* New Project Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Create New Project</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a starting template for your next event.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => openSetupModal(t.id)}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border border-border/60 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className={`p-3 rounded-2xl ${t.bg}`}>
                  <t.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  Select Template <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Setup Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Setup Ticket Project</DialogTitle>
              <DialogDescription>
                Link this design to an existing event. You can preview all ticket tiers inside the editor.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNew} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Summer VIP Tickets"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventSelect">Select Event *</Label>
                <select
                  id="eventSelect"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select Event --</option>
                  {events.map((ev: any) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Start Designing</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Saved Projects Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Saved Projects</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage and edit your existing ticket designs.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketProjects.map(proj => (
              <Link
                key={proj.id}
                to="/dashboard/$workspaceSlug/ticket-designer/$projectId"
                params={{
                  workspaceSlug,
                  projectId: proj.id,
                }}
                className="group block rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div 
                  className="h-32 p-4 flex flex-col justify-between"
                  style={{ background: `linear-gradient(135deg, ${proj.palette.from}, ${proj.palette.to})` }}
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-black/20 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {proj.template}
                    </span>
                  </div>
                  <div className="text-white drop-shadow-md">
                    <p className="text-sm opacity-80">{proj.subtitle}</p>
                    <h3 className="text-xl font-bold leading-tight">{proj.title}</h3>
                  </div>
                </div>
                <div className="p-5 bg-card">
                  <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{proj.name}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
