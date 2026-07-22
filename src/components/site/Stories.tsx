import { useState } from "react";
import { StoryViewer } from "@/components/site/StoryViewer";
import { Skeleton } from "@/components/ui/skeleton";

// Stubbed mock data
const defaultStories: any[] = [
  {
    id: "s1",
    name: "Sydney Fest",
    avatar: "https://ui-avatars.com/api/?name=Sydney+Fest&background=000&color=fff",
    items: [
      {
        id: "s1i1",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/0/02/Vivid_Sydney_2024_-_Bright_Lights_Big_City.jpg",
      },
    ],
  },
  {
    id: "s2",
    name: "Tomorrowland",
    avatar: "https://ui-avatars.com/api/?name=Tomorrowland&background=8B5CF6&color=fff",
    items: [
      {
        id: "s2i1",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Tomorrowland2016mainstage.jpg",
      },
    ],
  },
  {
    id: "s3",
    name: "Berlin Lights",
    avatar: "https://ui-avatars.com/api/?name=Berlin+Lights&background=EC4899&color=fff",
    items: [
      {
        id: "s3i1",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/e/e9/Berliner_Dom_Festival_of_Lights.jpg",
      },
    ],
  },
  {
    id: "s4",
    name: "Cairo Fest",
    avatar: "https://ui-avatars.com/api/?name=Cairo+Fest&background=10B981&color=fff",
    items: [
      {
        id: "s4i1",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Cairo_at_night.jpg",
      },
    ],
  },
  {
    id: "s5",
    name: "Doha Expo",
    avatar: "https://ui-avatars.com/api/?name=Doha+Expo&background=F59E0B&color=fff",
    items: [
      {
        id: "s5i1",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Doha_skyline_at_night.jpg",
      },
    ],
  },
  {
    id: "s6",
    name: "Web Summit",
    avatar: "https://ui-avatars.com/api/?name=Web+Summit&background=3B82F6&color=fff",
    items: [
      {
        id: "s6i1",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/66/SXSW_Center_%2854987238776%29.jpg",
      },
    ],
  },
  {
    id: "s7",
    name: "Paris Fashion",
    avatar: "https://ui-avatars.com/api/?name=Paris+Fashion&background=EF4444&color=fff",
    items: [
      {
        id: "s7i1",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Magdalena_Frackowiak.jpg",
      },
    ],
  },
  {
    id: "s8",
    name: "TechCrunch",
    avatar: "https://ui-avatars.com/api/?name=TechCrunch&background=14B8A6&color=fff",
    items: [
      {
        id: "s8i1",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/66/SXSW_Center_%2854987238776%29.jpg",
      },
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
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                <Skeleton className="h-[72px] w-[72px] rounded-full" />
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
