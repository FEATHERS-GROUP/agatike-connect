import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Film, ChevronRight, MessageCircle, Heart, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
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
  eventId?: string;
  createdAt: string;
};

function ActivityPage() {
  const { user } = useUserAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clearing, setClearing] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", user.id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(notifs.filter((n) => n.actorId !== user.id));
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem("lastActivityReadTimestamp", Date.now().toString());
    window.dispatchEvent(new Event("activityRead"));
  }, []);

  const handleClearOne = async (id: string) => {
    setDismissing(id);
    try {
      await deleteDoc(doc(db, "agatike_notifications", id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setDismissing(null);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || clearing) return;
    setClearing(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        batch.delete(doc(db, "agatike_notifications", n.id));
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 pt-safe-top md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 sticky top-0 bg-background/90 backdrop-blur-md z-30 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight">Activity</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 px-2 py-1.5 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearing ? "Clearing…" : "Clear all"}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
          Recent
        </h2>
        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-secondary/60 flex items-center justify-center">
                <Bell className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No recent activity.</p>
            </div>
          )}

          {notifications.map((n) => {
            const isComment = n.type === "comment";
            const isNewEvent = n.type === "new_event";
            const isNewPost = n.type === "new_post";
            const isNewMessage = n.type === "new_message";

            let Icon = Heart;
            let color = "text-primary";
            let bg = "bg-primary/10 border-primary/20";
            let title = "New Like";
            let description = "Someone interacted with a post you follow.";
            let link = `/community/${n.postId}`;
            let linkText = "View Post";

            if (isComment) {
              Icon = MessageCircle;
              title = "New Reply";
              description = n.content
                ? `Someone commented: "${n.content}"`
                : "Someone commented on a post you follow.";
            } else if (isNewEvent) {
              Icon = CalendarDays;
              title = "New Event";
              description = "An organizer you follow just posted a new event!";
              link = `/event/${n.eventId}`;
              linkText = "View Event";
            } else if (isNewPost) {
              Icon = Film;
              title = "New Post";
              description = n.content
                ? `An organizer you follow posted: "${n.content}"`
                : "An organizer you follow posted an update.";
            } else if (isNewMessage) {
              Icon = MessageCircle;
              title = "New Message";
              description = n.content ? `New message: "${n.content}"` : "You have a new message.";
              link = `/${user?.id}/message`;
              linkText = "View Messages";
            }

            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-3 rounded-2xl bg-card border border-border/40 shadow-sm transition-all active:scale-[0.98] ${dismissing === n.id ? "opacity-50 scale-95" : ""}`}
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

                  <div className="flex items-center gap-2">
                    <Link to={link} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs h-7 font-bold"
                      >
                        {linkText}
                        <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleClearOne(n.id)}
                      disabled={dismissing === n.id}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/60 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors disabled:opacity-40"
                      title="Dismiss"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
