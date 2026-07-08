import { Link } from "@tanstack/react-router";
import { Search, Plus, Menu, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function Navbar({ hideOnMobile }: { hideOnMobile?: boolean } = {}) {
  const { isLoggedIn, user } = useUserAuth();

  return (
    <header className="hidden md:block sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon.svg" alt="Agatike" className="h-8 w-auto" />
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex text-sm text-muted-foreground">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Explore
          </Link>
          <Link
            to="/events"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Events
          </Link>
          <Link
            to="/movies"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Movies
          </Link>
          <Link
            to="/buses"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Trips
          </Link>
          <Link
            to="/venues"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Spaces
          </Link>
          <Link
            to="/pricing"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-sm md:block">
          <div className="relative">
            <Bus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search buses, routes, agencies"
              className="pl-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-2">
          <Link to="/dashboard">
            <Button
              className="rounded-full shadow-[var(--shadow-glow)] px-3 sm:px-4 mr-1 sm:mr-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline-block text-sm font-medium">Create & Host</span>
            </Button>
          </Link>

          {!isLoggedIn ? (
            <Link to="/signin">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm font-medium">
                Sign in
              </Button>
            </Link>
          ) : (
            <Link to="/profile">
              <div
                className="h-9 w-9 rounded-full p-[2px] shadow-sm shrink-0 hover:opacity-80 transition-opacity"
                style={{ background: "var(--gradient-primary)" }}
              >
                <img
                  src={user?.profile || "https://i.pravatar.cc/150?u=me"}
                  alt={user?.username || "Profile"}
                  className="h-full w-full rounded-full object-cover bg-card"
                />
              </div>
            </Link>
          )}
          <Link to="/buses/mobile" className="md:hidden ml-2" aria-label="Trips">
            <Bus className="h-5 w-5 text-foreground/80 hover:text-foreground" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1 rounded-full text-foreground/80 hover:text-foreground hover:bg-secondary/80 active:scale-95 transition-all"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
