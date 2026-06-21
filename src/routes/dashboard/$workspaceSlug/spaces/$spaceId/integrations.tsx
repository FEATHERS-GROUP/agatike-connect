import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceById, updateSpace } from "@/api/spaces";
import { getWorkspaceForms } from "@/api/rsvps";
import { getAllWorkspacePages } from "@/api/workspace-pages";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Link as LinkIcon,
  FileText,
  LayoutTemplate,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/integrations")({
  component: SpaceIntegrationsPage,
});

function SpaceIntegrationsPage() {
  const { spaceId, workspaceSlug } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: space, isLoading: isSpaceLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: forms } = useQuery({
    queryKey: ["forms", space?.workspace_id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: space?.workspace_id } } as any),
    enabled: !!space?.workspace_id,
  });

  const { data: pages } = useQuery({
    queryKey: ["workspace-pages", space?.workspace_id],
    queryFn: () => getAllWorkspacePages({ data: { workspace_id: space?.workspace_id } } as any),
    enabled: !!space?.workspace_id,
  });

  const [pageId, setPageId] = useState<string>("none");

  type ConnectedForm = { id: string; formId: string; showButton: boolean; buttonText: string };
  const [connectedForms, setConnectedForms] = useState<ConnectedForm[]>([]);

  useEffect(() => {
    if (space) {
      setPageId(space.page_id || "none");
      setConnectedForms(space.connected_forms || []);

      // Migrate legacy single form config if it exists and array is empty
      if ((!space.connected_forms || space.connected_forms.length === 0) && space.rsvp_form_id) {
        setConnectedForms([
          {
            id: crypto.randomUUID(),
            formId: space.rsvp_form_id,
            showButton: space.show_rsvp_form_button !== false,
            buttonText: space.rsvp_form_button_text || "Fill out our form",
          },
        ]);
      }
    }
  }, [space]);

  const updateMutation = useMutation({
    mutationFn: updateSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space", spaceId] });
      toast.success("Integrations updated successfully!");
    },
    onError: (err) => {
      toast.error("Failed to update integrations.");
      console.error(err);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        id: spaceId,
        page_id: pageId === "none" ? null : pageId,
        connected_forms: connectedForms,
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isSpaceLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  const selectedPage = pages?.find((p: any) => p.id === pageId);
  const pageUrl = selectedPage ? `${window.location.origin}/p/${selectedPage.slug}` : "";

  const addForm = () => {
    setConnectedForms([
      ...connectedForms,
      {
        id: crypto.randomUUID(),
        formId: "none",
        showButton: true,
        buttonText: "Fill out our form",
      },
    ]);
  };

  const updateForm = (id: string, updates: Partial<ConnectedForm>) => {
    setConnectedForms(connectedForms.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeForm = (id: string) => {
    setConnectedForms(connectedForms.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-5xl w-full space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Connect your space with custom landing pages and RSVP forms.
        </p>
      </div>

      <div className="space-y-6">
        {/* Custom Page Integration */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="font-bold text-lg">Custom Landing Page</h3>
              <p className="text-sm text-muted-foreground">
                Connect a custom page built with the Page Builder to this space. This serves as your
                personal sharing link.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="w-[280px]">Select Page</TableHead>
                  <TableHead>Public Shareable Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Select value={pageId} onValueChange={setPageId}>
                      <SelectTrigger className="w-full bg-background h-9">
                        <SelectValue placeholder="Select a page to connect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Do not connect)</SelectItem>
                        {pages?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title || "Untitled Page"} ({p.slug})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {selectedPage ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(pageUrl)}
                          title="Copy Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          asChild
                          title="Open Link"
                        >
                          <a href={pageUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPageId("none")}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      disabled={pageId === "none"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* RSVP Form Integration */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="font-bold text-lg">Custom Data Collection (RSVP Forms)</h3>
                <p className="text-sm text-muted-foreground">
                  Connect multiple forms to collect custom information from your space visitors or
                  members.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addForm} className="gap-1.5 rounded-full">
              <Plus className="h-4 w-4" /> Add Form
            </Button>
          </div>

          {connectedForms.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
              <p className="text-sm text-muted-foreground">
                No forms connected. Click "Add Form" to start.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="w-[280px]">Select Form</TableHead>
                    <TableHead>Direct Link</TableHead>
                    <TableHead>Show Button</TableHead>
                    <TableHead>Button Text</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectedForms.map((cForm) => {
                    const selectedForm = forms?.find((f: any) => f.id === cForm.formId);
                    const formUrl = selectedForm
                      ? `${window.location.origin}/f/${selectedForm.id}`
                      : "";

                    return (
                      <TableRow key={cForm.id}>
                        <TableCell>
                          <Select
                            value={cForm.formId}
                            onValueChange={(val) => updateForm(cForm.id, { formId: val })}
                          >
                            <SelectTrigger className="w-full bg-background h-9">
                              <SelectValue placeholder="Select a form..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {forms?.map((f: any) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.title || "Untitled Form"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {selectedForm ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(formUrl)}
                                title="Copy Link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                asChild
                                title="Open Link"
                              >
                                <a href={formUrl} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedForm && (
                            <Switch
                              checked={cForm.showButton}
                              onCheckedChange={(val) => updateForm(cForm.id, { showButton: val })}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedForm && cForm.showButton && (
                            <Input
                              className="h-9 text-sm w-full max-w-[200px]"
                              value={cForm.buttonText}
                              onChange={(e) => updateForm(cForm.id, { buttonText: e.target.value })}
                              placeholder="Button text..."
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeForm(cForm.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-semibold"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <LinkIcon className="h-5 w-5 mr-2" />
            )}
            Save Integrations
          </Button>
        </div>
      </div>
    </div>
  );
}
