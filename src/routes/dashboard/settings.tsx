import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizerProfile, updateOrganizerProfile, changeOrganizerPassword } from "@/api/organizers";
import { disableDatabaseWorkspace } from "@/api/workspaces";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceWallet, getWalletTransactions } from "@/api/wallet";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  User,
  Instagram,
  Twitter,
  Youtube,
  Lock,
  Camera,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const CATEGORIES = [
  { id: "bottts", label: "Robots" }, { id: "shapes", label: "Shapes" },
  { id: "identicon", label: "Patterns" }, { id: "adventurer", label: "Characters" },
  { id: "fun-emoji", label: "Emojis" }, { id: "micah", label: "Stylized" },
];

const generateAvatars = (category: string) => {
  const bg = ["b6e3f4", "c0aede", "ffdfbf", "ffd5dc", "d1d4f9"];
  return Array.from({ length: 12 }).map(() => {
    const color = bg[Math.floor(Math.random() * bg.length)];
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${category}/svg?seed=${seed}&backgroundColor=${color}`;
  });
};

function EditableInput({ icon: Icon, ...props }: any) {
  return (
    <div className="flex items-start gap-3 group">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />}
      <div className="flex-1">
        <input
          {...props}
          className={`w-full bg-transparent border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring px-2 py-1.5 -ml-2 rounded-md transition-all text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none ${props.className || ""}`}
        />
        {props.error && <p className="text-[10px] text-destructive ml-1">{props.error}</p>}
      </div>
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllEarnings, setShowAllEarnings] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "security">("overview");
  const [avatar, setAvatar] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("identicon");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["organizerProfile"],
    queryFn: async () => await getOrganizerProfile(),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty, errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "", handle: profile.handle || "",
        email: profile.email || "", phone: profile.phone || "",
        bio: profile.bio || "", instagram: profile.socials?.instagram || "",
        twitter: profile.socials?.twitter || "", youtube: profile.socials?.youtube || "",
      });
      setAvatar(profile.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.id || "org"}&backgroundColor=f3f4f6`);
    }
  }, [profile, reset]);

  useEffect(() => {
    if (isAvatarModalOpen) setAvatarOptions(generateAvatars(activeCategory));
  }, [activeCategory, isAvatarModalOpen]);

  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue && !isDirty) {
      setValue("handle", nameValue.toLowerCase().replace(/[^a-z0-9]/g, ""), { shouldValidate: true });
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

      notifs.sort((a, b) => {
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
      const wallet = await getWorkspaceWallet({ data: { workspace_id: activeWorkspace.id } } as any);
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
    if (activeTab === "security") passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))();
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
            <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
          <div className="w-full md:w-[320px] md:pr-8 md:border-r border-border flex-shrink-0">
            {/* Identity Card */}
            <div className="flex items-start justify-between mb-8 group">
              <div className="flex items-center gap-4">
                <div 
                  className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-border"
                  onClick={() => setIsAvatarModalOpen(true)}
                >
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <input
                    {...register("name")}
                    className="font-bold text-lg text-foreground bg-transparent border-transparent hover:border-border focus:border-input focus:bg-muted px-1 py-0.5 -ml-1 rounded w-full outline-none transition-colors"
                    placeholder="Organizer Name"
                  />
                  <div className="flex items-center text-sm text-muted-foreground font-medium px-1 mt-0.5">
                    #<input
                      {...register("handle")}
                      className="bg-transparent border-transparent hover:border-border focus:border-input focus:bg-muted rounded outline-none w-[120px] transition-colors"
                      placeholder="handle"
                    />
                  </div>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <Separator className="my-6" />

            {/* About / Contact */}
            <div className="mb-6">
              <h3 className="font-semibold text-[15px] mb-4">Contact</h3>
              <div className="space-y-1">
                <EditableInput
                  icon={Phone}
                  {...register("phone")}
                  placeholder="Add phone number"
                  error={errors.phone?.message}
                />
                <EditableInput
                  icon={Mail}
                  {...register("email")}
                  placeholder="Add email address"
                  error={errors.email?.message}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Address / Bio */}
            <div className="mb-6">
              <h3 className="font-semibold text-[15px] mb-4">About</h3>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                <textarea
                  {...register("bio")}
                  placeholder="Write a short bio..."
                  className="w-full bg-transparent border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring px-2 py-1.5 -ml-2 rounded-md transition-all text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none min-h-[100px] resize-none"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Platform Stats (mimicking Employee details) */}
            <div className="mb-6">
              <h3 className="font-semibold text-[15px] mb-4">Platform Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-24">Joined:</span>
                  <span className="font-medium text-foreground">Jan 05, 2023</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-24">Status:</span>
                  <span className="font-medium text-foreground">Verified Partner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 md:pl-10 pb-20">
            {activeTab === "overview" && (
              <div className="animate-in fade-in duration-500">
                {/* Workspaces Table */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[17px] font-bold">Workspaces</h2>
                    <button onClick={() => setIsWizardOpen(true)} className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors">
                      + Create Workspace
                    </button>
                  </div>
                  
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-b border-border">
                          <th className="pb-3 font-medium">NAME</th>
                          <th className="pb-3 font-medium">TYPE</th>
                          <th className="pb-3 font-medium">OWNER</th>
                          <th className="pb-3 font-medium">CREATED</th>
                          <th className="pb-3 font-medium">LOCATION</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {workspaces.map((w, i) => (
                          <tr key={i} className="group hover:bg-muted/50 transition-colors">
                            <td className="py-4 font-medium text-foreground pr-4 flex items-center gap-2">
                              {w.logo ? <img src={w.logo} alt="" className="h-6 w-6 rounded-md object-cover" /> : <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-xs">{w.icon}</div>}
                              {w.name}
                            </td>
                            <td className="py-4 text-muted-foreground font-medium pr-4">{w.type}</td>
                            <td className="py-4 text-muted-foreground font-medium pr-4">{w.city || "Not specified"}</td>
                            <td className="py-4 text-muted-foreground font-medium pr-4">{w.created_at ? new Date(w.created_at).toLocaleDateString() : "Unknown"}</td>
                            <td className="py-4 text-muted-foreground font-medium pr-4">{w.country || "Not specified"}</td>
                            <td className="py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/${w.slug}` as any })}>
                                    Open Workspace
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => disableWorkspaceMutation.mutate(w.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    Disable Workspace
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Split Section */}
                <div className="grid md:grid-cols-2 gap-12 mt-12">
                  {/* Activity */}
                  <div>
                    <h2 className="text-[17px] font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent activity.</p>
                      ) : (showAllActivities ? notifications : notifications.slice(0, 5)).map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 text-primary`}>
                            {item.title?.charAt(0) || "N"}
                          </div>
                          <div>
                            <p className="text-[13px] text-foreground font-semibold line-clamp-1">
                              {item.title || "Notification"} <span className="text-muted-foreground font-normal">{item.content}</span>
                            </p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                              {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Just now"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {notifications.length > 5 && (
                      <button 
                        onClick={() => setShowAllActivities(!showAllActivities)} 
                        className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors mt-6"
                      >
                        {showAllActivities ? "Show less" : "View all"}
                      </button>
                    )}
                  </div>

                  {/* Compensation / Platform Stats */}
                  <div>
                    <h2 className="text-[17px] font-bold mb-6">Platform Earnings</h2>
                    <div className="space-y-6">
                      {!transactions || transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent transactions.</p>
                      ) : (showAllEarnings ? transactions : transactions.slice(0, 5)).map((item: any, i: number) => (
                        <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <p className="text-[14px] text-foreground font-bold">
                            {item.amount || 0} {item.currency || "RWF"} <span className="font-medium text-muted-foreground">{item.transaction_type === "withdrawal" ? "Withdrawn" : "Earned"}</span>
                          </p>
                          <p className="text-[12px] text-muted-foreground mt-1">
                            {item.description || "Platform transaction"} on <span className="font-medium text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    {transactions && transactions.length > 5 && (
                      <button 
                        onClick={() => setShowAllEarnings(!showAllEarnings)} 
                        className="text-[#D93F3C] font-semibold text-sm hover:text-red-700 transition-colors mt-6"
                      >
                        {showAllEarnings ? "Show less" : "View all"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="animate-in fade-in duration-500 max-w-2xl">
                <div className="mb-10">
                  <h2 className="text-[17px] font-bold mb-6">Social Links</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-500" /> Instagram Profile
                      </Label>
                      <Input
                        {...register("instagram")}
                        placeholder="https://instagram.com/yourhandle"
                        className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-blue-400" /> Twitter Profile
                      </Label>
                      <Input
                        {...register("twitter")}
                        placeholder="https://twitter.com/yourhandle"
                        className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-500" /> YouTube Channel
                      </Label>
                      <Input
                        {...register("youtube")}
                        placeholder="https://youtube.com/c/yourchannel"
                        className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in duration-500 max-w-2xl">
                <div className="mb-10">
                  <h2 className="text-[17px] font-bold mb-6">Change Password</h2>
                  <div className="space-y-6">
                    <div className="space-y-2 max-w-md">
                      <Label className="text-sm font-semibold text-foreground">Current Password</Label>
                      <Input
                        {...passwordForm.register("currentPassword")}
                        type="password"
                        className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>
                    <Separator className="max-w-md" />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">New Password</Label>
                        <Input
                          {...passwordForm.register("newPassword")}
                          type="password"
                          className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Confirm Password</Label>
                        <Input
                          {...passwordForm.register("confirmPassword")}
                          type="password"
                          className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-background text-foreground border border-border hover:border-input"
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
                    avatar === opt ? "border-primary ring-4 ring-primary/10" : "border-transparent bg-background shadow-sm hover:shadow"
                  }`}
                  onClick={() => setAvatar(opt)}
                >
                  <img src={opt} alt="Avatar" className="w-full aspect-square object-cover mix-blend-multiply dark:mix-blend-normal" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3 bg-background">
            <Button variant="ghost" onClick={() => setIsAvatarModalOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsAvatarModalOpen(false)}>Confirm</Button>
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
