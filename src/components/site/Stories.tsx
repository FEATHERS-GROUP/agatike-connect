import { useState } from "react";
import { stories as defaultStories } from "@/lib/mock-data";
import { StoryViewer } from "@/components/site/StoryViewer";

type Story = { id: string; name: string; avatar: string; items: { id: string; image: string }[] };

export function Stories({ items = defaultStories }: { items?: Story[] }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const handleStoryFinished = (orgId: string) => {
    setViewedStories((prev) => {
      const next = new Set(prev);
      next.add(orgId);
      return next;
    });
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {items.map((s, i) => (
          <div 
            key={s.id} 
            className="flex shrink-0 flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => setActiveStoryIndex(i)}
          >
            <div 
              className={`rounded-full p-[2px] ${viewedStories.has(s.id) ? "bg-border" : ""}`} 
              style={viewedStories.has(s.id) ? undefined : { background: "var(--gradient-primary)" }}
            >
              <div className="rounded-full bg-background p-[2px]">
                <img src={s.avatar} alt={s.name} className="h-16 w-16 rounded-full object-cover" loading="lazy" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>

      {activeStoryIndex !== null && (
        <StoryViewer 
          stories={items} 
          initialIndex={activeStoryIndex} 
          onClose={() => setActiveStoryIndex(null)} 
          onStoryFinished={handleStoryFinished}
        />
      )}
    </>
  );
}