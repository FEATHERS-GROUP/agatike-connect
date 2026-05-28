import { createFileRoute } from "@tanstack/react-router";
import { HomeMobile } from "@/components/mobile/HomeMobile";
import { HomeDesktop } from "@/components/desktop/HomeDesktop";

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
