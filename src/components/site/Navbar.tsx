import { Link } from "@tanstack/react-router";
import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            A
          </div>
          <span className="text-lg font-semibold tracking-tight">Agatike</span>
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
            to="/experiences"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Experiences
          </Link>
          <Link
            to="/movies"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Movies
          </Link>
          <Link
            to="/feed"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Stories
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-sm md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, cities, organizers"
              className="pl-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-2">
          <Link to="/signin">
            <Button variant="ghost" className="hidden sm:inline-flex text-sm font-medium">
              Sign in
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              className="rounded-full shadow-[var(--shadow-glow)] px-3 sm:px-4"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline-block text-sm font-medium">Create event</span>
            </Button>
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
