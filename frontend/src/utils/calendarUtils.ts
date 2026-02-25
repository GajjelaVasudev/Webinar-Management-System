import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  parseISO,
  differenceInMinutes,
  addWeeks,
  subWeeks,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  addMinutes,
} from 'date-fns';

export interface CalendarEvent {
  id: number;
  title: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  speaker?: string;
  host?: string;
  description?: string;
  status?: string;
}

export interface PositionedEvent extends CalendarEvent {
  top: number;
  height: number;
  dayIndex: number;
  left: number;
  width: number;
}

/**
 * Get array of dates for the current week (Sun - Sat)
 */
export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/**
 * Format week range e.g., "25 - 31 Jan 2026"
 */
export const formatWeekRange = (date: Date): string => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  
  const startDay = format(start, 'd');
  const endDay = format(end, 'd');
  const month = format(end, 'MMM');
  const year = format(end, 'yyyy');
  
  return `${startDay} - ${endDay} ${month} ${year}`;
};

/**
 * Calculate event position based on time
 * @param slotHeight Height of one hour slot in pixels
 */
export const calculateEventPosition = (
  event: CalendarEvent,
  slotHeight: number,
  weekStart: Date
): PositionedEvent | null => {
  const startTime = parseISO(event.start_time);
  const endTime = parseISO(event.end_time);
  
  // Find which day of the week this event belongs to
  const weekDays = getWeekDays(weekStart);
  const dayIndex = weekDays.findIndex(day => isSameDay(day, startTime));
  
  // If event is not in this week, skip it
  if (dayIndex === -1) return null;
  
  // Calculate top position based on hour of day
  const hours = startTime.getHours();
  const minutes = startTime.getMinutes();
  const top = (hours + minutes / 60) * slotHeight;
  
  // Calculate height based on duration
  const durationMinutes = differenceInMinutes(endTime, startTime);
  const height = (durationMinutes / 60) * slotHeight;
  
  return {
    ...event,
    top,
    height: Math.max(height, slotHeight / 2), // Minimum half slot height
    dayIndex,
    left: 0,
    width: 100,
  };
};

/**
 * Filter events that fall within the current week
 */
export const filterEventsInWeek = (
  events: CalendarEvent[],
  weekStart: Date
): CalendarEvent[] => {
  const start = startOfDay(startOfWeek(weekStart, { weekStartsOn: 0 }));
  const end = endOfDay(endOfWeek(weekStart, { weekStartsOn: 0 }));
  
  return events.filter(event => {
    const eventStart = parseISO(event.start_time);
    return isWithinInterval(eventStart, { start, end });
  });
};

/**
 * Detect overlapping events and adjust their width/position
 */
export const handleOverlaps = (
  events: PositionedEvent[]
): PositionedEvent[] => {
  // Group events by day
  const eventsByDay: { [key: number]: PositionedEvent[] } = {};
  
  events.forEach(event => {
    if (!eventsByDay[event.dayIndex]) {
      eventsByDay[event.dayIndex] = [];
    }
    eventsByDay[event.dayIndex].push(event);
  });
  
  // Process each day's events
  const adjustedEvents: PositionedEvent[] = [];
  
  Object.values(eventsByDay).forEach(dayEvents => {
    // Sort by start time
    dayEvents.sort((a, b) => a.top - b.top);
    
    // Detect overlaps
    const columns: PositionedEvent[][] = [];
    
    dayEvents.forEach(event => {
      let placed = false;
      
      // Try to place in existing column
      for (let col of columns) {
        const lastInCol = col[col.length - 1];
        if (lastInCol.top + lastInCol.height <= event.top) {
          col.push(event);
          placed = true;
          break;
        }
      }
      
      // Create new column if needed
      if (!placed) {
        columns.push([event]);
      }
    });
    
    // Calculate widths based on number of columns
    const numColumns = columns.length;
    const colWidth = 100 / numColumns;
    
    columns.forEach((col, colIndex) => {
      col.forEach(event => {
        adjustedEvents.push({
          ...event,
          left: colIndex * colWidth,
          width: colWidth - 1, // Small gap between columns
        });
      });
    });
  });
  
  return adjustedEvents;
};

/**
 * Navigate to next week
 */
export const goToNextWeek = (currentDate: Date): Date => {
  return addWeeks(currentDate, 1);
};

/**
 * Navigate to previous week
 */
export const goToPreviousWeek = (currentDate: Date): Date => {
  return subWeeks(currentDate, 1);
};

/**
 * Go to today
 */
export const goToToday = (): Date => {
  return new Date();
};

/**
 * Get time slots for the calendar (12 AM to 11 PM)
 */
export const getTimeSlots = (): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    times.push(`${displayHour} ${period}`);
  }
  return times;
};

/**
 * Format time for display
 */
export const formatEventTime = (start: string, end: string): string => {
  const startTime = parseISO(start);
  const endTime = parseISO(end);
  return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
};

/**
 * Check if event is starting soon (within next hour)
 */
export const isEventUpcoming = (startTime: string): boolean => {
  const start = parseISO(startTime);
  const now = new Date();
  const oneHourFromNow = addMinutes(now, 60);
  
  return isAfter(start, now) && isBefore(start, oneHourFromNow);
};

/**
 * Get upcoming events (within next 24 hours)
 */
export const getUpcomingEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const now = new Date();
  const tomorrow = addMinutes(now, 24 * 60);
  
  return events.filter(event => {
    const start = parseISO(event.start_time);
    return isAfter(start, now) && isBefore(start, tomorrow);
  }).sort((a, b) => {
    return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
  });
};

/**
 * Calculate time from hour and minute for creating new events
 */
export const calculateTimeFromSlot = (
  date: Date,
  hour: number,
  minute: number = 0
): string => {
  const eventDate = new Date(date);
  eventDate.setHours(hour, minute, 0, 0);
  return eventDate.toISOString();
};
