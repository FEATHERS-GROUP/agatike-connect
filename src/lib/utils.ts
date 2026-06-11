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
