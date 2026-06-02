import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { BookingMobile } from "@/components/mobile/BookingMobile";
import { BookingDesktop } from "@/components/desktop/BookingDesktop";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect } from "react";

export const Route = createFileRoute("/book/$eventId")({
  head: () => ({
    meta: [{ title: "Checkout — Agatike" }],
  }),
  component: BookingRoute,
});

function BookingRoute() {
  const { isLoggedIn, isLoading } = useUserAuth();
  const navigate = useNavigate();
  const { eventId } = useParams({ strict: false });

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop && !isLoggedIn) {
      navigate({ to: "/signin", replace: true });
    }
  }, [isLoading, isLoggedIn, navigate]);

  return (
    <>
      <div className="md:hidden">
        <BookingMobile eventId={eventId} />
      </div>
      <div className="hidden md:block">
        <BookingDesktop eventId={eventId} />
      </div>
    </>
  );
}
