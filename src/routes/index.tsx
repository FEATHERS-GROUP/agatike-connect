import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HomeMobile } from "@/components/mobile/HomeMobile";
import { HomeDesktop } from "@/components/desktop/HomeDesktop";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect } from "react";

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
  const { isLoggedIn, isLoading } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile && !isLoggedIn) {
        navigate({ to: "/signin", replace: true });
      }
    }
  }, [isLoggedIn, isLoading, navigate]);

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
