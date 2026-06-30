import { Button } from "@/components/ui/button";
import { CheckCircle2, Instagram, Star, Twitter } from "lucide-react";

interface OrganizerProfileProps {
  org: any;
  following: boolean;
  isLoggedIn: boolean;
  rating?: { avg: number; count: number };
  onFollowToggle: () => void;
}

export function OrganizerProfile({
  org,
  following,
  isLoggedIn,
  rating,
  onFollowToggle,
}: OrganizerProfileProps) {
  const followerCount = org.followers ?? 0;
  const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
  const twitterUrl =
    org.twitterUrl || org.socials?.twitter || `https://twitter.com/${org.handle}`;
  const instagramUrl =
    org.instagramUrl || org.socials?.instagram || `https://instagram.com/${org.handle}`;

  return (
    <div className="flex flex-col items-center pt-4 pb-6 px-4">
      <div className="h-24 w-24 rounded-full overflow-hidden border border-border/40 shadow-sm mb-4 relative">
        <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <h2 className="text-xl font-bold text-foreground">{org.name}</h2>
        <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-2">
        @{org.handle} ·{" "}
        {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}{" "}
        {followerCount === 1 ? "follower" : "followers"}
      </p>

      {rating && (
        <div className="flex items-center gap-1 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Star className="h-3 w-3 fill-primary" />
          <span>{rating.avg.toFixed(1)}</span>
          <span className="text-muted-foreground font-normal">
            ({rating.count} {rating.count === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      <p className="text-center text-sm mb-6 max-w-xs text-muted-foreground">{org.bio}</p>

      <div className="flex gap-4 w-full justify-center mb-6">
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {isLoggedIn && (
        <Button
          onClick={onFollowToggle}
          variant={following ? "outline" : "default"}
          className={`w-full max-w-xs rounded-full font-bold ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
          style={following ? undefined : { background: "var(--gradient-primary)" }}
        >
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
