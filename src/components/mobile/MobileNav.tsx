import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Bus,
  User,
  Menu,
  Film,
  CalendarDays,
  Repeat,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useState, useEffect, useRef } from "react";

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useUserAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Events", href: "/events", icon: CalendarDays },
    { name: "Spaces", href: "/venues", icon: Building2 },
  ];

  const moreMenuLinks = [
    { name: "Trips", href: "/buses/mobile", icon: Bus },
    { name: "Movies & Cinemas", href: "/movies", icon: Film },
    { name: "Subscriptions", href: "/subscriptions", icon: Repeat, requiresAuth: true },
    { name: "Profile Settings", href: "/settings", icon: User, requiresAuth: true },
  ];

  // Close on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    const handleTouch = (e: TouchEvent | MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("touchstart", handleTouch);
    document.addEventListener("mousedown", handleTouch);
    return () => {
      document.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("mousedown", handleTouch);
    };
  }, [moreOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const handleNavLink = (href: string) => {
    setMoreOpen(false);
    navigate({ to: href as any });
  };

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onTouchStart={() => setMoreOpen(false)}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      {moreOpen && (
        <div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 z-[70] bg-background border-t border-border/60 rounded-t-3xl shadow-2xl"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h2 className="text-xl font-bold">More Options</h2>
            <button
              onClick={() => setMoreOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1 px-4 pb-4 pt-2">
            {/* Profile / Sign in */}
            {isLoggedIn ? (
              <button
                onClick={() => handleNavLink("/profile")}
                className="flex items-center gap-4 p-4 mb-4 bg-secondary/50 rounded-2xl border border-border/40 hover:bg-secondary/70 transition-colors w-full text-left"
              >
                <div className="h-12 w-12 rounded-full p-[2px] bg-gradient-to-tr from-primary to-primary/50 shrink-0">
                  <img
                    src={user?.profile || "https://i.pravatar.cc/150?u=me"}
                    alt={user?.username || "Profile"}
                    className="h-full w-full rounded-full object-cover bg-card"
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground leading-tight">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleNavLink("/signin")}
                className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground h-12 font-bold shadow-[var(--shadow-glow)] mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                Sign in or create account
              </button>
            )}

            {moreMenuLinks.map((link) => {
              if (link.requiresAuth && !isLoggedIn) return null;
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavLink(link.href)}
                  className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary active:bg-secondary/80 font-medium text-foreground w-full text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/40 shadow-sm text-muted-foreground shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="pb-10 pt-2 text-center">
            <button
              onClick={() => setMoreOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pb-4 sm:pb-6">
        <div className="mx-auto flex h-[68px] max-w-[400px] items-center justify-between rounded-full border border-white/10 dark:border-white/5 bg-background/80 px-6 shadow-2xl shadow-primary/10 backdrop-blur-3xl backdrop-saturate-150">
          {/* Regular Tabs */}
          {tabs.map((tab) => {
            const isActive =
              location.pathname === tab.href ||
              (tab.href !== "/" && location.pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.href as any}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 transition-all duration-500 ease-out",
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive ? "fill-primary/20 stroke-[2.5]" : "stroke-2",
                    )}
                  />
                </div>
                {/* Animated active indicator */}
                <div
                  className={cn(
                    "absolute -bottom-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ease-out",
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-0",
                  )}
                />
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex h-full flex-col items-center justify-center gap-1 transition-all duration-500 ease-out",
              moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="relative flex items-center justify-center">
              <Menu className="h-6 w-6 stroke-2 transition-all duration-300" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
