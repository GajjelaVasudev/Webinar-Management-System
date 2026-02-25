import React, { useEffect, useState } from 'react';
import { Bell, X, Clock, Calendar } from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { CalendarEvent, getUpcomingEvents } from '../utils/calendarUtils';

interface UpcomingEventAlertsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function UpcomingEventAlerts({
  events,
  onEventClick,
}: UpcomingEventAlertsProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    const updateUpcoming = () => {
      const upcoming = getUpcomingEvents(events).filter(
        (event) => !dismissedIds.has(event.id)
      );
      setUpcomingEvents(upcoming);
    };

    updateUpcoming();
    // Update every minute
    const interval = setInterval(updateUpcoming, 60000);

    return () => clearInterval(interval);
  }, [events, dismissedIds]);

  const handleDismiss = (eventId: number) => {
    setDismissedIds((prev) => new Set([...prev, eventId]));
  };

  const getTimeUntilEvent = (startTime: string): string => {
    const minutes = differenceInMinutes(parseISO(startTime), new Date());
    
    if (minutes < 5) {
      return 'Starting very soon!';
    } else if (minutes < 60) {
      return `Starts in ${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `Starts in ${hours}h ${mins}m`;
    }
  };

  if (upcomingEvents.length === 0 || !showAlerts) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-3 max-w-md animate-in slide-in-from-right duration-500">
      {upcomingEvents.map((event) => (
        <div
          key={event.id}
          className="bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-orange-500 rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right"
          onClick={() => onEventClick(event)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Bell className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                    UPCOMING
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">
                  {event.title}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold text-orange-600">
                      {getTimeUntilEvent(event.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {format(parseISO(event.start_time), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(event.id);
              }}
              className="p-1 hover:bg-orange-100 rounded-full transition"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      ))}

      {/* Dismiss All Button */}
      {upcomingEvents.length > 1 && (
        <button
          onClick={() => setShowAlerts(false)}
          className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white transition"
        >
          Dismiss All
        </button>
      )}
    </div>
  );
}
