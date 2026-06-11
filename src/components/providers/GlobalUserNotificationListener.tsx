import { useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function GlobalUserNotificationListener() {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const currentUserId = user.id;

    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoadRef.current) {
        // Only start notifying on subsequent updates to prevent blast on mount
        setTimeout(() => {
          isFirstLoadRef.current = false;
        }, 1000);
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const notifId = change.doc.id;

          // Don't notify the user about their own actions
          if (data.actorId === currentUserId) return;

          const rawTimeMillis = data.createdAt ? new Date(data.createdAt).getTime() : 0;
          const storageKey = `notified_user_${notifId}`;
          const lastNotifiedTime = parseInt(localStorage.getItem(storageKey) || "0", 10);

          if (rawTimeMillis <= lastNotifiedTime) return;
          localStorage.setItem(storageKey, rawTimeMillis.toString());

          let title = "New Notification";
          let body = "";

          if (data.type === "comment") {
            title = "New Reply";
            body = data.content ? `Someone commented: "${data.content}"` : "Someone replied to a post you follow.";
          }

          if ("Notification" in window && Notification.permission === "granted") {
            const notif = new Notification(title, {
              body,
              icon: "/icon.svg",
              tag: `user-notif-${notifId}`,
            });
            notif.onclick = () => {
              window.focus();
              navigate({ to: "/activity" });
            };
          }

          toast(title, {
            description: body,
            action: {
              label: "View",
              onClick: () => navigate({ to: "/activity" }),
            },
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user?.id, navigate]);

  return null;
}
