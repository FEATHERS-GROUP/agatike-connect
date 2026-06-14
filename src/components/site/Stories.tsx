import { useState } from "react";
import { StoryViewer } from "@/components/site/StoryViewer";
import { Skeleton } from "@/components/ui/skeleton";

// Stubbed mock data
const defaultStories: any[] = [
  {
    id: "s1",
    name: "AfroBeat Fest",
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
    items: [
      { id: "s1i1", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800" },
      { id: "s1i2", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800" },
    ],
  },
  {
    id: "s2",
    name: "Lagos Nights",
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop",
    items: [
      { id: "s2i1", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800" },
    ],
  },
  {
    id: "s3",
    name: "Cape Jazz",
    avatar: "https://images.unsplash.com/photo-1511735111819-9a3efd16269a?w=150&h=150&fit=crop",
    items: [
      { id: "s3i1", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800" },
      { id: "s3i2", image: "https://images.unsplash.com/photo-1501386761578-eaa54b8b9f8f?w=800" },
    ],
  },
  {
    id: "s4",
    name: "Nairobi FC",
    avatar: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=150&h=150&fit=crop",
    items: [
      { id: "s4i1", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800" },
    ],
  },
  {
    id: "s5",
    name: "Accra Vibes",
    avatar: "https://images.unsplash.com/photo-1545484152-c8e5b50c6fce?w=150&h=150&fit=crop",
    items: [
      { id: "s5i1", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
      { id: "s5i2", image: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800" },
    ],
  },
  {
    id: "s6",
    name: "Kigali Art",
    avatar: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=150&h=150&fit=crop",
    items: [
      { id: "s6i1", image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800" },
    ],
  },
];

type Story = { id: string; name: string; avatar: string; items: { id: string; image: string }[] };

export function Stories({
  items = defaultStories,
  isLoading = false,
}: {
  items?: Story[];
  isLoading?: boolean;
}) {
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
        {isLoading
          ? [1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                <Skeleton className="h-[72px] w-[72px] rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))
          : items.map((s, i) => (
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
