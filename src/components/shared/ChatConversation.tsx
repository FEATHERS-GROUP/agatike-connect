import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MoreVertical,
  Send,
  MessageCircle,
  Loader2,
  Users,
  Smile,
  Sticker,
  ArrowLeft,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { formatMessageDate } from "@/lib/utils";

const gf = new GiphyFetch(import.meta.env.GIPHY_API_KEY || "");

interface ChatConversationProps {
  activeChat: any;
  sendMessage: (text: string, channel: any, mediaUrl?: string, eventCard?: any) => void;
  onBack: () => void;
  initialEventId?: string;
}

export function ChatConversation({
  activeChat,
  sendMessage,
  onBack,
  initialEventId,
}: ChatConversationProps) {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const [gifSearch, setGifSearch] = useState("");
  const [isGifPopoverOpen, setIsGifPopoverOpen] = useState(false);
  const [isFetchingGifs, setIsFetchingGifs] = useState(false);
  const [pendingEventCard, setPendingEventCard] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEventId) {
      import("@/lib/mock-data").then(async ({ events, experiences, movies }) => {
        let ev: any =
          events.find((e) => e.id === initialEventId) ||
          experiences.find((x) => x.id === initialEventId) ||
          movies.find((m) => m.id === initialEventId);

        if (!ev) {
          try {
            const { getEventById } = await import("@/api/events");
            ev = await getEventById({ data: { id: initialEventId } } as any);
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
  }, [initialEventId]);

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
  }, [activeChat?.messages, activeChat?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || (!messageInput.trim() && !pendingEventCard)) return;

    sendMessage(messageInput, activeChat, undefined, pendingEventCard);
    setMessageInput("");
    setPendingEventCard(null);

    // clear eventId from url
    navigate({ search: { chatId: activeChat.id || undefined } as any, replace: true });
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground bg-card/30">
        <div className="h-24 w-24 bg-card border border-border/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <MessageCircle className="h-10 w-10 text-primary/50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card/30 relative">
      {/* Chat Header */}
      <div className="h-16 px-4 md:px-6 border-b border-border/60 flex items-center justify-between bg-background/50 backdrop-blur-md z-10 shrink-0 pt-safe-top">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 -ml-2 rounded-full"
            onClick={onBack}
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
          {activeChat.messages.map((msg: any, index: number) => {
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
                  search: { chatId: activeChat.id || undefined } as any,
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
    </div>
  );
}
