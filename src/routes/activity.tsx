import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CalendarDays, Star, Film, ChevronRight } from "lucide-react";
import { events, experiences, movies } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

type Notification = {
  id: string;
  type: "booking" | "new_event" | "rating" | "movie";
  title: string;
  description: string;
  time: string;
  image: string;
  icon: any;
  color: string;
  bg: string;
  actionText: string;
  link: string;
};

function ActivityPage() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "booking",
      title: "Booking Confirmed",
      description: `You're all set for ${events[0].title}.`,
      time: "2m ago",
      image: events[0].cover,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10 border-green-500/20",
      actionText: "View Ticket",
      link: `/events/${events[0].id}`
    },
    {
      id: "2",
      type: "new_event",
      title: "New Event Announced",
      description: `${events[1].organizer} just dropped tickets for ${events[1].title}.`,
      time: "2h ago",
      image: events[1].cover,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      actionText: "Book Now",
      link: `/events/${events[1].id}`
    },
    {
      id: "3",
      type: "rating",
      title: "Rate Your Experience",
      description: `How was ${experiences[0].title}?`,
      time: "1d ago",
      image: experiences[0].cover,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      actionText: "Rate",
      link: `/explore`
    },
    {
      id: "4",
      type: "movie",
      title: "Now Showing",
      description: `${movies[0].title} is now playing near you.`,
      time: "2d ago",
      image: movies[0].cover,
      icon: Film,
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
      actionText: "Get Seats",
      link: `/movies`
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      <div className="px-4 py-3 sticky top-0 bg-background/90 backdrop-blur-md z-30 border-b border-border/40">
        <h1 className="font-bold text-2xl tracking-tight">Activity</h1>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Recent</h2>
        <div className="space-y-5">
          {notifications.slice(0, 2).map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-start gap-4 p-3 rounded-2xl bg-card border border-border/40 shadow-sm transition-all active:scale-[0.98]">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-secondary">
                    <img src={n.image} alt={n.title} className="h-full w-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${n.bg} border-2 border-background flex items-center justify-center shadow-sm`}>
                    <Icon className={`h-3.5 w-3.5 ${n.color}`} strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-bold truncate">{n.title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">{n.time}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-snug line-clamp-2 mb-2">
                    {n.description}
                  </p>
                  
                  <Link to={n.link as any}>
                    <Button variant={n.type === 'booking' ? 'secondary' : 'default'} size="sm" className={`h-8 w-full rounded-lg text-xs font-bold ${n.type !== 'booking' && 'shadow-md shadow-primary/20'}`}>
                      {n.actionText}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="px-4 py-4 mt-2">
        <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Earlier</h2>
        <div className="space-y-5 opacity-80 hover:opacity-100 transition-opacity">
           {notifications.slice(2).map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-start gap-4 p-3 rounded-2xl bg-card/50 border border-border/40 transition-all active:scale-[0.98]">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-secondary">
                    <img src={n.image} alt={n.title} className="h-full w-full object-cover grayscale-[30%]" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${n.bg} border-2 border-background flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${n.color}`} strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-bold truncate">{n.title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">{n.time}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-snug line-clamp-2 mb-2">
                    {n.description}
                  </p>
                  
                  {n.type === 'rating' ? (
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-5 w-5 text-muted-foreground/30 hover:text-amber-500 hover:fill-amber-500 cursor-pointer transition-colors" />
                      ))}
                    </div>
                  ) : (
                    <Link to={n.link as any}>
                      <Button variant="outline" size="sm" className="h-8 w-full rounded-lg text-xs font-bold">
                        {n.actionText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
