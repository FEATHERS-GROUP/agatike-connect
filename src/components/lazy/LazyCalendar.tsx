import { Calendar, dateFnsLocalizer, CalendarProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function LazyCalendar(props: Omit<CalendarProps, "localizer">) {
  return <Calendar localizer={localizer} {...props} />;
}
