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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link as LinkIcon, FileText, LayoutTemplate, Copy, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
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
            buttonText: space.rsvp_form_button_text || "Fill out our form"
          }
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
    setConnectedForms([...connectedForms, { id: crypto.randomUUID(), formId: "none", showButton: true, buttonText: "Fill out our form" }]);
  };

  const updateForm = (id: string, updates: Partial<ConnectedForm>) => {
    setConnectedForms(connectedForms.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeForm = (id: string) => {
    setConnectedForms(connectedForms.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Connect your space with custom landing pages and RSVP forms.
        </p>
      </div>

      <div className="space-y-6">
        {/* Custom Page Integration */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <LayoutTemplate className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg">Custom Landing Page</h3>
                <p className="text-sm text-muted-foreground">
                  Connect a custom page built with the Page Builder to this space. This serves as your personal sharing link.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select a Page</Label>
                <Select value={pageId} onValueChange={setPageId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a page to connect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Do not connect a page)</SelectItem>
                    {pages?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title || "Untitled Page"} ({p.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPage && (
                <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">
                    Public Shareable Link
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={pageUrl} className="bg-background" />
                    <Button variant="secondary" size="icon" onClick={() => copyToClipboard(pageUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={pageUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RSVP Form Integration */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
              <FileText className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">Custom Data Collection (RSVP Forms)</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect multiple forms to collect custom information from your space visitors or members.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addForm} className="gap-1.5 rounded-full">
                  <Plus className="h-4 w-4" /> Add Form
                </Button>
              </div>

              {connectedForms.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                  <p className="text-sm text-muted-foreground">No forms connected. Click "Add Form" to start.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {connectedForms.map((cForm, index) => {
                    const selectedForm = forms?.find((f: any) => f.id === cForm.formId);
                    const formUrl = selectedForm ? `${window.location.origin}/f/${selectedForm.id}` : "";

                    return (
                      <div key={cForm.id} className="relative bg-card border border-border/60 rounded-2xl p-5 space-y-5">
                        <div className="absolute top-4 right-4">
                          <Button variant="ghost" size="icon" onClick={() => removeForm(cForm.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 pr-10">
                          <Label>Select a Form</Label>
                          <Select value={cForm.formId} onValueChange={(val) => updateForm(cForm.id, { formId: val })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an RSVP form to connect" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (Select a form)</SelectItem>
                              {forms?.map((f: any) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.title || "Untitled Form"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedForm && (
                          <>
                            <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Show button on Space Details</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Display a button linking to this form.
                                  </p>
                                </div>
                                <Switch checked={cForm.showButton} onCheckedChange={(val) => updateForm(cForm.id, { showButton: val })} />
                              </div>

                              {cForm.showButton && (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                  <Label>Button Text</Label>
                                  <Input 
                                    value={cForm.buttonText} 
                                    onChange={(e) => updateForm(cForm.id, { buttonText: e.target.value })} 
                                    placeholder="e.g. Fill out our form" 
                                  />
                                </div>
                              )}
                            </div>

                            <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">
                                Direct Form Link
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input readOnly value={formUrl} className="bg-background text-sm" />
                                <Button variant="secondary" size="icon" onClick={() => copyToClipboard(formUrl)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                  <a href={formUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending} 
            className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-semibold"
          >
            {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LinkIcon className="h-5 w-5 mr-2" />}
            Save Integrations
          </Button>
        </div>
      </div>
    </div>
  );
}
