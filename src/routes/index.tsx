import { createFileRoute, useRouter } from "@tanstack/react-router";
import { HomeMobile } from "@/components/mobile/HomeMobile";
import { HomeDesktop } from "@/components/desktop/HomeDesktop";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect, useState } from "react";

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
  const [isMobileRedirecting, setIsMobileRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && window.innerWidth < 768) {
      setIsMobileRedirecting(true);
      router.navigate({ to: "/events" });
    }
  }, [isLoggedIn, router]);

  if (isMobileRedirecting) {
    return null; // Return null while redirecting to avoid flashing mobile home
  }

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
