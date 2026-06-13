import { useState } from "react";
import { stories as defaultStories } from "@/lib/mock-data";
import { StoryViewer } from "@/components/site/StoryViewer";
import { Skeleton } from "@/components/ui/skeleton";

type Story = { id: string; name: string; avatar: string; items: { id: string; image: string }[] };

export function Stories({ items = defaultStories, isLoading = false }: { items?: Story[], isLoading?: boolean }) {
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
        {isLoading ? (
          [1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <Skeleton className="h-[72px] w-[72px] rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))
        ) : (
          items.map((s, i) => (
            <div
              key={s.id}
              className="flex shrink-0 flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => setActiveStoryIndex(i)}
            >
              <div
                className={`rounded-full p-[2px] ${viewedStories.has(s.id) ? "bg-border" : ""}`}
                style={
                  viewedStories.has(s.id) ? undefined : { background: "var(--gradient-primary)" }
                }
              >
                <div className="rounded-full bg-background p-[2px]">
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="h-16 w-16 rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </div>
          ))
        )}
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
