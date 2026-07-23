import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { MapPin } from "lucide-react";

const HomeMobile = lazy(() =>
  import("@/components/mobile/HomeMobile").then((m) => ({ default: m.HomeMobile })),
);
const HomeDesktop = lazy(() =>
  import("@/components/desktop/HomeDesktop").then((m) => ({ default: m.HomeDesktop })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agatike — The premium social event platform" },
      {
        name: "description",
        content:
          "Discover music, nightlife, sports, festivals and experiences worldwide. Buy tickets, share moments, follow organizers.",
      },
      { property: "og:title", content: "Agatike — The premium social event platform" },
      {
        property: "og:description",
        content: "Discover and live the moments that matter, worldwide.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { isLoggedIn } = useUserAuth();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        }
      >
        <div className="md:hidden">
          <HomeMobile />
        </div>
        <div className="hidden md:block">
          <HomeDesktop />
        </div>
      </Suspense>

      {/* Map Bubble - Visible to everyone */}
      <Link
        to="/map"
        className="fixed bottom-[160px] right-4 md:bottom-[96px] md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95 border border-border"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="Open Map"
      >
        <MapPin className="h-6 w-6 text-white" />
      </Link>
    </>
  );
}
