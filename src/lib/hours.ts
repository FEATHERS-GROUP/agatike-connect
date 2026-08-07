const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function formatHourEntry(h: any) {
  if (!h || h.closed) return "Closed";
  if (h.is24Hours) return "24 Hours";
  return `${h.open} – ${h.close}`;
}

/** Collapse consecutive days with the same schedule into a range e.g. "Mon–Fri: 08:00–18:00" */
export function summarizeHours(opening_hours: Record<string, any>): string[] {
  if (!opening_hours) return [];
  const lines: string[] = [];
  let i = 0;
  while (i < DAY_KEYS.length) {
    const key = DAY_KEYS[i];
    const h = opening_hours[key];
    const label = formatHourEntry(h);
    let j = i + 1;
    while (j < DAY_KEYS.length && formatHourEntry(opening_hours[DAY_KEYS[j]]) === label) j++;
    const dayRange =
      j - i > 1
        ? `${DAY_LABELS[DAY_KEYS[i]]}–${DAY_LABELS[DAY_KEYS[j - 1]]}`
        : DAY_LABELS[DAY_KEYS[i]];
    lines.push(`${dayRange}: ${label}`);
    i = j;
  }
  return lines;
}

/** Get today's hours string from an opening_hours object */
export function todayHours(opening_hours: Record<string, any>): string | null {
  if (!opening_hours) return null;
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayKey = days[new Date().getDay()];
  const h = opening_hours[todayKey];
  if (!h) return null;
  return formatHourEntry(h);
}
