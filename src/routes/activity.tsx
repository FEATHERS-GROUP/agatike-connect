import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, UserPlus, Ticket } from "lucide-react";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const notifications = [
    { type: "like", user: "amaka_o", text: "liked your photo from AfroFuture", time: "2h", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
    { type: "comment", user: "kwame_b", text: "commented: 'FOMO is real 🔥'", time: "4h", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    { type: "follow", user: "dj_nala", text: "started following you", time: "5h", icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
    { type: "event", user: "Kigali Nights", text: "just announced a new event near you", time: "1d", icon: Ticket, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      <div className="px-4 py-3 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <h1 className="font-bold text-2xl tracking-tight">Activity</h1>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-sm font-bold text-foreground mb-4">New</h2>
        <div className="space-y-4">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="relative">
                  <img src={`https://i.pravatar.cc/100?img=${i+1}`} className="h-12 w-12 rounded-full object-cover" />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${n.bg} flex items-center justify-center border-2 border-background`}>
                    <Icon className={`h-3 w-3 ${n.color}`} fill={n.type === "like" ? "currentColor" : "none"} />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[48px]">
                  <p className="text-sm leading-tight text-foreground">
                    <span className="font-bold">{n.user}</span> {n.text}
                  </p>
                  <span className="text-xs text-muted-foreground mt-0.5">{n.time}</span>
                </div>
                {n.type === "follow" ? (
                  <button className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-lg h-fit self-center">Follow</button>
                ) : (
                  <div className="h-10 w-10 bg-secondary rounded-lg self-center overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80`} className="h-full w-full object-cover opacity-80" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="px-4 py-6 border-t border-border/40 mt-6">
        <h2 className="text-sm font-bold text-foreground mb-4">Earlier</h2>
        {/* Repeating for mockup */}
        <div className="space-y-4 opacity-70">
           {notifications.slice(0, 2).map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="relative">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="h-12 w-12 rounded-full object-cover" />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${n.bg} flex items-center justify-center border-2 border-background`}>
                    <Icon className={`h-3 w-3 ${n.color}`} fill={n.type === "like" ? "currentColor" : "none"} />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[48px]">
                  <p className="text-sm leading-tight text-foreground">
                    <span className="font-bold">{n.user}</span> {n.text}
                  </p>
                  <span className="text-xs text-muted-foreground mt-0.5">{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
