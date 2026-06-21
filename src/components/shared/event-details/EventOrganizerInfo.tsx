import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";

export function EventOrganizerInfo({
  organizerName,
  organizerHandle,
  organizerId,
  cover,
  image,
  eventId,
}: {
  organizerName: string;
  organizerHandle: string;
  organizerId?: string;
  cover?: string;
  image?: string;
  eventId: string;
}) {
  const { isLoggedIn, user } = useUserAuth();
  const { isFollowing, toggleFollow } = useFollowedOrganizers();
  const following = organizerId ? isFollowing(organizerId) : false;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3">
        <img
          src={image || cover}
          className="h-12 w-12 rounded-full object-cover"
          alt={organizerName}
        />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Organized by
          </p>
          <p className="font-semibold">
            {organizerName}{" "}
            <span className="text-xs text-muted-foreground">@{organizerHandle}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="rounded-full shrink-0">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full shrink-0">
          <Share2 className="h-4 w-4" />
        </Button>
        {organizerId && following && isLoggedIn && (
          <Button asChild variant="outline" size="icon" className="rounded-full shrink-0">
            <Link
              to="/$userId/message"
              params={{ userId: user?.id || "" }}
              search={{ chatId: organizerId, eventId }}
            >
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {organizerId && !following && (
          <Button
            variant="default"
            className="rounded-full shrink-0"
            onClick={() => toggleFollow(organizerId)}
          >
            Follow
          </Button>
        )}
      </div>
    </div>
  );
}
