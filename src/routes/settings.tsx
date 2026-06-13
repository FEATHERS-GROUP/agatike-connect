import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Lock, Image as ImageIcon, Heart, Loader2, 
  RefreshCw, ChevronRight, ChevronDown, Moon, Sun, Monitor, 
  FileText, ArrowLeft, Settings as SettingsIcon 
} from "lucide-react";
import { updateUserGeneral, updateUserPassword, updateUserOnboarding } from "@/api/auth";
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
  "Music", "Sports", "Cinema", "Conferences", "Tech", "Art", "Food", 
  "Fashion", "Gaming", "Business", "Health", "Education"
];

function SettingsPage() {
  const { user, refresh } = useUserAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // States for sub-forms
  const [general, setGeneral] = useState({ username: "", email: "", phone: "", country: "", gender: "" });
  const [isUpdatingGeneral, setIsUpdatingGeneral] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState("micah");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [stagedAvatar, setStagedAvatar] = useState<string | null>(null);
  const generatedAvatars = Array.from({ length: 12 }).map((_, i) => 
    `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}_${i}`
  );

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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
        ints = Array.isArray(user.interests) ? user.interests : (typeof user.interests === "string" ? JSON.parse(user.interests) : []);
      } catch (e) { }
      setSelectedInterests(ints);
    }
  }, [user]);

  // Handlers
  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!general.username || !general.email) return toast.error("Name and email are required");
    setIsUpdatingGeneral(true);
    
    // Generate unique handle
    let newHandle = general.username.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!user?.handle || user.username !== general.username) {
      newHandle = newHandle + Math.floor(Math.random() * 10000);
    } else {
      newHandle = user.handle;
    }

    try {
      await updateUserGeneral({ data: { ...general, handle: newHandle, dateOfBirth: user?.dateOfBirth || "" } });
      toast.success("Profile updated successfully!");
      refresh();
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
    setIsUpdatingPassword(true);
    try {
      await updateUserPassword({ data: { password } });
      toast.success("Password updated successfully!");
      setPassword(""); setConfirmPassword("");
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
      await updateUserOnboarding({ data: { profile: url, interests: user?.interests } });
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
      await updateUserOnboarding({ data: { profile: user?.profile || "", interests: selectedInterests } });
      toast.success("Interests updated successfully!");
      refresh();
      setActiveModal(null);
    } catch (e: any) {
      toast.error("Failed to update interests");
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  // Modals Content
  const renderModalContent = () => {
    switch (activeModal) {
      case "general":
        return (
          <form onSubmit={handleUpdateGeneral} className="space-y-4 px-1">
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input value={general.username} onChange={e => setGeneral({...general, username: e.target.value})} className="bg-background/50 rounded-xl"/>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Email</Label>
              <Input type="email" value={general.email} onChange={e => setGeneral({...general, email: e.target.value})} className="bg-background/50 rounded-xl"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label>Phone Number</Label>
                <Input value={general.phone} onChange={e => setGeneral({...general, phone: e.target.value})} className="bg-background/50 rounded-xl" placeholder="+1 234 567 890"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label>Country</Label>
                <div className="relative">
                  <select 
                    value={general.country} 
                    onChange={e => setGeneral({...general, country: e.target.value})} 
                    className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select Country</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
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
                  onChange={e => setGeneral({...general, gender: e.target.value})} 
                  className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <Button type="submit" disabled={isUpdatingGeneral} className="w-full rounded-xl mt-4" style={{ background: "var(--gradient-primary)" }}>
              {isUpdatingGeneral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        );
      case "avatar":
        return (
          <div className="space-y-5 px-1">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {AVATAR_STYLES.map(style => (
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
              <Button onClick={() => handleSelectAvatar(stagedAvatar)} disabled={isUpdatingAvatar} className="w-full rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                {isUpdatingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Selected Avatar"}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSeed(Math.random().toString(36).substring(7))} className="w-full rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" /> Generate More
            </Button>
          </div>
        );
      case "interests":
        return (
          <div className="space-y-5 px-1">
            <p className="text-sm text-muted-foreground">Select categories you're interested in to get better event recommendations.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterests(isSelected ? selectedInterests.filter(i => i !== interest) : [...selectedInterests, interest])}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isSelected ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <Button onClick={handleUpdateInterests} disabled={isUpdatingInterests} className="w-full rounded-xl mt-4" style={{ background: "var(--gradient-primary)" }}>
              {isUpdatingInterests ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Interests"}
            </Button>
          </div>
        );
      case "security":
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-4 px-1">
            <div className="flex flex-col gap-3">
              <Label>New Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-background/50 rounded-xl" placeholder="Enter new password"/>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-background/50 rounded-xl" placeholder="Confirm new password"/>
            </div>
            <Button type="submit" disabled={isUpdatingPassword || !password || !confirmPassword} className="w-full rounded-xl mt-4" style={{ background: "var(--gradient-primary)" }}>
              {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        );
      case "preferences":
        return (
          <div className="space-y-4 px-1">
            <p className="text-sm text-muted-foreground mb-4">Choose your preferred application theme.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor }
              ].map(t => (
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
          <div className="space-y-4 px-1 h-[60vh] overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert">
              <h3>1. Terms of Use</h3>
              <p>By accessing and using Agatike Connect, you accept and agree to be bound by the terms and provision of this agreement.</p>
              <h3>2. Privacy Policy</h3>
              <p>We respect your privacy. Any information you provide is protected securely and is only used to enhance your experience.</p>
              <h3>3. User Conduct</h3>
              <p>You agree to use the platform responsibly and not to engage in any activity that interferes with or disrupts the services.</p>
              <h3>4. Modifications</h3>
              <p>Agatike Connect reserves the right to modify these terms at any time. We will notify users of any significant changes.</p>
              <p className="text-muted-foreground italic mt-4">These are placeholder terms. Actual terms and conditions apply to your use of this application.</p>
            </div>
            <Button onClick={() => setActiveModal(null)} className="w-full rounded-xl mt-6" variant="secondary">
              Acknowledge & Close
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch(activeModal) {
      case "general": return "General Information";
      case "avatar": return "Change Avatar";
      case "interests": return "Manage Interests";
      case "security": return "Security & Password";
      case "preferences": return "App Preferences";
      case "terms": return "Terms & Conditions";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pt-safe-top md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate({ to: "/profile" })} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="flex-1 md:flex">
        <div className="hidden md:block w-64 border-r border-border/40 bg-card/50 min-h-[calc(100vh-64px)] pt-24">
          <div className="px-6 pb-6">
            <h2 className="font-bold text-2xl mb-6 flex items-center gap-2"><SettingsIcon className="h-6 w-6"/> Settings</h2>
            {/* Desktop layout would normally put the list here, but we will reuse the main list for both */}
          </div>
        </div>

        <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-10 md:pt-24 space-y-6">
          <div className="bg-card rounded-3xl border border-border/40 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/40 bg-muted/20">
              <h2 className="font-bold text-lg">Account</h2>
              <p className="text-xs text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="divide-y divide-border/40">
              <button onClick={() => setActiveModal("general")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">General Info</p>
                    <p className="text-xs text-muted-foreground">Name, Email, Phone</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setActiveModal("avatar")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><ImageIcon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Avatar</p>
                    <p className="text-xs text-muted-foreground">Change your profile picture</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setActiveModal("interests")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><Heart className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Interests</p>
                    <p className="text-xs text-muted-foreground">Manage event categories</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/40 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/40 bg-muted/20">
              <h2 className="font-bold text-lg">App Settings</h2>
              <p className="text-xs text-muted-foreground">Security and preferences</p>
            </div>
            <div className="divide-y divide-border/40">
              <button onClick={() => setActiveModal("security")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Lock className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Security</p>
                    <p className="text-xs text-muted-foreground">Update your password</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setActiveModal("preferences")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><Monitor className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Preferences</p>
                    <p className="text-xs text-muted-foreground">Dark mode, Light mode</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => setActiveModal("terms")} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Terms & Conditions</p>
                    <p className="text-xs text-muted-foreground">Read our legal agreements</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="w-full h-[100dvh] max-w-none sm:max-w-[500px] sm:h-auto p-0 overflow-hidden bg-card sm:bg-card/95 backdrop-blur-xl border-none sm:border-solid sm:border-border/40 rounded-none sm:rounded-2xl flex flex-col">
          <DialogHeader className="p-4 md:p-6 border-b border-border/40 bg-muted/20 flex flex-row items-center gap-3 space-y-0 text-left">
            <button onClick={() => setActiveModal(null)} className="sm:hidden p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <DialogTitle className="text-xl font-bold tracking-tight">{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="hidden md:block">
        <Footer />
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
