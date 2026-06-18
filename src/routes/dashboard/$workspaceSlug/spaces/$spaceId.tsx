import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import {
  ArrowLeft,
  MapPin,
  Building2,
  CreditCard,
  Users,
  Settings,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId")({
  component: SpaceDetailsPage,
});

function SpaceDetailsPage() {
  const { workspaceSlug, spaceId } = useParams({ from: "/dashboard/$workspaceSlug/spaces/$spaceId" });
  const { activeWorkspace } = useWorkspace();

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Loading space details...
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-2xl border border-dashed">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Space Not Found</h3>
        <p className="text-muted-foreground mb-6">The space you are looking for does not exist.</p>
        <Button asChild>
          <Link to={`/dashboard/${workspaceSlug}/spaces`}>Back to Spaces</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 shrink-0 bg-secondary/50" asChild>
          <Link to={`/dashboard/${workspaceSlug}/spaces`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{space.name}</h1>
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {space.type}
            </span>
            <span
              className={`${
                space.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
              } px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
            >
              {space.status}
            </span>
          </div>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Settings className="h-4 w-4" /> Settings
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 border-b border-border/60 w-full justify-start rounded-none space-x-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-semibold"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="locations"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-semibold"
          >
            Locations ({space.locations?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-semibold"
          >
            Membership Plans ({space.plans?.length || 0})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">About this space</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {space.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border/60 rounded-3xl p-1 overflow-hidden shadow-sm aspect-[4/3]">
                  <img
                    src={space.cover_url}
                    alt={space.name}
                    className="w-full h-full object-cover rounded-[20px] bg-secondary"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">Manage Locations</h3>
                <p className="text-sm text-muted-foreground">Add or remove locations for this space.</p>
              </div>
              <Button className="gap-2 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <Plus className="h-4 w-4" /> Add Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {space.locations?.map((loc: any, idx: number) => (
                <div key={idx} className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{loc.name}</h4>
                      <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
                        <MapPin className="h-3.5 w-3.5" /> {loc.address}, {loc.city} ({loc.country})
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">Membership Plans</h3>
                <p className="text-sm text-muted-foreground">Manage pricing and subscription options.</p>
              </div>
              <Button className="gap-2 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <Plus className="h-4 w-4" /> Add Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {space.plans?.map((plan: any, idx: number) => (
                <div key={idx} className="flex flex-col bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl">{plan.name}</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-6">
                    {space.currency} {Number(plan.price || 0).toLocaleString()}
                  </div>
                  <div className="space-y-2 flex-1">
                    {plan.features?.map((feat: string, fIdx: number) => (
                      feat && (
                        <div key={fIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
