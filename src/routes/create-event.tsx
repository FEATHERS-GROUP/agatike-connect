import { createFileRoute } from "@tanstack/react-router";
import { CreateEventMobile } from "@/components/mobile/CreateEventMobile";
import { CreateEventDesktop } from "@/components/desktop/CreateEventDesktop";

export const Route = createFileRoute("/create-event")({
  head: () => ({
    meta: [
      { title: "Create event — Agatike" },
      { name: "description", content: "Publish your event in minutes: tickets, venue, merchandise and VIP." },
    ],
  }),
  component: CreateEventRoute,
});

function CreateEventRoute() {
  return (
    <>
      <div className="md:hidden">
        <CreateEventMobile />
      </div>
      <div className="hidden md:block">
        <CreateEventDesktop />
      </div>
    </>
  );
}