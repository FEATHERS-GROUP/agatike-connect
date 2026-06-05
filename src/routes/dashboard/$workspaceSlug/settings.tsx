import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { updateDatabaseWorkspace, disableDatabaseWorkspace } from "@/api/workspaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import {
  Save,
  AlertTriangle,
  Building2,
  Trash2,
  Image as ImageIcon,
  Pencil,
  X,
  Dices,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/settings")({
  component: WorkspaceSettings,
});

function WorkspaceSettings() {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<any>({});
  const [disableConfirmWorkspace, setDisableConfirmWorkspace] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteAgreed, setDeleteAgreed] = useState(false);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("bottts");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const CATEGORIES = [
    { id: "bottts", label: "Robots" },
    { id: "shapes", label: "Shapes" },
    { id: "identicon", label: "Patterns" },
    { id: "adventurer", label: "Characters" },
    { id: "fun-emoji", label: "Emojis" },
    { id: "micah", label: "Stylized" },
    { id: "avataaars", label: "People" },
    { id: "big-smile", label: "Smiles" },
    { id: "lorelei", label: "Cute" },
    { id: "pixel-art", label: "8-Bit" },
    { id: "initials", label: "Initials" },
    { id: "rings", label: "Rings" },
  ];

  const generateAvatarsForCategory = (category: string) => {
    const BACKGROUND_COLORS = [
      "b6e3f4",
      "c0aede",
      "ffdfbf",
      "ffd5dc",
      "d1d4f9",
      "c0aede",
      "b6e3f4",
      "ffdfbf",
    ];
    return Array.from({ length: 12 }).map(() => {
      const bg = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${bg}`;
    });
  };

  useEffect(() => {
    if (isAvatarModalOpen) {
      setAvatarOptions(generateAvatarsForCategory(activeCategory));
    }
  }, [activeCategory, isAvatarModalOpen]);

  useEffect(() => {
    if (activeWorkspace) {
      setFormState({
        id: activeWorkspace.id,
        name: activeWorkspace.name || "",
        type: activeWorkspace.type || "",
        city: activeWorkspace.city || "",
        country: activeWorkspace.country || "",
        address: activeWorkspace.address || "",
        moduls: activeWorkspace.moduls || [],
        icon: activeWorkspace.icon || "",
        currency: activeWorkspace.currency || "RWF",
      });
    }
  }, [activeWorkspace]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await updateDatabaseWorkspace({ data }),
    onSuccess: () => {
      toast.success("Workspace updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => toast.error(error.message || "Failed to update workspace."),
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => await disableDatabaseWorkspace({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Workspace disabled successfully!");
      setDisableConfirmWorkspace(null);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      window.location.href = "/dashboard/workspaces";
    },
    onError: (error) => toast.error(error.message || "Failed to disable workspace."),
  });

  if (!activeWorkspace) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 pt-8">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your workspace profile, modules, and configurations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-full gap-2 shadow-sm"
              >
                <Pencil className="h-4 w-4" /> Edit Details
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    if (activeWorkspace) {
                      setFormState({
                        ...activeWorkspace,
                        icon: activeWorkspace.icon || "",
                      });
                    }
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMutation.mutate(formState)}
                  disabled={updateMutation.isPending}
                  className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Save className="h-4 w-4" />{" "}
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="col-span-1 space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Workspace Logo</h3>
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 shrink-0 rounded-2xl border-2 border-border/60 overflow-hidden bg-secondary/30 flex items-center justify-center">
                  {formState.icon?.startsWith("data:image") ||
                  formState.icon?.startsWith("http") ? (
                    <img src={formState.icon} alt="Logo" className="h-full w-full object-cover" />
                  ) : formState.icon ? (
                    <span className="text-4xl">{formState.icon}</span>
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-2 w-full">
                    <label className="cursor-pointer w-full">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) =>
                              setFormState({ ...formState, icon: e.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
                        Upload New Image
                      </div>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl h-10 w-full"
                      onClick={() => setIsAvatarModalOpen(true)}
                    >
                      Choose Avatar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-destructive mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you disable a workspace, there is no going back from the dashboard. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                onClick={() => setDisableConfirmWorkspace(activeWorkspace)}
              >
                Disable Workspace
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Workspace Details
              </h3>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  {isEditing ? (
                    <Input
                      value={formState.name || ""}
                      className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  ) : (
                    <p className="p-3 bg-secondary/30 rounded-xl text-sm">
                      {formState.name || "-"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    {isEditing ? (
                      <Input
                        value={formState.type || ""}
                        placeholder="e.g. Venue, Club, Agency"
                        className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                        onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-xl text-sm">
                        {formState.type || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    {isEditing ? (
                      <Input
                        value={formState.city || ""}
                        className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                        onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-xl text-sm">
                        {formState.city || "-"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  {isEditing ? (
                    <Input
                      value={formState.country || ""}
                      className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                      onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                    />
                  ) : (
                    <p className="p-3 bg-secondary/30 rounded-xl text-sm">
                      {formState.country || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  {isEditing ? (
                    <select
                      value={formState.currency || "RWF"}
                      className="w-full rounded-xl bg-secondary/50 border-transparent focus:border-primary px-3 py-2 text-sm"
                      onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                    >
                      <option value="RWF">RWF - Rwandan Franc</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="UGX">UGX - Ugandan Shilling</option>
                    </select>
                  ) : (
                    <p className="p-3 bg-secondary/30 rounded-xl text-sm uppercase font-semibold">
                      {formState.currency || "RWF"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Full Address</Label>
                  {isEditing ? (
                    <AddressAutocomplete
                      value={formState.address || ""}
                      className="rounded-xl bg-secondary/50 border-transparent focus:border-primary"
                      onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    />
                  ) : (
                    <p className="p-3 bg-secondary/30 rounded-xl text-sm">
                      {formState.address || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disable Workspace Confirmation Modal */}
      <Dialog
        open={!!disableConfirmWorkspace}
        onOpenChange={(open) => {
          if (!open) {
            setDisableConfirmWorkspace(null);
            setDeleteConfirmName("");
            setDeleteConfirmText("");
            setDeleteAgreed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-3xl bg-card border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl">Disable Workspace?</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to disable <strong>{disableConfirmWorkspace?.name}</strong>?
              This will remove your access and hide it from the platform. This action cannot be
              undone from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2 space-y-4">
            <div className="space-y-2">
              <Label>
                Type workspace name (<strong>{disableConfirmWorkspace?.name}</strong>)
              </Label>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={disableConfirmWorkspace?.name}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Type "delete" to confirm</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="rounded-xl"
              />
            </div>
            <label className="flex items-start gap-3 mt-4 cursor-pointer p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border shrink-0"
                checked={deleteAgreed}
                onChange={(e) => setDeleteAgreed(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground leading-tight">
                I understand that once deleted, this workspace and all its data will be hard to
                recover.
              </span>
            </label>
          </div>
          <div className="pt-4 flex gap-3 border-t border-border/40 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={() => {
                setDisableConfirmWorkspace(null);
                setDeleteConfirmName("");
                setDeleteConfirmText("");
                setDeleteAgreed(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl h-11"
              disabled={
                disableMutation.isPending ||
                deleteConfirmName !== disableConfirmWorkspace?.name ||
                deleteConfirmText.toLowerCase() !== "delete" ||
                !deleteAgreed
              }
              onClick={() => disableMutation.mutate(disableConfirmWorkspace.id)}
            >
              {disableMutation.isPending ? "Disabling..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Modal Overlay */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">Choose an Avatar</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b border-border/60 bg-secondary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-4 gap-4">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => {
                    setFormState({ ...formState, icon: avatar });
                    setIsAvatarModalOpen(false);
                  }}
                  className={`aspect-square w-full rounded-2xl border-2 flex items-center justify-center transition-all overflow-hidden ${
                    formState.icon === avatar
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                      : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-105"
                  }`}
                >
                  <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-secondary/20 flex justify-end">
              <Button
                onClick={() => setAvatarOptions(generateAvatarsForCategory(activeCategory))}
                variant="outline"
                className="rounded-xl gap-2 w-full"
              >
                <Dices className="h-4 w-4" /> Randomize Options
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
