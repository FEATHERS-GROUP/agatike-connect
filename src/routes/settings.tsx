import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  Image as ImageIcon,
  Heart,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Monitor,
  FileText,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  updateUserGeneral,
  updateUserPassword,
  updateUserOnboarding,
  verifyNewPasswordDifference,
  deactivateUserAccount,
} from "@/api/auth";
import { sendProfileUpdateOTP } from "@/api/email";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { RefundPolicy } from "@/components/legal/RefundPolicy";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/countries";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Agatike" },
      { name: "description", content: "Manage your Agatike account settings and preferences." },
    ],
  }),
  component: SettingsPage,
});

const AVATAR_STYLES = ["micah", "avataaars", "bottts", "lorelei", "adventurer", "fun-emoji"];
const INTEREST_OPTIONS = [
  "Events",
  "Entertainment",
  "Experiences",
  "Music",
  "Sports",
  "Cinema",
  "Conferences",
  "Tech",
  "Art",
  "Food",
  "Fashion",
  "Gaming",
  "Business",
  "Health",
  "Education",
  "Bus Booking",
  "Travel & Transport",
  "Gym & Fitness",
  "Wellness",
  "Office Spaces",
  "Coworking",
  "Venue Booking",
  "Nightlife & Parties",
  "Networking",
  "Workshops",
  "Retreats",
  "Exhibitions & Expos",
  "Comedy",
  "Theater & Arts",
  "Festivals",
  "Pop-ups & Markets",
  "Real Estate",
  "Outdoors & Adventure",
  "Photography",
  "Startups",
];

function SettingsPage() {
  const { user, refresh } = useUserAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // States for sub-forms
  const [general, setGeneral] = useState({
    username: "",
    email: "",
    phone: "",
    country: "",
    gender: "",
  });
  const [isUpdatingGeneral, setIsUpdatingGeneral] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [deleteConfirmHandle, setDeleteConfirmHandle] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState("micah");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [stagedAvatar, setStagedAvatar] = useState<string | null>(null);
  const generatedAvatars = Array.from({ length: 12 }).map(
    (_, i) => `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}_${i}`,
  );

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [initialInterests, setInitialInterests] = useState<string[]>([]);
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);

  useEffect(() => {
    if (user) {
      setGeneral({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        gender: user.gender || "",
      });
      let ints: string[] = [];
      try {
        ints = Array.isArray(user.interests)
          ? user.interests
          : typeof user.interests === "string"
            ? JSON.parse(user.interests)
            : [];
      } catch (e) {}
      setSelectedInterests(ints);
      setInitialInterests(ints);
    }
  }, [user]);

  // Handlers
  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!general.username || !general.email) return toast.error("Name and email are required");

    if (!isOtpStep) {
      setIsUpdatingGeneral(true);
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        await sendProfileUpdateOTP({ data: { to: general.email, otp } } as any);
        setIsOtpStep(true);
        toast.success("OTP sent to your email");
      } catch (e: any) {
        toast.error(e.message || "Failed to send OTP");
      } finally {
        setIsUpdatingGeneral(false);
      }
      return;
    }

    if (otpInput !== generatedOtp) {
      return toast.error("Invalid OTP");
    }

    setIsUpdatingGeneral(true);

    // Generate unique handle
    let newHandle = general.username.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!user?.handle || user.username !== general.username) {
      newHandle = newHandle + Math.floor(Math.random() * 10000);
    } else {
      newHandle = user.handle;
    }

    try {
      await updateUserGeneral({
        data: { ...general, handle: newHandle, dateOfBirth: user?.dateOfBirth || "" },
      } as any);
      toast.success("Profile updated successfully!");
      refresh();
      setIsOtpStep(false);
      setOtpInput("");
      setActiveModal(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setIsUpdatingGeneral(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!isOtpStep) {
      setIsUpdatingPassword(true);
      try {
        await verifyNewPasswordDifference({ data: { password } } as any);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        await sendProfileUpdateOTP({ data: { to: user?.email || "", otp } } as any);
        setIsOtpStep(true);
        toast.success("OTP sent to your email");
      } catch (e: any) {
        toast.error(e.message || "Failed to send OTP");
      } finally {
        setIsUpdatingPassword(false);
      }
      return;
    }

    if (otpInput !== generatedOtp) {
      return toast.error("Invalid OTP");
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword({ data: { password } } as any);
      toast.success("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
      setIsOtpStep(false);
      setOtpInput("");
      setActiveModal(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setIsUpdatingAvatar(true);
    try {
      await updateUserOnboarding({ data: { profile: url, interests: user?.interests } } as any);
      toast.success("Avatar updated successfully!");
      refresh();
      setActiveModal(null);
    } catch (e: any) {
      toast.error("Failed to update avatar");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleUpdateInterests = async () => {
    setIsUpdatingInterests(true);
    try {
      await updateUserOnboarding({
        data: { profile: user?.profile || "", interests: selectedInterests },
      } as any);
      toast.success("Interests updated successfully!");
      refresh();
      setActiveModal(null);
    } catch (e: any) {
      toast.error("Failed to update interests");
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmHandle !== user?.handle) {
      return toast.error("Handle does not match. Please type your exact handle.");
    }
    setIsDeletingAccount(true);
    try {
      await deactivateUserAccount();
      toast.success("Your account has been deleted.");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Modals Content
  const renderModalContent = () => {
    switch (activeModal) {
      case "general":
        return (
          <form onSubmit={handleUpdateGeneral} className="space-y-4 px-1">
            {isOtpStep ? (
              <div className="flex flex-col gap-4 text-center py-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Verification Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've sent a 6-digit OTP to <strong>{general.email}</strong>. Please enter it
                  below to save changes.
                </p>
                <div className="flex flex-col gap-3 text-left">
                  <Label>One-Time Password</Label>
                  <Input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="bg-background/50 rounded-xl text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOtpStep(false)}
                  className="mt-2 text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <Label>Name</Label>
                  <Input
                    value={general.username}
                    onChange={(e) => setGeneral({ ...general, username: e.target.value })}
                    className="bg-background/50 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={general.email}
                    onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                    className="bg-background/50 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label>Phone Number</Label>
                    <Input
                      value={general.phone}
                      onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                      className="bg-background/50 rounded-xl"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Country</Label>
                    <div className="relative">
                      <select
                        value={general.country}
                        onChange={(e) => setGeneral({ ...general, country: e.target.value })}
                        className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>
                          Select Country
                        </option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Gender</Label>
                  <div className="relative">
                    <select
                      value={general.gender}
                      onChange={(e) => setGeneral({ ...general, gender: e.target.value })}
                      className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </>
            )}
            <Button
              type="submit"
              disabled={isUpdatingGeneral}
              className="w-full rounded-xl mt-4"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isUpdatingGeneral ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isOtpStep ? (
                "Confirm & Save"
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        );
      case "avatar":
        return (
          <div className="space-y-5 px-1">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize transition-colors ${selectedStyle === style ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {generatedAvatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setStagedAvatar(url)}
                  disabled={isUpdatingAvatar}
                  className={`aspect-square rounded-2xl p-2 border transition-all hover:scale-105 ${stagedAvatar === url ? "bg-primary/20 border-primary shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-secondary/30 border-border/40 hover:border-primary/50"}`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            {stagedAvatar && (
              <Button
                onClick={() => handleSelectAvatar(stagedAvatar)}
                disabled={isUpdatingAvatar}
                className="w-full rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isUpdatingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Selected Avatar"
                )}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setSeed(Math.random().toString(36).substring(7))}
              className="w-full rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Generate More
            </Button>
          </div>
        );
      case "interests":
        return (
          <div className="space-y-5 px-1">
            <p className="text-sm text-muted-foreground">
              Select categories you're interested in to get better event recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.some((i) => {
                  if (typeof i !== "string") return false;
                  const d = i.toLowerCase();
                  const o = interest.toLowerCase();
                  return d === o || d + "s" === o || d === o + "s";
                });
                return (
                  <button
                    key={interest}
                    onClick={() =>
                      setSelectedInterests(
                        isSelected
                          ? selectedInterests.filter(
                              (i) =>
                                typeof i === "string" && i.toLowerCase() !== interest.toLowerCase(),
                            )
                          : [...selectedInterests, interest],
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isSelected ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            {(() => {
              const normalizedSelected = selectedInterests
                .filter((i) => typeof i === "string")
                .map((i) => i.toLowerCase());
              const normalizedInitial = initialInterests
                .filter((i) => typeof i === "string")
                .map((i) => i.toLowerCase());
              const isChanged =
                normalizedSelected.length !== normalizedInitial.length ||
                normalizedSelected.some((i) => !normalizedInitial.includes(i));
              return (
                <Button
                  onClick={handleUpdateInterests}
                  disabled={isUpdatingInterests || !isChanged}
                  className="w-full rounded-xl mt-4 transition-all"
                  style={{ background: !isChanged ? undefined : "var(--gradient-primary)" }}
                >
                  {isUpdatingInterests ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Interests"
                  )}
                </Button>
              );
            })()}
          </div>
        );
      case "security":
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-4 px-1">
            {isOtpStep ? (
              <div className="flex flex-col gap-4 text-center py-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Verification Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've sent a 6-digit OTP to <strong>{user?.email}</strong>. Please enter it below
                  to securely change your password.
                </p>
                <div className="flex flex-col gap-3 text-left">
                  <Label>One-Time Password</Label>
                  <Input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="bg-background/50 rounded-xl text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOtpStep(false)}
                  className="mt-2 text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 rounded-xl"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 rounded-xl"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
            <Button
              type="submit"
              disabled={isUpdatingPassword || (!isOtpStep && (!password || !confirmPassword))}
              className="w-full rounded-xl mt-4"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isUpdatingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isOtpStep ? (
                "Confirm & Update Password"
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        );
      case "preferences":
        return (
          <div className="space-y-4 px-1">
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred application theme.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${theme === t.id ? "bg-primary/10 border-primary text-primary font-bold shadow-sm" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"}`}
                >
                  <t.icon className="h-6 w-6" />
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "terms":
        return (
          <div className="px-1 h-[60vh] overflow-y-auto">
            <TermsAndConditions />
          </div>
        );
      case "refunds":
        return (
          <div className="px-1 h-[60vh] overflow-y-auto">
            <RefundPolicy />
          </div>
        );
      case "privacy":
        return (
          <div className="px-1 h-[60vh] overflow-y-auto">
            <PrivacyPolicy />
          </div>
        );
      case "delete":
        return (
          <div className="space-y-6 px-1">
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                This will permanently deactivate your account. You will be immediately logged out
                and will <strong>not</strong> be able to log back in.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive/80 space-y-1">
                <p className="font-semibold">This action cannot be undone.</p>
                <p>All your data, bookings, and tickets will become inaccessible.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">
                Type your handle <strong className="text-foreground">@{user?.handle}</strong> to
                confirm:
              </Label>
              <Input
                value={deleteConfirmHandle}
                onChange={(e) => setDeleteConfirmHandle(e.target.value)}
                placeholder={`@${user?.handle}`}
                className="bg-background/50 rounded-xl"
              />
            </div>

            <Button
              variant="destructive"
              className="w-full rounded-xl"
              disabled={isDeletingAccount || deleteConfirmHandle !== user?.handle}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Yes, delete my account
                </>
              )}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "general":
        return "General Information";
      case "avatar":
        return "Change Avatar";
      case "interests":
        return "Manage Interests";
      case "security":
        return "Security & Password";
      case "preferences":
        return "App Preferences";
      case "terms":
        return "Terms & Conditions";
      case "refunds":
        return "Refund Policy";
      case "privacy":
        return "Privacy Policy";
      case "delete":
        return "Delete Account";
      default:
        return "";
    }
  };

  const DESKTOP_TABS = [
    {
      group: "Account",
      items: [
        {
          id: "general",
          label: "General Info",
          desc: "Name, email, phone",
          icon: User,
          color: "text-primary bg-primary/10",
        },
        {
          id: "avatar",
          label: "Avatar",
          desc: "Profile picture",
          icon: ImageIcon,
          color: "text-blue-500 bg-blue-500/10",
        },
        {
          id: "interests",
          label: "Interests",
          desc: "Event categories",
          icon: Heart,
          color: "text-rose-500 bg-rose-500/10",
        },
      ],
    },
    {
      group: "App Settings",
      items: [
        {
          id: "security",
          label: "Security",
          desc: "Update password",
          icon: Lock,
          color: "text-emerald-500 bg-emerald-500/10",
        },
        {
          id: "preferences",
          label: "Preferences",
          desc: "Dark / Light mode",
          icon: Monitor,
          color: "text-amber-500 bg-amber-500/10",
        },
      ],
    },
    {
      group: "Legal",
      items: [
        {
          id: "terms",
          label: "Terms & Conditions",
          desc: "Legal agreements",
          icon: FileText,
          color: "text-purple-500 bg-purple-500/10",
        },
        {
          id: "refunds",
          label: "Refund Policy",
          desc: "Refund rules",
          icon: FileText,
          color: "text-blue-500 bg-blue-500/10",
        },
        {
          id: "privacy",
          label: "Privacy Policy",
          desc: "How we use your data",
          icon: Lock,
          color: "text-indigo-500 bg-indigo-500/10",
        },
      ],
    },
    {
      group: "Danger Zone",
      items: [
        {
          id: "delete",
          label: "Delete Account",
          desc: "Permanently deactivate",
          icon: Trash2,
          color: "text-destructive bg-destructive/10",
        },
      ],
    },
  ];

  const [desktopTab, setDesktopTab] = useState("general");

  const getDesktopTabMeta = () =>
    DESKTOP_TABS.flatMap((g) => g.items).find((i) => i.id === desktopTab);

  const renderDesktopContent = () => {
    // Reuse renderModalContent logic but keyed on desktopTab
    const savedModal = activeModal;
    // We temporarily use desktopTab as the key for renderModalContent
    const content = (() => {
      switch (desktopTab) {
        case "general":
          return (
            <form onSubmit={handleUpdateGeneral} className="space-y-5">
              {isOtpStep ? (
                <div className="flex flex-col gap-4 text-center py-8 max-w-sm mx-auto">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Verification Required</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit OTP to <strong>{general.email}</strong>. Please enter it
                    below to save changes.
                  </p>
                  <div className="flex flex-col gap-3 text-left">
                    <Label>One-Time Password</Label>
                    <Input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="bg-background/50 rounded-xl text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOtpStep(false)}
                    className="mt-2 text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 max-w-2xl">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label>Name</Label>
                      <Input
                        value={general.username}
                        onChange={(e) => setGeneral({ ...general, username: e.target.value })}
                        className="bg-background/50 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={general.email}
                        onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                        className="bg-background/50 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={general.phone}
                        onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                        className="bg-background/50 rounded-xl"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Gender</Label>
                      <div className="relative">
                        <select
                          value={general.gender}
                          onChange={(e) => setGeneral({ ...general, gender: e.target.value })}
                          className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Country</Label>
                    <div className="relative">
                      <select
                        value={general.country}
                        onChange={(e) => setGeneral({ ...general, country: e.target.value })}
                        className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>
                          Select Country
                        </option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={isUpdatingGeneral}
                className="rounded-xl px-8"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isUpdatingGeneral ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isOtpStep ? (
                  "Confirm & Save"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          );
        case "avatar":
          return (
            <div className="space-y-5">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize transition-colors ${selectedStyle === style ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {generatedAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStagedAvatar(url)}
                    disabled={isUpdatingAvatar}
                    className={`aspect-square rounded-2xl p-2 border transition-all hover:scale-105 ${stagedAvatar === url ? "bg-primary/20 border-primary shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-secondary/30 border-border/40 hover:border-primary/50"}`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                {stagedAvatar && (
                  <Button
                    onClick={() => handleSelectAvatar(stagedAvatar)}
                    disabled={isUpdatingAvatar}
                    className="rounded-xl"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isUpdatingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Selected Avatar"
                    )}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSeed(Math.random().toString(36).substring(7))}
                  className="rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Generate More
                </Button>
              </div>
            </div>
          );
        case "interests":
          return (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Select categories you're interested in to get better event recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.some((i) => {
                    if (typeof i !== "string") return false;
                    const d = i.toLowerCase();
                    const o = interest.toLowerCase();
                    return d === o || d + "s" === o || d === o + "s";
                  });
                  return (
                    <button
                      key={interest}
                      onClick={() =>
                        setSelectedInterests(
                          isSelected
                            ? selectedInterests.filter(
                                (i) =>
                                  typeof i === "string" &&
                                  i.toLowerCase() !== interest.toLowerCase(),
                              )
                            : [...selectedInterests, interest],
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isSelected ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"}`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const normalizedSelected = selectedInterests
                  .filter((i) => typeof i === "string")
                  .map((i) => i.toLowerCase());
                const normalizedInitial = initialInterests
                  .filter((i) => typeof i === "string")
                  .map((i) => i.toLowerCase());
                const isChanged =
                  normalizedSelected.length !== normalizedInitial.length ||
                  normalizedSelected.some((i) => !normalizedInitial.includes(i));
                return (
                  <Button
                    onClick={handleUpdateInterests}
                    disabled={isUpdatingInterests || !isChanged}
                    className="rounded-xl px-8 transition-all"
                    style={{ background: !isChanged ? undefined : "var(--gradient-primary)" }}
                  >
                    {isUpdatingInterests ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Interests"
                    )}
                  </Button>
                );
              })()}
            </div>
          );
        case "security":
          return (
            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
              {isOtpStep ? (
                <div className="flex flex-col gap-4 text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Verification Required</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit OTP to <strong>{user?.email}</strong>. Please enter it
                    below to securely change your password.
                  </p>
                  <div className="flex flex-col gap-3 text-left">
                    <Label>One-Time Password</Label>
                    <Input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="bg-background/50 rounded-xl text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOtpStep(false)}
                    className="mt-2 text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50 rounded-xl"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-background/50 rounded-xl"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}
              <Button
                type="submit"
                disabled={isUpdatingPassword || (!isOtpStep && (!password || !confirmPassword))}
                className="rounded-xl px-8"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isUpdatingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isOtpStep ? (
                  "Confirm & Update Password"
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          );
        case "preferences":
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose your preferred application theme.
              </p>
              <div className="flex gap-4">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border transition-all w-32 ${theme === t.id ? "bg-primary/10 border-primary text-primary font-bold shadow-sm" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"}`}
                  >
                    <t.icon className="h-7 w-7" />
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        case "terms":
          return (
            <div className="h-[60vh] overflow-y-auto">
              <TermsAndConditions />
            </div>
          );
        case "refunds":
          return (
            <div className="h-[60vh] overflow-y-auto">
              <RefundPolicy />
            </div>
          );
        case "privacy":
          return (
            <div className="h-[60vh] overflow-y-auto">
              <PrivacyPolicy />
            </div>
          );
        case "delete":
          return (
            <div className="space-y-6 max-w-md">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently deactivate your account. You will be immediately logged out
                  and will <strong>not</strong> be able to log back in.
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm text-destructive/80 space-y-1">
                  <p className="font-semibold">This action cannot be undone.</p>
                  <p>All your data, bookings, and tickets will become inaccessible.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">
                  Type your handle <strong className="text-foreground">@{user?.handle}</strong> to
                  confirm:
                </Label>
                <Input
                  value={deleteConfirmHandle}
                  onChange={(e) => setDeleteConfirmHandle(e.target.value)}
                  placeholder={`@${user?.handle}`}
                  className="bg-background/50 rounded-xl"
                />
              </div>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                disabled={isDeletingAccount || deleteConfirmHandle !== user?.handle}
                onClick={handleDeleteAccount}
              >
                {isDeletingAccount ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" /> Yes, delete my account
                  </>
                )}
              </Button>
            </div>
          );
        default:
          return null;
      }
    })();
    return content;
  };

  const desktopTabMeta = getDesktopTabMeta();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── MOBILE layout ── */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Settings</h1>
          </div>
        </div>

        <main className="flex-1 p-4 space-y-6">
          {/* Account group */}
          <div className="bg-card rounded-3xl border border-border/40 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-4 border-b border-border/40 bg-muted/20">
              <h2 className="font-bold text-lg">Account</h2>
              <p className="text-xs text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="divide-y divide-border/40">
              {[
                {
                  id: "general",
                  label: "General Info",
                  desc: "Name, Email, Phone",
                  icon: User,
                  color: "bg-primary/10 text-primary",
                },
                {
                  id: "avatar",
                  label: "Avatar",
                  desc: "Change your profile picture",
                  icon: ImageIcon,
                  color: "bg-blue-500/10 text-blue-500",
                },
                {
                  id: "interests",
                  label: "Interests",
                  desc: "Manage event categories",
                  icon: Heart,
                  color: "bg-rose-500/10 text-rose-500",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "delete") {
                      setShowDelete(true);
                    } else {
                      setActiveModal(item.id);
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* App Settings group */}
          <div className="bg-card rounded-3xl border border-border/40 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-4 border-b border-border/40 bg-muted/20">
              <h2 className="font-bold text-lg">App Settings</h2>
              <p className="text-xs text-muted-foreground">Security and preferences</p>
            </div>
            <div className="divide-y divide-border/40">
              {[
                {
                  id: "security",
                  label: "Security",
                  desc: "Update your password",
                  icon: Lock,
                  color: "bg-emerald-500/10 text-emerald-500",
                },
                {
                  id: "preferences",
                  label: "Preferences",
                  desc: "Dark mode, Light mode",
                  icon: Monitor,
                  color: "bg-amber-500/10 text-amber-500",
                },
                {
                  id: "terms",
                  label: "Terms & Conditions",
                  desc: "Read our legal agreements",
                  icon: FileText,
                  color: "bg-purple-500/10 text-purple-500",
                },
                {
                  id: "refunds",
                  label: "Refund Policy",
                  desc: "Read our refund rules",
                  icon: FileText,
                  color: "bg-blue-500/10 text-blue-500",
                },
                {
                  id: "privacy",
                  label: "Privacy Policy",
                  desc: "How we handle your data",
                  icon: Lock,
                  color: "bg-indigo-500/10 text-indigo-500",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-destructive/20">
              <h2 className="font-bold text-lg text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Irreversible account actions</p>
            </div>
            <button
              onClick={() => {
                setDeleteConfirmHandle("");
                setActiveModal("delete");
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently deactivate your account
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-destructive/50" />
            </button>
          </div>
        </main>

        {/* Mobile Modal */}
        <Dialog
          open={!!activeModal}
          onOpenChange={(open) => {
            if (!open) {
              setActiveModal(null);
              setIsOtpStep(false);
              setOtpInput("");
            }
          }}
        >
          <DialogContent className="w-full h-[100dvh] max-w-none p-0 overflow-hidden bg-card border-none rounded-none flex flex-col">
            <DialogHeader className="p-4 border-b border-border/40 bg-muted/20 flex flex-row items-center gap-3 space-y-0 text-left">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setIsOtpStep(false);
                  setOtpInput("");
                }}
                className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {getModalTitle()}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 flex-1 overflow-y-auto">{renderModalContent()}</div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-72 shrink-0 border-r border-border/40 bg-card/40 backdrop-blur sticky top-0 h-screen flex flex-col overflow-y-auto pt-6 pb-8">
          {/* User card at top */}
          <div className="px-5 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/60 border border-border/40">
              {user?.profile ? (
                <img
                  src={user.profile}
                  alt={user.username}
                  className="h-12 w-12 rounded-full object-cover border-2 border-border/40"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">@{user?.handle}</p>
              </div>
            </div>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 px-3 space-y-6">
            {DESKTOP_TABS.map((group) => (
              <div key={group.group}>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = desktopTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setDesktopTab(item.id);
                          setIsOtpStep(false);
                          setOtpInput("");
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
                      >
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? item.color : "bg-secondary/60"}`}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                        {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-5 pt-4 border-t border-border/40">
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to profile
            </button>
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-10">
            {/* Section header */}
            <div className="mb-8 pb-6 border-b border-border/40">
              <div className="flex items-center gap-4">
                {desktopTabMeta && (
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${desktopTabMeta.color}`}
                  >
                    <desktopTabMeta.icon className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{desktopTabMeta?.label}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{desktopTabMeta?.desc}</p>
                </div>
              </div>
            </div>

            {/* Content card */}
            <div className="bg-card rounded-3xl border border-border/40 shadow-[var(--shadow-card)] p-8">
              {renderDesktopContent()}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
