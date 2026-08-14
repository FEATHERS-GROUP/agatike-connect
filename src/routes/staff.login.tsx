import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { loginCompanyUser, getStaffAssignmentsByEmail } from "@/api/staff_portal_auth";
import { Lock, ArrowRight, ChevronRight, User } from "lucide-react";
import { MobileNav } from "@/components/mobile/MobileNav";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUserStaffAssignments } from "@/api/staff";
import { getWorkspaceUserByLinkedId } from "@/api/workspace_users";

export const Route = createFileRoute("/staff/login")({
  component: StaffLoginRoute,
});

function Numpad({ onPinComplete, error }: { onPinComplete: (pin: string) => void; error: string }) {
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length < 9) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 9) {
        onPinComplete(newPin);
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              pin.length > i
                ? "bg-primary shadow-[0_0_10px_var(--color-primary)] scale-125"
                : "bg-black/10 dark:bg-white/20"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-destructive text-sm mb-6 animate-pulse">{error}</p>}

      <div className="grid grid-cols-3 gap-x-8 gap-y-4 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="w-16 h-16 rounded-full bg-black/5 border border-black/10 text-2xl font-medium flex items-center justify-center active:bg-black/10 active:scale-95 transition-all mx-auto backdrop-blur-md"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress("0")}
          className="w-16 h-16 rounded-full bg-black/5 border border-black/10 text-2xl font-medium flex items-center justify-center active:bg-black/10 active:scale-95 transition-all mx-auto backdrop-blur-md"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full text-muted-foreground text-xl font-medium flex items-center justify-center active:text-foreground active:scale-95 transition-all mx-auto"
        >
          DEL
        </button>
      </div>
    </div>
  );
}

function StaffLoginRoute() {
  const navigate = useNavigate();
  const [loginStep, setLoginStep] = useState<
    "gateway" | "company" | "staff_email" | "staff_event_select" | "staff_pin"
  >("gateway");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffAssignments, setStaffAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { isLoggedIn, user } = useUserAuth();

  const { data: staffAssignmentsLinked = [] } = useQuery({
    queryKey: ["user-staff-assignments", user?.id, user?.email],
    queryFn: () =>
      getUserStaffAssignments({ data: { user_id: user?.id, email: user?.email } } as any),
    enabled: !!user && isLoggedIn,
  });

  const { data: workspaceUser } = useQuery({
    queryKey: ["user-workspace-account", user?.id],
    queryFn: () => getWorkspaceUserByLinkedId({ data: { user_id: user?.id } } as any),
    enabled: !!user && isLoggedIn,
  });

  const activeAssignments = staffAssignmentsLinked.filter((a: any) => {
    const isExpired =
      a.event?.schedules?.[0]?.end_date && new Date(a.event.schedules[0].end_date) < new Date();
    return !isExpired;
  });

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await loginCompanyUser({ data: { email, password } } as any);
      if (res.success) {
        // We set the auth state and redirect to workspace route
        const authState = {
          role: res.role,
          email: res.email,
          name: res.name,
          id: res.id,
        };
        localStorage.setItem(`staff_auth_ws_${res.id}`, JSON.stringify(authState));
        localStorage.setItem(`staff_session_ws_${res.id}`, Date.now().toString());
        navigate({ to: `/staff/workspace/${res.id}` });
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStaffEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const assignments = await getStaffAssignmentsByEmail({ data: { email: staffEmail } } as any);
      if (assignments.length > 0) {
        setStaffAssignments(assignments);
        setLoginStep("staff_event_select");
      } else {
        setLoginError("No active staff assignments found for this email.");
      }
    } catch (err: any) {
      setLoginError("Failed to verify staff email");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative bg-background flex flex-col items-center justify-center text-foreground px-6 w-full overflow-hidden font-sans pb-24">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center my-auto pt-10">
        {/* Glassmorphism Card */}
        <div className="w-full bg-background/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] flex flex-col items-center relative overflow-hidden">
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] border border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping opacity-20" />
            <img
              src="/agatike-icon-new.png"
              alt="Agatike Logo"
              className="h-12 w-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-3xl font-black mb-2 text-center tracking-tight">Agatike Connect</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center font-medium">
            {loginStep === "gateway" && "Welcome to the Staff Portal"}
            {loginStep === "company" && "Sign in to your workspace account"}
            {loginStep === "staff_email" && "Enter your staff email"}
            {loginStep === "staff_event_select" && "Select your assignment"}
            {loginStep === "staff_pin" && "Enter your 9-digit security PIN"}
          </p>

          <div className="w-full relative min-h-[200px] flex flex-col items-center justify-center">
            {loginStep === "gateway" && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Event Staff Button */}
                {(!isLoggedIn || activeAssignments.length > 0) && (
                  <button
                    onClick={() => {
                      if (isLoggedIn && activeAssignments.length > 0) {
                        // Quick login for event staff
                        const a = activeAssignments[0];
                        const authState = {
                          role: "event_staff",
                          email: a.email || user?.email,
                          id: a.id,
                          app_permissions: a.app_permissions || [],
                          allowed_sections: a.allowed_sections || [],
                          name: a.role,
                        };
                        localStorage.setItem(`staff_auth_${a.event_id}`, JSON.stringify(authState));
                        localStorage.setItem(`staff_session_${a.event_id}`, Date.now().toString());
                        navigate({ to: `/staff/event/${a.event_id}` });
                      } else {
                        setLoginStep("staff_email");
                      }
                    }}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:shadow-[0_15px_40px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <User className="h-5 w-5" />
                      </div>
                      Event Staff
                    </span>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* Company User Button */}
                {(!isLoggedIn || workspaceUser) && (
                  <>
                    {(!isLoggedIn || activeAssignments.length > 0) && (
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border/50"></div>
                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                          Or
                        </span>
                        <div className="flex-grow border-t border-border/50"></div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (isLoggedIn && workspaceUser) {
                          // Quick login for company admin
                          const authState = {
                            role: workspaceUser.role,
                            email: workspaceUser.email,
                            name: workspaceUser.name,
                            id: workspaceUser.id,
                          };
                          localStorage.setItem(
                            `staff_auth_ws_${workspaceUser.id}`,
                            JSON.stringify(authState),
                          );
                          localStorage.setItem(
                            `staff_session_ws_${workspaceUser.id}`,
                            Date.now().toString(),
                          );
                          navigate({ to: `/staff/workspace/${workspaceUser.id}` });
                        } else {
                          setLoginStep("company");
                        }
                      }}
                      className="w-full py-4 px-6 bg-secondary/60 hover:bg-secondary/80 backdrop-blur-md border border-border/50 rounded-2xl font-bold text-lg active:scale-95 transition-all duration-300 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-xl shadow-sm">
                          <Lock className="h-5 w-5 text-foreground/70" />
                        </div>
                        Company User
                      </span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
              </div>
            )}

            {loginStep === "company" && (
              <form
                onSubmit={handleCompanyLogin}
                className="w-full space-y-4 animate-in fade-in slide-in-from-right-8 duration-300"
              >
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-xl border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-xl border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {loginError && (
                  <p className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg">
                    {loginError}
                  </p>
                )}

                <button
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold mt-2 shadow-[0_5px_20px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginStep("gateway")}
                  className="w-full py-3 text-muted-foreground font-medium text-sm mt-2 hover:text-foreground transition-colors"
                >
                  Back to options
                </button>
              </form>
            )}

            {loginStep === "staff_email" && (
              <form
                onSubmit={handleStaffEmailSubmit}
                className="w-full space-y-4 animate-in fade-in slide-in-from-right-8 duration-300"
              >
                <input
                  type="email"
                  placeholder="Staff Email"
                  className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-xl border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
                {loginError && (
                  <p className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg">
                    {loginError}
                  </p>
                )}

                <button
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold mt-2 shadow-[0_5px_20px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginStep("gateway")}
                  className="w-full py-3 text-muted-foreground font-medium text-sm mt-2 hover:text-foreground transition-colors"
                >
                  Back to options
                </button>
              </form>
            )}

            {loginStep === "staff_event_select" && (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border">
                  {staffAssignments.map((a: any) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAssignment(a);
                        setLoginStep("staff_pin");
                      }}
                      className="w-full p-5 bg-background/60 hover:bg-secondary/80 backdrop-blur-xl border border-white/5 hover:border-primary/30 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all duration-200 text-left group"
                    >
                      <div>
                        <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {a.event?.title || "Event"}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider rounded-md border border-border/50">
                            {a.role}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setLoginStep("staff_email")}
                  className="w-full py-3 text-muted-foreground font-medium text-sm mt-4 hover:text-foreground transition-colors"
                >
                  Use a different email
                </button>
              </div>
            )}

            {loginStep === "staff_pin" && selectedAssignment && (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="px-4 py-2 bg-secondary/50 rounded-full border border-white/5 mb-6 text-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mr-2">
                    Event
                  </span>
                  <span className="font-bold text-sm">{selectedAssignment.event?.title}</span>
                </div>

                <Numpad
                  error={loginError}
                  onPinComplete={(pin) => {
                    if (pin === String(selectedAssignment.pin_code)) {
                      const authState = {
                        role: "event_staff",
                        email: staffEmail,
                        id: selectedAssignment.id,
                        app_permissions: selectedAssignment.app_permissions || [],
                        allowed_sections: selectedAssignment.allowed_sections || [],
                        name: selectedAssignment.role,
                      };
                      localStorage.setItem(
                        `staff_auth_${selectedAssignment.event_id}`,
                        JSON.stringify(authState),
                      );
                      localStorage.setItem(
                        `staff_session_${selectedAssignment.event_id}`,
                        Date.now().toString(),
                      );
                      navigate({ to: `/staff/event/${selectedAssignment.event_id}` });
                    } else {
                      setLoginError("Incorrect PIN");
                    }
                  }}
                />
                <button
                  onClick={() => setLoginStep("staff_event_select")}
                  className="mt-6 text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
                >
                  Back to events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
