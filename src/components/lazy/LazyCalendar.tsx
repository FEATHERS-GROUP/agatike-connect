import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useState } from 'react';

export default function LazyCalendar(props: any) {
  const [eventsService] = useState(() => createEventsServicePlugin());
  const [calendarControls] = useState(() => createCalendarControlsPlugin());

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const getResponsiveView = () => {
    if (props.defaultView) {
      if (props.defaultView === 'month') return isMobile ? 'month-agenda' : 'month-grid';
      if (props.defaultView === 'week' && isMobile) return 'month-agenda';
      return props.defaultView;
    }
    return isMobile ? 'month-agenda' : 'month-grid';
  };

  const calendar = useNextCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: props.events || [],
    defaultView: getResponsiveView(),
    calendars: {
      'my-booking': {
        colorName: 'my-booking',
        lightColors: { main: '#f97316', container: '#ffedd5', onContainer: '#9a3412' },
        darkColors: { main: '#f97316', container: '#431407', onContainer: '#ffedd5' },
      },
      'other-booking': {
        colorName: 'other-booking',
        lightColors: { main: '#64748b', container: '#f1f5f9', onContainer: '#334155' },
        darkColors: { main: '#94a3b8', container: '#0f172a', onContainer: '#f1f5f9' },
      },
      'session': {
        colorName: 'session',
        lightColors: { main: '#10b981', container: '#d1fae5', onContainer: '#065f46' },
        darkColors: { main: '#10b981', container: '#022c22', onContainer: '#d1fae5' },
      },
      'confirmed': {
        colorName: 'confirmed',
        lightColors: { main: '#8b5cf6', container: '#ede9fe', onContainer: '#4c1d95' },
        darkColors: { main: '#8b5cf6', container: '#2e1065', onContainer: '#ede9fe' },
      },
      'pending': {
        colorName: 'pending',
        lightColors: { main: '#f59e0b', container: '#fef3c7', onContainer: '#78350f' },
        darkColors: { main: '#f59e0b', container: '#451a03', onContainer: '#fef3c7' },
      },
      'cancelled': {
        colorName: 'cancelled',
        lightColors: { main: '#ef4444', container: '#fee2e2', onContainer: '#7f1d1d' },
        darkColors: { main: '#ef4444', container: '#450a0a', onContainer: '#fee2e2' },
      }
    },
    callbacks: {
      onEventClick: (calendarEvent) => {
        if (props.onSelectEvent) props.onSelectEvent(calendarEvent);
      },
      onClickDate: (date) => {
        calendarControls.setDate(date);
        calendarControls.setView('day');
      }
    },
    plugins: [eventsService, calendarControls],
  });

  
  useEffect(() => {
    if (props.events) {
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
