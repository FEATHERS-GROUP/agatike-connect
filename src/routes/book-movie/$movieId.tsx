import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect } from "react";
import { MovieBookingDesktop } from "@/components/desktop/MovieBookingDesktop";
import { MovieBookingMobile } from "@/components/mobile/MovieBookingMobile";

export const Route = createFileRoute("/book-movie/$movieId")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: search.date as string | undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Movie Checkout — Agatike" }],
  }),
  component: MovieBookingRoute,
});

function MovieBookingRoute() {
  const { isLoggedIn, isLoading } = useUserAuth();
  const navigate = useNavigate();
  const { movieId } = Route.useParams();

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
        <MovieBookingMobile movieId={movieId} />
      </div>
      <div className="hidden md:block">
        <MovieBookingDesktop movieId={movieId} />
      </div>
    </>
  );
}
