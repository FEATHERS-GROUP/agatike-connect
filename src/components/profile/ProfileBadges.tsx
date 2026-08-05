import React from "react";
import { Lock } from "lucide-react";

// Custom Agatike Icons
const ExplorerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const EnthusiastIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const VipIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 4h20M2 4l3 16h14l3-16M2 4l6 8 4-8 4 8 6-8"/>
  </svg>
);

const SocialIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SubscriberIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

interface ProfileBadgesProps {
  historyCount: number;
  upcomingCount: number;
  followingCount: number;
  subscriptionsCount: number;
}

export function ProfileBadges({
  historyCount,
  upcomingCount,
  followingCount,
  subscriptionsCount,
}: ProfileBadgesProps) {
  const totalEvents = historyCount + upcomingCount;

  const BADGES = [
    {
      id: "event_explorer",
      title: "Event Explorer",
      description: "Attended 10+ events",
      icon: ExplorerIcon,
      unlocked: totalEvents >= 10,
      color: "from-orange-400 to-orange-500",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      id: "event_enthusiast",
      title: "Enthusiast",
      description: "Attended 50+ events",
      icon: EnthusiastIcon,
      unlocked: totalEvents >= 50,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      id: "vip_attendee",
      title: "VIP Attendee",
      description: "Attended 100+ events",
      icon: VipIcon,
      unlocked: totalEvents >= 100,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-500",
    },
    {
      id: "social_butterfly",
      title: "Social Butterfly",
      description: "Following 25+ organizers",
      icon: SocialIcon,
      unlocked: followingCount >= 25,
      color: "from-orange-300 to-amber-500",
      bgColor: "bg-orange-400/10",
      iconColor: "text-orange-400",
    },
    {
      id: "loyal_subscriber",
      title: "Loyal Subscriber",
      description: "Active on 5+ subscriptions",
      icon: SubscriberIcon,
      unlocked: subscriptionsCount >= 5,
      color: "from-red-400 to-orange-600",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 md:mb-4 px-2">
        <h2 className="text-base md:text-lg font-bold text-foreground">Achievements</h2>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {BADGES.filter(b => b.unlocked).length} / {BADGES.length}
        </span>
      </div>

      {/* MOBILE VIEW (Stories style) */}
      <div className="md:hidden flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-2 snap-x">
        {BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.id} className="flex flex-col items-center gap-1.5 snap-start shrink-0">
              <div 
                className={`relative p-[2px] rounded-full transition-transform duration-300 ${
                  badge.unlocked ? `bg-gradient-to-tr ${badge.color}` : "bg-border/40"
                }`}
              >
                <div className={`h-14 w-14 rounded-full flex items-center justify-center border-2 border-background ${
                  badge.unlocked ? "bg-background" : "bg-secondary/40 grayscale"
                }`}>
                  {badge.unlocked ? (
                    <Icon className={`h-6 w-6 ${badge.iconColor}`} />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-bold text-center w-16 leading-tight ${
                badge.unlocked ? "text-foreground" : "text-muted-foreground"
              }`}>
                {badge.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW (Card style) */}
      <div className="hidden md:flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-2">
        {BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border min-w-[120px] shrink-0 transition-all duration-300 ${
                badge.unlocked
                  ? "border-border/60 bg-card shadow-sm hover:-translate-y-1"
                  : "border-border/30 bg-secondary/20 opacity-60 grayscale hover:opacity-80"
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                  badge.unlocked ? badge.bgColor : "bg-secondary"
                }`}
              >
                {badge.unlocked ? (
                  <Icon className={`h-6 w-6 ${badge.iconColor}`} />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <h3
                className={`text-xs font-bold text-center ${
                  badge.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {badge.title}
              </h3>
              <p className="text-[10px] text-center text-muted-foreground mt-1 px-1 leading-tight">
                {badge.description}
              </p>
              
              {/* Unlocked Glow Effect */}
              {badge.unlocked && (
                <div
                  className={`absolute inset-0 -z-10 rounded-2xl blur-xl opacity-20 bg-gradient-to-br ${badge.color}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
