import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useState } from 'react';

export default function LazyCalendar(props: any) {
  const [eventsService] = useState(() => createEventsServicePlugin());

  const calendar = useNextCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: props.events || [],
    defaultView: props.defaultView === 'month' ? 'month-grid' : (props.defaultView || 'month-grid'),
    callbacks: {
      onEventClick: (calendarEvent) => {
        if (props.onSelectEvent) props.onSelectEvent(calendarEvent);
      },
    },
    plugins: [eventsService],
  });

  console.log("LazyCalendar render props.events:", props.events);
  console.log("LazyCalendar calendar instance:", calendar);
  
  useEffect(() => {
    if (props.events) {
       console.log("LazyCalendar calling eventsService.set with:", props.events);
       // We can't deep clone with JSON because it destroys Temporal objects
       eventsService.set(props.events);
    }
  }, [props.events, eventsService]);

  return (
    <div style={props.style || { height: '100%' }} className="sx-react-calendar-wrapper">
      <ScheduleXCalendar calendarApp={calendar} customComponents={props.customComponents} />
    </div>
  );
}
