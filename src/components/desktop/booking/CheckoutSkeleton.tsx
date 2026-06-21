import { Navbar } from "@/components/site/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-10">
            <Skeleton className="h-10 w-80 mb-8" />
            <div className="p-6 rounded-3xl border border-border/60 bg-card/40 space-y-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-24 w-20 rounded-xl" />
                <div className="flex flex-col space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-2xl mt-8" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
