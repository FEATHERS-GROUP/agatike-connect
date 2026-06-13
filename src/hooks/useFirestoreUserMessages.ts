import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
};

export function useFirestoreUserMessages(currentUserId: string, followedOrganizerIds: string[] = []) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen to Channels (DMs and Groups)
  useEffect(() => {
    if (!currentUserId) return;

    // Listen to Direct Messages
    const dmQuery = query(
      collection(db, "agatike_channels"),
      where("type", "==", "user"),
      where("userId", "==", currentUserId)
    );

    // To listen to group channels, since `in` limits to 10, we'll listen to all group channels and filter in memory,
    // or if we have fewer than 10 followed organizers, we can use `in`.
    // For simplicity, we can just fetch all group channels if there aren't too many, or we can use multiple queries.
    // In Firebase, we can do where("type", "==", "group") and filter locally by followedOrganizerIds.
    const groupQuery = query(collection(db, "agatike_channels"), where("type", "==", "group"));

    const unsubscribeDMs = onSnapshot(dmQuery, (snapshot) => {
      handleSnapshot(snapshot, "user");
    });

    const unsubscribeGroups = onSnapshot(groupQuery, (snapshot) => {
      handleSnapshot(snapshot, "group");
    });

    let currentChannels: Record<string, any> = {};

    function handleSnapshot(snapshot: any, type: string) {
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        
        if (type === "group" && followedOrganizerIds.length > 0 && !followedOrganizerIds.includes(data.organizerId)) {
          // If it's a group channel and user is not following the organizer, skip it
          return;
        }

        const rawTime = data.lastMessageTime;
        currentChannels[doc.id] = {
          id: doc.id,
          name: data.name || "Unknown Channel",
          avatar: data.avatar && !data.avatar.includes("pravatar.cc") ? data.avatar : "",
          lastMessage: data.lastMessage || "",
          time:
            rawTime?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ||
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          rawTimeMillis: rawTime?.toMillis?.() || Date.now(),
          unread: data.unreadCount || 0,
          online: data.online || false,
          type: data.type || "group",
          entityType: data.entityType,
          organizerId: data.organizerId,
          userId: data.userId,
        };
      });

      updateStateChannels();
    }

    function updateStateChannels() {
      let fetchedChannels = Object.values(currentChannels);
      fetchedChannels.sort((a, b) => b.rawTimeMillis - a.rawTimeMillis);

      setChannels((prev) => {
        return fetchedChannels.map((fc) => {
          const existing = prev.find((p) => p.id === fc.id);
          const { rawTimeMillis, ...cleanFc } = fc;
          return { ...cleanFc, messages: existing ? existing.messages : [] } as ChatChannel;
        });
      });

      setLoading(false);
    }

    return () => {
      unsubscribeDMs();
      unsubscribeGroups();
    };
  }, [currentUserId, followedOrganizerIds.join(",")]);

  // 2. Listen to Messages for the Active Chat
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
          timestamp: rawTime,
          timeFormatted:
            rawTime?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ||
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: data.senderId === currentUserId,
          channelId: data.channelId,
          mediaUrl: data.mediaUrl,
          isPending: !rawTime,
        };
      });

      messages.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || Date.now();
        const timeB = b.timestamp?.toMillis?.() || Date.now();
        return timeA - timeB;
      });

      const finalMessages = messages.map((m) => ({ ...m, timestamp: m.timeFormatted }));

      setChannels((prev) =>
        prev.map((ch) => (ch.id === activeChatId ? { ...ch, messages: finalMessages } : ch))
      );
    });

    return () => unsubscribeMessages();
  }, [activeChatId, currentUserId]);

  const sendMessage = async (text: string, activeChat: ChatChannel, mediaUrl?: string) => {
    if (!activeChatId) return;

    let senderId = currentUserId;
    // For DMs from user, receiver is the organizer
    let receiverId = activeChat.type === "user" ? activeChat.organizerId : null;

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
    });
  };

  const createDirectMessageWithOrganizer = async (
    organizerId: string,
    organizerName: string,
    organizerAvatar: string,
    userName: string
  ) => {
    // Check if we already have a DM with this organizer
    const existing = channels.find((c) => c.type === "user" && c.organizerId === organizerId);
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    // Creating a DM from the user side sets the channel name to the organizer's name 
    // Wait, in useFirestoreCommunity, the organizer sees the user's name as the channel name.
    // We should be careful about how 'name' is used. Inagatike_channels, 'name' is currently set to the user's name.
    // But since the database has one channel for both, we should just use the existing one or create it.
    // If we create it, name should probably be the userName, so the organizer knows who it is.
    // On the user side, we will display the organizer's name.
    
    // Actually, let's just query if one exists.
    // The previous DM listener already listens for all DMs for this user.
    // So if it's not in `channels`, it doesn't exist.

    const newDoc = await addDoc(collection(db, "agatike_channels"), {
      organizerId: organizerId,
      name: userName, // The organizer will see the user's name
      type: "user",
      entityType: "SUPPORT",
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      online: false,
      avatar: organizerAvatar, // Note: the organizer needs to see the user's avatar. The user needs to see the organizer's avatar. 
      // If we store organizerAvatar, the organizer will see their own avatar.
      // Let's store userAvatar here instead if we can, or just let the UI handle it.
      userId: currentUserId,
      createdAt: serverTimestamp(),
    });

    setActiveChatId(newDoc.id);
  };

  return {
    channels,
    activeChatId,
    setActiveChatId,
    sendMessage,
    loading,
    createDirectMessageWithOrganizer,
  };
}
