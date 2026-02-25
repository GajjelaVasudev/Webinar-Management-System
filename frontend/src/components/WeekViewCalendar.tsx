import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  CalendarEvent,
  PositionedEvent,
  getWeekDays,
  formatWeekRange,
  calculateEventPosition,
  filterEventsInWeek,
  handleOverlaps,
  goToNextWeek,
  goToPreviousWeek,
  goToToday,
  getTimeSlots,
  formatEventTime,
  calculateTimeFromSlot,
} from '../utils/calendarUtils';
import WebinarModal from './WebinarModal';
import UpcomingEventAlerts from './UpcomingEventAlerts';

interface WeekViewCalendarProps {
  events: CalendarEvent[];
  onRefresh: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const SLOT_HEIGHT = 60; // Height of each hour slot in pixels

export default function WeekViewCalendar({
  events,
  onRefresh,
  onEventClick,
}: WeekViewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'Week' | 'Month'>('Week');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    data?: any;
  }>({ isOpen: false, mode: 'create' });

  const calendarRef = useRef<HTMLDivElement>(null);
  const weekDays = getWeekDays(currentDate);
  const timeSlots = getTimeSlots();

  // Scroll to 8 AM on mount
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.scrollTop = 8 * SLOT_HEIGHT;
    }
  }, []);

  // Filter and position events
  const weekEvents = filterEventsInWeek(events, currentDate);
  const positionedEvents = weekEvents
    .map((event) => calculateEventPosition(event, SLOT_HEIGHT, currentDate))
    .filter((e): e is PositionedEvent => e !== null);
  const adjustedEvents = handleOverlaps(positionedEvents);

  const handlePreviousWeek = () => {
    setCurrentDate(goToPreviousWeek(currentDate));
  };

  const handleNextWeek = () => {
    setCurrentDate(goToNextWeek(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(goToToday());
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setModalState({
      isOpen: true,
      mode: 'create',
      data: { date, hour },
    });
  };

  const handleEventCardClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      setModalState({
        isOpen: true,
        mode: 'edit',
        data: event,
      });
    }
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleModalSuccess = () => {
    onRefresh();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Upcoming Event Alerts */}
      <UpcomingEventAlerts
        events={events}
        onEventClick={handleEventCardClick}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-4">
        {/* Top Row: Title and Schedule Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: 'create', data: {} })
            }
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition"
          >
            <Plus className="w-5 h-5" />
            Schedule Webinar
          </button>
        </div>

        {/* Bottom Row: Navigation Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToday}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Previous Week"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleNextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Next Week"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {formatWeekRange(currentDate)}
            </span>
          </div>

          {/* Right: View Selector */}
          <div className="relative">
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <CalendarIcon className="w-4 h-4" />
              {viewMode}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showViewDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['Week', 'Month'].map((view) => (
                  <button
                    key={view}
                    onClick={() => {
                      setViewMode(view as 'Week' | 'Month');
                      setShowViewDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition ${
                      viewMode === view ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700'
                    } ${view === 'Week' ? 'rounded-t-lg' : 'rounded-b-lg'}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Day Headers */}
          <div className="bg-white border-b border-gray-200 flex">
            {/* Time column header */}
            <div className="w-20 flex-shrink-0 border-r border-gray-200"></div>
            {/* Day columns */}
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="border-r border-gray-200 last:border-r-0 px-4 py-3 text-center"
                >
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      isToday(day)
                        ? 'w-10 h-10 mx-auto bg-purple-600 text-white rounded-full flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Grid */}
          <div
            ref={calendarRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="flex relative">
              {/* Time Labels */}
              <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="border-b border-gray-200 text-xs text-gray-500 pr-2 text-right py-1"
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  >
                    {index > 0 && time}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 grid grid-cols-7 relative">
                {weekDays.map((day, dayIndex) => (
                  <div
                    key={day.toISOString()}
                    className="border-r border-gray-200 last:border-r-0 relative"
                  >
                    {/* Hour slots */}
                    {timeSlots.map((_, hourIndex) => (
                      <div
                        key={hourIndex}
                        className="border-b border-gray-200 hover:bg-purple-50/30 cursor-pointer transition"
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onClick={() => handleSlotClick(day, hourIndex)}
                      ></div>
                    ))}

                    {/* Today indicator line */}
                    {isToday(day) && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-purple-600 z-10"
                        style={{
                          top: `${
                            (new Date().getHours() +
                              new Date().getMinutes() / 60) *
                            SLOT_HEIGHT
                          }px`,
                        }}
                      >
                        <div className="absolute -left-1 -top-1 w-3 h-3 bg-purple-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Event Cards */}
                {adjustedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="absolute rounded-lg p-2 cursor-pointer overflow-hidden group transition-all duration-200 hover:z-20 hover:shadow-lg"
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      left: `${(event.dayIndex * 100) / 7 + event.left / 7}%`,
                      width: `${event.width / 7}%`,
                      backgroundColor: event.status === 'live' ? '#ec4899' : event.status === 'completed' ? '#9ca3af' : '#8b5cf6',
                    }}
                    onClick={() => handleEventCardClick(event)}
                  >
                    <div className="text-white text-xs font-bold line-clamp-2 mb-1">
                      {event.title}
                    </div>
                    <div className="text-white/90 text-[10px]">
                      {formatEventTime(event.start_time, event.end_time)}
                    </div>
                    {event.speaker && event.height > 50 && (
                      <div className="text-white/80 text-[10px] mt-1 truncate">
                        {event.speaker}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <WebinarModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}
