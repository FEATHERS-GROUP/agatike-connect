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
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3 md:p-4">
      <div className="flex items-center gap-2.5 md:gap-3 shrink-0 max-w-[55%] sm:max-w-none">
        <img
          src={image || cover}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shrink-0"
          alt={organizerName}
        />
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold truncate">
            Organized by
          </p>
          <p className="text-sm md:text-base font-semibold truncate">
            {organizerName}{" "}
            <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">
              @{organizerHandle}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <Button
          variant="outline"
          className="h-9 w-9 md:h-12 md:w-12 rounded-full shrink-0 p-0 flex items-center justify-center"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-9 w-9 md:h-12 md:w-12 rounded-full shrink-0 p-0 flex items-center justify-center"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        {organizerId && following && isLoggedIn && (
          <Button
            asChild
            variant="outline"
            className="h-9 w-9 md:h-12 md:w-12 rounded-full shrink-0 p-0 flex items-center justify-center"
          >
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
            className="h-9 px-3.5 md:h-12 md:px-6 text-xs md:text-sm rounded-full shrink-0"
            onClick={() => toggleFollow(organizerId)}
          >
            Follow
          </Button>
        )}
      </div>
    </div>
  );
}
