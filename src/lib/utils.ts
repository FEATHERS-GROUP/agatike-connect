import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateParam: string | Date | number): string {
  if (!dateParam) return "";

  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const today = new Date();
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) return "Just now";
  else if (minutes < 60) return `${minutes}m ago`;
  else if (hours < 24) return `${hours}h ago`;
  else if (days < 30) return `${days}d ago`;
  else if (months < 12) return `${months}mo ago`;
  else return `${years}y ago`;
}

export function formatMessageTime(dateParam: string | Date | number): string {
  if (!dateParam) return "";
  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
}

export function formatMessageDate(dateParam: string | Date | number): string {
  if (!dateParam) return "";
  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    // Check if it's within the last 7 days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "long" });
    }
    return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
  }
}

export function mapDbEventToEvent(e: any): any {
  if (!e) return null;
  const isMock = !!e.organizer || !!e.host || !!e.cinema;
  if (isMock) return e;

  const date = Array.isArray(e.tour_stops) && e.tour_stops[0] ? e.tour_stops[0].date : "TBD";
  const time = Array.isArray(e.tour_stops) && e.tour_stops[0] ? e.tour_stops[0].time : "";
  const city =
    Array.isArray(e.tour_stops) && e.tour_stops[0]
      ? e.tour_stops[0].city
      : e.workspaces?.city || "TBD";
  const venue = Array.isArray(e.tour_stops) && e.tour_stops[0] ? e.tour_stops[0].venue : "";

  // Count unique people going (distinct by email) — not ticket count
  const attendees = e.event_attendees_aggregate?.aggregate?.count ?? 0;

  const price =
    e.event_tickets && e.event_tickets.length > 0
      ? Math.min(...e.event_tickets.map((t: any) => t.cost || 0))
      : 0;

  const currency = e.workspaces?.currency || e.workspaces?.wallet?.currency || "$";
  const organizer = e.workspaces?.organizer?.name || e.workspaces?.name || "Organizer";
  const organizerId = e.workspaces?.organizer?.id || e.workspaces?.orgnizer_id;

  return {
    id: e.id,
    title: e.title,
    cover: e.cover || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    image: e.cover || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    date,
    time,
    city,
    location: venue ? `${venue}, ${city}` : city,
    price,
    currency,
    category: e.category || "Event",
    attendees,
    rating: e.workspaces?.organizer?.rating || 4.8,
    organizer,
    organizerId,
    allowed_public: e.allowed_public,
    deleted: e.deleted,
  };
}

export function isWeekendEvent(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const day = date.getDay();
  return day === 0 || day === 5 || day === 6;
}
