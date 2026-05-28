import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, PlusCircle, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Create", href: "/create-event", icon: PlusCircle },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between rounded-full border border-border/40 bg-background/80 px-6 shadow-lg backdrop-blur-xl mb-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              to={tab.href as any}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-primary/20 stroke-[2.5]")} />
              {isActive && (
                <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
