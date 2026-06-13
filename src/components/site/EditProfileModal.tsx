import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Image as ImageIcon, Heart, Loader2, RefreshCw } from "lucide-react";
import { updateUserGeneral, updateUserPassword, updateUserOnboarding } from "@/api/auth";
import { toast } from "sonner";

// DiceBear styles for avatar generation
const AVATAR_STYLES = ["micah", "avataaars", "bottts", "lorelei", "adventurer", "fun-emoji"];

const INTEREST_OPTIONS = [
  "Music", "Sports", "Cinema", "Conferences", "Tech", "Art", "Food", 
  "Fashion", "Gaming", "Business", "Health", "Education"
];

export function EditProfileModal({ isOpen, setIsOpen, user, onUpdate }: any) {
  const [activeTab, setActiveTab] = useState("general");
  
  // General Tab State
  const [general, setGeneral] = useState({
    username: "",
    email: "",
    phone: "",
    country: "",
  });
  const [isUpdatingGeneral, setIsUpdatingGeneral] = useState(false);

  // Password Tab State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Avatar Tab State
  const [selectedStyle, setSelectedStyle] = useState("micah");
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const generatedAvatars = Array.from({ length: 6 }).map((_, i) => 
    `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}_${i}`
  );

  // Interests Tab State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setGeneral({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
      });
      
      let ints: string[] = [];
      try {
        ints = Array.isArray(user.interests) ? user.interests : (typeof user.interests === "string" ? JSON.parse(user.interests) : []);
      } catch (e) { }
      setSelectedInterests(ints);
    }
  }, [user, isOpen]);

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!general.username || !general.email) {
      toast.error("Name and email are required");
      return;
    }
    setIsUpdatingGeneral(true);
    try {
      await updateUserGeneral({ data: { ...general, gender: user.gender, dateOfBirth: user.dateOfBirth } });
      toast.success("Profile updated successfully!");
      onUpdate?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setIsUpdatingGeneral(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updateUserPassword({ data: { password } });
      toast.success("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setIsUpdatingAvatar(true);
    try {
      await updateUserOnboarding({ data: { profile: url, interests: user.interests } });
      toast.success("Avatar updated successfully!");
      onUpdate?.();
    } catch (e: any) {
      toast.error("Failed to update avatar");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleUpdateInterests = async () => {
    setIsUpdatingInterests(true);
    try {
      await updateUserOnboarding({ data: { profile: user.profile, interests: selectedInterests } });
      toast.success("Interests updated successfully!");
      onUpdate?.();
    } catch (e: any) {
      toast.error("Failed to update interests");
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/40">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="general" className="rounded-lg text-xs"><User className="h-3.5 w-3.5 mr-1.5 md:mr-2" /> <span className="hidden md:inline">General</span></TabsTrigger>
              <TabsTrigger value="avatar" className="rounded-lg text-xs"><ImageIcon className="h-3.5 w-3.5 mr-1.5 md:mr-2" /> <span className="hidden md:inline">Avatar</span></TabsTrigger>
              <TabsTrigger value="interests" className="rounded-lg text-xs"><Heart className="h-3.5 w-3.5 mr-1.5 md:mr-2" /> <span className="hidden md:inline">Interests</span></TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg text-xs"><Lock className="h-3.5 w-3.5 mr-1.5 md:mr-2" /> <span className="hidden md:inline">Security</span></TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 pt-4 h-[400px] overflow-y-auto hide-scrollbar">
            {/* GENERAL TAB */}
            <TabsContent value="general" className="m-0 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <form onSubmit={handleUpdateGeneral} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={general.username} 
                    onChange={e => setGeneral({...general, username: e.target.value})} 
                    className="bg-background/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={general.email} 
                    onChange={e => setGeneral({...general, email: e.target.value})} 
                    className="bg-background/50 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      value={general.phone} 
                      onChange={e => setGeneral({...general, phone: e.target.value})} 
                      className="bg-background/50 rounded-xl"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      value={general.country} 
                      onChange={e => setGeneral({...general, country: e.target.value})} 
                      className="bg-background/50 rounded-xl"
                      placeholder="e.g. Rwanda"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingGeneral}
                  className="w-full rounded-xl shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isUpdatingGeneral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </TabsContent>

            {/* AVATAR TAB */}
            <TabsContent value="avatar" className="m-0 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {AVATAR_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize transition-colors ${
                        selectedStyle === style ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {generatedAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAvatar(url)}
                    disabled={isUpdatingAvatar}
                    className="aspect-square rounded-2xl bg-secondary/30 p-2 border border-border/40 hover:border-primary/50 transition-all hover:scale-105"
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              <Button 
                variant="secondary"
                onClick={() => setSeed(Math.random().toString(36).substring(7))}
                className="w-full rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Generate More
              </Button>
            </TabsContent>

            {/* INTERESTS TAB */}
            <TabsContent value="interests" className="m-0 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm text-muted-foreground mb-4">Select categories you're interested in to get better event recommendations.</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        isSelected 
                          ? "bg-primary/20 border-primary text-primary" 
                          : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 mt-4 border-t border-border/40">
                <Button 
                  onClick={handleUpdateInterests}
                  disabled={isUpdatingInterests}
                  className="w-full rounded-xl shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isUpdatingInterests ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Interests"}
                </Button>
              </div>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="m-0 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="bg-background/50 rounded-xl"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password"
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="bg-background/50 rounded-xl"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword || !password || !confirmPassword}
                  className="w-full rounded-xl shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
