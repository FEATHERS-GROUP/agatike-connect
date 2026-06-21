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
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
        <span className="w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
          {category}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {date || "Today"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" /> {time || "All day"}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {venue ? `${venue}, ` : ""}
            {city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" /> {avgRating}
          </span>
        </div>
      </div>
    </section>
  );
}
