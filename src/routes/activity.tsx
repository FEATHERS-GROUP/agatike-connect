import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CalendarDays, Star, Film, ChevronRight, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
});

type Notification = {
  id: string;
  type: string;
  postId: string;
  organizerId: string;
  actorId: string;
  content?: string;
  createdAt: string;
};

function ActivityPage() {
  const { user } = useUserAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    
    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      // Sort by createdAt desc locally since Firestore requires a composite index for where+orderBy
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Filter out notifications triggered by the user themselves
      setNotifications(notifs.filter(n => n.actorId !== user.id));
    });

    return () => unsubscribe();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      <div className="px-4 py-3 sticky top-0 bg-background/90 backdrop-blur-md z-30 border-b border-border/40">
        <h1 className="font-bold text-2xl tracking-tight">Activity</h1>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
          Recent
        </h2>
        <div className="space-y-5">
          {notifications.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No recent activity.
            </div>
          )}
          {notifications.map((n) => {
            const isComment = n.type === "comment";
            const Icon = isComment ? MessageCircle : Heart;
            const color = isComment ? "text-primary" : "text-rose-500";
            const bg = isComment ? "bg-primary/10 border-primary/20" : "bg-rose-500/10 border-rose-500/20";
            const title = isComment ? "New Reply" : "New Like";
            const description = isComment && n.content ? `Someone commented: "${n.content}"` : "Someone interacted with a post you follow.";

            return (
              <div
                key={n.id}
                className="flex items-start gap-4 p-3 rounded-2xl bg-card border border-border/40 shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div
                    className={`absolute -bottom-2 -right-2 h-7 w-7 rounded-full ${bg} border-2 border-background flex items-center justify-center shadow-sm`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-bold truncate">{title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-snug line-clamp-2 mb-2">
                    {description}
                  </p>

                  <Link to={`/community/${n.postId}`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 w-full rounded-lg text-xs font-bold shadow-md shadow-primary/20"
                    >
                      View Post
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Removed Earlier mock section */}
    </div>
  );
}
