import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Bus, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Bus", href: "/buses/mobile", icon: Bus },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pb-4 sm:pb-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-[68px] max-w-[400px] items-center justify-between rounded-full border border-white/10 dark:border-white/5 bg-background/75 px-6 shadow-2xl shadow-primary/10 backdrop-blur-2xl backdrop-saturate-150">
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
      </div>
    </div>
  );
}
