import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizerProfile,
  updateOrganizerProfile,
  changeOrganizerPassword,
} from "@/api/organizers";
import { disableDatabaseWorkspace } from "@/api/workspaces";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceWallet, getWalletTransactions } from "@/api/wallet";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { SettingsOverviewTab } from "@/components/dashboard/settings/SettingsOverviewTab";
import { SettingsSocialTab } from "@/components/dashboard/settings/SettingsSocialTab";
import { SettingsSecurityTab } from "@/components/dashboard/settings/SettingsSecurityTab";
import { SettingsIntegrationsTab } from "@/components/dashboard/settings/SettingsIntegrationsTab";
import { SettingsProfileSidebar } from "@/components/dashboard/settings/SettingsProfileSidebar";
import { Camera, Globe, ArrowLeft, X, Dices } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(3, "Handle must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

const CATEGORIES = [
  { id: "bottts", label: "Robots" },
  { id: "shapes", label: "Shapes" },
  { id: "identicon", label: "Patterns" },
  { id: "adventurer", label: "Characters" },
  { id: "fun-emoji", label: "Emojis" },
  { id: "micah", label: "Stylized" },
];

const generateAvatars = (category: string) => {
  const bg = ["b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9"];
  return Array.from({ length: 12 }).map(() => {
    const color = bg[Math.floor(Math.random() * bg.length)];
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${color}`;
  });
};

function SettingsPage() {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllEarnings, setShowAllEarnings] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "security" | "integrations">(
    "overview",
  );
  const [avatar, setAvatar] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("identicon");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["organizerProfile"],
    queryFn: async () => await getOrganizerProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        handle: profile.handle || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        instagram: profile.socials?.instagram || "",
        twitter: profile.socials?.twitter || "",
        youtube: profile.socials?.youtube || "",
      });
      setAvatar(
        profile.image ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.id || "org"}&backgroundColor=f3f4f6`,
      );
    }
  }, [profile, reset]);

  useEffect(() => {
    if (isAvatarModalOpen) setAvatarOptions(generateAvatars(activeCategory));
  }, [activeCategory, isAvatarModalOpen]);

  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue && !isDirty) {
      setValue("handle", nameValue.toLowerCase().replace(/[^a-z0-9]/g, ""), {
        shouldValidate: true,
      });
    }
  }, [nameValue, setValue, isDirty]);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;

    const q = query(
      collection(db, "agatike_notifications"),
      where("organizerId", "==", activeWorkspace.orgnizer_id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((n: any) => n.actorId !== activeWorkspace.orgnizer_id);

      notifs.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setNotifications(notifs.slice(0, 20)); // Keep latest 20
    });

    return () => unsubscribe();
  }, [activeWorkspace?.orgnizer_id]);

  const { data: transactions } = useQuery({
    queryKey: ["platform-earnings", activeWorkspace?.id],
    queryFn: async () => {
      if (!activeWorkspace?.id) return [];
      const wallet = await getWorkspaceWallet({
        data: { workspace_id: activeWorkspace.id },
      } as any);
      if (!wallet || !wallet.id) return [];
      const txs = await getWalletTransactions({ data: { wallet_id: wallet.id } } as any);
      return txs.slice(0, 20);
    },
    enabled: !!activeWorkspace?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { instagram, twitter, youtube, ...core } = values;
      return await updateOrganizerProfile({
        data: { ...core, image: avatar, socials: { instagram, twitter, youtube } } as any,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
    },
    onError: (err) => toast.error(err.message || "Failed to update profile"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      return await changeOrganizerPassword({
        data: { currentPassword: values.currentPassword, newPassword: values.newPassword } as any,
      });
    },
    onSuccess: () => {
      toast.success("Password changed!");
      passwordForm.reset();
    },
    onError: (err) => toast.error(err.message || "Failed to change password"),
  });

  const disableWorkspaceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await disableDatabaseWorkspace({ data: { id } } as any);
    },
    onSuccess: () => {
      toast.success("Workspace disabled.");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (err) => toast.error(err.message || "Failed to disable workspace"),
  });

  const handleSaveAll = () => {
    if (activeTab === "security")
      passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))();
    else handleSubmit((d) => updateMutation.mutate(d))();
  };

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading profile...</div>;

  const isSaving = updateMutation.isPending || changePasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="px-6 md:px-10 py-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src="/agatike-logo.svg" alt="Agatike" className="h-6" />
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            {isSaving ? "Saving..." : "+ Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border">
          {[
            { id: "overview", label: "Overview" },
            { id: "social", label: "Social Links" },
            { id: "security", label: "Security" },
            { id: "integrations", label: "Integrations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row mt-8">
          {/* Left Column */}
          <SettingsProfileSidebar
            avatar={avatar}
            setIsAvatarModalOpen={setIsAvatarModalOpen}
            register={register}
            errors={errors}
          />

          {/* Right Column */}
          <div className="flex-1 md:pl-10 pb-20">
            {activeTab === "overview" && (
              <SettingsOverviewTab
                workspaces={workspaces}
                navigate={navigate}
                disableWorkspaceMutation={disableWorkspaceMutation}
                setIsWizardOpen={setIsWizardOpen}
                notifications={notifications}
                showAllActivities={showAllActivities}
                setShowAllActivities={setShowAllActivities}
                transactions={transactions ?? []}
                showAllEarnings={showAllEarnings}
                setShowAllEarnings={setShowAllEarnings}
              />
            )}

            {activeTab === "social" && <SettingsSocialTab register={register} />}

            {activeTab === "security" && <SettingsSecurityTab passwordForm={passwordForm} />}

            {activeTab === "integrations" && <SettingsIntegrationsTab />}
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Update Profile Picture</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 bg-muted/50">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground border border-border hover:border-input"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto">
              {avatarOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                    avatar === opt
                      ? "border-primary ring-4 ring-primary/10"
                      : "border-transparent bg-background shadow-sm hover:shadow"
                  }`}
                  onClick={() => setAvatar(opt)}
                >
                  <img
                    src={opt}
                    alt="Avatar"
                    className="w-full aspect-square object-cover mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3 bg-background">
            <Button variant="ghost" onClick={() => setIsAvatarModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {isWizardOpen && <WorkspaceWizard onClose={() => setIsWizardOpen(false)} />}
    </div>
  );
}
