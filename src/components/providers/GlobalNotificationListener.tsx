import { useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { getUsersByIds } from "@/api/users";
import { useNavigate } from "@tanstack/react-router";

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
  "South Africa": "🇿🇦",
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
    // Request permission once on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!activeWorkspace?.id) return;

    const organizerId = activeWorkspace.id;
    // For the dashboard, the "current user" acting is the organizer itself (workspaceId)
    // Wait, the organizer sends messages as the workspace.
    const currentUserId = activeWorkspace.id; 

    const q = query(
      collection(db, "agatike_channels"),
      where("organizerId", "==", organizerId)
    );

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
                const handleOrName = profile.handle ? `@${profile.handle}` : (profile.username || profile.profile?.first_name || "User");
                const flag = getCountryFlag(profile.country);
                title = `New message from ${handleOrName} ${flag}`;
              }
            } catch (e) {
              console.error("Failed to fetch user profile for notification", e);
            }
          }

          // Trigger System Notification
          if ("Notification" in window && Notification.permission === "granted") {
            const notif = new Notification(title, {
              body,
              icon: avatar || "/icon.svg",
              tag: `msg-${channelId}` // Helps prevent duplicates at OS level
            });
            notif.onclick = () => {
              window.focus();
              navigate({ to: `/dashboard/${activeWorkspace.slug}/community` });
            };
          }

          // Trigger In-App Toast
          toast(title, {
            description: body,
            action: {
              label: "View",
              onClick: () => navigate({ to: `/dashboard/${activeWorkspace.slug}/community` }),
            },
          });
        }
      });
    });

    return () => unsubscribe();
  }, [activeWorkspace?.id, activeWorkspace?.slug, navigate]);

  return null;
}
