import { Calendar, Clock, MapPin, Star } from "lucide-react";

export function EventBannerDesktop({
  cover,
  title,
  category,
  date,
  time,
  venue,
  city,
  avgRating,
}: {
  cover: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  avgRating: string | number;
}) {
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      <img src={cover} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 z-10">
        <span className="w-fit rounded-full bg-black/30 border border-white/20 text-white px-3 py-1 text-xs backdrop-blur font-semibold tracking-wider uppercase">
          {category}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-6xl text-white drop-shadow-md leading-tight">{title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/80 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" /> {date || "Today"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> {time || "All day"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> {venue ? `${venue}, ` : ""}
            {city}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-primary/20 px-2 py-0.5 rounded-full text-white">
            <Star className="h-4 w-4 fill-primary text-primary" /> {avgRating}
          </span>
        </div>
      </div>
    </section>
  );
}
