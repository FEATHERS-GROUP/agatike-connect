import { stories as defaultStories } from "@/lib/mock-data";

type Story = { id: string; name: string; cover: string };

export function Stories({ items = defaultStories }: { items?: Story[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
      {items.map((s) => (
        <div key={s.id} className="flex shrink-0 flex-col items-center gap-2">
          <div className="rounded-full p-[2px]" style={{ background: "var(--gradient-primary)" }}>
            <div className="rounded-full bg-background p-[2px]">
              <img src={s.cover} alt={s.name} className="h-16 w-16 rounded-full object-cover" loading="lazy" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{s.name}</span>
        </div>
      ))}
    </div>
  );
}