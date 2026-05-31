import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
  Edit2,
  Eye,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceForms } from "@/api/rsvps";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/$workspaceSlug/rsvps/")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { workspaceSlug } = Route.useParams();
  const [search, setSearch] = useState("");

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["workspace-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const filteredForms = forms.filter(
    (f: any) => !search || f.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RSVP Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage custom registration forms for{" "}
            {activeWorkspace?.name || "your workspace"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/$workspaceSlug/rsvps/create" params={{ workspaceSlug }}>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Create Form
            </Button>
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Forms</p>
              <h3 className="text-3xl font-bold mt-2">{forms.filter((f) => f.is_active).length}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <LayoutTemplate className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
              <h3 className="text-3xl font-bold mt-2">
                {forms.reduce((acc, f) => acc + (f.rsvps?.length || 0), 0)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="rounded-full shadow-sm w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center shadow-sm">
          <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No forms found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            You haven't created any custom RSVP forms yet.
          </p>
          <Link to="/dashboard/$workspaceSlug/rsvps/create" params={{ workspaceSlug }}>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Create First Form
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form: any) => (
            <div
              key={form.id}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              onClick={() =>
                navigate({
                  to: "/dashboard/$workspaceSlug/rsvps/$formId",
                  params: {
                    workspaceSlug,
                    formId: form.id,
                  },
                })
              }
            >
              <div className="h-32 w-full bg-secondary relative overflow-hidden">
                <img
                  src={form.cover_image_url || "/default-form-cover.png"}
                  alt={form.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      form.is_active
                        ? "bg-green-500/90 text-white backdrop-blur-sm shadow-sm"
                        : "bg-secondary/90 text-muted-foreground backdrop-blur-sm"
                    }`}
                  >
                    {form.is_active ? "Active" : "Closed"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {form.title}
                  </h3>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full -mt-1 -mr-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
                          }}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" /> Copy Public Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: "/dashboard/$workspaceSlug/rsvps/$formId",
                              params: { workspaceSlug, formId: form.id },
                            })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> View RSVPs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                          <Ban className="mr-2 h-4 w-4" /> Close Form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {form.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                  <div className="flex items-center text-sm font-medium">
                    <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    {form.rsvps?.length || 0} RSVPs
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
