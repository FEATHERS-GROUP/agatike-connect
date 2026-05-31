import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import {
  b as createRouter,
  a as createRootRouteWithContext,
  e as useRouter,
  L as Link,
  f as useRouterState,
  O as Outlet,
  H as HeadContent,
  S as Scripts,
  c as createFileRoute,
  l as lazyRouteComponent,
  u as useLocation,
} from "../_libs/tanstack__react-router.mjs";
import { G as notFound } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import {
  w as House,
  p as Compass,
  G as Map,
  A as Activity,
  ab as User,
} from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const appCss = "/assets/styles-B7FLtVOW.css";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function MobileNav() {
  const location = useLocation();
  const tabs = [
    { name: "Home", href: "/", icon: House },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Map", href: "/map", icon: Map },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Profile", href: "/profile", icon: User },
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className:
        "mx-auto flex h-16 max-w-md items-center justify-between rounded-full border border-border/40 bg-background/80 px-6 shadow-lg backdrop-blur-xl mb-4",
      children: tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: tab.href,
            className: cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground",
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {
                className: cn("h-6 w-6", isActive && "fill-primary/20 stroke-[2.5]"),
              }),
              isActive &&
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
                  className: "absolute -bottom-2 h-1 w-1 rounded-full bg-primary",
                }),
            ],
          },
          tab.name,
        );
      }),
    }),
  });
}
const AppContext = reactExports.createContext(void 0);
function AppProvider({ children }) {
  const [isOrganizerMode, setOrganizerMode] = reactExports.useState(false);
  const toggleOrganizerMode = () => setOrganizerMode((prev) => !prev);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppContext.Provider, {
    value: { isOrganizerMode, setOrganizerMode, toggleOrganizerMode },
    children,
  });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
          className: "text-7xl font-bold text-foreground",
          children: "404",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "mt-4 text-xl font-semibold text-foreground",
          children: "Page not found",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "The page you're looking for doesn't exist or has been moved.",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "mt-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            to: "/",
            className:
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            children: "Go home",
          }),
        }),
      ],
    }),
  });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
          className: "text-xl font-semibold tracking-tight text-foreground",
          children: "This page didn't load",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "Something went wrong on our end. You can try refreshing or head back home.",
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "mt-6 flex flex-wrap justify-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
              onClick: () => {
                router2.invalidate();
                reset();
              },
              className:
                "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Try again",
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
              href: "/",
              className:
                "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Go home",
            }),
          ],
        }),
      ],
    }),
  });
}
const Route$k = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Agatike App" },
      { name: "description", content: "Agatike Generated Project" },
      { name: "author", content: "Agatike" },
      { property: "og:title", content: "Agatike App" },
      { property: "og:description", content: "Agatike Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Agatike" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", {
    lang: "en",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("head", {
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("body", {
        children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})],
      }),
    ],
  });
}
function RootComponent() {
  const { queryClient } = Route$k.useRouteContext();
  const location = useRouterState({ select: (s) => s.location });
  const hideNav = location.pathname.match(/^\/(events|book|community|ticket)\/.+/);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppProvider, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, {
      client: queryClient,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: `min-h-screen md:pb-0 ${hideNav ? "" : "pb-24"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
        }),
        !hideNav &&
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
            className: "md:hidden",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {}),
          }),
      ],
    }),
  });
}
const $$splitComponentImporter$j = () => import("./workspaces-DPt1VM7y.mjs");
const Route$j = createFileRoute("/workspaces")({
  head: () => ({
    meta: [
      {
        title: "Workspaces — Agatike",
      },
      {
        name: "description",
        content: "Create a workspace for your venue, cinema, club or festival.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component"),
});
const $$splitComponentImporter$i = () => import("./wallet-CUSCQRsz.mjs");
const Route$i = createFileRoute("/wallet")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component"),
});
const $$splitComponentImporter$h = () => import("./signin-CzRUOMNJ.mjs");
const Route$h = createFileRoute("/signin")({
  head: () => ({
    meta: [
      {
        title: "Sign in — Agatike",
      },
      {
        name: "description",
        content: "Sign in to discover events, save tickets and follow organizers.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component"),
});
const $$splitComponentImporter$g = () => import("./scanner-C8TIOMG3.mjs");
const Route$g = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      {
        title: "Scanner — Agatike",
      },
      {
        name: "description",
        content: "Mobile scanner for event entrances. Fast, reliable, offline-ready.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component"),
});
const e1 = "/assets/event-1-Bz0AicTe.jpg";
const e2 = "/assets/event-2-BnVxE8AY.jpg";
const e3 = "/assets/event-3-BhV2Ceo-.jpg";
const e4 = "/assets/event-4-BIEV16bu.jpg";
const e5 = "/assets/event-5-lVARb03W.jpg";
const e6 = "/assets/event-6-BfhqK3_6.jpg";
const expHiking = "/assets/exp-hiking-yxIjor7c.jpg";
const expRunning = "/assets/exp-running-BNttbGcH.jpg";
const expSurf = "/assets/exp-surf-g-ACj4VW.jpg";
const movie1 = "/assets/movie-1-3iwo9eCD.jpg";
const movie2 = "/assets/movie-2-Do5ov7M7.jpg";
const events = [
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
    rating: 5,
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
];
const categories = [
  "Music",
  "Sports",
  "Cinema",
  "Conferences",
  "Nightlife",
  "Festivals",
  "Tourism",
  "Experiences",
];
const organizers = [
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
    followers: 45e3,
    twitterUrl: "https://twitter.com/baobabvc",
    instagramUrl: "https://instagram.com/baobabvc",
  },
  {
    id: "org-4",
    name: "Starboy Live",
    handle: "starboylive",
    avatar: e4,
    bio: "The official touring company for the biggest stadium concerts in West Africa.",
    followers: 15e4,
    twitterUrl: "https://twitter.com/starboylive",
    instagramUrl: "https://instagram.com/starboylive",
  },
  {
    id: "org-5",
    name: "Soko Market",
    handle: "sokomarket",
    avatar: e5,
    bio: "Celebrating local artisans, street food, and culture through vibrant pop-up markets.",
    followers: 22e3,
    twitterUrl: "https://twitter.com/sokomarket",
    instagramUrl: "https://instagram.com/sokomarket",
  },
  {
    id: "org-6",
    name: "BAL League",
    handle: "ballafrica",
    avatar: e6,
    bio: "The premier professional basketball league in Africa. Watch the finals live.",
    followers: 32e4,
    twitterUrl: "https://twitter.com/thebal",
    instagramUrl: "https://instagram.com/thebal",
  },
];
const stories = [
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
const movieStories = [
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
const experiences = [
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
    rating: 5,
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
const movies = [
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
const cinemas = [
  { id: "silverbird", name: "Silverbird Galleria", city: "Lagos, NG", screens: 8, image: movie1 },
  { id: "genesis", name: "Genesis Cinemas", city: "Accra, GH", screens: 6, image: movie2 },
  { id: "filmhouse", name: "Filmhouse IMAX", city: "Abuja, NG", screens: 10, image: movie1 },
  { id: "numetro", name: "Nu Metro V&A", city: "Cape Town, ZA", screens: 12, image: movie2 },
];
const feedPosts = events.map((ev, i) => ({
  id: `p-${i}`,
  user: ev.organizer,
  handle: ev.organizerHandle,
  image: ev.cover,
  avatar: ev.cover,
  // Reusing cover as avatar for convenience
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
const ticketTiers = [
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
const merch = [
  { id: "tee", name: "Tour Tee", price: 25, image: e4 },
  { id: "vip", name: "VIP Package", price: 180, image: e1 },
  { id: "parking", name: "Parking Pass", price: 15, image: e6 },
  { id: "drinks", name: "Drinks Bundle", price: 40, image: e2 },
];
const $$splitComponentImporter$f = () => import("./profile-C-Am6G22.mjs");
const Route$f = createFileRoute("/profile")({
  head: () => ({
    meta: [
      {
        title: "My Profile — Agatike",
      },
      {
        name: "description",
        content: "Your Agatike profile, tickets and event history.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component"),
});
const upcomingTickets = [
  {
    ...events[0],
    id: "t1",
    ticketCategory: "event",
    ticketType: "VIP",
    seat: "Section A · Row 3 · Seat 12",
    orderId: "AGT-1000",
  },
  {
    ...movies[0],
    id: "t2",
    ticketCategory: "movie",
    ticketType: "Standard",
    seat: "Row H · Seat 4",
    orderId: "AGT-1001",
  },
  {
    ...experiences[0],
    id: "t3",
    ticketCategory: "experience",
    ticketType: "Pass",
    seat: "General Admission",
    orderId: "AGT-1002",
  },
  {
    ...events[2],
    // "Africa Tech Summit"
    id: "t4",
    ticketCategory: "conference",
    ticketType: "Attendee",
    seat: "All Access",
    orderId: "AGT-1003",
  },
  {
    ...events[4],
    // Free Fest
    id: "t5",
    price: 0,
    ticketCategory: "free",
    ticketType: "Guest",
    seat: "RSVP",
    orderId: "AGT-1004",
  },
];
const $$splitComponentImporter$e = () => import("./organizers-DJ5zK2S8.mjs");
const Route$e = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      {
        title: "Organizers — Agatike",
      },
      {
        name: "description",
        content: "Discover the best organizers in Africa.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component"),
});
const $$splitComponentImporter$d = () => import("./movies-nU4YYJFO.mjs");
const Route$d = createFileRoute("/movies")({
  head: () => ({
    meta: [
      {
        title: "Movies — Agatike",
      },
      {
        name: "description",
        content: "Showtimes, reserved seats and IMAX from cinemas across Africa.",
      },
      {
        property: "og:title",
        content: "Movies on Agatike",
      },
      {
        property: "og:description",
        content: "Africa's cinemas, all in one app.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component"),
});
const $$splitComponentImporter$c = () => import("./map-CUQRWZB0.mjs");
const Route$c = createFileRoute("/map")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component"),
});
const $$splitComponentImporter$b = () => import("./feed-CAft5hLF.mjs");
const Route$b = createFileRoute("/feed")({
  head: () => ({
    meta: [
      {
        title: "Feed — Agatike",
      },
      {
        name: "description",
        content: "Live moments, reels and reviews from events across Africa.",
      },
      {
        property: "og:title",
        content: "Agatike Feed",
      },
      {
        property: "og:description",
        content: "The social heartbeat of African nightlife and culture.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
});
const $$splitComponentImporter$a = () => import("./explore-D9MGsVcX.mjs");
const Route$a = createFileRoute("/explore")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
});
const $$splitComponentImporter$9 = () => import("./experiences-DNKSXtnm.mjs");
const Route$9 = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      {
        title: "Experiences — Agatike",
      },
      {
        name: "description",
        content: "Join hikes, run clubs, surf camps and wellness retreats across Africa.",
      },
      {
        property: "og:title",
        content: "Experiences — Agatike",
      },
      {
        property: "og:description",
        content: "Hike, run, surf and explore with curated local hosts.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
});
const $$splitComponentImporter$8 = () => import("./dashboard-BzHpKTjA.mjs");
const Route$8 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Organizer Dashboard — Agatike",
      },
      {
        name: "description",
        content: "Sell tickets, run analytics, scan attendees and grow your events.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
});
const $$splitComponentImporter$7 = () => import("./create-event-Dobmv6_D.mjs");
const Route$7 = createFileRoute("/create-event")({
  head: () => ({
    meta: [
      {
        title: "Create event — Agatike",
      },
      {
        name: "description",
        content: "Publish your event in minutes: tickets, venue, merchandise and VIP.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
});
const $$splitComponentImporter$6 = () => import("./activity-CU1Va8cv.mjs");
const Route$6 = createFileRoute("/activity")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
});
const $$splitComponentImporter$5 = () => import("./index-DI68vwP9.mjs");
const Route$5 = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Agatike — Africa's premium social event platform",
      },
      {
        name: "description",
        content:
          "Discover music, nightlife, sports, festivals and experiences across Africa. Buy tickets, share moments, follow organizers.",
      },
      {
        property: "og:title",
        content: "Agatike — Africa's premium social event platform",
      },
      {
        property: "og:description",
        content: "Discover and live the moments that matter, across Africa.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
});
const $$splitComponentImporter$4 = () => import("./events.index-eVoQBpP9.mjs");
const Route$4 = createFileRoute("/events/")({
  head: () => ({
    meta: [
      {
        title: "All events — Agatike",
      },
      {
        name: "description",
        content: "Browse nightlife, music, sports, conferences and festivals across Africa.",
      },
      {
        property: "og:title",
        content: "All events — Agatike",
      },
      {
        property: "og:description",
        content: "Browse nightlife, music, sports, conferences and festivals across Africa.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
});
const $$splitComponentImporter$3 = () => import("./ticket._ticketId-C6ztthcS.mjs");
const Route$3 = createFileRoute("/ticket/$ticketId")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
});
const $$splitComponentImporter$2 = () => import("./events._eventId-BaR_Ny9L.mjs");
const Route$2 = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const ev =
      events.find((e) => e.id === params.eventId) ||
      experiences.find((x) => x.id === params.eventId) ||
      movies.find((m) => m.id === params.eventId);
    if (!ev) throw notFound();
    return {
      event: ev,
    };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.event;
    return {
      meta: loaderData
        ? [
            {
              title: `${e.title} — Agatike`,
            },
            {
              name: "description",
              content: e.description || e.synopsis,
            },
            {
              property: "og:title",
              content: e.title,
            },
            {
              property: "og:description",
              content: e.description || e.synopsis,
            },
            {
              property: "og:image",
              content: e.cover,
            },
          ]
        : [],
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
});
const $$splitComponentImporter$1 = () => import("./community._postId-vxixwoEF.mjs");
const Route$1 = createFileRoute("/community/$postId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
});
const $$splitComponentImporter = () => import("./book._eventId-7rnNt_M9.mjs");
const Route = createFileRoute("/book/$eventId")({
  head: () => ({
    meta: [
      {
        title: "Checkout — Agatike",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
const WorkspacesRoute = Route$j.update({
  id: "/workspaces",
  path: "/workspaces",
  getParentRoute: () => Route$k,
});
const WalletRoute = Route$i.update({
  id: "/wallet",
  path: "/wallet",
  getParentRoute: () => Route$k,
});
const SigninRoute = Route$h.update({
  id: "/signin",
  path: "/signin",
  getParentRoute: () => Route$k,
});
const ScannerRoute = Route$g.update({
  id: "/scanner",
  path: "/scanner",
  getParentRoute: () => Route$k,
});
const ProfileRoute = Route$f.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$k,
});
const OrganizersRoute = Route$e.update({
  id: "/organizers",
  path: "/organizers",
  getParentRoute: () => Route$k,
});
const MoviesRoute = Route$d.update({
  id: "/movies",
  path: "/movies",
  getParentRoute: () => Route$k,
});
const MapRoute = Route$c.update({
  id: "/map",
  path: "/map",
  getParentRoute: () => Route$k,
});
const FeedRoute = Route$b.update({
  id: "/feed",
  path: "/feed",
  getParentRoute: () => Route$k,
});
const ExploreRoute = Route$a.update({
  id: "/explore",
  path: "/explore",
  getParentRoute: () => Route$k,
});
const ExperiencesRoute = Route$9.update({
  id: "/experiences",
  path: "/experiences",
  getParentRoute: () => Route$k,
});
const DashboardRoute = Route$8.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$k,
});
const CreateEventRoute = Route$7.update({
  id: "/create-event",
  path: "/create-event",
  getParentRoute: () => Route$k,
});
const ActivityRoute = Route$6.update({
  id: "/activity",
  path: "/activity",
  getParentRoute: () => Route$k,
});
const IndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$k,
});
const EventsIndexRoute = Route$4.update({
  id: "/events/",
  path: "/events/",
  getParentRoute: () => Route$k,
});
const TicketTicketIdRoute = Route$3.update({
  id: "/ticket/$ticketId",
  path: "/ticket/$ticketId",
  getParentRoute: () => Route$k,
});
const EventsEventIdRoute = Route$2.update({
  id: "/events/$eventId",
  path: "/events/$eventId",
  getParentRoute: () => Route$k,
});
const CommunityPostIdRoute = Route$1.update({
  id: "/community/$postId",
  path: "/community/$postId",
  getParentRoute: () => Route$k,
});
const BookEventIdRoute = Route.update({
  id: "/book/$eventId",
  path: "/book/$eventId",
  getParentRoute: () => Route$k,
});
const rootRouteChildren = {
  IndexRoute,
  ActivityRoute,
  CreateEventRoute,
  DashboardRoute,
  ExperiencesRoute,
  ExploreRoute,
  FeedRoute,
  MapRoute,
  MoviesRoute,
  OrganizersRoute,
  ProfileRoute,
  ScannerRoute,
  SigninRoute,
  WalletRoute,
  WorkspacesRoute,
  BookEventIdRoute,
  CommunityPostIdRoute,
  EventsEventIdRoute,
  TicketTicketIdRoute,
  EventsIndexRoute,
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      getRouter,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
export {
  Route$3 as R,
  Route$2 as a,
  Route$1 as b,
  Route as c,
  categories as d,
  cinemas as e,
  cn as f,
  events as g,
  experiences as h,
  feedPosts as i,
  movieStories as j,
  movies as k,
  merch as m,
  organizers as o,
  router as r,
  stories as s,
  ticketTiers as t,
  upcomingTickets as u,
};
