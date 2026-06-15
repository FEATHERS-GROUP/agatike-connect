import { useState, useEffect } from "react";
import { sendPushNotification } from "@/api/push";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUsersByIds } from "@/api/users";
import { getCommunityChannels } from "@/api/community";
import { getEventAttendees } from "@/api/attendees";
import { getOrganizerFollowerIds } from "@/api/organizers";
import { formatMessageTime } from "@/lib/utils";

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  isMe: boolean;
  channelId: string;
  mediaUrl?: string;
  timeFormatted?: string;
  isPending?: boolean;
  rawTimeMillis?: number;
};

export type ChatChannel = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: "user" | "group";
  entityType?: string;
  messages: Message[];
  organizerId: string;
  userId?: string;
  country?: string;
  handle?: string;
  eventId?: string;
  lastMessageSenderId?: string;
};

export function useFirestoreCommunity(workspaceId: string, currentUserId: string, initialChatId?: string | null) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [loading, setLoading] = useState(true);

  // Sync state if URL search param changes via back button
  useEffect(() => {
    if (initialChatId !== undefined && initialChatId !== activeChatId) {
      setActiveChatId(initialChatId || null);
    }
  }, [initialChatId]);

  // 1. Listen to Channels for this Workspace/Organizer
  useEffect(() => {
    if (!workspaceId) return;

    const q = query(collection(db, "agatike_channels"), where("organizerId", "==", workspaceId));

    const unsubscribeChannels = onSnapshot(q, async (snapshot) => {
      let fetchedChannels: any[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const rawTime = data.lastMessageTime;
        return {
          id: doc.id,
          name: data.name || "Unknown Channel",
          avatar: data.avatar && !data.avatar.includes("pravatar.cc") ? data.avatar : "",
          lastMessage: data.lastMessage || "",
          time: rawTime ? formatMessageTime(rawTime.toDate()) : formatMessageTime(new Date()),
          rawTimeMillis: rawTime?.toMillis?.() || Date.now(),
          unread: data.unreadCount || 0,
          online: data.online || false,
          type: data.type || "group",
          entityType: data.entityType,
          messages: [],
          organizerId: data.organizerId,
          userId: data.userId,
          eventId: data.eventId,
          lastMessageSenderId: data.lastMessageSenderId,
        };
      });

      // Note: Auto-creation of General Announcements is removed.
      // Channels are now created explicitly via Hasura and synced.

      // Fetch Real User Profiles for direct messages
      const userIds = fetchedChannels
        .filter((c) => c.type === "user" && c.userId)
        .map((c) => c.userId!);
      if (userIds.length > 0) {
        try {
          // @ts-ignore - The tanstack createServerFn types here default to undefined but the handler accepts it
          const profiles = await getUsersByIds({ data: { ids: userIds } });
          fetchedChannels = fetchedChannels.map((ch) => {
            if (ch.type === "user" && ch.userId) {
              const profile = profiles.find((p: any) => p.id === ch.userId);
              if (profile) {
                return {
                  ...ch,
                  name:
                    (profile.handle ? `@${profile.handle}` : profile.username) ||
                    profile.profile?.first_name ||
                    ch.name,
                  avatar: profile.profile || ch.avatar,
                  country: profile.country,
                  handle: profile.handle,
                };
              }
            }
            return ch;
          });
        } catch (e) {
          console.error("Failed to fetch user profiles:", e);
        }
      }

      // Sort by latest message
      fetchedChannels.sort((a, b) => b.rawTimeMillis - a.rawTimeMillis);

      setChannels((prev) => {
        // Merge messages if they exist in prev state
        let updatedChannels = fetchedChannels.map((fc) => {
          const existing = prev.find((p) => p.id === fc.id);
          const { rawTimeMillis, ...cleanFc } = fc; // Remove temporary sorting prop
          return { ...cleanFc, messages: existing ? existing.messages : [] } as ChatChannel;
        });

        // Filter out DMs that have NO messages yet (lastMessage is empty) so they don't clog "All"
        // Wait, if we filter them out completely, they won't exist in channels state, so clicking a follower won't be able to find the channel!
        // We shouldn't filter them out of `channels` state, but rather we should filter them in the UI's "All" tab!
        // Let's just return updatedChannels here and handle the "All" tab filter in community.tsx
        return updatedChannels;
      });

      setActiveChatId((prev) => {
        if (!prev && fetchedChannels.length > 0) return fetchedChannels[0].id;
        return prev;
      });
      setLoading(false);
    });

    return () => unsubscribeChannels();
  }, [workspaceId]);

  // 2. Listen to Messages for the Active Chat
  useEffect(() => {
    if (!activeChatId) return;
    const activeChannel = channels.find((c) => c.id === activeChatId);
    if (
      activeChannel &&
      activeChannel.unread > 0 &&
      activeChannel.lastMessageSenderId !== workspaceId
    ) {
      const channelRef = doc(db, "agatike_channels", activeChatId);
      updateDoc(channelRef, { unreadCount: 0 }).catch(console.error);
    }
  }, [activeChatId, channels, workspaceId]);

  useEffect(() => {
    if (!activeChatId) return;

    const q = query(collection(db, "agatike_messages"), where("channelId", "==", activeChatId));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const rawTime = data.timestamp;
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: rawTime, // Keep raw timestamp for sorting
          timeFormatted:
            rawTime?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ||
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: data.senderId === currentUserId || data.senderId === workspaceId, // Include workspaceId for DMs
          channelId: data.channelId,
          mediaUrl: data.mediaUrl,
          isPending: !rawTime,
          rawTimeMillis: rawTime?.toMillis?.() || Date.now(),
        };
      });

      // Sort in memory to bypass the Firebase composite index requirement
      messages.sort((a, b) => {
        const timeA = a.rawTimeMillis || Date.now();
        const timeB = b.rawTimeMillis || Date.now();
        return timeA - timeB;
      });

      // Replace raw timestamp with formatted string for the UI
      const finalMessages = messages.map((m) => ({ ...m, timestamp: m.timeFormatted }));

      setChannels((prev) =>
        prev.map((ch) => (ch.id === activeChatId ? { ...ch, messages: finalMessages } : ch)),
      );
    });

    return () => unsubscribeMessages();
  }, [activeChatId, currentUserId]);

  const sendMessage = async (text: string, activeChat: ChatChannel, mediaUrl?: string) => {
    if (!activeChatId) return;

    let senderId = currentUserId;
    let receiverId = null;

    if (activeChat.type === "user") {
      senderId = workspaceId; // Organizer is the sender
      receiverId = activeChat.userId || null;
    }

    await addDoc(collection(db, "agatike_messages"), {
      channelId: activeChatId,
      senderId,
      receiverId,
      text,
      mediaUrl: mediaUrl || null,
      timestamp: serverTimestamp(),
    });

    const channelRef = doc(db, "agatike_channels", activeChatId);
    await updateDoc(channelRef, {
      lastMessage: text || "Sent an attachment",
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      unreadCount: increment(1),
    });

    try {
      let targetUsers: string[] = [];
      if (activeChat.type === "user" && activeChat.userId) {
        targetUsers = [activeChat.userId];
      } else if (activeChat.type === "group") {
        if (activeChat.entityType === "EVENT") {
          const channelsResult = await getCommunityChannels({ data: { organizerId: workspaceId } });
          const hasuraChannel = channelsResult.find((c) => c.id === activeChat.id);
          if (hasuraChannel && hasuraChannel.event_id) {
            const attendees = await getEventAttendees({
              data: { event_id: hasuraChannel.event_id },
            });
            targetUsers = attendees.map((a) => a.user_id).filter(Boolean);
          } else {
            targetUsers = await getOrganizerFollowerIds({ data: { organizerId: workspaceId } });
          }
        } else {
          targetUsers = await getOrganizerFollowerIds({ data: { organizerId: workspaceId } });
        }
      }

      if (targetUsers.length > 0) {
        await addDoc(collection(db, "agatike_notifications"), {
          type: "new_message",
          postId: activeChat.id,
          organizerId: workspaceId,
          actorId: senderId,
          content: text || "Sent an attachment",
          targetUsers,
          createdAt: new Date().toISOString(),
        });

        // Trigger the backend push notification API
        try {
          await sendPushNotification({
            data: {
              userIds: targetUsers,
              title: activeChat.type === "group" ? `New message in ${activeChat.name}` : "New message",
              body: text || "Sent an attachment",
              data: {
                url: `/dashboard/${workspaceId}/community?chatId=${activeChatId}`,
                chatId: activeChatId
              }
            }
          });
        } catch (pushErr) {
          console.error("Failed to trigger push notification", pushErr);
        }
      }
    } catch (e) {
      console.error("Failed to create notification for message", e);
    }
  };

  const createDirectMessageChannel = async (
    userId: string,
    userName: string,
    userAvatar: string,
  ) => {
    const existing = channels.find((c) => c.type === "user" && c.userId === userId);
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    const newDoc = await addDoc(collection(db, "agatike_channels"), {
      organizerId: workspaceId,
      name: userName,
      type: "user",
      entityType: "SUPPORT",
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      online: false,
      avatar: userAvatar,
      userId: userId,
      createdAt: serverTimestamp(),
    });

    setActiveChatId(newDoc.id);
  };

  const createFirebaseGroupChannel = async (
    channelId: string,
    name: string,
    avatar: string,
    entityType: string = "GROUP",
  ) => {
    const channelRef = doc(db, "agatike_channels", channelId);
    await setDoc(
      channelRef,
      {
        organizerId: workspaceId,
        name,
        type: "group",
        entityType,
        lastMessage: "Channel created",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        online: true,
        avatar,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    ); // use merge so we don't overwrite if it exists
    setActiveChatId(channelId);
  };

  return {
    channels,
    activeChatId,
    setActiveChatId,
    sendMessage,
    loading,
    createDirectMessageChannel,
    createFirebaseGroupChannel,
  };
}
