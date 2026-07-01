import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizerCardProps {
  org: any;
  following: boolean;
  isLoggedIn: boolean;
  rating?: { avg: number; count: number };
  onClick: () => void;
  onFollowToggle: (e: React.MouseEvent) => void;
}

export function OrganizerCard({
  org,
  following,
  isLoggedIn,
  rating,
  onClick,
  onFollowToggle,
}: OrganizerCardProps) {
  const followerCount = org.followers ?? 0;
  const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-border/60 bg-card p-3 md:p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 cursor-pointer flex flex-row items-center text-left md:flex-col md:items-center md:text-center animate-in fade-in duration-300 w-full"
    >
      <div className="relative h-12 w-12 shrink-0 md:h-20 md:w-20 md:mb-3 rounded-full overflow-hidden border border-border/40">
        <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 ml-3 md:ml-0">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 w-full text-foreground">
          {org.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
          {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}{" "}
          {followerCount === 1 ? "follower" : "followers"}
        </p>

        {rating && (
          <div className="flex items-center gap-1 mt-0.5 md:mt-2 md:justify-center text-xs text-primary font-medium">
            <Star className="h-3 w-3 fill-primary" />
            <span>{rating.avg.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">({rating.count})</span>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <Button
          variant={following ? "outline" : "default"}
          className={`w-24 shrink-0 ml-3 md:w-full md:ml-0 md:mt-4 rounded-full text-xs font-semibold h-8 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
          style={following ? undefined : { background: "var(--gradient-primary)" }}
          onClick={(e) => {
            e.stopPropagation();
            onFollowToggle(e);
          }}
        >
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
