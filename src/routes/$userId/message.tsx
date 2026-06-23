import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  Send,
  MessageCircle,
  Loader2,
  Users,
  Smile,
  Sticker,
  ArrowLeft,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { ChatConversation } from "@/components/shared/ChatConversation";

const gf = new GiphyFetch(import.meta.env.GIPHY_API_KEY || "");

import { useFirestoreUserMessages } from "@/hooks/useFirestoreUserMessages";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { getUserAttendedEventIds } from "@/api/attendees";
import { getCommunityChannelsForOrganizers } from "@/api/community";
import { formatMessageDate } from "@/lib/utils";

type MessageSearch = {
  chatId?: string;
  eventId?: string;
};

export const Route = createFileRoute("/$userId/message")({
  validateSearch: (search: Record<string, unknown>): MessageSearch => {
    return {
      chatId: search.chatId as string | undefined,
      eventId: search.eventId as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Messages — Agatike" },
      { name: "description", content: "Your conversations." },
    ],
  }),
  component: UserMessagesPage,
});

function UserMessagesPage() {
  const { userId } = Route.useParams();
  const { chatId, eventId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user, isLoading: authLoading } = useUserAuth();
  const { followedIds } = useFollowedOrganizers();

  const { data: dbOrganizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const followedOrganizers = useMemo(() => {
    return dbOrganizers.filter((org: any) => followedIds.includes(org.id));
  }, [dbOrganizers, followedIds]);

  const { data: attendedEventIds = [] } = useQuery({
    queryKey: ["attendedEvents"],
    queryFn: () => getUserAttendedEventIds(),
  });

  const { data: hasuraChannels = [] } = useQuery({
    queryKey: ["hasuraChannels", followedIds],
    queryFn: () => getCommunityChannelsForOrganizers({ data: { organizerIds: followedIds } }),
    enabled: followedIds.length > 0,
  });

  const {
    channels,
    activeChatId,
    setActiveChatId,
    sendMessage,
    loading: chatLoading,
    createDirectMessageWithOrganizer,
  } = useFirestoreUserMessages(user?.id || "", followedIds, chatId);

  // Sync activeChatId to URL and update read receipt
  useEffect(() => {
    navigate({ search: { chatId: activeChatId || undefined, eventId }, replace: true });
    if (activeChatId) {
      localStorage.setItem(`chat_read_${activeChatId}`, Date.now().toString());
    }
  }, [activeChatId, navigate, eventId]);

  // Automatically resolve organizerId search param to DM channel or create one
  useEffect(() => {
    if (!chatId || chatLoading || dbOrganizers.length === 0) return;

    // Check if the chatId is already an active channel ID
    const hasChannel = channels.some((c) => c.id === chatId);
    if (hasChannel) return;

    // Check if chatId corresponds to an organizerId
    const org = dbOrganizers.find((o: any) => o.id === chatId);
    if (org) {
      const existingChannel = channels.find((c) => c.type === "user" && c.organizerId === org.id);
      if (existingChannel) {
        setActiveChatId(existingChannel.id);
      } else {
        createDirectMessageWithOrganizer(
          org.id,
          org.name || "Organizer",
          org.image || org.avatar || "",
          user?.username || "User",
        );
      }
    }
  }, [
    chatId,
    channels,
    dbOrganizers,
    chatLoading,
    user,
    createDirectMessageWithOrganizer,
    setActiveChatId,
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  // Map channels to show correct organizer info for DMs and filter event channels
  const displayChannels = useMemo(() => {
    return channels
      .filter((c) => {
        if (c.type === "group" && c.entityType === "EVENT") {
          const hc = hasuraChannels.find((h: any) => h.id === c.id);
          if (hc && hc.event_id) {
            return attendedEventIds.includes(hc.event_id);
          }
          // If we can't verify the event ticket, don't show the channel
          return false;
        }
        return true;
      })
      .map((c) => {
        if (c.type === "user") {
          const org = dbOrganizers.find((o: any) => o.id === c.organizerId);
          if (org) {
            return {
              ...c,
              name: org.name || "Organizer",
              avatar: org.image || org.avatar || "",
            };
          }
        }
        return c;
      });
  }, [channels, dbOrganizers, hasuraChannels, attendedEventIds]);

  const activeChat = displayChannels.find((c) => c.id === activeChatId);

  // Chat UI logic has been moved to ChatConversation.tsx

  const startDM = async (org: any) => {
    if (!user) return;
    await createDirectMessageWithOrganizer(
      org.id,
      org.name,
      org.image || org.avatar || "",
      user.username || "User",
    );
    setIsNewMessageModalOpen(false);
  };

  if (authLoading || chatLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-background border-none rounded-none shadow-none">
      {/* LEFT SIDEBAR - Chat List */}
      <div
        className={`w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-border/60 bg-card/50 ${
          activeChatId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-border/60 pt-safe-top">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 rounded-full"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold tracking-tight">Messages</h2>
            </div>
            <Dialog open={isNewMessageModalOpen} onOpenChange={setIsNewMessageModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Select an organizer you follow:
                  </p>
                  {followedOrganizers.length === 0 ? (
                    <p className="text-sm text-center py-4">
                      You aren't following any organizers yet.
                    </p>
                  ) : (
                    <ScrollArea className="h-64">
                      {followedOrganizers.map((org: any) => (
                        <button
                          key={org.id}
                          onClick={() => startDM(org)}
                          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-accent/50 text-left transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={org.image || org.avatar} />
                            <AvatarFallback>
                              {org.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{org.name}</p>
                            <p className="text-xs text-muted-foreground">@{org.handle}</p>
                          </div>
                        </button>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-background/50 border-border/60 rounded-xl"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col w-full"
        >
          <div className="px-4 pt-2 border-b border-border/60">
            <TabsList className="w-full grid grid-cols-2 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2 pt-1"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2 pt-1"
              >
                Communities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100dvh-180px)]">
              <div className="p-2 flex flex-col gap-1">
                {displayChannels.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No messages yet</p>
                  </div>
                ) : (
                  displayChannels.map((chat) => {
                    const isUnread =
                      chat.lastMessageSenderId !== user?.id &&
                      chat.rawTimeMillis >
                        parseInt(localStorage.getItem(`chat_read_${chat.id}`) || "0", 10);
                    const displayUnread =
                      chat.lastMessageSenderId !== user?.id && chat.unread > 0
                        ? chat.unread
                        : isUnread
                          ? 1
                          : 0;

                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left ${
                          activeChatId === chat.id
                            ? "bg-primary/10 shadow-[var(--shadow-glow)] shadow-primary/5"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12 border border-border/50">
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chat.type === "group" ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                chat.name.substring(0, 2).toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm truncate pr-2">{chat.name}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {chat.time}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p
                              className={`text-xs truncate pr-2 ${
                                displayUnread > 0
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {chat.lastMessage || "Tap to chat"}
                            </p>
                            {displayUnread > 0 && (
                              <Badge
                                className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
                                style={{ background: "var(--gradient-primary)" }}
                              >
                                {displayUnread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100dvh-180px)]">
              <div className="p-2 flex flex-col gap-1">
                {displayChannels.filter((c) => c.type === "group").length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No community channels</p>
                    <p className="text-xs mt-1">Follow organizers to join their communities.</p>
                  </div>
                ) : (
                  displayChannels
                    .filter((c) => c.type === "group")
                    .map((chat) => {
                      const isUnread =
                        chat.lastMessageSenderId !== user?.id &&
                        chat.rawTimeMillis >
                          parseInt(localStorage.getItem(`chat_read_${chat.id}`) || "0", 10);
                      const displayUnread =
                        chat.lastMessageSenderId !== user?.id && chat.unread > 0
                          ? chat.unread
                          : isUnread
                            ? 1
                            : 0;

                      return (
                        <button
                          key={chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left ${
                            activeChatId === chat.id
                              ? "bg-primary/10 shadow-[var(--shadow-glow)] shadow-primary/5"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <Avatar className="h-12 w-12 border border-border/50">
                              <AvatarImage src={chat.avatar} alt={chat.name} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm truncate pr-2">
                                {chat.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {chat.time}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p
                                className={`text-xs truncate pr-2 ${
                                  displayUnread > 0
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {chat.lastMessage || "Tap to chat"}
                              </p>
                              {displayUnread > 0 && (
                                <Badge
                                  className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
                                  style={{ background: "var(--gradient-primary)" }}
                                >
                                  {displayUnread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT MAIN AREA - Chat View */}
      <div
        className={`flex-1 h-full bg-card/30 relative ${
          !activeChatId ? "hidden md:block" : "block"
        }`}
      >
        <ChatConversation
          activeChat={activeChat}
          sendMessage={sendMessage}
          onBack={() => setActiveChatId(null)}
          initialEventId={eventId}
        />
      </div>
    </div>
  );
}
