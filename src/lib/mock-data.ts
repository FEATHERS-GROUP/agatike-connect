import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import e4 from "@/assets/event-4.jpg";
import e5 from "@/assets/event-5.jpg";
import e6 from "@/assets/event-6.jpg";

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