import { useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app, { db } from "@/lib/firebase";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { saveFCMToken } from "@/api/users";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Bell, CalendarDays, Film } from "lucide-react";

export function GlobalUserNotificationListener() {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const isFirstLoadRef = useRef(true);
  const onMessageUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Request permission, register FCM token, and wire up foreground message handler
    const setupFCM = async () => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !user?.id
      )
        return;

      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const vapidKey = import.meta.env.FIREBASE_VAPID_KEY;
        const registration = await navigator.serviceWorker.register(
          `/firebase-messaging-sw.js?apiKey=${import.meta.env.FIREBASE_API_KEY}&projectId=${import.meta.env.FIREBASE_PROJECT_ID}&messagingSenderId=${import.meta.env.FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.FIREBASE_APP_ID}`,
        );

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await saveFCMToken({ data: { userId: user.id, token } });
        }

        // Foreground handler: FCM suppresses OS notifications when the app is focused;
        // this re-shows them via the service worker so the user always sees them.
        onMessageUnsubRef.current?.();
        onMessageUnsubRef.current = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "New Notification";
          const body = payload.notification?.body || "";
          if (Notification.permission === "granted") {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: "/agatike-icon.png",
                  data: payload.data || {},
                });
              })
              .catch(() => {
                new Notification(title, { body, icon: "/agatike-icon.png" });
              });
          }
        });
      } catch (error) {
        console.warn("FCM setup failed. Push notifications may not work in background.", error);
      }
    };

    setupFCM();

    return () => {
      onMessageUnsubRef.current?.();
      onMessageUnsubRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const currentUserId = user.id;

    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", currentUserId),
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
          let targetPath = "/activity";
          let Icon = Bell;

          if (data.type === "comment") {
            title = "New Reply";
            body = data.content
              ? `Someone commented: "${data.content}"`
              : "Someone replied to a post you follow.";
            Icon = MessageCircle;
          } else if (data.type === "new_event") {
            title = "New Event Announced!";
            body = "An organizer you follow just posted a new event.";
            if (data.eventId) targetPath = `/event/${data.eventId}`;
            Icon = CalendarDays;
          } else if (data.type === "new_post") {
            title = "New Post";
            body = data.content
              ? `An organizer posted: "${data.content}"`
              : "An organizer you follow posted an update.";
            if (data.postId) targetPath = `/community/${data.postId}`;
            Icon = Film;
          } else if (data.type === "new_story") {
            title = "New Story";
            body = "An organizer you follow just posted a new story.";
            if (data.eventId) targetPath = `/event/${data.eventId}`;
            Icon = Film;
          } else if (data.type === "new_message") {
            title = "New Message";
            body = data.content ? `New message: "${data.content}"` : "You have a new message.";
            targetPath = `/${currentUserId}/message?chatId=${data.postId}`;
            Icon = MessageCircle;
          }

          if ("Notification" in window && Notification.permission === "granted") {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready
                .then((registration) => {
                  registration.showNotification(title, {
                    body,
                    icon: "/agatike-icon.png",
                    tag: `user-notif-${notifId}`,
                    data: { url: targetPath },
                  });
                })
                .catch(() => {
                  const notif = new Notification(title, {
                    body,
                    icon: "/agatike-icon.png",
                    tag: `user-notif-${notifId}`,
                  });
                  notif.onclick = () => {
                    window.focus();
                    navigate({ to: targetPath });
                  };
                });
            } else {
              const notif = new Notification(title, {
                body,
                icon: "/agatike-icon.png",
                tag: `user-notif-${notifId}`,
              });
              notif.onclick = () => {
                window.focus();
                navigate({ to: targetPath });
              };
            }
          }

          toast(title, {
            description: body,
            icon: <Icon className="text-primary h-5 w-5" />,
            action: {
              label: "View",
              onClick: () => navigate({ to: targetPath }),
            },
            actionButtonStyle: {
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            },
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user?.id, navigate]);

  return null;
}
