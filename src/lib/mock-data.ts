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
  lat?: number;
  lng?: number;
  hasStory?: boolean;
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
    lat: -1.9441,
    lng: 30.0619,
    hasStory: true,
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
    lat: -1.95,
    lng: 30.058,
    hasStory: false,
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
    description: "Three days of founders, investors, and operators shaping Africa's tech future.",
    lat: -1.954,
    lng: 30.093,
    hasStory: true,
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
    lat: -1.932,
    lng: 30.051,
    hasStory: true,
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
    lat: -1.948,
    lng: 30.075,
    hasStory: false,
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
    lat: -1.96,
    lng: 30.11,
    hasStory: true,
  },
  {
    id: "nba-africa-game",
    title: "NBA Africa Game 2026",
    organizer: "NBA Africa",
    organizerHandle: "nbaafrica",
    city: "Kigali, RW",
    venue: "BK Arena",
    date: "Sat, Sep 12",
    time: "18:00",
    category: "Sports",
    price: 85,
    cover: e6,
    attendees: 10000,
    rating: 4.9,
    description:
      "Team World takes on Team Africa in the highly anticipated annual NBA exhibition game.",
    lat: -1.954,
    lng: 30.114,
    hasStory: true,
  },
  {
    id: "fifa-world-cup-qualifier",
    title: "FIFA World Cup Qualifier: NGA vs RSA",
    organizer: "FIFA",
    organizerHandle: "fifa",
    city: "Uyo, NG",
    venue: "Godswill Akpabio International Stadium",
    date: "Thu, Oct 15",
    time: "16:00",
    category: "Sports",
    price: 45,
    cover: e6,
    attendees: 30000,
    rating: 4.9,
    description: "Crucial World Cup Qualifying match between the Super Eagles and Bafana Bafana.",
    lat: 5.033,
    lng: 7.926,
    hasStory: true,
  },
  {
    id: "dakar-surf-camp",
    title: "Dakar Kitesurf Experience",
    organizer: "North Coast Wind",
    organizerHandle: "northcoastwind",
    city: "Dakar, SN",
    venue: "Ngaparou Beach",
    date: "Fri, Nov 06",
    time: "10:00",
    category: "Experiences",
    price: 95,
    cover: expSurf,
    attendees: 120,
    rating: 4.9,
    description: "Full-day kitesurf session with gear, instructor and lunch at the lagoon.",
    lat: 14.478,
    lng: -17.065,
    hasStory: true,
  },
  {
    id: "mount-meru-hike",
    title: "Mount Meru Sunrise Hike",
    organizer: "Trail Tribe",
    organizerHandle: "trailtribe",
    city: "Arusha, TZ",
    venue: "Mount Meru Base Camp",
    date: "Sat, Dec 12",
    time: "04:00",
    category: "Experiences",
    price: 45,
    cover: expHiking,
    attendees: 45,
    rating: 5.0,
    description: "Pre-dawn hike to catch the sunrise over Mount Meru. Guides included.",
    lat: -3.242,
    lng: 36.758,
    hasStory: false,
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

export type Organizer = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  twitterUrl: string;
  instagramUrl: string;
};

export const organizers: Organizer[] = [
  {
    id: "org-1",
    name: "Nala Sound",
    handle: "nalasound",
    avatar: e1,
    bio: "Curating the finest Afrobeats and amapiano experiences across East Africa.",
    followers: 12400,
    twitterUrl: "https://twitter.com/nalasound",
    instagramUrl: "https://instagram.com/nalasound",
  },
  {
    id: "org-2",
    name: "Skyline Collective",
    handle: "skylineco",
    avatar: e2,
    bio: "Pioneering the underground house and techno scene in Kigali and beyond.",
    followers: 8200,
    twitterUrl: "https://twitter.com/skylineco",
    instagramUrl: "https://instagram.com/skylineco",
  },
  {
    id: "org-3",
    name: "Baobab Ventures",
    handle: "baobabvc",
    avatar: e3,
    bio: "Connecting founders, investors, and builders shaping the future of African tech.",
    followers: 45000,
    twitterUrl: "https://twitter.com/baobabvc",
    instagramUrl: "https://instagram.com/baobabvc",
  },
  {
    id: "org-4",
    name: "Starboy Live",
    handle: "starboylive",
    avatar: e4,
    bio: "The official touring company for the biggest stadium concerts in West Africa.",
    followers: 150000,
    twitterUrl: "https://twitter.com/starboylive",
    instagramUrl: "https://instagram.com/starboylive",
  },
  {
    id: "org-5",
    name: "Soko Market",
    handle: "sokomarket",
    avatar: e5,
    bio: "Celebrating local artisans, street food, and culture through vibrant pop-up markets.",
    followers: 22000,
    twitterUrl: "https://twitter.com/sokomarket",
    instagramUrl: "https://instagram.com/sokomarket",
  },
  {
    id: "org-6",
    name: "BAL League",
    handle: "ballafrica",
    avatar: e6,
    bio: "The premier professional basketball league in Africa. Watch the finals live.",
    followers: 320000,
    twitterUrl: "https://twitter.com/thebal",
    instagramUrl: "https://instagram.com/thebal",
  },
];

export const stories = [
  {
    id: "1",
    name: "Nala Sound",
    avatar: e1,
    items: [
      { id: "1-1", image: e1 },
      { id: "1-2", image: e2 },
      { id: "1-3", image: e3 },
    ],
  },
  {
    id: "2",
    name: "Skyline",
    avatar: e2,
    items: [
      { id: "2-1", image: e2 },
      { id: "2-2", image: e3 },
    ],
  },
  { id: "3", name: "Baobab", avatar: e3, items: [{ id: "3-1", image: e3 }] },
  {
    id: "4",
    name: "Starboy",
    avatar: e4,
    items: [
      { id: "4-1", image: e4 },
      { id: "4-2", image: e5 },
    ],
  },
  { id: "5", name: "Soko", avatar: e5, items: [{ id: "5-1", image: e5 }] },
  { id: "6", name: "BAL", avatar: e6, items: [{ id: "6-1", image: e6 }] },
  { id: "7", name: "Afrochella", avatar: e1, items: [{ id: "7-1", image: e1 }] },
  { id: "8", name: "Lagos Live", avatar: e2, items: [{ id: "8-1", image: e2 }] },
];

export const movieStories = [
  {
    id: "m1",
    name: "Silverbird",
    avatar: movie1,
    items: [
      { id: "m1-1", image: movie1 },
      { id: "m1-2", image: movie2 },
    ],
  },
  { id: "m2", name: "Genesis Cinemas", avatar: movie2, items: [{ id: "m2-1", image: movie2 }] },
  { id: "m3", name: "Filmhouse", avatar: movie1, items: [{ id: "m3-1", image: movie1 }] },
  { id: "m4", name: "Ster-Kinekor", avatar: movie2, items: [{ id: "m4-1", image: movie2 }] },
  { id: "m5", name: "Prestige IMAX", avatar: movie1, items: [{ id: "m5-1", image: movie1 }] },
  { id: "m6", name: "Nu Metro", avatar: movie2, items: [{ id: "m6-1", image: movie2 }] },
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
    description:
      "Pre-dawn hike to catch the sunrise over Mount Meru. Guides, breakfast and shuttle included.",
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
    synopsis:
      "A young accountant uncovers a conspiracy at the heart of Africa's biggest banking dynasty.",
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
  avatar: ev.cover, // Reusing cover as avatar for convenience
  caption:
    i % 2 === 0
      ? `Last night was unreal at ${ev.title} — tag yourself in the moments below.`
      : `Tickets dropping for ${ev.title}. Don't sleep on this one.`,
  likes: 1200 + i * 317,
  comments: 48 + i * 11,
  eventId: ev.id,
  eventTitle: ev.title,
  commentsList: [
    {
      id: "c1",
      handle: "angryswan",
      text: "Can't wait for this one! 🔥",
      avatar: "https://i.pravatar.cc/100?img=5",
      time: "2h",
    },
    {
      id: "c2",
      handle: "kigali_vibes",
      text: "Take my money! 💸",
      avatar: "https://i.pravatar.cc/100?img=6",
      time: "4h",
    },
    {
      id: "c3",
      handle: "party_animal",
      text: "Who's going? Let's link up!",
      avatar: "https://i.pravatar.cc/100?img=7",
      time: "5h",
    },
  ],
}));

export const ticketTiers = [
  {
    id: "ga",
    name: "General Admission",
    price: 35,
    perks: ["Entry", "Welcome drink"],
    remaining: 142,
  },
  {
    id: "vip",
    name: "VIP Lounge",
    price: 95,
    perks: ["Priority entry", "VIP lounge", "2 premium drinks"],
    remaining: 24,
  },
  {
    id: "table",
    name: "Bottle Table (x6)",
    price: 480,
    perks: ["Reserved table", "Bottle service", "Skip the line"],
    remaining: 3,
  },
];

export const merch = [
  { id: "tee", name: "Tour Tee", price: 25, image: e4 },
  { id: "vip", name: "VIP Package", price: 180, image: e1 },
  { id: "parking", name: "Parking Pass", price: 15, image: e6 },
  { id: "drinks", name: "Drinks Bundle", price: 40, image: e2 },
];

export type TicketProject = {
  id: string;
  name: string;
  eventId?: string;
  template: "concert" | "movie" | "experience" | "conference" | "entrance" | string;
  palette: { name: string; from: string; to: string } | any;
  font: { name: string; css: string } | any;
  tier?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  time?: string;
  seat?: string;
  price?: string;
  currency?: string;
  cover?: string;
  coverImage?: string;
  logoText?: string;
  logoImage?: string;
  logoScale?: number | string;
  logoColorMode?: "original" | "black" | "white" | string;
  logoOpacity?: number | string;
  design_overrides?: any;
  updatedAt?: string;
};

export const ticketProjects: TicketProject[] = [
  {
    id: "proj-1",
    name: "Summer Afrobeats VIP",
    eventId: "afrobeats-night-lagos",
    template: "concert",
    palette: { name: "Sunset", from: "#f97316", to: "#db2777" },
    font: { name: "Modern", css: "'Inter', sans-serif" },
    tier: "VIP",
    title: "Afrobeats Night Live",
    subtitle: "Eko Convention Centre · Lagos",
    date: "Sat, 14 Sep 2026",
    time: "21:00",
    seat: "Sec A · Row 12 · Seat 36",
    price: "85",
    currency: "₦",
    cover: e1,
    logoText: "AGATIKE",
    updatedAt: "2026-05-28T14:30:00Z",
  },
];

export type RentableVenue = {
  id: string;
  name: string;
  type:
    | "Stadium"
    | "Arena"
    | "Conference Room"
    | "Wedding Garden"
    | "Theater"
    | "Club"
    | "Basketball Court"
    | "Football Pitch"
    | "Gaming Lounge";
  city: string;
  capacity: number;
  pricePerDay: number;
  currency: string;
  cover: string;
  rating: number;
  amenities: string[];
  status: "Active" | "Draft" | "Maintenance";
  pendingRequests: number;
  activeRentals: number;
  rentalType?: "Per Day" | "Per Hour" | "Both";
  pricePerHour?: number;
};

export const rentableVenues: RentableVenue[] = [
  {
    id: "bk-arena",
    name: "BK Arena",
    type: "Arena",
    city: "Kigali, RW",
    capacity: 10000,
    pricePerDay: 5000,
    currency: "$",
    cover: e6,
    rating: 4.9,
    amenities: ["VIP Lounges", "Jumbotron", "Locker Rooms", "Parking"],
    status: "Active",
    pendingRequests: 3,
    activeRentals: 1,
    rentalType: "Both",
    pricePerHour: 500,
  },
  {
    id: "eko-hotel",
    name: "Eko Convention Centre",
    type: "Conference Room",
    city: "Lagos, NG",
    capacity: 6000,
    pricePerDay: 8500,
    currency: "$",
    cover: e1,
    rating: 4.8,
    amenities: ["A/C", "Audio Setup", "Catering Kitchen", "Valet"],
    status: "Active",
    pendingRequests: 5,
    activeRentals: 2,
  },
  {
    id: "botanical-gardens",
    name: "Aburi Botanical Gardens",
    type: "Wedding Garden",
    city: "Accra, GH",
    capacity: 500,
    pricePerDay: 1200,
    currency: "$",
    cover: expHiking,
    rating: 4.7,
    amenities: ["Gazebo", "Outdoor Lighting", "Restrooms", "Scenic Views"],
    status: "Draft",
    pendingRequests: 0,
    activeRentals: 0,
  },
  {
    id: "national-stadium",
    name: "Godswill Akpabio Stadium",
    type: "Stadium",
    city: "Uyo, NG",
    capacity: 30000,
    pricePerDay: 12000,
    currency: "$",
    cover: e6,
    rating: 4.8,
    amenities: ["Floodlights", "Locker Rooms", "Media Center", "VIP Boxes"],
    status: "Maintenance",
    pendingRequests: 1,
    activeRentals: 0,
  },
  {
    id: "hoops-court",
    name: "Downtown Hoops Center",
    type: "Basketball Court",
    city: "Nairobi, KE",
    capacity: 200,
    pricePerDay: 400,
    currency: "$",
    cover: expHiking, // placeholder
    rating: 4.6,
    amenities: ["Hardwood Floor", "Scoreboard", "Locker Rooms", "Bleachers"],
    status: "Active",
    pendingRequests: 2,
    activeRentals: 1,
    rentalType: "Per Hour",
    pricePerHour: 50,
  },
  {
    id: "city-pitch",
    name: "City AstroTurf Pitch",
    type: "Football Pitch",
    city: "Johannesburg, ZA",
    capacity: 50,
    pricePerDay: 150,
    currency: "$",
    cover: e6, // placeholder
    rating: 4.8,
    amenities: ["Floodlights", "Goals", "Bibs provided", "Changing Rooms"],
    status: "Active",
    pendingRequests: 4,
    activeRentals: 3,
  },
  {
    id: "cyber-lounge",
    name: "Nexus Gaming Lounge",
    type: "Gaming Lounge",
    city: "Cairo, EG",
    capacity: 100,
    pricePerDay: 800,
    currency: "$",
    cover: e1, // placeholder
    rating: 4.9,
    amenities: ["High-speed WiFi", "PC Setup", "Console Booths", "Energy Drinks Bar"],
    status: "Draft",
    pendingRequests: 0,
    activeRentals: 0,
  },
];

export type VenueBooking = {
  id: string;
  venueId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  amount: number;
  paymentStatus: "Paid" | "Unpaid";
  isAllDay?: boolean;
};

export const venueBookings: VenueBooking[] = [
  {
    id: "vb-1",
    venueId: "bk-arena",
    customerName: "Kigali Sports Dept",
    customerEmail: "events@kigalisports.gov.rw",
    customerPhone: "+250 788 123 456",
    date: "2026-05-30",
    timeStart: "08:00",
    timeEnd: "18:00",
    status: "Confirmed",
    amount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "vb-2",
    venueId: "bk-arena",
    customerName: "Tech Africa Summit",
    customerEmail: "hello@techafrica.org",
    customerPhone: "+250 788 987 654",
    date: "2026-06-05",
    timeStart: "09:00",
    timeEnd: "20:00",
    status: "Pending",
    amount: 10000,
    paymentStatus: "Unpaid",
  },
  {
    id: "vb-3",
    venueId: "eko-hotel",
    customerName: "Lagos Fashion Week",
    customerEmail: "info@lagosfashion.ng",
    customerPhone: "+234 803 111 2222",
    date: "2026-05-28",
    timeStart: "10:00",
    timeEnd: "22:00",
    status: "Confirmed",
    amount: 8500,
    paymentStatus: "Paid",
  },
  {
    id: "vb-4",
    venueId: "hoops-court",
    customerName: "Kigali Titans Practice",
    customerEmail: "coach@titans.rw",
    customerPhone: "+250 788 000 000",
    date: "2026-05-29",
    timeStart: "14:00",
    timeEnd: "16:00",
    status: "Confirmed",
    amount: 100,
    paymentStatus: "Paid",
    isAllDay: false,
  },
  {
    id: "vb-5",
    venueId: "bk-arena",
    customerName: "Global Esports Finals",
    customerEmail: "organizer@esports.com",
    customerPhone: "+1 555 123 4567",
    date: "2026-05-31",
    timeStart: "00:00",
    timeEnd: "23:59",
    status: "Pending",
    amount: 5000,
    paymentStatus: "Unpaid",
    isAllDay: true,
  },
  {
    id: "vb-6",
    venueId: "bk-arena",
    customerName: "Rwandan Tech Hub",
    customerEmail: "contact@techhub.rw",
    customerPhone: "+250 788 111 222",
    date: "2026-05-12",
    timeStart: "09:00",
    timeEnd: "17:00",
    status: "Confirmed",
    amount: 4000,
    paymentStatus: "Paid",
    isAllDay: false,
  },
  {
    id: "vb-7",
    venueId: "bk-arena",
    customerName: "Symphony Orchestra",
    customerEmail: "music@symphony.com",
    customerPhone: "+250 788 333 444",
    date: "2026-05-18",
    timeStart: "18:00",
    timeEnd: "22:00",
    status: "Confirmed",
    amount: 3000,
    paymentStatus: "Paid",
    isAllDay: false,
  },
  {
    id: "vb-8",
    venueId: "bk-arena",
    customerName: "National Basketball League",
    customerEmail: "info@nbl.rw",
    customerPhone: "+250 788 555 666",
    date: "2026-05-20",
    timeStart: "16:00",
    timeEnd: "21:00",
    status: "Confirmed",
    amount: 2500,
    paymentStatus: "Paid",
    isAllDay: false,
  },
  {
    id: "vb-9",
    venueId: "bk-arena",
    customerName: "University Graduation",
    customerEmail: "admin@university.edu.rw",
    customerPhone: "+250 788 777 888",
    date: "2026-05-22",
    timeStart: "08:00",
    timeEnd: "14:00",
    status: "Pending",
    amount: 4500,
    paymentStatus: "Unpaid",
    isAllDay: false,
  },
  {
    id: "vb-10",
    venueId: "bk-arena",
    customerName: "Standup Comedy Night",
    customerEmail: "laughs@comedy.com",
    customerPhone: "+250 788 999 000",
    date: "2026-05-25",
    timeStart: "19:00",
    timeEnd: "23:00",
    status: "Confirmed",
    amount: 3500,
    paymentStatus: "Paid",
    isAllDay: false,
  },
  {
    id: "vb-11",
    venueId: "bk-arena",
    customerName: "Youth Conference",
    customerEmail: "youth@conference.org",
    customerPhone: "+250 788 121 212",
    date: "2026-05-05",
    timeStart: "00:00",
    timeEnd: "23:59",
    status: "Confirmed",
    amount: 5000,
    paymentStatus: "Paid",
    isAllDay: true,
  },
  {
    id: "vb-12",
    venueId: "bk-arena",
    customerName: "Trade Fair Setup",
    customerEmail: "setup@tradefair.com",
    customerPhone: "+250 788 343 434",
    date: "2026-05-08",
    timeStart: "07:00",
    timeEnd: "19:00",
    status: "Pending",
    amount: 2000,
    paymentStatus: "Unpaid",
    isAllDay: false,
  },
];
