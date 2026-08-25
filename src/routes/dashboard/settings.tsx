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
import { WorkspaceWizard } from "@/components/dashboard/workspaces/WorkspaceWizard";

import { useNavigate } from "@tanstack/react-router";
import { SettingsDesktop } from "@/components/dashboard/settings/SettingsDesktop";
import { SettingsMobile } from "@/components/dashboard/settings/SettingsMobile";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(3, "Handle must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  country: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<
    "overview" | "social" | "security" | "integrations" | "account-type"
  >("overview");
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
        country: profile.country || "",
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

  const viewProps = {
    navigate,
    workspaces,
    activeWorkspace,
    notifications,
    showAllActivities,
    setShowAllActivities,
    showAllEarnings,
    setShowAllEarnings,
    isWizardOpen,
    setIsWizardOpen,
    activeTab,
    setActiveTab,
    avatar,
    setAvatar,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    avatarOptions,
    activeCategory,
    setActiveCategory,
    profile,
    register,
    errors,
    passwordForm,
    transactions: transactions ?? [],
    disableWorkspaceMutation,
    handleSaveAll,
    isSaving,
    CATEGORIES,
  };

  return (
    <>
      <SettingsDesktop {...viewProps} />
      <SettingsMobile {...viewProps} />
    </>
  );
}
