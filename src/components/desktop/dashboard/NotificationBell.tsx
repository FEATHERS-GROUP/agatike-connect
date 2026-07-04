import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Bell, Check, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";

export function NotificationBell() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;

    const q = query(
      collection(db, "agatike_notifications"),
      where("organizerId", "==", activeWorkspace.orgnizer_id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((n: any) => n.actorId !== activeWorkspace.orgnizer_id);
      
      notifs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setNotifications(notifs.slice(0, 20)); // Keep latest 20
    });

    return () => unsubscribe();
  }, [activeWorkspace?.orgnizer_id]);

  const removeNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "agatike_notifications", id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = () => {
    notifications.forEach(n => removeNotification(n.id));
  };

  const handleNotificationClick = (n: any) => {
    removeNotification(n.id);
    setIsOpen(false);
    if (n.link) {
      navigate({ to: n.link });
    } else if (n.type === "new_event" && n.eventId) {
      navigate({ to: `/event/${n.eventId}` });
    } else if (n.type === "comment" || n.type === "new_message") {
      if (n.content?.toLowerCase().includes("ticket")) {
        navigate({ to: `/dashboard/support` });
      } else {
        navigate({ to: `/dashboard/${activeWorkspace?.slug}/community` });
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 shadow-xl border-border/40" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/10">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground">You're all caught up</p>
              <p className="text-xs mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map(n => (
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors cursor-pointer group" onClick={() => handleNotificationClick(n)}>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium leading-snug mb-1">{n.content || n.title || "New Notification"}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "Just now"}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-all shrink-0 self-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
