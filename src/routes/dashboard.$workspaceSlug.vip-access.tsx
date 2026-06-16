import { createFileRoute } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Crown, CarFront, Star, Wine, Ticket, Trash2, Edit2, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceVipPrivileges, createVipPrivilege, updateVipPrivilege, deleteVipPrivilege, VipPrivilege, VipField } from "@/api/vip";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/vip-access")({
  component: VipAccessPage,
});

const TEMPLATES = [
  {
    name: "Free Parking",
    description: "Dedicated parking spots near the venue entrance.",
    icon: "CarFront",
    fields: [
      { id: "plate", name: "License Plate Number", type: "text", required: true }
    ]
  },
  {
    name: "Backstage Pass",
    description: "Exclusive access to the backstage and artist areas.",
    icon: "Star",
    fields: [
      { id: "shirt", name: "T-Shirt Size", type: "text", required: true }
    ]
  },
  {
    name: "VIP Lounge Access",
    description: "Access to the VIP lounge with complimentary drinks.",
    icon: "Wine",
    fields: []
  },
  {
    name: "Fast Track Entry",
    description: "Skip the queue and enter through the VIP lane.",
    icon: "Ticket",
    fields: []
  }
];

const ICONS: Record<string, React.ReactNode> = {
  Crown: <Crown className="w-5 h-5" />,
  CarFront: <CarFront className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Wine: <Wine className="w-5 h-5" />,
  Ticket: <Ticket className="w-5 h-5" />
};

function VipAccessPage() {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<VipPrivilege | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Crown");
  const [fields, setFields] = useState<VipField[]>([]);

  const { data: privileges = [], isLoading } = useQuery({
    queryKey: ["vip_privileges", activeWorkspace?.id],
    queryFn: () => getWorkspaceVipPrivileges({ data: { workspace_id: activeWorkspace!.id } }),
    enabled: !!activeWorkspace,
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createVipPrivilege({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vip_privileges"] });
      toast.success("Privilege created successfully!");
      setIsModalOpen(false);
    }
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => updateVipPrivilege({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vip_privileges"] });
      toast.success("Privilege updated successfully!");
      setIsModalOpen(false);
    }
  });

  const deleteMut = useMutation({
    mutationFn: (data: { id: string }) => deleteVipPrivilege({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vip_privileges"] });
      toast.success("Privilege deleted.");
    }
  });

  const openNew = () => {
    setEditingPrivilege(null);
    setName("");
    setDescription("");
    setIcon("Crown");
    setFields([]);
    setIsModalOpen(true);
  };

  const openEdit = (p: VipPrivilege) => {
    setEditingPrivilege(p);
    setName(p.name);
    setDescription(p.description || "");
    setIcon(p.icon || "Crown");
    setFields(p.fields || []);
    setIsModalOpen(true);
  };

  const applyTemplate = (t: any) => {
    setName(t.name);
    setDescription(t.description);
    setIcon(t.icon);
    setFields(t.fields);
  };

  const addField = () => {
    setFields([...fields, { id: Math.random().toString(), name: "New Field", type: "text", required: true }]);
  };

  const updateField = (idx: number, key: string, val: any) => {
    const nf = [...fields];
    nf[idx] = { ...nf[idx], [key]: val };
    setFields(nf);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name) return toast.error("Name is required");
    if (!activeWorkspace) return;

    if (editingPrivilege) {
      updateMut.mutate({ id: editingPrivilege.id, name, description, icon, fields });
    } else {
      createMut.mutate({ workspace_id: activeWorkspace.id, name, description, icon, fields });
    }
  };

  return (
    <div className="flex-1 space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">VIP Access Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Define VIP perks and privileges. These can be assigned to ticket tiers to offer exclusive access or collect data (e.g., License Plates for Free Parking).
          </p>
        </div>
        <Button onClick={openNew} className="h-10 px-4">
          <Plus className="mr-2 h-4 w-4" /> Create Privilege
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading privileges...</div>}
        {!isLoading && privileges.length === 0 && (
          <div className="col-span-full border border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No privileges defined</h3>
            <p className="text-sm mt-1 mb-4">You haven't set up any VIP privileges yet.</p>
            <Button variant="outline" onClick={openNew}>Create your first privilege</Button>
          </div>
        )}
        
        {privileges.map((p) => (
          <Card key={p.id} className="relative group overflow-hidden border-border/50 hover:border-border transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {ICONS[p.icon] || <Crown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description || "No description"}</p>
                  </div>
                </div>
              </div>
              
              {p.fields && p.fields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Requires Form Data</p>
                  <div className="flex flex-wrap gap-2">
                    {p.fields.map(f => (
                      <span key={f.id} className="text-xs bg-secondary px-2 py-0.5 rounded-md text-foreground">{f.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {
                  if (confirm("Are you sure you want to delete this privilege?")) deleteMut.mutate({ id: p.id });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl border-border/40 p-0 overflow-hidden">
          <div className="flex h-[600px]">
            {/* Left Sidebar: Templates */}
            {!editingPrivilege && (
              <div className="w-64 bg-secondary/30 border-r border-border/40 p-4 flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                  <LayoutTemplate className="w-4 h-4" />
                  Templates
                </div>
                {TEMPLATES.map((t, i) => (
                  <button 
                    key={i}
                    onClick={() => applyTemplate(t)}
                    className="flex flex-col text-left bg-background border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-primary">{ICONS[t.icon]}</div>
                      <span className="font-medium text-sm">{t.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{t.description}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Form */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPrivilege ? "Edit VIP Privilege" : "Create VIP Privilege"}</DialogTitle>
                <DialogDescription>Define what this privilege offers and what information you need from the attendee.</DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-6 flex-1">
                <div className="flex gap-4">
                  <div className="w-24">
                    <Label className="text-xs font-medium">Icon</Label>
                    <Select value={icon} onValueChange={setIcon}>
                      <SelectTrigger className="mt-1.5 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ICONS).map(k => (
                          <SelectItem key={k} value={k}>
                            <div className="flex items-center justify-center w-full">{ICONS[k]}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Privilege Name</Label>
                    <Input className="mt-1.5 h-10" placeholder="e.g. Free Parking" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Input className="mt-1.5 h-10" placeholder="Describe the perk..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold">Attendee Data Form</h4>
                      <p className="text-xs text-muted-foreground">Fields the attendee must fill out when claiming this privilege.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addField}>
                      <Plus className="w-3 h-3 mr-1" /> Add Field
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {fields.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No data collection fields required for this privilege.</p>
                    )}
                    {fields.map((f, idx) => (
                      <div key={f.id} className="flex gap-2 items-center bg-secondary/20 p-2 rounded-lg border border-border/50">
                        <Input className="h-9 flex-1 text-sm bg-background" placeholder="Field Label (e.g. License Plate)" value={f.name} onChange={e => updateField(idx, "name", e.target.value)} />
                        <Select value={f.type} onValueChange={val => updateField(idx, "type", val as any)}>
                          <SelectTrigger className="h-9 w-[120px] bg-background text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeField(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-8 pt-4 border-t border-border/40">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                  {editingPrivilege ? "Save Changes" : "Create Privilege"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
