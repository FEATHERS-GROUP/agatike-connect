import { Music, Trophy, Film, Mic } from "lucide-react";

export const events: any[] = [];
export const organizers: any[] = [];
export const movies: any[] = [];
export const experiences: any[] = [];

export const mockSubscriptions = [
  {
    id: "sub_1",
    title: "Premium Gym Access",
    venue: "Fit & Flex Center",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-14",
    price: "$50.00",
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_2",
    title: "Gold Swimming Session",
    venue: "Aqua Oasis",
    type: "Monthly",
    status: "Expiring Soon",
    nextBilling: "2026-06-20",
    price: "$30.00",
    cover:
      "https://images.unsplash.com/photo-1519315901367-f34f9274ceb3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_3",
    title: "Dedicated Workspace",
    venue: "Kigali Tech Hub",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-01",
    price: "$150.00",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop",
  },
];

export const upcomingTickets = [
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
    ...events[2], // "Africa Tech Summit"
    id: "t4",
    ticketCategory: "conference",
    ticketType: "Attendee",
    seat: "All Access",
    orderId: "AGT-1003",
  },
  {
    ...events[4], // Free Fest
    id: "t5",
    price: 0,
    ticketCategory: "free",
    ticketType: "Guest",
    seat: "RSVP",
    orderId: "AGT-1004",
  },
] as any[];

export const pastEvents = events.slice(2, 6).map((e, i) => ({
  ...e,
  histRating: 3 + (i % 3),
  rated: i % 2 === 0,
}));

// Mock user favorite categories
export const favoriteCategories = [
  {
    label: "Music",
    icon: Music,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    label: "Sports",
    icon: Trophy,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Cinema",
    icon: Film,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    label: "Conferences",
    icon: Mic,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];
