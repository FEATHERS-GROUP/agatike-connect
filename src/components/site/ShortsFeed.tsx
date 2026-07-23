import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Volume2, VolumeX, Play } from "lucide-react";
import { defaultStories } from "@/components/site/Stories";

type Short = {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar: string;
  mediaUrl: string;
};

const shorts: Short[] = defaultStories.flatMap((story) =>
  story.items.map((item: any) => ({
    id: item.id,
    organizerId: story.id,
    organizerName: story.name,
    organizerAvatar: story.avatar,
    mediaUrl: item.image,
  }))
);

export function ShortsFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(shorts[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      if (shorts[index] && shorts[index].id !== activeId) {
        setActiveId(shorts[index].id);
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [activeId]);

  return (
    <div className="flex justify-center w-full my-4">
      <div 
        ref={containerRef}
        className="relative h-[calc(100vh-140px)] w-full max-w-[400px] overflow-y-auto snap-y snap-mandatory scrollbar-none bg-black rounded-3xl shadow-xl border border-gray-800"
      >
        {shorts.map((short) => (
          <div key={short.id} className="relative h-full w-full snap-start snap-always shrink-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Background / Media */}
            <img 
              src={short.mediaUrl} 
              alt={short.organizerName}
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity"
            />
            
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

            {/* Play indicator (simulated) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black/10">
               <Play className="w-16 h-16 text-white/50 drop-shadow-lg" fill="currentColor" />
            </div>

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
              <span className="text-white font-semibold text-sm drop-shadow-md tracking-wider">Shorts</span>
              <button className="text-white pointer-events-auto p-2 hover:bg-white/10 rounded-full transition">
                <Volume2 className="w-5 h-5 drop-shadow-md" />
              </button>
            </div>

            {/* Right Action Bar */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white group-hover:bg-black/40 transition">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-md">{(Math.random() * 10).toFixed(1)}k</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white group-hover:bg-black/40 transition">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-md">{Math.floor(Math.random() * 500)}</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white group-hover:bg-black/40 transition">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white group-hover:bg-black/40 transition">
                  <MoreHorizontal className="w-6 h-6" />
                </div>
              </button>
            </div>

            {/* Bottom Info Area */}
            <div className="absolute left-4 bottom-4 right-20 flex flex-col gap-3 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={short.organizerAvatar} alt={short.organizerName} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-[15px] drop-shadow-md flex items-center gap-2">
                    {short.organizerName}
                    <button className="text-[11px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded text-white transition">Follow</button>
                  </span>
                  <span className="text-white/90 text-xs drop-shadow-md mt-0.5">Epic moments from the festival! 🎵✨ #live</span>
                </div>
              </div>
              
              {/* Audio Track marquee simulation */}
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[11px] font-medium drop-shadow-md marquee">Original Audio - {short.organizerName}</span>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
