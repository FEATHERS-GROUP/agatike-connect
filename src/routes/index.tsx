import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { RenderedPage } from "@/components/page-builder/RenderedPage";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { MapPin } from "lucide-react";

const HomeMobile = lazy(() =>
  import("@/components/mobile/HomeMobile").then((m) => ({ default: m.HomeMobile })),
);
const HomeDesktop = lazy(() =>
  import("@/components/desktop/HomeDesktop").then((m) => ({ default: m.HomeDesktop })),
);

export const Route = createFileRoute("/")({
  head: () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agatike.com";
    return {
      meta: [
        { title: "Agatike | Discover & Book Events, Activities, Venues & Experiences" },
        {
          name: "description",
          content:
            "Discover and book events, venues, activities, tours, travel, sports, wellness, and experiences on Agatike. Find something to do, somewhere to go, or an experience to enjoy.",
        },
        {
          property: "og:title",
          content: "Agatike | Discover & Book Events, Activities, Venues & Experiences",
        },
        {
          property: "og:description",
          content:
            "Discover and book events, venues, activities, tours, travel, sports, wellness, and experiences on Agatike. Find something to do, somewhere to go, or an experience to enjoy.",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Agatike",
            url: baseUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${baseUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "SiteNavigationElement",
                position: 1,
                name: "Sign In",
                url: `${baseUrl}/signin`,
              },
              {
                "@type": "SiteNavigationElement",
                position: 2,
                name: "Host on Agatike",
                url: `${baseUrl}/dashboard`,
              },
              {
                "@type": "SiteNavigationElement",
                position: 3,
                name: "Events",
                url: `${baseUrl}/events`,
              },
              {
                "@type": "SiteNavigationElement",
                position: 4,
                name: "About Us",
                url: `${baseUrl}/about`,
              },
              {
                "@type": "SiteNavigationElement",
                position: 5,
                name: "Pricing",
                url: `${baseUrl}/pricing`,
              },
            ],
          }),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { isLoggedIn } = useUserAuth();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Detect Subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
  }, []);

  if (!isClient) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (subdomainSlug) {
    return <RenderedPage slug={subdomainSlug} isPreview={false} />;
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

      {/* Map Bubble - Visible to logged-in users on desktop */}
      {isLoggedIn && !subdomainSlug && (
        <Link
          to="/map"
          className="fixed bottom-[96px] right-8 z-40 hidden md:flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95 border border-border"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="Open Map"
        >
          <MapPin className="h-6 w-6 text-white" />
        </Link>
      )}
    </>
  );
}
