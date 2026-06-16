import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";

export function CommunityBadge() {
  const { activeWorkspace } = useWorkspace();
  const [docs, setDocs] = useState<any[]>([]);
  const [readTick, setReadTick] = useState(0);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;
    const organizerId = activeWorkspace.orgnizer_id;

    const q = query(collection(db, "agatike_channels"), where("organizerId", "==", organizerId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newDocs: any[] = [];
      snapshot.forEach((doc) => {
        newDocs.push({ id: doc.id, ...doc.data() });
      });
      setDocs(newDocs);
    });

    const handleReadEvent = () => setReadTick((t) => t + 1);
    window.addEventListener("chat_read_updated", handleReadEvent);

    return () => {
      unsubscribe();
      window.removeEventListener("chat_read_updated", handleReadEvent);
    };
  }, [activeWorkspace?.orgnizer_id]);

  let unreadCount = 0;
  const currentUserId = activeWorkspace?.orgnizer_id;

  docs.forEach((data) => {
    if (data.lastMessage && data.lastMessageSenderId !== currentUserId) {
      const rawTimeMillis = data.lastMessageTime?.toMillis?.() || 0;
      const readTime = parseInt(localStorage.getItem(`chat_read_${data.id}`) || "0", 10);
      if (rawTimeMillis > readTime || data.unreadCount > 0) {
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
