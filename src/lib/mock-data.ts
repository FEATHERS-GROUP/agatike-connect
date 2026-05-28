import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import e4 from "@/assets/event-4.jpg";
import e5 from "@/assets/event-5.jpg";
import e6 from "@/assets/event-6.jpg";
import expHiking from "@/assets/exp-hiking.jpg";
import expRunning from "@/assets/exp-running.jpg";
import expSurf from "@/assets/exp-surf.jpg";
import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";

export const eventImages = [e1, e2, e3, e4, e5, e6];

export type Event = {
  id: string;
  title: string;
  organizer: string;
  organizerHandle: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  currency?: string;
  price: number;
  cover: string;
  attendees: number;
  rating: number;
  description: string;
};

export const events: Event[] = [
  {
    id: "afrobeats-night-lagos",
    title: "Afrobeats Night Live",
    organizer: "Nala Sound",
    organizerHandle: "nalasound",
    city: "Lagos, NG",
    venue: "Eko Convention Centre",
    date: "Sat, Jun 14",
    time: "21:00",
    category: "Nightlife",
    currency: "₦",
    price: 35,
    cover: e1,
    attendees: 1284,
    rating: 4.9,
    description:
      "An electric night of Afrobeats with top DJs from across the continent. Rooftop bars, surprise live sets, and the best crowd in the city.",
  },
  {
    id: "sunset-rooftop-nairobi",
    title: "Sunset Rooftop Sessions",
    organizer: "Skyline Collective",
    organizerHandle: "skylineco",
    city: "Nairobi, KE",
    venue: "The Alchemist Rooftop",
    date: "Fri, Jun 20",
    time: "17:30",
    category: "Experiences",
    price: 22,
    cover: e2,
    attendees: 540,
    rating: 4.8,
    description:
      "Golden hour cocktails, live house, and panoramic views over Nairobi. Limited tickets.",
  },
  {
    id: "africa-tech-summit",
    title: "Africa Tech Summit 2026",
    organizer: "Baobab Ventures",
    organizerHandle: "baobabvc",
    city: "Kigali, RW",
    venue: "Kigali Convention Centre",
    date: "Wed, Jul 02",
    time: "09:00",
    category: "Conferences",
    price: 120,
    cover: e3,
    attendees: 3200,
    rating: 4.7,
    description:
      "Three days of founders, investors, and operators shaping Africa's tech future.",
  },
  {
    id: "wizkid-arena-tour",
    title: "Wave Arena Tour",
    organizer: "Starboy Live",
    organizerHandle: "starboylive",
    city: "Accra, GH",
    venue: "Accra Sports Stadium",
    date: "Sat, Jul 12",
    time: "20:00",
    category: "Music",
    price: 65,
    cover: e4,
    attendees: 18400,
    rating: 5.0,
    description: "Headline arena show with a full live band and special guests.",
  },
  {
    id: "afro-food-festival",
    title: "Afro Food & Culture Fest",
    organizer: "Soko Market",
    organizerHandle: "sokomarket",
    city: "Dakar, SN",
    venue: "Place du Souvenir",
    date: "Sun, Jul 20",
    time: "12:00",
    category: "Festivals",
    price: 12,
    cover: e5,
    attendees: 4100,
    rating: 4.9,
    description: "Street food, craft makers, and live drumming across two open-air stages.",
  },
  {
    id: "abj-basketball-finals",
    title: "ABJ Basketball Finals",
    organizer: "BAL League",
    organizerHandle: "ballafrica",
    city: "Cairo, EG",
    venue: "Cairo Indoor Stadium",
    date: "Sat, Aug 02",
    time: "19:00",
    category: "Sports",
    price: 28,
    cover: e6,
    attendees: 9800,
    rating: 4.8,
    description: "The continent's biggest pro basketball finals — championship night.",
  },
];

export const categories = [
  "Music",
  "Sports",
  "Cinema",
  "Conferences",
  "Nightlife",
  "Festivals",
  "Tourism",
  "Experiences",
];

export const stories = [
  { id: "1", name: "Nala Sound", cover: e1 },
  { id: "2", name: "Skyline", cover: e2 },
  { id: "3", name: "Baobab", cover: e3 },
  { id: "4", name: "Starboy", cover: e4 },
  { id: "5", name: "Soko", cover: e5 },
  { id: "6", name: "BAL", cover: e6 },
  { id: "7", name: "Afrochella", cover: e1 },
  { id: "8", name: "Lagos Live", cover: e2 },
];

export const movieStories = [
  { id: "m1", name: "Silverbird", cover: movie1 },
  { id: "m2", name: "Genesis Cinemas", cover: movie2 },
  { id: "m3", name: "Filmhouse", cover: movie1 },
  { id: "m4", name: "Ster-Kinekor", cover: movie2 },
  { id: "m5", name: "Prestige IMAX", cover: movie1 },
  { id: "m6", name: "Nu Metro", cover: movie2 },
];

export type Experience = {
  id: string;
  title: string;
  host: string;
  city: string;
  category: "Hiking" | "Running" | "Surf" | "Wellness" | "Food";
  duration: string;
  date: string;
  currency?: string;
  price: number;
  cover: string;
  rating: number;
  spots: number;
  description: string;
};

export const experiences: Experience[] = [
  {
    id: "mount-meru-sunrise",
    title: "Mount Meru Sunrise Hike",
    host: "Trail Tribe",
    city: "Arusha, TZ",
    category: "Hiking",
    duration: "6h",
    date: "Every Sat",
    currency: "KSh",
    price: 45,
    cover: expHiking,
    rating: 4.9,
    spots: 12,
    description: "Pre-dawn hike to catch the sunrise over Mount Meru. Guides, breakfast and shuttle included.",
  },
  {
    id: "lagos-run-club",
    title: "Lagos Run Club — Sunday Long Run",
    host: "Run LDN-LOS",
    city: "Lagos, NG",
    category: "Running",
    duration: "1.5h",
    date: "Every Sun",
    price: 0,
    cover: expRunning,
    rating: 4.8,
    spots: 80,
    description: "Weekly 10K social run along Lekki. All paces welcome — pacers up to 7:30/km.",
  },
  {
    id: "dakar-kite-camp",
    title: "Dakar Kitesurf Day Camp",
    host: "North Coast Wind",
    city: "Dakar, SN",
    category: "Surf",
    duration: "1 day",
    date: "Fri–Sun",
    price: 95,
    cover: expSurf,
    rating: 4.9,
    spots: 8,
    description: "Full-day kitesurf session with gear, instructor and lunch at the lagoon.",
  },
  {
    id: "kilimanjaro-trek",
    title: "Kilimanjaro 7-Day Trek",
    host: "Summit Co.",
    city: "Moshi, TZ",
    category: "Hiking",
    duration: "7 days",
    date: "Aug 10",
    price: 1850,
    cover: expHiking,
    rating: 5.0,
    spots: 14,
    description: "Machame route, certified guides, all permits, gear and camp meals included.",
  },
  {
    id: "nairobi-trail-runners",
    title: "Nairobi Trail Runners",
    host: "Karura Crew",
    city: "Nairobi, KE",
    category: "Running",
    duration: "2h",
    date: "Every Wed",
    price: 0,
    cover: expRunning,
    rating: 4.9,
    spots: 60,
    description: "Mid-week trail session in Karura forest. Bring trail shoes.",
  },
  {
    id: "zanzibar-wellness-retreat",
    title: "Zanzibar Sunrise Yoga",
    host: "Indian Ocean Wellness",
    city: "Zanzibar, TZ",
    category: "Wellness",
    duration: "1.5h",
    date: "Daily",
    currency: "€",
    price: 18,
    cover: expSurf,
    rating: 4.7,
    spots: 20,
    description: "Beachfront vinyasa flow at sunrise, with fresh juice after class.",
  },
];

export type Movie = {
  id: string;
  title: string;
  genre: string;
  rating: string;
  duration: string;
  cinema: string;
  city: string;
  cover: string;
  showtimes: string[];
  currency?: string;
  price: number;
  synopsis: string;
};

export const movies: Movie[] = [
  {
    id: "the-gilded-age",
    title: "The Gilded Age",
    genre: "Drama · Crime",
    rating: "PG-13",
    duration: "2h 14m",
    cinema: "Silverbird Galleria",
    city: "Lagos, NG",
    cover: movie2,
    showtimes: ["12:30", "15:45", "18:30", "21:15"],
    currency: "Frws",
    price: 8,
    synopsis: "A young accountant uncovers a conspiracy at the heart of Africa's biggest banking dynasty.",
  },
  {
    id: "after-the-rains",
    title: "After the Rains",
    genre: "Romance · Drama",
    rating: "PG",
    duration: "1h 48m",
    cinema: "Genesis Cinemas",
    city: "Accra, GH",
    cover: movie1,
    showtimes: ["14:00", "17:00", "20:00"],
    price: 7,
    synopsis: "Two strangers, one monsoon, and a city that won't let them say goodbye.",
  },
  {
    id: "lions-of-the-sahel",
    title: "Lions of the Sahel",
    genre: "Action · Thriller",
    rating: "R",
    duration: "2h 02m",
    cinema: "Filmhouse IMAX",
    city: "Abuja, NG",
    cover: movie2,
    showtimes: ["11:00", "14:30", "18:00", "21:45"],
    price: 10,
    synopsis: "An elite rangers unit takes on a poaching syndicate across three borders.",
  },
  {
    id: "summer-on-eko",
    title: "Summer on Eko",
    genre: "Comedy",
    rating: "PG-13",
    duration: "1h 36m",
    cinema: "Nu Metro V&A",
    city: "Cape Town, ZA",
    cover: movie1,
    showtimes: ["13:15", "16:00", "19:30"],
    price: 7,
    synopsis: "Three cousins, one rented beach house, and the worst-best summer of their lives.",
  },
];

export const cinemas = [
  { id: "silverbird", name: "Silverbird Galleria", city: "Lagos, NG", screens: 8, image: movie1 },
  { id: "genesis", name: "Genesis Cinemas", city: "Accra, GH", screens: 6, image: movie2 },
  { id: "filmhouse", name: "Filmhouse IMAX", city: "Abuja, NG", screens: 10, image: movie1 },
  { id: "numetro", name: "Nu Metro V&A", city: "Cape Town, ZA", screens: 12, image: movie2 },
];

export const feedPosts = events.map((ev, i) => ({
  id: `p-${i}`,
  user: ev.organizer,
  handle: ev.organizerHandle,
  image: ev.cover,
  caption:
    i % 2 === 0
      ? `Last night was unreal at ${ev.title} — tag yourself in the moments below.`
      : `Tickets dropping for ${ev.title}. Don't sleep on this one.`,
  likes: 1200 + i * 317,
  comments: 48 + i * 11,
  eventId: ev.id,
  eventTitle: ev.title,
}));

export const ticketTiers = [
  { id: "ga", name: "General Admission", price: 35, perks: ["Entry", "Welcome drink"], remaining: 142 },
  { id: "vip", name: "VIP Lounge", price: 95, perks: ["Priority entry", "VIP lounge", "2 premium drinks"], remaining: 24 },
  { id: "table", name: "Bottle Table (x6)", price: 480, perks: ["Reserved table", "Bottle service", "Skip the line"], remaining: 3 },
];

export const merch = [
  { id: "tee", name: "Tour Tee", price: 25, image: e4 },
  { id: "vip", name: "VIP Package", price: 180, image: e1 },
  { id: "parking", name: "Parking Pass", price: 15, image: e6 },
  { id: "drinks", name: "Drinks Bundle", price: 40, image: e2 },
];