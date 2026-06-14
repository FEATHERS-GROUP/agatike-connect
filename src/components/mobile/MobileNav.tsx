import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Bus, Ticket, User, Menu, Film, CalendarDays, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function MobileNav() {
  const location = useLocation();
  const { isLoggedIn, user } = useUserAuth();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Bus", href: "/buses/mobile", icon: Bus },
    { name: "Venues", href: "/venues", icon: Ticket },
  ];

  const moreMenuLinks = [
    { name: "Events", href: "/events", icon: CalendarDays },
    { name: "Movies & Cinemas", href: "/movies", icon: Film },
    { name: "Subscriptions", href: "/subscriptions", icon: Repeat, requiresAuth: true },
    { name: "Profile Settings", href: "/settings", icon: User, requiresAuth: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pb-4 sm:pb-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-[68px] max-w-[400px] items-center justify-between rounded-full border border-white/10 dark:border-white/5 bg-background/80 px-6 shadow-2xl shadow-primary/10 backdrop-blur-3xl backdrop-saturate-150">
        {/* Regular Tabs */}
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              to={tab.href as any}
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-1 transition-all duration-500 ease-out",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground",
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

        {/* More Menu Drawer */}
        <Drawer shouldScaleBackground={false}>
          <DrawerTrigger asChild>
            <button className="relative flex h-full flex-col items-center justify-center gap-1 transition-all duration-500 ease-out text-muted-foreground hover:text-foreground active:scale-95">
              <div className="relative flex items-center justify-center">
                <Menu className="h-6 w-6 stroke-2 transition-all duration-300" />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="px-2 border-border/60">
            <DrawerHeader className="text-left pb-2">
              <DrawerTitle className="text-xl font-bold">More Options</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-1 p-4 pt-0">
              {isLoggedIn ? (
                <div className="flex items-center gap-4 p-4 mb-4 bg-secondary/50 rounded-2xl border border-border/40">
                  <div className="h-12 w-12 rounded-full p-[2px] bg-gradient-to-tr from-primary to-primary/50 shrink-0">
                    <img
                      src={user?.profile || "https://i.pravatar.cc/150?u=me"}
                      alt={user?.username || "Profile"}
                      className="h-full w-full rounded-full object-cover bg-card"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-foreground leading-tight">
                      {user?.username || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <DrawerClose asChild>
                    <Link
                      to="/signin"
                      className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground h-12 font-bold shadow-[var(--shadow-glow)]"
                    >
                      Sign in or create account
                    </Link>
                  </DrawerClose>
                </div>
              )}

              {moreMenuLinks.map((link) => {
                if (link.requiresAuth && !isLoggedIn) return null;
                const Icon = link.icon;
                return (
                  <DrawerClose asChild key={link.href}>
                    <Link
                      to={link.href as any}
                      className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary active:bg-secondary/80 font-medium text-foreground"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/40 shadow-sm text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      {link.name}
                    </Link>
                  </DrawerClose>
                );
              })}
            </div>
            <div className="pb-8 pt-4 text-center">
              <DrawerClose asChild>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Close Menu
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
