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
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUsersByIds } from "@/api/users";

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  isMe: boolean;
  channelId: string;
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
};

export function useFirestoreCommunity(workspaceId: string, currentUserId: string) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen to Channels for this Workspace/Organizer
  useEffect(() => {
    if (!workspaceId) return;

    const q = query(
      collection(db, "channels"),
      where("organizerId", "==", workspaceId)
    );

    const unsubscribeChannels = onSnapshot(q, async (snapshot) => {
      let fetchedChannels: ChatChannel[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Unknown Channel",
        avatar: (doc.data().avatar && !doc.data().avatar.includes("pravatar.cc")) ? doc.data().avatar : "",
        lastMessage: doc.data().lastMessage || "",
        time: doc.data().lastMessageTime?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "",
        unread: doc.data().unreadCount || 0,
        online: doc.data().online || false,
        type: doc.data().type || "group",
        entityType: doc.data().entityType,
        messages: [],
        organizerId: doc.data().organizerId,
        userId: doc.data().userId
      }));

      // Note: Auto-creation of General Announcements is removed. 
      // Channels are now created explicitly via Hasura and synced.

      // Fetch Real User Profiles for direct messages
      const userIds = fetchedChannels.filter(c => c.type === "user" && c.userId).map(c => c.userId!);
      if (userIds.length > 0) {
        try {
          const profiles = await getUsersByIds({ data: { ids: userIds } });
          fetchedChannels = fetchedChannels.map(ch => {
            if (ch.type === "user" && ch.userId) {
              const profile = profiles.find((p: any) => p.id === ch.userId);
              if (profile) {
                return {
                  ...ch,
                  name: profile.username || profile.profile?.first_name || ch.name,
                  avatar: profile.profile || ch.avatar
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
      fetchedChannels.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      setChannels(prev => {
        // Merge messages if they exist in prev state
        return fetchedChannels.map(fc => {
          const existing = prev.find(p => p.id === fc.id);
          return { ...fc, messages: existing ? existing.messages : [] };
        });
      });

      if (fetchedChannels.length > 0 && !activeChatId) {
        setActiveChatId(fetchedChannels[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribeChannels();
  }, [workspaceId]);

  // 2. Listen to Messages for the Active Chat
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(
      collection(db, "messages"),
      where("channelId", "==", activeChatId)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp, // Keep raw timestamp for sorting
          timeFormatted: data.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "",
          isMe: data.senderId === currentUserId,
          channelId: data.channelId
        };
      });

      // Sort in memory to bypass the Firebase composite index requirement
      messages.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeA - timeB;
      });

      // Replace raw timestamp with formatted string for the UI
      const finalMessages = messages.map(m => ({ ...m, timestamp: m.timeFormatted }));

      setChannels(prev => prev.map(ch => 
        ch.id === activeChatId ? { ...ch, messages: finalMessages } : ch
      ));
    });

    return () => unsubscribeMessages();
  }, [activeChatId, currentUserId]);

  const sendMessage = async (text: string) => {
    if (!activeChatId) return;

    await addDoc(collection(db, "messages"), {
      channelId: activeChatId,
      senderId: currentUserId,
      text,
      timestamp: serverTimestamp()
    });

    const channelRef = doc(db, "channels", activeChatId);
    await updateDoc(channelRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    });
  };

  const createDirectMessageChannel = async (userId: string, userName: string, userAvatar: string) => {
    const existing = channels.find(c => c.type === "user" && c.userId === userId);
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    const newDoc = await addDoc(collection(db, "channels"), {
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
      createdAt: serverTimestamp()
    });
    
    setActiveChatId(newDoc.id);
  };

  const createFirebaseGroupChannel = async (channelId: string, name: string, avatar: string, entityType: string = "GROUP") => {
    const channelRef = doc(db, "channels", channelId);
    await setDoc(channelRef, {
      organizerId: workspaceId,
      name,
      type: "group",
      entityType,
      lastMessage: "Channel created",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      online: true,
      avatar,
      createdAt: serverTimestamp()
    }, { merge: true }); // use merge so we don't overwrite if it exists
    setActiveChatId(channelId);
  };

  return { channels, activeChatId, setActiveChatId, sendMessage, loading, createDirectMessageChannel, createFirebaseGroupChannel };
}
