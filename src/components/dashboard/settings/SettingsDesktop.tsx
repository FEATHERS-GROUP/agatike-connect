import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsProfileSidebar } from "./SettingsProfileSidebar";
import { SettingsOverviewTab } from "./SettingsOverviewTab";
import { SettingsSocialTab } from "./SettingsSocialTab";
import { SettingsSecurityTab } from "./SettingsSecurityTab";
import { SettingsIntegrationsTab } from "./SettingsIntegrationsTab";
import { SettingsAccountTypeTab } from "./SettingsAccountTypeTab";
import { WorkspaceWizard } from "../workspaces/WorkspaceWizard";

export interface SettingsViewProps {
  navigate: any;
  workspaces: any[];
  activeWorkspace: any;
  notifications: any[];
  showAllActivities: boolean;
  setShowAllActivities: (show: boolean) => void;
  showAllEarnings: boolean;
  setShowAllEarnings: (show: boolean) => void;
  isWizardOpen: boolean;
  setIsWizardOpen: (show: boolean) => void;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  isAvatarModalOpen: boolean;
  setIsAvatarModalOpen: (show: boolean) => void;
  avatarOptions: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  profile: any;
  register: any;
  errors: any;
  passwordForm: any;
  transactions: any[];
  disableWorkspaceMutation: any;
  handleSaveAll: () => void;
  isSaving: boolean;
  CATEGORIES: { id: string; label: string }[];
}

export function SettingsDesktop(props: SettingsViewProps) {
  const {
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
    transactions,
    disableWorkspaceMutation,
    handleSaveAll,
    isSaving,
    CATEGORIES,
  } = props;

  return (
    <div className="hidden md:flex min-h-screen bg-muted/10 text-foreground font-sans flex-col w-full">
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <div className="w-full md:w-[280px] lg:w-[320px] bg-background border-r border-border/40 shrink-0 px-6 py-8 flex flex-col h-full md:min-h-screen">
          <Button
            variant="ghost"
            className="w-fit mb-8 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent -ml-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <SettingsProfileSidebar
            avatar={avatar}
            setIsAvatarModalOpen={setIsAvatarModalOpen}
            register={register}
            errors={errors}
          />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Top Bar / Tabs inside right area */}
          <div className="bg-background border-b border-border/40 px-8 pt-6 flex items-end justify-between sticky top-14 z-10">
            <div className="flex gap-8 overflow-x-auto hide-scrollbar">
              {[
                { id: "overview", label: "Overview" },
                { id: "social", label: "Social Links" },
                { id: "security", label: "Security" },
                { id: "account-type", label: "Account Type" },
                ...(activeWorkspace?.business
                  ? [{ id: "integrations", label: "Integrations" }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-[14px] font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary),0.5)]" />
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="rounded-full shadow-sm gap-2 px-6 h-9 mb-3"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="p-8 flex-1">
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

            {activeTab === "integrations" && activeWorkspace?.business && (
              <SettingsIntegrationsTab />
            )}

            {activeTab === "account-type" && <SettingsAccountTypeTab profile={profile} />}
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
