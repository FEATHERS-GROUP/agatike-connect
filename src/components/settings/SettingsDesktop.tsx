import React from "react";
import { SettingsProps } from "./SettingsTypes";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  ChevronDown,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { RefundPolicy } from "@/components/legal/RefundPolicy";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";

export function SettingsDesktop(props: SettingsProps) {
  const {
    user,
    theme,
    setTheme,
    navigate,
    desktopTab,
    setDesktopTab,
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
    DESKTOP_TABS,
    COUNTRIES,
    INTEREST_OPTIONS,
    AVATAR_STYLES,
  } = props;

  const desktopTabMeta = DESKTOP_TABS.flatMap((g) => g.items).find((i) => i.id === desktopTab);

  const renderContent = () => {
    switch (desktopTab) {
      case "general":
        return (
          <form onSubmit={handleUpdateGeneral} className="space-y-6">
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
              <div className="grid grid-cols-1 gap-6 max-w-3xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Name</Label>
                    <Input
                      value={general.username}
                      onChange={(e) => setGeneral({ ...general, username: e.target.value })}
                      className="bg-background/50 rounded-xl border-border/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <Input
                      type="email"
                      value={general.email}
                      onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                      className="bg-background/50 rounded-xl border-border/40"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <Input
                      value={general.phone}
                      onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                      className="bg-background/50 rounded-xl border-border/40"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Gender</Label>
                    <div className="relative">
                      <select
                        value={general.gender}
                        onChange={(e) => setGeneral({ ...general, gender: e.target.value })}
                        className="flex appearance-none h-10 w-full rounded-xl border border-border/40 bg-background/50 px-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                  <Label className="text-muted-foreground">Country</Label>
                  <div className="relative">
                    <select
                      value={general.country}
                      onChange={(e) => setGeneral({ ...general, country: e.target.value })}
                      className="flex appearance-none h-10 w-full rounded-xl border border-border/40 bg-background/50 px-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
              className="rounded-xl px-8 h-10 shadow-sm transition-all"
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
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`text-xs px-4 py-2 rounded-full whitespace-nowrap capitalize transition-all ${
                    selectedStyle === style
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
              {generatedAvatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setStagedAvatar(url)}
                  disabled={isUpdatingAvatar}
                  className={`aspect-square rounded-2xl p-2 border transition-all hover:scale-105 hover:shadow-md ${
                    stagedAvatar === url
                      ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-secondary/20 border-border/40 hover:border-primary/40"
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              {stagedAvatar && (
                <Button
                  onClick={() => handleSelectAvatar(stagedAvatar)}
                  disabled={isUpdatingAvatar}
                  className="rounded-xl px-6"
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
                className="rounded-xl px-6 border border-border/60"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Generate More
              </Button>
            </div>
          </div>
        );
      case "interests":
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Select categories you're interested in to get better event recommendations tailored
              just for you.
            </p>
            <div className="flex flex-wrap gap-2.5">
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
                    className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
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

              if (!isChanged) return null;

              return (
                <div className="pt-2">
                  <Button
                    onClick={handleUpdateInterests}
                    disabled={isUpdatingInterests}
                    className="rounded-xl px-8 shadow-sm transition-all"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isUpdatingInterests ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Interests"
                    )}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      case "security":
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {isOtpStep ? (
              <div className="flex flex-col gap-4 text-center py-8 max-w-sm mx-auto">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Verification Required</h3>
                <p className="text-sm text-muted-foreground">
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
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">New Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 rounded-xl border-border/40"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 rounded-xl border-border/40"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              disabled={isUpdatingPassword || (!isOtpStep && (!password || !confirmPassword))}
              className="rounded-xl px-8 shadow-sm transition-all"
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
          <div className="space-y-6 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Choose your preferred application theme.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {DESKTOP_TABS[1].items.find((i) => i.id === "preferences") &&
                [
                  { id: "light", label: "Light", icon: DESKTOP_TABS[1].items[1].icon }, // using fallback icons since they aren't explicitly passed
                  { id: "dark", label: "Dark", icon: DESKTOP_TABS[1].items[1].icon },
                  { id: "system", label: "System", icon: DESKTOP_TABS[1].items[1].icon },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all hover:scale-105 ${
                      theme === t.id
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-md"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${theme === t.id ? "bg-primary/20" : "bg-secondary"}`}
                    >
                      {t.id === "light" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2" />
                          <path d="M12 20v2" />
                          <path d="m4.93 4.93 1.41 1.41" />
                          <path d="m17.66 17.66 1.41 1.41" />
                          <path d="M2 12h2" />
                          <path d="M20 12h2" />
                          <path d="m6.34 17.66-1.41 1.41" />
                          <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                      ) : t.id === "dark" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{t.label}</span>
                  </button>
                ))}
            </div>
          </div>
        );
      case "terms":
        return <TermsAndConditions />;
      case "refunds":
        return <RefundPolicy />;
      case "privacy":
        return <PrivacyPolicy />;
      case "delete":
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4 py-4 border-b border-border/40">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently deactivate your account and log you out.
                </p>
              </div>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive/90 space-y-2">
                <p className="font-semibold text-base">This action cannot be undone.</p>
                <p>
                  All your data, bookings, tickets, and followers will become inaccessible. We
                  cannot recover an account once it has been deleted.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Label className="text-sm text-muted-foreground">
                Type your handle <strong className="text-foreground">@{user?.handle}</strong> to
                confirm:
              </Label>
              <Input
                value={deleteConfirmHandle}
                onChange={(e) => setDeleteConfirmHandle(e.target.value)}
                placeholder={`@${user?.handle}`}
                className="bg-background/50 rounded-xl border-destructive/30 focus-visible:ring-destructive max-w-sm"
              />
            </div>

            <Button
              variant="destructive"
              className="rounded-xl px-8 mt-2"
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
    <div className="hidden md:flex min-h-screen bg-secondary/20">
      {/* Left Sidebar */}
      <aside className="w-[300px] shrink-0 border-r border-border/40 bg-card/60 backdrop-blur sticky top-0 h-screen flex flex-col overflow-y-auto">
        {/* User profile brief */}
        <div className="px-6 pt-8 pb-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            {user?.profile ? (
              <img
                src={user.profile}
                alt={user.username}
                className="h-14 w-14 rounded-[12px] object-cover border-2 border-border/60 bg-secondary shadow-sm"
              />
            ) : (
              <div className="h-14 w-14 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-border/60 shadow-sm">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-base text-foreground truncate leading-tight">
                {user?.username || "User"}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">@{user?.handle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-4 py-6 space-y-8">
          {DESKTOP_TABS.map((group) => (
            <div key={group.group}>
              <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item: any) => {
                  const isActive = desktopTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setDesktopTab(item.id);
                        setIsOtpStep(false);
                        setOtpInput("");
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? item.color : "bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-4 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Back to Profile */}
        <div className="px-6 py-6 border-t border-border/40">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <Navbar />

        <main className="flex-1 px-8 lg:px-12 py-10 max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between pb-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              {desktopTabMeta && (
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${desktopTabMeta.color}`}
                >
                  <desktopTabMeta.icon className="h-7 w-7" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {desktopTabMeta?.label}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{desktopTabMeta?.desc}</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-card rounded-[24px] border border-border/40 shadow-sm p-8 min-h-[500px]">
            {renderContent()}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
