import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/$workspaceSlug/community")({
  head: () => ({
    meta: [
      { title: "Community — Agatike" },
      { name: "description", content: "Engage with your followers and community." },
    ],
  }),
  component: CommunityPage,
});

// --- Mock Data ---
type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
};

type Chat = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: "user" | "group";
  messages: Message[];
};

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    name: "VIP Members Group",
    avatar: "https://i.pravatar.cc/150?u=vip",
    lastMessage: "Are there any updates on the summer festival tickets?",
    time: "10:23 AM",
    unread: 5,
    online: true,
    type: "group",
    messages: [
      { id: "m1", senderId: "other1", text: "Hey everyone! So excited for the upcoming events.", timestamp: "10:15 AM", isMe: false },
      { id: "m2", senderId: "me", text: "Welcome! We have some great announcements coming soon.", timestamp: "10:18 AM", isMe: true },
      { id: "m3", senderId: "other2", text: "Are there any updates on the summer festival tickets?", timestamp: "10:23 AM", isMe: false },
    ],
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    lastMessage: "Thanks for the swift response!",
    time: "Yesterday",
    unread: 0,
    online: false,
    type: "user",
    messages: [
      { id: "m4", senderId: "other", text: "Hi, I had a question regarding my recent booking.", timestamp: "Yesterday 2:00 PM", isMe: false },
      { id: "m5", senderId: "me", text: "Hello Sarah, how can I help you today?", timestamp: "Yesterday 2:05 PM", isMe: true },
      { id: "m6", senderId: "me", text: "I've checked your booking. Everything is confirmed.", timestamp: "Yesterday 2:10 PM", isMe: true },
      { id: "m7", senderId: "other", text: "Thanks for the swift response!", timestamp: "Yesterday 2:15 PM", isMe: false },
    ],
  },
  {
    id: "3",
    name: "Event Organizers Hub",
    avatar: "https://i.pravatar.cc/150?u=hub",
    lastMessage: "Let's schedule a call for next week.",
    time: "Tuesday",
    unread: 2,
    online: true,
    type: "group",
    messages: [
      { id: "m8", senderId: "other", text: "The venue looks great, but we need more lighting.", timestamp: "Tuesday 9:00 AM", isMe: false },
      { id: "m9", senderId: "me", text: "Noted. I will contact the suppliers.", timestamp: "Tuesday 9:30 AM", isMe: true },
      { id: "m10", senderId: "other", text: "Let's schedule a call for next week.", timestamp: "Tuesday 10:00 AM", isMe: false },
    ],
  },
  {
    id: "4",
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?u=michael",
    lastMessage: "See you at the conference!",
    time: "Monday",
    unread: 0,
    online: true,
    type: "user",
    messages: [
      { id: "m11", senderId: "other", text: "See you at the conference!", timestamp: "Monday", isMe: false },
    ],
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=elena",
    lastMessage: "Can you send the presentation deck?",
    time: "Last week",
    unread: 1,
    online: false,
    type: "user",
    messages: [
      { id: "m12", senderId: "other", text: "Can you send the presentation deck?", timestamp: "Last week", isMe: false },
    ],
  },
];

function CommunityPage() {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>(MOCK_CHATS[0].id);
  const [messageInput, setMessageInput] = useState("");

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setChats(chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage.text,
          time: newMessage.timestamp,
        };
      }
      return chat;
    }));
    setMessageInput("");
  };

  return (
    <div className="flex h-screen bg-background border-none rounded-none shadow-none">
      
      {/* LEFT SIDEBAR - Chat List */}
      <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-border/60 bg-card/50">
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

        <Tabs defaultValue="all" className="flex-1 flex flex-col w-full">
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

          <TabsContent value="all" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2 flex flex-col gap-1">
                {chats.map((chat) => (
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
                        <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm truncate pr-2">{chat.name}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate pr-2 ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]" style={{ background: "var(--gradient-primary)" }}>
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="followers" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2 flex flex-col gap-1">
                {chats.filter(c => c.type === "user").map((chat) => (
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
                       <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     {chat.online && (
                       <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                     )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-semibold text-sm truncate pr-2">{chat.name}</span>
                       <span className="text-[10px] text-muted-foreground whitespace-nowrap">{chat.time}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <p className={`text-xs truncate pr-2 ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                         {chat.lastMessage}
                       </p>
                       {chat.unread > 0 && (
                         <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]" style={{ background: "var(--gradient-primary)" }}>
                           {chat.unread}
                         </Badge>
                       )}
                     </div>
                   </div>
                 </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="channels" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2 flex flex-col gap-1">
                {chats.filter(c => c.type === "group").map((chat) => (
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
                       <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     {chat.online && (
                       <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                     )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-semibold text-sm truncate pr-2">{chat.name}</span>
                       <span className="text-[10px] text-muted-foreground whitespace-nowrap">{chat.time}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <p className={`text-xs truncate pr-2 ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                         {chat.lastMessage}
                       </p>
                       {chat.unread > 0 && (
                         <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]" style={{ background: "var(--gradient-primary)" }}>
                           {chat.unread}
                         </Badge>
                       )}
                     </div>
                   </div>
                 </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT MAIN AREA - Chat View */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-card/30 relative">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-border/60 flex items-center justify-between bg-background/50 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
                <AvatarFallback>{activeChat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm leading-tight">{activeChat.name}</h3>
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
                      <span>24 Members</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button variant="ghost" size="icon" className="rounded-full hover:text-foreground">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:text-foreground">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:text-foreground">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-4">
              {/* Date divider */}
              <div className="flex items-center justify-center my-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  Today
                </span>
              </div>

              {activeChat.messages.map((msg, idx) => {
                const showAvatar = !msg.isMe && (idx === 0 || activeChat.messages[idx - 1]?.senderId !== msg.senderId);
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "justify-end" : "justify-start"}`}>
                    {!msg.isMe && (
                      <div className="w-8 shrink-0">
                        {showAvatar && (
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarImage src={activeChat.avatar} />
                            <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                      {!msg.isMe && activeChat.type === "group" && showAvatar && (
                        <span className="text-[11px] text-muted-foreground mb-1 ml-1 font-medium">
                          Follower Member
                        </span>
                      )}
                      
                      <div 
                        className={`p-3.5 rounded-2xl shadow-sm text-sm ${
                          msg.isMe 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-background border border-border/50 rounded-tl-sm"
                        }`}
                        style={msg.isMe ? { background: "var(--gradient-primary)" } : {}}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 mx-1">
                        {msg.timestamp}
                        {msg.isMe && <span className="text-primary ml-1">✓✓</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background/50 backdrop-blur-md border-t border-border/60 shrink-0">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2 bg-card border border-border/60 rounded-full p-1.5 shadow-sm">
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0 hidden sm:inline-flex">
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <Input 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 shadow-none text-sm"
              />
              
              {messageInput.trim() ? (
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-10 rounded-full shrink-0 shadow-[var(--shadow-glow)] transition-all"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </Button>
              )}
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
            Engage with your followers, answer questions, and build lasting relationships with your event attendees.
          </p>
        </div>
      )}
    </div>
  );
}
