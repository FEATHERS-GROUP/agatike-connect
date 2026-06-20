import { MapPin, Search } from "lucide-react";

export function MoviesSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 animate-pulse">
      <div className="hidden md:block">
        {/* Desktop Skeleton */}
        <div className="pt-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="h-10 w-full bg-border rounded-full" />
            <div className="flex gap-2">
              <div className="h-10 w-1/2 bg-border rounded-full" />
              <div className="h-10 w-1/2 bg-border rounded-full" />
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-border">
                  <div className="w-20 h-28 bg-border rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 bg-border rounded" />
                    <div className="h-4 w-1/2 bg-border rounded" />
                    <div className="h-4 w-1/4 bg-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block w-[1px] bg-border" />
          <div className="w-full md:w-2/3 h-[600px] bg-border rounded-xl" />
        </div>
      </div>

      <div className="md:hidden">
        {/* Mobile Skeleton */}
        <div className="px-4 pt-16 pb-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10 space-y-4">
          <div className="h-10 w-full bg-border rounded-full" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-border rounded-full" />
            <div className="h-10 w-24 bg-border rounded-full" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex overflow-x-auto gap-4 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[150px] w-[150px] space-y-2">
                <div className="w-full aspect-[2/3] bg-border rounded-xl" />
                <div className="h-4 w-3/4 bg-border rounded" />
                <div className="h-4 w-1/2 bg-border rounded" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-border rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full bg-border rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
