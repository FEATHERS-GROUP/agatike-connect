import React from "react";
import { SettingsProps } from "./SettingsTypes";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronDown, RefreshCw, Trash2, AlertTriangle, ArrowLeft, Loader2, Lock, Monitor, Sun, Moon } from "lucide-react";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { RefundPolicy } from "@/components/legal/RefundPolicy";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";

export function SettingsMobile(props: SettingsProps) {
  const {
    user,
    theme,
    setTheme,
    navigate,
    activeModal,
    setActiveModal,
    general,
    setGeneral,
    isUpdatingGeneral,
    isOtpStep,
    setIsOtpStep,
    otpInput,
    setOtpInput,
    deleteConfirmHandle,
    setDeleteConfirmHandle,
    isDeletingAccount,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isUpdatingPassword,
    selectedStyle,
    setSelectedStyle,
    seed,
    setSeed,
    isUpdatingAvatar,
    stagedAvatar,
    setStagedAvatar,
    generatedAvatars,
    selectedInterests,
    setSelectedInterests,
    initialInterests,
    isUpdatingInterests,
    handleUpdateGeneral,
    handleUpdatePassword,
    handleSelectAvatar,
    handleUpdateInterests,
    handleDeleteAccount,
    getModalTitle,
    DESKTOP_TABS,
    COUNTRIES,
    INTEREST_OPTIONS,
    AVATAR_STYLES,
  } = props;

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
                        className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>{c.name}</option>
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
                      className="flex appearance-none h-10 w-full rounded-xl border border-input bg-background/50 px-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select Gender</option>
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
                              (i) => typeof i === "string" && i.toLowerCase() !== interest.toLowerCase(),
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
                Type your handle <strong className="text-foreground">@{user?.handle}</strong> to confirm:
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

  return (
    <div className="md:hidden flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-secondary/20 pt-6 pb-20">
        <div className="px-5 mb-6 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-card shadow-sm border border-border/40 p-[2px] mb-3 relative">
            {user?.profile ? (
              <img src={user.profile} alt={user.username} className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm">
              <div className="h-3 w-3 bg-green-500 rounded-full" />
            </div>
          </div>
          <h1 className="font-bold text-xl">{user?.username || "Guest User"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">@{user?.handle}</p>
        </div>

        <div className="px-4 space-y-6">
          <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/40 bg-secondary/10">
              <h2 className="font-bold text-sm text-muted-foreground tracking-wider uppercase">Account</h2>
            </div>
            <div className="divide-y divide-border/40">
              {DESKTOP_TABS[0].items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
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

          <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/40 bg-secondary/10">
              <h2 className="font-bold text-sm text-muted-foreground tracking-wider uppercase">App Settings</h2>
            </div>
            <div className="divide-y divide-border/40">
              {DESKTOP_TABS[1].items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
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

          <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/40 bg-secondary/10">
              <h2 className="font-bold text-sm text-muted-foreground tracking-wider uppercase">Legal</h2>
            </div>
            <div className="divide-y divide-border/40">
              {DESKTOP_TABS[2].items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModal(item.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
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

          <div className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-destructive/20">
              <h2 className="font-bold text-sm text-destructive tracking-wider uppercase">Danger Zone</h2>
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
                  <p className="text-xs text-muted-foreground">Permanently deactivate your account</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-destructive/50" />
            </button>
          </div>
        </div>
      </main>

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
        <DialogContent className="w-full h-[100dvh] max-w-none p-0 overflow-hidden bg-card border-none rounded-none flex flex-col sm:max-w-none">
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
  );
}
