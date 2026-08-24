import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, User, Shield, Link as LinkIcon, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsProfileSidebar } from "./SettingsProfileSidebar";
import { SettingsSocialTab } from "./SettingsSocialTab";
import { SettingsSecurityTab } from "./SettingsSecurityTab";
import { SettingsAccountTypeTab } from "./SettingsAccountTypeTab";
import { SettingsViewProps } from "./SettingsDesktop";
import { useState } from "react";

export function SettingsMobile(props: SettingsViewProps) {
  const {
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
    handleSaveAll,
    isSaving,
    CATEGORIES,
  } = props;

  const [activeMobileView, setActiveMobileView] = useState<"menu" | "profile" | "social" | "security" | "account">("menu");

  const renderContent = () => {
    switch (activeMobileView) {
      case "profile":
        return (
          <div className="bg-background px-4 py-8 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <SettingsProfileSidebar avatar={avatar} setIsAvatarModalOpen={setIsAvatarModalOpen} register={register} errors={errors} />
          </div>
        );
      case "social":
        return (
          <div className="bg-background px-4 py-8 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <SettingsSocialTab register={register} />
          </div>
        );
      case "security":
        return (
          <div className="bg-background px-4 py-8 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <SettingsSecurityTab passwordForm={passwordForm} />
          </div>
        );
      case "account":
        return (
          <div className="bg-background px-4 py-8 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <SettingsAccountTypeTab profile={profile} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="md:hidden min-h-screen bg-[#F4F4F5] dark:bg-background text-foreground font-sans flex flex-col w-full pb-24">
      {/* Header */}
      <div className="bg-[#F4F4F5] dark:bg-background p-4 sticky top-0 z-20 flex items-center justify-between">
        {activeMobileView === "menu" ? (
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="h-10 w-10 -ml-2 rounded-full bg-background border border-border/40 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setActiveMobileView("menu")} className="h-10 w-10 -ml-2 rounded-full bg-background border border-border/40 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <h1 className="font-bold text-[20px] tracking-tight">
          {activeMobileView === "menu" ? "My Settings" : 
           activeMobileView === "profile" ? "Profile Details" :
           activeMobileView === "social" ? "Social Links" :
           activeMobileView === "security" ? "Security" : "Account Type"}
        </h1>
        
        {activeMobileView === "menu" ? (
          <div className="w-10" />
        ) : (
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            size="sm"
            className="rounded-full h-9 px-4 text-xs font-semibold shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {activeMobileView === "menu" ? (
        <div className="p-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Profile Card */}
          <div 
            className="bg-background rounded-2xl p-4 flex items-center justify-between shadow-sm border border-border/40 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setActiveMobileView("profile")}
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/10">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base leading-tight mb-1">{profile?.name || "Organizer Name"}</span>
                <span className="text-sm text-muted-foreground leading-tight">{profile?.email || `@${profile?.handle || "handle"}`}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 px-1">General Settings</h3>
            <div className="bg-background rounded-[1.25rem] border border-border/40 shadow-sm overflow-hidden flex flex-col">
              <div 
                className="flex items-center justify-between p-4 border-b border-border/40 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                onClick={() => setActiveMobileView("social")}
              >
                <div className="flex items-center gap-3.5">
                  <LinkIcon className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
                  <span className="font-medium text-[16px]">Social Links</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>
              
              <div 
                className="flex items-center justify-between p-4 border-b border-border/40 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                onClick={() => setActiveMobileView("security")}
              >
                <div className="flex items-center gap-3.5">
                  <Shield className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
                  <span className="font-medium text-[16px]">Security Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>

              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                onClick={() => setActiveMobileView("account")}
              >
                <div className="flex items-center gap-3.5">
                  <Briefcase className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
                  <span className="font-medium text-[16px]">Account Type</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderContent()
      )}

      {/* Avatar Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="p-5 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Update Profile Picture</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-5 bg-muted/50">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-foreground border border-border"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
              {avatarOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                    avatar === opt
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent bg-background shadow-sm"
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
            <Button variant="ghost" className="rounded-full" onClick={() => setIsAvatarModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground rounded-full shadow-sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
