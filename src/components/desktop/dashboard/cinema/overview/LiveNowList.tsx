import { Film } from "lucide-react";

interface LiveNowListProps {
  liveSchedules: any[];
}

export function LiveNowList({ liveSchedules }: LiveNowListProps) {
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold mb-4">Live Now</h3>
      {liveSchedules.length === 0 ? (
        <div className="flex-1 text-center py-8 bg-secondary/10 rounded-2xl border border-border/40 flex flex-col items-center justify-center">
          <Film className="h-6 w-6 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground text-sm">No movies are currently playing.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {liveSchedules.map((schedule: any) => (
            <div key={schedule.id} className="min-w-[140px] max-w-[140px] shrink-0 snap-start space-y-2">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-secondary border border-border/40 shadow-sm relative">
                <img 
                  src={schedule.movie?.cover_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400"} 
                  alt={schedule.movie?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                  Playing
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg text-center truncate shadow-sm border border-white/10">
                  {schedule.screen?.name || "Screen 1"}
                </div>
              </div>
              <div>
                <p className="font-bold text-sm truncate" title={schedule.movie?.title}>{schedule.movie?.title}</p>
                <p className="text-xs text-muted-foreground">Started {schedule.start_time?.substring(0, 5)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
