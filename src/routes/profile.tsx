import { createFileRoute } from "@tanstack/react-router";
import { Settings, CheckCircle2, Grid, Bookmark, Ticket } from "lucide-react";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const isOrganizer = false; // Could toggle with AppContext later

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <h1 className="font-bold text-xl tracking-tight">gatike_user</h1>
        <button className="p-2 -mr-2 text-foreground">
          <Settings className="h-6 w-6" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full p-1 bg-gradient-to-tr from-primary to-accent">
              <img src="https://i.pravatar.cc/150?u=me" alt="Profile" className="h-full w-full rounded-full border-4 border-background object-cover" />
            </div>
            {isOrganizer && (
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5">
                <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />
              </div>
            )}
          </div>
          
          <div className="flex-1 flex justify-around text-center">
            <div className="flex flex-col">
              <span className="font-bold text-lg">24</span>
              <span className="text-xs text-muted-foreground">Events</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">1.2k</span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">340</span>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-bold">Alex Doe</h2>
          <p className="text-sm text-foreground mt-1">Living for the weekend 🎵<br/>📍 Kigali, Rwanda</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-secondary text-foreground font-bold py-2 rounded-lg text-sm">Edit Profile</button>
          <button className="flex-1 bg-secondary text-foreground font-bold py-2 rounded-lg text-sm">Share Profile</button>
        </div>
      </div>

      {/* Badges / Highlights (Stories) */}
      <div className="px-4 py-4 flex gap-4 overflow-x-auto hide-scrollbar">
        {["VIP 2025", "Festival", "Top Fan"].map((title, i) => (
          <div key={title} className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-16 w-16 rounded-full border border-border bg-secondary flex items-center justify-center p-0.5">
              <img src={`https://i.pravatar.cc/150?img=${i+4}`} className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="text-xs font-medium">{title}</span>
          </div>
        ))}
      </div>

      {/* Grid Tabs */}
      <div className="flex w-full border-t border-border/40 mt-2">
        <button className="flex-1 flex justify-center py-3 border-t-2 border-foreground text-foreground">
          <Grid className="h-6 w-6" />
        </button>
        <button className="flex-1 flex justify-center py-3 border-t-2 border-transparent text-muted-foreground hover:text-foreground">
          <Ticket className="h-6 w-6" />
        </button>
        <button className="flex-1 flex justify-center py-3 border-t-2 border-transparent text-muted-foreground hover:text-foreground">
          <Bookmark className="h-6 w-6" />
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {events.map((event, i) => (
          <div key={i} className="aspect-square bg-secondary relative group overflow-hidden">
            <img src={event.cover} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
