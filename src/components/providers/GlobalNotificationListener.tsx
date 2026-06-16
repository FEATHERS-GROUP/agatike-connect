import { useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import app, { db } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { getUsersByIds, saveFCMToken } from "@/api/users";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Bell } from "lucide-react";

const COUNTRY_FLAGS: Record<string, string> = {
  Rwanda: "🇷🇼",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Canada: "🇨🇦",
  Kenya: "🇰🇪",
  Uganda: "🇺🇬",
  Tanzania: "🇹🇿",
  Nigeria: "🇳🇬",
};

const getCountryFlag = (countryName?: string) => {
  if (!countryName) return "";
  return COUNTRY_FLAGS[countryName] || "🌍";
};

export function GlobalNotificationListener() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  // Keep track of the first load so we don't spam notifications on mount
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    // Request permission and get FCM token on mount
    const setupFCM = async () => {
      if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted" && activeWorkspace?.orgnizer_id) {
            // Note: The VAPID key should be placed here or in environment variables
            const vapidKey = import.meta.env.FIREBASE_VAPID_KEY;

            // Register the service worker manually so we can pass config or just ensure it's loaded
            const registration = await navigator.serviceWorker.register(
              `/firebase-messaging-sw.js?apiKey=${import.meta.env.FIREBASE_API_KEY}&projectId=${import.meta.env.FIREBASE_PROJECT_ID}&messagingSenderId=${import.meta.env.FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.FIREBASE_APP_ID}`
            );

            const messaging = getMessaging(app);
            const token = await getToken(messaging, {
              vapidKey: vapidKey,
              serviceWorkerRegistration: registration
            });

            if (token) {
              await saveFCMToken({ data: { userId: activeWorkspace.orgnizer_id, token } });
            }
          }
        } catch (error) {
          console.warn("FCM Token generation failed. Push notifications may not work in background.", error);
        }
      }
    };

    setupFCM();
  }, [activeWorkspace?.orgnizer_id]);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;

    const organizerId = activeWorkspace.orgnizer_id;
    // For the dashboard, the "current user" acting is the organizer itself
    const currentUserId = activeWorkspace.orgnizer_id;

    const q = query(collection(db, "agatike_channels"), where("organizerId", "==", organizerId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // If it's the very first snapshot of the mount, we ignore it to avoid duplicate blasts
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "modified" || change.type === "added") {
          const data = change.doc.data();
          const channelId = change.doc.id;
          const lastMessageSenderId = data.lastMessageSenderId;
          const rawTimeMillis = data.lastMessageTime?.toMillis?.() || 0;

          // If there's no message, or we sent it, ignore
          if (!data.lastMessage || lastMessageSenderId === currentUserId) {
            return;
          }

          // Deduplication: check localStorage
          const storageKey = `notified_msg_${channelId}`;
          const lastNotifiedTime = parseInt(localStorage.getItem(storageKey) || "0", 10);

          if (rawTimeMillis <= lastNotifiedTime) {
            // Already notified (perhaps by another tab or earlier)
            return;
          }

          // Mark as notified
          localStorage.setItem(storageKey, rawTimeMillis.toString());

          // Build Notification Content
          let title = `New message in ${data.name || "Channel"}`;
          let body = data.lastMessage;
          let avatar = data.avatar;

          // If it's a DM (user channel), fetch the user's profile to get handle & flag
          if (data.type === "user" && data.userId) {
            try {
              // @ts-ignore
              const profiles = await getUsersByIds({ data: { ids: [data.userId] } });
              const profile = profiles[0];
              if (profile) {
                const handleOrName = profile.handle
                  ? `@${profile.handle}`
                  : profile.username || profile.profile?.first_name || "User";
                const flag = getCountryFlag(profile.country);
                title = `New message from ${handleOrName} ${flag}`;
              }
            } catch (e) {
              console.error("Failed to fetch user profile for notification", e);
            }
          }

          // Trigger System Notification
          if ("Notification" in window && Notification.permission === "granted") {
            const targetUrl = `/dashboard/${activeWorkspace.slug}/community?chatId=${channelId}`;
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                  body,
                  icon: avatar || "/icon.svg",
                  tag: `msg-${channelId}`, // Helps prevent duplicates at OS level
                  data: { url: targetUrl }
                });
              }).catch(() => {
                const notif = new Notification(title, {
                  body,
                  icon: avatar || "/icon.svg",
                  tag: `msg-${channelId}`,
                });
                notif.onclick = () => {
                  window.focus();
                  navigate({ to: targetUrl });
                };
              });
            } else {
              const notif = new Notification(title, {
                body,
                icon: avatar || "/icon.svg",
                tag: `msg-${channelId}`,
              });
              notif.onclick = () => {
                window.focus();
                navigate({ to: targetUrl });
              };
            }
          }

          // Trigger In-App Toast
          toast(title, {
            description: body,
            icon: <MessageCircle className="text-primary h-5 w-5" />,
            action: {
              label: "View",
              onClick: () => navigate({ to: `/dashboard/${activeWorkspace.slug}/community?chatId=${channelId}` as any }),
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
  }, [activeWorkspace?.orgnizer_id, activeWorkspace?.slug, navigate]);

  useEffect(() => {
    if (!activeWorkspace?.orgnizer_id) return;

    const organizerId = activeWorkspace.orgnizer_id;
    const q = query(
      collection(db, "agatike_notifications"),
      where("organizerId", "==", organizerId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoadRef.current) return;

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const notifId = change.doc.id;

          if (data.actorId === organizerId) return;

          const rawTimeMillis = data.createdAt ? new Date(data.createdAt).getTime() : 0;

          const storageKey = `notified_org_${notifId}`;
          const lastNotifiedTime = parseInt(localStorage.getItem(storageKey) || "0", 10);

          if (rawTimeMillis <= lastNotifiedTime) return;

          localStorage.setItem(storageKey, rawTimeMillis.toString());

          let title = "Notification";
          let body = "";

          if (data.type === "comment") {
            title = "New comment on your post!";
            body = data.content || "Someone left a comment.";
          } else if (data.type === "like") {
            title = "New Like!";
            body = "Someone liked your post.";
          }

          if ("Notification" in window && Notification.permission === "granted") {
            const targetUrl = "/dashboard";
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                  body,
                  icon: "/icon.svg",
                  tag: `notif-${notifId}`,
                  data: { url: targetUrl }
                });
              }).catch(() => {
                const notif = new Notification(title, {
                  body,
                  icon: "/icon.svg",
                  tag: `notif-${notifId}`,
                });
                notif.onclick = () => {
                  window.focus();
                };
              });
            } else {
              const notif = new Notification(title, {
                body,
                icon: "/icon.svg",
                tag: `notif-${notifId}`,
              });
              notif.onclick = () => {
                window.focus();
              };
            }
          }

          toast(title, {
            description: body,
            icon: <Bell className="text-primary h-5 w-5" />,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [activeWorkspace?.orgnizer_id]);

  return null;
}
