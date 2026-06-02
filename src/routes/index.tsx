import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HomeMobile } from "@/components/mobile/HomeMobile";
import { HomeDesktop } from "@/components/desktop/HomeDesktop";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agatike — Africa's premium social event platform" },
      {
        name: "description",
        content:
          "Discover music, nightlife, sports, festivals and experiences across Africa. Buy tickets, share moments, follow organizers.",
      },
      { property: "og:title", content: "Agatike — Africa's premium social event platform" },
      {
        property: "og:description",
        content: "Discover and live the moments that matter, across Africa.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { isLoggedIn, isLoading: authLoading } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (!authLoading && !isLoggedIn && isMobile) {
        navigate({ to: "/signin", replace: true });
      }
    }
  }, [authLoading, isLoggedIn, navigate]);
  return (
    <>
      <div className="md:hidden">
        <HomeMobile />
      </div>
      <div className="hidden md:block">
        <HomeDesktop />
      </div>
    </>
  );
}
