import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";

export function ExperienceBadge({ eventId }: { eventId?: string }) {
  const { activeWorkspace } = useWorkspace();
  const [docs, setDocs] = useState<any[]>([]);
  const [readTick, setReadTick] = useState(0);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;
    const organizerId = activeWorkspace.orgnizer_id;

    let constraints = [where("organizerId", "==", organizerId)];
    if (eventId) {
      constraints.push(where("eventId", "==", eventId));
    }

    const q = query(collection(db, "agatike_notifications"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newDocs: any[] = [];
      snapshot.forEach((doc) => {
        newDocs.push({ id: doc.id, ...doc.data() });
      });
      setDocs(newDocs);
    });

    const handleReadEvent = () => setReadTick((t) => t + 1);
    window.addEventListener("experience_read_updated", handleReadEvent);

    return () => {
      unsubscribe();
      window.removeEventListener("experience_read_updated", handleReadEvent);
    };
  }, [activeWorkspace?.orgnizer_id, eventId]);

  let unreadCount = 0;
  // If eventId is provided, we check its specific read time.
  // For the global Events badge (no eventId), we could check a global read time or just sum up event unreads.
  // It's safer to just use `experience_read_all` or the specific one.
  const readKey = eventId ? `experience_read_${eventId}` : "experience_read_all";
  const readTime = parseInt(localStorage.getItem(readKey) || "0", 10);

  docs.forEach((data) => {
    if (data.type === "like" || data.type === "comment") {
      const rawTimeMillis = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      if (rawTimeMillis > readTime) {
        unreadCount++;
      }
    }
  });

  if (unreadCount === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="ml-auto h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
    >
      {unreadCount}
    </Badge>
  );
}
