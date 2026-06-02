import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspacePage, upsertWorkspacePage } from "@/api/workspace-pages";
import { getWorkspaceForms } from "@/api/rsvps";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, GripVertical, Image as ImageIcon, Type, Link as LinkIcon, Trash2, LayoutTemplate, Columns, AlignLeft, AlignRight, Link2, Users2 } from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/$workspaceSlug/page-builder")({
  component: PageBuilder,
});

function PageBuilder() {
  const { activeWorkspace } = useWorkspace();
  const workspace_id = activeWorkspace?.id;

  const { data: pageData, isLoading: isLoadingPage } = useQuery({
    queryKey: ["workspace-page", workspace_id],
    queryFn: () => getWorkspacePage({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["workspace-forms", workspace_id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState("#000000");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [components, setComponents] = useState<any[]>([]);

  useEffect(() => {
    if (pageData) {
      setSlug(pageData.slug || "");
      setTitle(pageData.title || "");
      setDescription(pageData.description || "");
      setThemeColor(pageData.theme_color || "#000000");
      setHeaderImageUrl(pageData.header_image_url || "");
      setLogoUrl(pageData.logo_url || "");
      setComponents(pageData.components || []);
    }
  }, [pageData]);

  const mutation = useMutation({
    mutationFn: (values: any) => upsertWorkspacePage({ data: values } as any),
    onSuccess: () => {
      toast.success("Page published successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish page.");
    },
  });

  const handlePublish = () => {
    if (!slug) return toast.error("Slug is required.");
    mutation.mutate({
      workspace_id,
      slug,
      title,
      description,
      theme_color: themeColor,
      header_image_url: headerImageUrl,
      logo_url: logoUrl,
      components,
      is_published: true,
    });
  };

  const handleImageUpload = async (file: File, setter: (url: string) => void) => {
    const loadingToast = toast.loading("Uploading image...");
    try {
      const url = await uploadFileToStorage(file, `pages/${workspace_id}/${Date.now()}`);
      setter(url);
      toast.success("Uploaded!", { id: loadingToast });
    } catch (e) {
      toast.error("Failed to upload", { id: loadingToast });
    }
  };

  const addComponent = (type: string) => {
    const newComp: any = { id: Date.now().toString(), type, content: "" };
    
    if (type === "form_link") {
      newComp.content = forms.length > 0 ? forms[0].id : "";
      newComp.design = "card"; // 'card' or 'button'
    } else if (type === "split_block") {
      newComp.text = "";
      newComp.imageUrl = "";
      newComp.imagePosition = "left"; // 'left' or 'right'
    } else if (type === "button") {
      newComp.label = "Click Me";
      newComp.url = "";
    } else if (type === "sponsor_logos") {
      newComp.title = "Our Sponsors";
      newComp.logos = []; // array of { url: string }
    }

    setComponents([...components, newComp]);
  };

  const updateComponent = (index: number, key: string, value: any) => {
    const newComps = [...components];
    newComps[index] = { ...newComps[index], [key]: value };
    setComponents(newComps);
  };

  const removeComponent = (index: number) => {
    const newComps = [...components];
    newComps.splice(index, 1);
    setComponents(newComps);
  };

  const moveComponent = (index: number, dir: number) => {
    if (index + dir < 0 || index + dir >= components.length) return;
    const newComps = [...components];
    const temp = newComps[index];
    newComps[index] = newComps[index + dir];
    newComps[index + dir] = temp;
    setComponents(newComps);
  };

  if (isLoadingPage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-secondary/20">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Landing Page Builder</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Design a custom page for your brand and link your forms.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {
            const previewData = {
              title, description, theme_color: themeColor, header_image_url: headerImageUrl, logo_url: logoUrl, components
            };
            localStorage.setItem("page_preview_data", JSON.stringify(previewData));
            window.open(`/p/${slug || 'preview'}?preview=true`, '_blank');
          }}>
            Preview Page
          </Button>
          <Button onClick={handlePublish} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish Page
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider">Page Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Page URL Slug</Label>
                <div className="flex items-center">
                  <span className="bg-secondary px-3 py-2 rounded-l-md border border-r-0 border-border/60 text-sm text-muted-foreground">/p/</span>
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="my-company"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex items-center gap-3">
                  <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-12 h-12 p-1 rounded-lg" />
                  <span className="text-sm text-muted-foreground font-mono">{themeColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                {logoUrl ? (
                  <div className="relative w-20 h-20 rounded-xl border border-border/60 overflow-hidden group">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white cursor-pointer" onClick={() => setLogoUrl("")} />
                    </div>
                  </div>
                ) : (
                  <Input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], setLogoUrl);
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Builder Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm flex flex-col">
            
            {/* Header Preview / Edit - Made taller to fit text properly */}
            <div className="relative h-80 bg-secondary group flex flex-col items-center justify-center text-center p-6">
              {headerImageUrl ? (
                <img src={headerImageUrl} alt="Header" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-primary/5">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Add Header Cover Image</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Header Image Change UI */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <div className="relative">
                  <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], setHeaderImageUrl);
                  }} />
                  <Button variant="secondary" size="sm" className="pointer-events-none">
                    <ImageIcon className="w-4 h-4 mr-2" /> Change Image
                  </Button>
                </div>
                {headerImageUrl && (
                  <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setHeaderImageUrl(""); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Overlay Text Editing */}
              <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4">
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Hero Title (e.g., Welcome to Acme Corp)" 
                  className="text-3xl md:text-5xl font-bold text-center bg-transparent border-transparent text-white placeholder:text-white/50 focus:bg-black/30 hover:bg-black/20"
                />
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Hero Subtitle or description..."
                  className="w-full text-lg text-center bg-transparent border-transparent text-white/90 placeholder:text-white/50 focus:bg-black/30 hover:bg-black/20 resize-none rounded-md p-2 outline-none focus:ring-1 focus:ring-white/30"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6">
              {/* Components List */}
              <div className="space-y-4">
                {components.map((comp, idx) => (
                  <div key={comp.id} className="relative group border border-border/40 rounded-xl p-4 bg-secondary/20 hover:border-primary/50 transition-colors">
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveComponent(idx, -1)} className="p-1 hover:text-primary"><GripVertical className="w-4 h-4" /></button>
                    </div>

                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => removeComponent(idx)} className="text-destructive bg-background shadow-sm hover:bg-destructive/10 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {comp.type === "text" && (
                      <div className="space-y-2 mt-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Type className="w-3 h-3" /> Text Block</Label>
                        <textarea 
                          value={comp.content} 
                          onChange={(e) => updateComponent(idx, "content", e.target.value)} 
                          placeholder="Write something..."
                          className="w-full min-h-[100px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}

                    {comp.type === "image" && (
                      <div className="space-y-2 mt-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image Block</Label>
                        {comp.url ? (
                          <div className="relative rounded-lg overflow-hidden border border-border/60 group/img">
                            <img src={comp.url} alt="Custom" className="w-full h-auto max-h-[400px] object-contain bg-background" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100">
                               <Button size="sm" variant="destructive" onClick={() => updateComponent(idx, "url", "")}>Change Image</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border/60 rounded-lg p-8 flex flex-col items-center justify-center bg-background">
                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
                            <Input type="file" accept="image/*" className="w-full max-w-xs" onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], (url) => updateComponent(idx, "url", url));
                              }
                            }} />
                          </div>
                        )}
                      </div>
                    )}

                    {comp.type === "split_block" && (
                      <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1"><Columns className="w-3 h-3" /> Split Layout (Image + Text)</Label>
                          <div className="flex items-center bg-background rounded-md border border-border/60 p-1">
                            <button 
                              className={`px-3 py-1 text-xs rounded-sm transition-colors flex items-center gap-1 ${comp.imagePosition === 'left' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
                              onClick={() => updateComponent(idx, "imagePosition", "left")}
                            >
                              <AlignLeft className="w-3 h-3" /> Img Left
                            </button>
                            <button 
                              className={`px-3 py-1 text-xs rounded-sm transition-colors flex items-center gap-1 ${comp.imagePosition === 'right' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
                              onClick={() => updateComponent(idx, "imagePosition", "right")}
                            >
                              Img Right <AlignRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className={`flex flex-col md:flex-row gap-4 ${comp.imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
                          {/* Image Side */}
                          <div className="flex-1 bg-background rounded-lg border border-border/60 overflow-hidden min-h-[200px] flex flex-col relative group/img">
                            {comp.imageUrl ? (
                              <>
                                <img src={comp.imageUrl} alt="Split" className="w-full h-full object-cover absolute inset-0" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                   <Button size="sm" variant="destructive" onClick={() => updateComponent(idx, "imageUrl", "")}>Remove</Button>
                                </div>
                              </>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                                <Input type="file" accept="image/*" className="w-full max-w-[200px] text-xs" onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleImageUpload(e.target.files[0], (url) => updateComponent(idx, "imageUrl", url));
                                  }
                                }} />
                              </div>
                            )}
                          </div>
                          
                          {/* Text Side */}
                          <div className="flex-1">
                            <textarea 
                              value={comp.text} 
                              onChange={(e) => updateComponent(idx, "text", e.target.value)} 
                              placeholder="Write accompanying text here..."
                              className="w-full h-full min-h-[200px] bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.type === "button" && (
                      <div className="space-y-4 mt-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Link2 className="w-3 h-3" /> Action Button</Label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Button Label</Label>
                            <Input 
                              value={comp.label} 
                              onChange={(e) => updateComponent(idx, "label", e.target.value)} 
                              placeholder="e.g. Buy Tickets"
                              className="bg-background"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Link URL</Label>
                            <Input 
                              value={comp.url} 
                              onChange={(e) => updateComponent(idx, "url", e.target.value)} 
                              placeholder="https://..."
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.type === "form_link" && (
                      <div className="space-y-4 mt-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Form Link Card</Label>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-[2] space-y-1">
                            <Label className="text-xs">Select Form</Label>
                            <Select value={comp.content} onValueChange={(val) => updateComponent(idx, "content", val)}>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select a form to link" />
                              </SelectTrigger>
                              <SelectContent>
                                {forms.filter((f:any) => f.is_active).map((f: any) => (
                                  <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Design Type</Label>
                            <Select value={comp.design || "card"} onValueChange={(val) => updateComponent(idx, "design", val)}>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="card">Large Card</SelectItem>
                                <SelectItem value="button">Simple Button</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {comp.content && comp.design !== "button" && (
                          <div className="mt-3 p-4 border border-primary/20 rounded-lg bg-primary/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded bg-primary/20 flex-shrink-0" />
                            <div className="flex-1 truncate">
                              <p className="font-semibold text-sm truncate">{forms.find((f:any) => f.id === comp.content)?.title}</p>
                              <p className="text-xs text-muted-foreground truncate">Card will be generated automatically</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {comp.type === "sponsor_logos" && (
                      <div className="space-y-4 mt-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Users2 className="w-3 h-3" /> Logos / Sponsors Grid</Label>
                        <Input 
                          value={comp.title} 
                          onChange={(e) => updateComponent(idx, "title", e.target.value)} 
                          placeholder="Grid Title (e.g. Our Sponsors)"
                          className="bg-background"
                        />
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                          {comp.logos?.map((logo: any, logoIdx: number) => (
                            <div key={logoIdx} className="relative group/logo border border-border/60 rounded-md overflow-hidden aspect-video bg-background flex items-center justify-center p-2">
                              <img src={logo.url} alt="Logo" className="w-full h-full object-contain" />
                              <button 
                                onClick={() => {
                                  const newLogos = [...comp.logos];
                                  newLogos.splice(logoIdx, 1);
                                  updateComponent(idx, "logos", newLogos);
                                }}
                                className="absolute top-1 right-1 bg-destructive/90 text-white p-1 rounded opacity-0 group-hover/logo:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="relative border-2 border-dashed border-border/60 rounded-md aspect-video flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary transition-colors cursor-pointer">
                            <Plus className="w-4 h-4 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Add Logo</span>
                            <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], (url) => {
                                  updateComponent(idx, "logos", [...(comp.logos || []), { url }]);
                                });
                              }
                            }} />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Add Component Menu */}
              <div className="mt-8 border-t border-dashed border-border/60 pt-6">
                <p className="text-sm font-medium mb-4">Add Component Block</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("text")}>
                    <Type className="w-4 h-4" /> Text
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("image")}>
                    <ImageIcon className="w-4 h-4" /> Image
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("split_block")}>
                    <Columns className="w-4 h-4" /> Split Layout
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("button")}>
                    <Link2 className="w-4 h-4" /> Button
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("form_link")}>
                    <LayoutTemplate className="w-4 h-4" /> Form Link
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => addComponent("sponsor_logos")}>
                    <Users2 className="w-4 h-4" /> Logos Grid
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
