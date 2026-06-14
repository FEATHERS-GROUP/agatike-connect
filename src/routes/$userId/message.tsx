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
import EmojiPicker from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";

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

  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [isGifPopoverOpen, setIsGifPopoverOpen] = useState(false);
  const [isFetchingGifs, setIsFetchingGifs] = useState(false);
  const [pendingEventCard, setPendingEventCard] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      import("@/lib/mock-data").then(async ({ events, experiences, movies }) => {
        let ev: any =
          events.find((e) => e.id === eventId) ||
          experiences.find((x) => x.id === eventId) ||
          movies.find((m) => m.id === eventId);

        if (!ev) {
          try {
            const { getEventById } = await import("@/api/events");
            ev = await getEventById({ data: { id: eventId } } as any);
          } catch (error) {
            console.error("Failed to fetch event for card", error);
          }
        }

        if (ev) {
          setPendingEventCard({
            eventId: ev.id,
            title: ev.title || ev.name || "Event",
            image:
              ev.cover ||
              ev.image_url ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
            info: ev.date || "Event Details",
          });
        }
      });
    }
  }, [eventId]);

  const fetchGifs = async (offset: number) => {
    if (offset === 0) setIsFetchingGifs(true);
    try {
      if (gifSearch) {
        return await gf.search(gifSearch, { offset, limit: 10 });
      }
      return await gf.trending({ offset, limit: 10 });
    } finally {
      if (offset === 0) setIsFetchingGifs(false);
    }
  };

  const handleGifClick = (gif: any, e: React.SyntheticEvent<HTMLElement, Event>) => {
    e.preventDefault();
    if (!activeChat) return;
    sendMessage("", activeChat, gif.images.fixed_width.url);
    setIsGifPopoverOpen(false);
  };

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 150);
    const t2 = setTimeout(scrollToBottom, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeChat?.messages, activeChatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !pendingEventCard && !activeChat) return;

    sendMessage(messageInput, activeChat, undefined, pendingEventCard);
    setMessageInput("");
    setPendingEventCard(null);

    // clear eventId from url
    navigate({ search: { chatId: activeChatId || undefined } as any, replace: true });
  };

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
                    const displayUnread = chat.unread > 0 ? chat.unread : isUnread ? 1 : 0;

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
                      const displayUnread = chat.unread > 0 ? chat.unread : isUnread ? 1 : 0;

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
        className={`flex-1 flex flex-col h-full bg-card/30 relative ${
          !activeChatId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b border-border/60 flex items-center justify-between bg-background/50 backdrop-blur-md z-10 shrink-0 pt-safe-top">
              <div className="flex items-center gap-3 md:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 -ml-2 rounded-full"
                  onClick={() => setActiveChatId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activeChat.type === "group" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      activeChat.name.substring(0, 2).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{activeChat.name}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {activeChat.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <ScrollArea
              className="flex-1 p-4 md:p-6"
              style={{
                backgroundImage: "var(--chat-pattern)",
                backgroundSize: "400px",
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-4">
                {activeChat.messages.length === 0 && (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    Say hi to start the conversation!
                  </div>
                )}
                {activeChat.messages.map((msg, index) => {
                  const isMe = msg.isMe;
                  const currentMsgDate = formatMessageDate(msg.rawTimeMillis || Date.now());
                  const prevMsg = activeChat.messages[index - 1];
                  const prevMsgDate = prevMsg
                    ? formatMessageDate(prevMsg.rawTimeMillis || Date.now())
                    : null;
                  const showDateHeader = currentMsgDate !== prevMsgDate;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateHeader && (
                        <div className="flex justify-center my-4">
                          <Badge
                            variant="secondary"
                            className="px-3 py-1 text-xs bg-muted/50 backdrop-blur-sm border-border/50 text-muted-foreground font-medium rounded-full shadow-sm"
                          >
                            {currentMsgDate}
                          </Badge>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                        <div
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-sm shadow-[var(--shadow-glow)] shadow-primary/20"
                                : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
                            } ${msg.isPending ? "opacity-70" : ""}`}
                          >
                            {msg.mediaUrl && (
                              <img
                                src={msg.mediaUrl}
                                alt="attachment"
                                className="max-w-full rounded-xl mb-2"
                              />
                            )}
                            {msg.eventCard && (
                              <Link
                                to="/events/$eventId"
                                params={{ eventId: msg.eventCard.eventId }}
                                className="block mb-2 w-64 border border-border/50 rounded-xl overflow-hidden bg-card/50 hover:border-primary/50 transition-colors cursor-pointer"
                              >
                                <img
                                  src={msg.eventCard.image}
                                  alt={msg.eventCard.title}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="p-3">
                                  <p className="font-bold text-sm truncate">
                                    {msg.eventCard.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{msg.eventCard.info}</span>
                                  </div>
                                </div>
                              </Link>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
              </div>
            </ScrollArea>

            {/* Chat Input Area */}
            <div className="p-3 md:p-4 bg-background/80 backdrop-blur-md border-t border-border/60 shrink-0 pb-safe">
              {pendingEventCard && (
                <div className="mb-3 max-w-3xl mx-auto flex items-center justify-between bg-card/80 border border-border/50 p-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={pendingEventCard.image}
                      alt="Event"
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-xs leading-none mb-1">Attaching Event</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {pendingEventCard.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => {
                      setPendingEventCard(null);
                      navigate({
                        search: { chatId: activeChatId || undefined } as any,
                        replace: true,
                      });
                    }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 max-w-3xl mx-auto relative"
              >
                <div className="flex-1 relative flex items-center bg-card border border-border/60 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0 text-muted-foreground hover:text-foreground ml-1"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="p-0 border-none shadow-xl bg-transparent mb-2"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setMessageInput((prev) => prev + emojiData.emoji)
                        }
                        theme="auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={isGifPopoverOpen} onOpenChange={setIsGifPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Sticker className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="w-[300px] p-2 mb-2 shadow-xl rounded-xl max-w-[90vw]"
                    >
                      <Input
                        placeholder="Search GIFs..."
                        value={gifSearch}
                        onChange={(e) => setGifSearch(e.target.value)}
                        className="mb-2 h-8 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="h-[300px] overflow-y-auto overflow-x-hidden rounded-md no-scrollbar relative">
                        {isFetchingGifs && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          </div>
                        )}
                        <Grid
                          key={gifSearch}
                          width={280}
                          columns={2}
                          fetchGifs={fetchGifs}
                          onGifClick={handleGifClick}
                          noLink
                          hideAttribution
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 px-2 py-3 h-auto min-h-[44px] text-base"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!messageInput.trim()}
                  size="icon"
                  className="h-11 w-11 rounded-full shrink-0 shadow-[var(--shadow-glow)] shadow-primary/20 transition-transform active:scale-95"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="h-5 w-5 ml-1" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
            <div className="h-24 w-24 bg-card border border-border/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <MessageCircle className="h-10 w-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
