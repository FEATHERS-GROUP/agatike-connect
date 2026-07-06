import { createFileRoute, useParams } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Send,
  Image as ImageIcon,
  Users,
  MessageCircle,
  Loader2,
  UploadCloud,
  X,
  Sticker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";

const gf = new GiphyFetch(import.meta.env.GIPHY_API_KEY || "");

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type CommunitySearch = {
  chatId?: string;
};

export const Route = createFileRoute("/dashboard/$workspaceSlug/community")({
  validateSearch: (search: Record<string, unknown>): CommunitySearch => {
    return {
      chatId: search.chatId as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Community — Agatike" },
      { name: "description", content: "Engage with your followers and community." },
    ],
  }),
  component: CommunityPage,
});

import { useFirestoreCommunity } from "@/hooks/useFirestoreCommunity";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizerFollowersProfiles } from "@/api/users";
import { getCommunityChannels, createCommunityChannel } from "@/api/community";
import { getWorkspaceEvents, getEventAttendeesCount } from "@/api/events";
import { getOrganizersByIds } from "@/api/organizers";
import { uploadFile } from "@/api/storage";
import { formatMessageDate } from "@/lib/utils";

const COUNTRY_FLAGS: Record<string, string> = {
  Rwanda: "🇷🇼",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Kenya: "🇰🇪",
  Uganda: "🇺🇬",
  Tanzania: "🇹🇿",
  Burundi: "🇧🇮",
  "South Africa": "🇿🇦",
  Nigeria: "🇳🇬",
  India: "🇮🇳",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
};

const getCountryFlag = (countryName?: string) => {
  if (!countryName) return "";
  return COUNTRY_FLAGS[countryName] || "🌍";
};

function CommunityPage() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/community" });
  const { activeWorkspace } = useWorkspace();

  const organizerId = activeWorkspace?.orgnizer_id || "";
  const currentUserId = organizerId;

  const { chatId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const {
    channels,
    activeChatId,
    setActiveChatId,
    sendMessage,
    loading,
    createDirectMessageChannel,
    createFirebaseGroupChannel,
  } = useFirestoreCommunity(organizerId, currentUserId, chatId);

  // Sync activeChatId to URL
  useEffect(() => {
    navigate({ search: { chatId: activeChatId || undefined } as any, replace: true });
  }, [activeChatId, navigate]);

  const { data: followers = [] } = useQuery({
    queryKey: ["organizerFollowers", organizerId],
    queryFn: async () => {
      if (!organizerId) return [];
      return await getOrganizerFollowersProfiles({ data: { organizerId } });
    },
    enabled: !!organizerId,
  });

  const { data: communityChannels = [], refetch: refetchChannels } = useQuery({
    queryKey: ["communityChannels", organizerId],
    queryFn: async () => {
      if (!organizerId) return [];
      return await getCommunityChannels({ data: { organizerId } });
    },
    enabled: !!organizerId,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["workspaceEvents", activeWorkspace?.id],
    queryFn: async () => {
      if (!activeWorkspace?.id) return [];
      return await getWorkspaceEvents({ data: { workspace_id: activeWorkspace.id } });
    },
    enabled: !!activeWorkspace?.id,
  });

  const { data: organizerProfiles = [] } = useQuery({
    queryKey: ["organizerProfile", organizerId],
    queryFn: async () => {
      if (!organizerId) return [];
      return await getOrganizersByIds({ data: { ids: [organizerId] } });
    },
    enabled: !!organizerId,
  });
  const currentOrganizerProfile = organizerProfiles[0];

  const [messageInput, setMessageInput] = useState("");

  const activeChat = channels.find((c) => c.id === activeChatId);
  const activeHasuraChannel = communityChannels.find(
    (c: { id: string | null }) => c.id === activeChatId,
  );

  const { data: attendeesCount = 0 } = useQuery({
    queryKey: ["attendeesCount", activeHasuraChannel?.event_id, activeHasuraChannel?.schedule_id],
    queryFn: async () => {
      if (!activeHasuraChannel?.event_id && !activeHasuraChannel?.schedule_id) return 0;
      return await getEventAttendeesCount({
        data: {
          eventId: activeHasuraChannel.event_id || undefined,
          scheduleId: activeHasuraChannel.schedule_id || undefined,
        },
      });
    },
    enabled: !!(activeHasuraChannel?.event_id || activeHasuraChannel?.schedule_id),
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    sendMessage(messageInput, activeChat);
    setMessageInput("");
  };

  const [activeTab, setActiveTab] = useState("all");
  const [gifSearch, setGifSearch] = useState("");
  const [isGifPopoverOpen, setIsGifPopoverOpen] = useState(false);
  const [isFetchingGifs, setIsFetchingGifs] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages when a chat is opened or new messages arrive
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(`chat_read_${activeChatId}`, Date.now().toString());
      window.dispatchEvent(new Event("chat_read_updated"));
    }
    scrollToBottom();
  }, [activeChat?.messages, activeChatId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

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

  const handleFollowerClick = async (follower: any) => {
    const name = follower.handle ? `@${follower.handle}` : follower.username || "Follower";
    const profileStr = typeof follower.profile === "string" ? follower.profile : "";
    const avatar = profileStr && !profileStr.includes("pravatar.cc") ? profileStr : "";
    await createDirectMessageChannel(follower.id, name, avatar);
    setActiveTab("all");
  };

  const [creating, setCreating] = useState(false);
  const [isMainChannelModalOpen, setIsMainChannelModalOpen] = useState(false);
  const [mainChannelName, setMainChannelName] = useState("General Announcements");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const BACKGROUND_COLORS = [
    "b6e3f4",
    "c0aede",
    "d1d4f9",
    "ffdfbf",
    "ffd5dc",
    "d1f4e0",
    "fce2c4",
    "f9d8e5",
  ];

  useEffect(() => {
    if (isMainChannelModalOpen) {
      const options = Array.from({ length: 8 }).map(() => {
        const bg = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
        const seed = Math.random().toString(36).substring(7);
        return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${bg}`;
      });
      setAvatarOptions(options);
      setSelectedAvatarUrl(options[0]);
    } else {
      setSelectedFile(null);
      setFilePreviewUrl("");
      setMainChannelName("General Announcements");
    }
  }, [isMainChannelModalOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }

    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    setSelectedAvatarUrl("");
  };

  const handleCreateMainChannelSubmit = async () => {
    if (creating) return;
    setCreating(true);
    try {
      let finalCoverUrl = selectedAvatarUrl;

      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
        });
        reader.readAsDataURL(selectedFile);
        const base64 = await base64Promise;

        const ext = selectedFile.name.split(".").pop() || "png";

        const uploadRes = await uploadFile({
          data: {
            base64,
            contentType: selectedFile.type,
            folder: "channels",
            ext,
          } as any,
        });

        if (uploadRes && uploadRes.url) {
          finalCoverUrl = uploadRes.url;
        }
      }

      const ch = await createCommunityChannel({
        data: {
          organizerId,
          name: mainChannelName || "General Announcements",
          coverUrl: finalCoverUrl,
          isMain: true,
        },
      });
      await createFirebaseGroupChannel(ch.id, ch.name, ch.cover_url || "", "GLOBAL");
      refetchChannels();
      setIsMainChannelModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to create main channel.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateEventChannel = async (target: any) => {
    if (creating) return;
    setCreating(true);
    try {
      const ch = await createCommunityChannel({
        data: {
          organizerId,
          name: target.title,
          coverUrl: target.cover || "",
          isMain: false,
          eventId: target.eventId,
          scheduleId: target.scheduleId,
          tourStopIdx: target.tourStopIdx,
        },
      });
      await createFirebaseGroupChannel(ch.id, ch.name, ch.cover_url || "", "EVENT");
      refetchChannels();
    } finally {
      setCreating(false);
    }
  };

  const channelTargets = React.useMemo(() => {
    const targets: any[] = [];
    events.forEach(
      (event: {
        event_type: string;
        schedules: any[];
        event_requency: { date: any };
        tour_stops: {
          date: any;
          length: number;
          forEach: (arg0: (stop: any, idx: number) => void) => void;
        };
        id: any;
        title: any;
        cover: any;
      }) => {
        const isExperience =
          event.event_type === "experience" || (event.schedules && event.schedules.length > 0);

        if (isExperience) {
          const primaryDateStr =
            event.event_requency?.date ||
            (!Array.isArray(event.tour_stops) ? event.tour_stops?.date : undefined);

          targets.push({
            type: "schedule",
            id: `sched_primary_${event.id}`,
            eventId: event.id,
            scheduleId: null,
            tourStopIdx: null,
            title: `${event.title} - ${primaryDateStr || "Primary Schedule"}`,
            cover: event.cover,
          });

          if (Array.isArray(event.schedules)) {
            event.schedules.forEach((schedule: any) => {
              targets.push({
                type: "schedule",
                id: `sched_${schedule.id}`,
                eventId: event.id,
                scheduleId: schedule.id,
                tourStopIdx: null,
                title: `${event.title} - ${schedule.start_date || "Date TBD"}`,
                cover: event.cover,
              });
            });
          }
        } else if (Array.isArray(event.tour_stops) && event.tour_stops.length > 0) {
          event.tour_stops.forEach((stop: any, idx: number) => {
            const stopName = stop.city || stop.venue || `Stop ${idx + 1}`;
            targets.push({
              type: "tour_stop",
              id: `stop_${event.id}_${idx}`,
              eventId: event.id,
              scheduleId: null,
              tourStopIdx: idx,
              title: `${event.title} - ${stopName}`,
              cover: event.cover,
            });
          });
        } else {
          targets.push({
            type: "event",
            id: `ev_${event.id}`,
            eventId: event.id,
            scheduleId: null,
            tourStopIdx: null,
            title: event.title,
            cover: event.cover,
          });
        }
      },
    );
    return targets;
  }, [events]);

  const handleOpenHasuraChannel = (channelId: string) => {
    const hc = communityChannels.find((c: { id: string }) => c.id === channelId);
    if (hc) {
      createFirebaseGroupChannel(
        hc.id,
        hc.name,
        hc.cover_url || "",
        hc.is_main ? "GLOBAL" : "EVENT",
      );
    }
    setActiveChatId(channelId);
  };

  const mainChannel = communityChannels.find((c: { is_main: any }) => c.is_main);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background border-none rounded-none shadow-none">
      {/* LEFT SIDEBAR - Chat List */}
      <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 flex flex-col border-r border-border/60 bg-card/50">
        <div className="p-4 border-b border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Community</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search followers or groups..."
              className="pl-9 bg-background/50 border-border/60 rounded-xl"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col w-full min-h-0 overflow-hidden"
        >
          <div className="px-4 pt-2 border-b border-border/60">
            <TabsList className="w-full grid grid-cols-3 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2 pt-1"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2 pt-1"
              >
                Followers
              </TabsTrigger>
              <TabsTrigger
                value="channels"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-2 pt-1"
              >
                Channels
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 pr-4 flex flex-col gap-1">
                {channels
                  .filter((c) => !(c.type === "user" && !c.lastMessage))
                  .map((chat) => {
                    const isUnread =
                      chat.lastMessageSenderId !== organizerId &&
                      chat.rawTimeMillis >
                        parseInt(localStorage.getItem(`chat_read_${chat.id}`) || "0", 10);
                    const displayUnread =
                      chat.lastMessageSenderId !== organizerId && chat.unread > 0
                        ? chat.unread
                        : isUnread
                          ? 1
                          : 0;
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`group flex items-center gap-3 w-full p-2 px-3 rounded-md transition-all text-left ${
                          activeChatId === chat.id
                            ? "bg-muted/80 text-foreground"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chat.type === "group" ? (
                                <MessageCircle className="h-4 w-4" />
                              ) : (
                                chat.name.substring(0, 2).toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-center">
                            <span
                              className={`font-medium text-[14px] truncate pr-2 ${activeChatId === chat.id ? "text-foreground" : ""}`}
                            >
                              {chat.name} {chat.country ? getCountryFlag(chat.country) : ""}
                            </span>
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {chat.time}
                            </span>
                          </div>
                          {chat.lastMessage && (
                            <div className="flex justify-between items-center mt-0.5">
                              <p
                                className={`text-[12px] truncate pr-2 opacity-80 ${displayUnread > 0 ? "text-foreground font-semibold opacity-100" : ""}`}
                              >
                                {chat.lastMessage}
                              </p>
                              {displayUnread > 0 && (
                                <Badge className="h-4 min-w-4 flex items-center justify-center rounded-full px-1 text-[9px] bg-primary text-primary-foreground">
                                  {displayUnread}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="followers" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 pr-4 flex flex-col gap-1">
                {followers.length === 0 && (
                  <div className="text-center p-4 text-sm text-muted-foreground">
                    No followers found.
                  </div>
                )}
                {followers.map((follower: any) => {
                  const name = follower.handle
                    ? `@${follower.handle}`
                    : follower.username || "Follower";
                  const profileStr = typeof follower.profile === "string" ? follower.profile : "";
                  const avatar =
                    profileStr && !profileStr.includes("pravatar.cc") ? profileStr : "";
                  return (
                    <button
                      key={follower.id}
                      onClick={() => handleFollowerClick(follower)}
                      className={`flex items-center gap-3 w-full p-2 px-3 rounded-md transition-all text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[14px] truncate pr-2">
                            {name} {follower.country ? getCountryFlag(follower.country) : ""}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="channels" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 pr-4 flex flex-col gap-1">
                {/* Main Channel Section */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Main Channel
                  </h3>
                  {!mainChannel ? (
                    <div className="px-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-muted-foreground border-dashed"
                        onClick={() => setIsMainChannelModalOpen(true)}
                        disabled={creating}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Create Main Channel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenHasuraChannel(mainChannel.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left ${
                        activeChatId === mainChannel.id
                          ? "bg-primary/10 shadow-[var(--shadow-glow)] shadow-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border border-border/50">
                          <AvatarImage
                            src={
                              mainChannel.cover_url &&
                              !mainChannel.cover_url.includes("pravatar.cc")
                                ? mainChannel.cover_url
                                : undefined
                            }
                            alt={mainChannel.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <MessageCircle className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        {channels.find((c) => c.id === mainChannel.id)?.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm truncate pr-2">
                            {mainChannel.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {channels.find((c) => c.id === mainChannel.id)?.time || ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p
                            className={`text-xs truncate pr-2 ${
                              channels.find((c) => c.id === mainChannel.id)?.lastMessageSenderId !==
                                organizerId && channels.find((c) => c.id === mainChannel.id)?.unread
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {channels.find((c) => c.id === mainChannel.id)?.lastMessage ||
                              "Tap to chat"}
                          </p>
                          {channels.find((c) => c.id === mainChannel.id)?.lastMessageSenderId !==
                            organizerId && channels.find((c) => c.id === mainChannel.id)?.unread ? (
                            <Badge
                              className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
                              style={{ background: "var(--gradient-primary)" }}
                            >
                              {channels.find((c) => c.id === mainChannel.id)?.unread}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Event Channels Section */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Event Channels
                  </h3>
                  {channelTargets.map((target) => {
                    const eventChannel = communityChannels.find((c) => {
                      if (c.event_id !== target.eventId) return false;
                      if (target.type === "schedule") {
                        if (target.scheduleId === null)
                          return !c.schedule_id && c.tour_stop_idx === null;
                        return c.schedule_id === target.scheduleId;
                      }
                      if (target.type === "tour_stop")
                        return c.tour_stop_idx === target.tourStopIdx;
                      return !c.schedule_id && c.tour_stop_idx === null;
                    });

                    if (eventChannel) {
                      const fc = channels.find((c) => c.id === eventChannel.id);
                      return (
                        <button
                          key={eventChannel.id}
                          onClick={() => handleOpenHasuraChannel(eventChannel.id)}
                          className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left ${
                            activeChatId === eventChannel.id
                              ? "bg-primary/10 shadow-[var(--shadow-glow)] shadow-primary/5"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <Avatar className="h-12 w-12 border border-border/50">
                              <AvatarImage
                                src={
                                  eventChannel.cover_url &&
                                  !eventChannel.cover_url.includes("pravatar.cc")
                                    ? eventChannel.cover_url
                                    : undefined
                                }
                                alt={eventChannel.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            {fc?.online && (
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm truncate pr-2">
                                {eventChannel.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {fc?.time || ""}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p
                                className={`text-xs truncate pr-2 ${
                                  fc?.lastMessageSenderId !== organizerId && fc?.unread
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {fc?.lastMessage || "Tap to chat"}
                              </p>
                              {fc?.lastMessageSenderId !== organizerId && fc?.unread ? (
                                <Badge
                                  className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
                                  style={{ background: "var(--gradient-primary)" }}
                                >
                                  {fc.unread}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    } else {
                      return (
                        <div
                          key={target.id}
                          className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left hover:bg-accent/50"
                        >
                          <div className="relative shrink-0">
                            <Avatar className="h-12 w-12 border border-border/50 opacity-50 grayscale">
                              <AvatarImage
                                src={
                                  target.cover && !target.cover.includes("pravatar.cc")
                                    ? target.cover
                                    : undefined
                                }
                                alt={target.title}
                              />
                              <AvatarFallback className="bg-muted">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm truncate block">
                                {target.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                No channel active
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] px-2 rounded-full"
                              onClick={() => handleCreateEventChannel(target)}
                              disabled={creating}
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })}
                  {channelTargets.length === 0 && (
                    <div className="px-2 text-center py-4">
                      <p className="text-xs text-muted-foreground">
                        No events found. Create an event to add a channel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT MAIN AREA - Chat View */}
      {activeChat ? (
        <div className="flex-1 min-w-0 flex flex-col h-full bg-card/30 relative">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-border/60 flex items-center justify-between bg-background/50 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage
                  src={
                    activeChat.avatar && !activeChat.avatar.includes("pravatar.cc")
                      ? activeChat.avatar
                      : undefined
                  }
                  alt={activeChat.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activeChat.type === "group" ? (
                    <MessageCircle className="h-4 w-4" />
                  ) : (
                    activeChat.name.substring(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {activeChat.name} {activeChat.country ? getCountryFlag(activeChat.country) : ""}
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {activeChat.online ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span> Offline
                    </>
                  )}
                  {activeChat.type === "group" && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span>
                        {activeChat.entityType === "GLOBAL"
                          ? `${followers.length} Members`
                          : `${attendeesCount} Members`}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button variant="ghost" size="icon" className="rounded-full hover:text-foreground">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-4">
              {activeChat.messages.map((msg, idx) => {
                const currentMsgDate = formatMessageDate(msg.rawTimeMillis || Date.now());
                const prevMsg = activeChat.messages[idx - 1];
                const prevMsgDate = prevMsg
                  ? formatMessageDate(prevMsg.rawTimeMillis || Date.now())
                  : null;
                const showDateHeader = currentMsgDate !== prevMsgDate;

                // Show avatar if it's the first message, a new date, or a different sender
                const showAvatar =
                  idx === 0 ||
                  showDateHeader ||
                  activeChat.messages[idx - 1]?.senderId !== msg.senderId;

                const senderProfile = !msg.isMe
                  ? followers.find((f: any) => f.id === msg.senderId)
                  : null;

                const senderName = msg.isMe
                  ? currentOrganizerProfile?.name || activeWorkspace?.name || "Me"
                  : senderProfile?.handle
                    ? `@${senderProfile.handle}`
                    : senderProfile?.username || "Member";

                const profileStr =
                  typeof senderProfile?.profile === "string" ? senderProfile.profile : "";

                const myAvatar = currentOrganizerProfile?.image || activeWorkspace?.logo;
                const avatarSrc = msg.isMe
                  ? myAvatar && !myAvatar.includes("pravatar.cc")
                    ? myAvatar
                    : undefined
                  : profileStr && !profileStr.includes("pravatar.cc")
                    ? profileStr
                    : undefined;

                const initials = msg.isMe
                  ? String(currentOrganizerProfile?.name || activeWorkspace?.name || "M")
                      .substring(0, 1)
                      .toUpperCase()
                  : String(senderName || "M")
                      .substring(0, 2)
                      .toUpperCase();

                const senderFlag =
                  !msg.isMe && senderProfile?.country ? getCountryFlag(senderProfile.country) : "";

                return (
                  <React.Fragment key={msg.id}>
                    {showDateHeader && (
                      <div className="flex items-center my-4">
                        <div className="flex-1 h-px bg-border/50"></div>
                        <span className="text-[11px] font-semibold text-muted-foreground px-3">
                          {currentMsgDate}
                        </span>
                        <div className="flex-1 h-px bg-border/50"></div>
                      </div>
                    )}

                    <div
                      className={`group flex gap-4 hover:bg-muted/30 px-6 py-0.5 -mx-6 transition-colors ${showAvatar ? "mt-4" : ""}`}
                    >
                      <div className="w-10 shrink-0 flex justify-center select-none pt-0.5">
                        {showAvatar ? (
                          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={avatarSrc} />
                            <AvatarFallback
                              className={msg.isMe ? "bg-primary/10 text-primary" : "bg-muted"}
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 cursor-default">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-start">
                        {showAvatar && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-medium text-[15px] hover:underline cursor-pointer tracking-tight">
                              {senderName} {senderFlag}
                            </span>
                            <span className="text-xs text-muted-foreground cursor-default">
                              {msg.timestamp}
                            </span>
                            {msg.isMe && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1 text-[9px] rounded-sm font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                Organizer
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-[1.375rem]">
                          {msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="attachment"
                              className="max-w-[300px] rounded-lg mt-1 mb-2 border border-border/50 shadow-sm"
                            />
                          )}
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 px-6 bg-background shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto relative flex items-start gap-2 bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl p-2"
            >
              <div className="flex items-center gap-1 mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 shrink-0"
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
                      theme={Theme.AUTO}
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={isGifPopoverOpen} onOpenChange={setIsGifPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 shrink-0 hidden sm:inline-flex"
                    >
                      <Sticker className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-[300px] p-2 mb-2 shadow-xl rounded-xl border-border/50"
                  >
                    <Input
                      placeholder="Search GIFs..."
                      value={gifSearch}
                      onChange={(e) => setGifSearch(e.target.value)}
                      className="mb-2 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/50 border-none"
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
              </div>

              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={`Message ${activeChat.name}`}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 min-h-[40px] max-h-[200px] py-2 shadow-none text-[15px] resize-none"
                rows={1}
              />

              <div className="mt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-3 rounded-lg font-medium transition-all"
                  style={
                    messageInput.trim() ? { background: "var(--gradient-primary)" } : undefined
                  }
                  variant={messageInput.trim() ? "default" : "secondary"}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-card/20 text-center p-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Your Community Hub</h3>
          <p className="text-muted-foreground max-w-md">
            Engage with your followers, answer questions, and build lasting relationships with your
            event attendees.
          </p>
        </div>
      )}

      {/* Main Channel Creation Dialog */}
      <Dialog open={isMainChannelModalOpen} onOpenChange={setIsMainChannelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Main Channel</DialogTitle>
            <DialogDescription>
              This is the default channel for all your followers. Customize its name and appearance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={mainChannelName}
                onChange={(e) => setMainChannelName(e.target.value)}
                placeholder="e.g. General Announcements"
              />
            </div>

            <div className="space-y-3">
              <Label>Channel Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-full border border-border/50 overflow-hidden relative group bg-muted flex items-center justify-center">
                  {filePreviewUrl || selectedAvatarUrl ? (
                    <img
                      src={filePreviewUrl || selectedAvatarUrl || undefined}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                  {filePreviewUrl && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl("");
                        setSelectedAvatarUrl(avatarOptions[0]);
                      }}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                    Max 2MB. Jpeg, Png.
                  </p>
                </div>
              </div>
            </div>

            {!filePreviewUrl && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Or select an illustration
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(url)}
                      className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatarUrl === url
                          ? "border-primary scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                    >
                      <img src={url} alt={`Option ${i}`} className="h-full w-full" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMainChannelModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMainChannelSubmit}
              disabled={creating || !mainChannelName.trim()}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
