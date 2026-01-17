import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Video,
  Play,
  Search,
  CheckCircle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  Mic,
  Share2,
  Filter,
  Bell,
  Film,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import authService from "../services/auth";

type ViewState =
  | "home"
  | "listing"
  | "details"
  | "confirmation"
  | "my-webinars"
  | "live"
  | "recordings"
  | "profile";

interface Webinar {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  role: string;
  description: string;
  category: "Upcoming" | "Live" | "Past";
  image: string;
  isRegistered: boolean;
  price: string;
  status?: "upcoming" | "live" | "completed";
  live_stream_url?: string;
}

interface EventApi {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: number;
  start_time: string; // ISO
  end_time: string; // ISO
  organizer_name?: string;
  speaker_name?: string;
  speaker_role?: string;
  price?: string | number;
  thumbnail_url?: string;
  cover_image_url?: string;
  status?: "upcoming" | "live" | "completed";
  is_registered?: boolean;
  live_stream_url?: string;
}

interface RecordingApi {
  id: number;
  event: number;
  event_id?: number;
  title?: string;
  event_title?: string;
  video_url?: string;
  recording_link?: string;
  duration_seconds?: number;
  recorded_on?: string;
  thumbnail_url?: string;
}

interface RegistrationResponse {
  id: number;
  event: number;
  email?: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const durationBetween = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const mins = Math.max(0, Math.round((e - s) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const resolveCategory = (ev: EventApi): Webinar["category"] => {
  if (ev.status) {
    if (ev.status.toLowerCase() === "live") return "Live";
    if (ev.status.toLowerCase() === "past") return "Past";
  }
  const now = Date.now();
  const start = new Date(ev.start_time).getTime();
  const end = new Date(ev.end_time).getTime();
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Live";
  return "Past";
};

const mapEvent = (ev: EventApi): Webinar => ({
  id: ev.id,
  title: ev.title,
  date: formatDate(ev.start_time),
  time: formatTime(ev.start_time),
  duration: ev.duration ? `${ev.duration}m` : durationBetween(ev.start_time, ev.end_time),
  speaker: ev.speaker_name || ev.organizer_name || "Organizer",
  role: ev.speaker_role || "Speaker",
  description: ev.description,
  category: resolveCategory(ev),
  image:
    ev.thumbnail_url ||
    ev.cover_image_url ||
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
  isRegistered: Boolean(ev.is_registered),
  price:
    typeof ev.price === "number"
      ? ev.price === 0
        ? "Free"
        : `$${ev.price.toFixed(2)}`
      : ev.price || "Free",
  status: ev.status,
  live_stream_url: ev.live_stream_url,
});

// --- Sub-Components ---

const Header = ({
  setView,
  currentView,
  userName,
  notifications,
  unreadCount,
  showNotifications,
  setShowNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  setView: (v: ViewState) => void;
  currentView: ViewState;
  userName?: string;
  notifications: any[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}) => (
  <nav className="bg-[#1e1b4b] text-white px-8 py-5 sticky top-0 z-50 shadow-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div
        className="text-xl font-extrabold uppercase tracking-widest cursor-pointer hover:opacity-80 transition"
        onClick={() => setView("home")}
      >
        Logo Here
      </div>

      <div className="hidden md:flex space-x-8 text-sm font-medium">
        {[
          { id: "home", label: "Dashboard" },
          { id: "listing", label: "All Events" },
          { id: "my-webinars", label: "My Schedule" },
          { id: "recordings", label: "Recordings" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`transition-colors duration-300 ${
              currentView === item.id
                ? "text-pink-500 font-bold"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-300 hover:text-white transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && onMarkAsRead(notif.id)}
                        className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                          !notif.is_read ? 'bg-pink-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-pink-500 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{notif.content}</p>
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>
                            {notif.sender_username && `By ${notif.sender_username}`}
                            {notif.event_title && notif.event_title}
                          </span>
                          <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 pl-6 border-l border-gray-700">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400">Welcome,</div>
            <div className="text-sm font-bold">{userName || "..."}</div>
          </div>
          <button
            onClick={() => setView("profile")}
            className="w-10 h-10 rounded-full border-2 border-pink-500 p-0.5 cursor-pointer hover:scale-105 transition focus:outline-none"
          >
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              className="rounded-full w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// 2. Consistent Footer
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
      <div className="font-bold text-slate-800 text-lg mb-4 md:mb-0">
        Publish Ninja
      </div>
      <div className="flex space-x-8">
        <a href="#" className="hover:text-pink-500 transition">
          Privacy
        </a>
        <a href="#" className="hover:text-pink-500 transition">
          Terms
        </a>
        <a href="#" className="hover:text-pink-500 transition">
          Support
        </a>
      </div>
      <div className="mt-4 md:mt-0">
        © 2024, Publish Ninja All Rights Reserved.
      </div>
    </div>
  </footer>
);

// 3. Themed Card Component
const WebinarCard = ({
  data,
  onClick,
  actionLabel = "View Details",
  secondaryAction,
}: any) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border border-gray-100">
    <div className="relative h-56 overflow-hidden rounded-t-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition"></div>
      <img
        src={data.image}
        alt={data.title}
        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
      />

      <div className="absolute top-4 right-4 z-20">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            data.status === "live" || data.category === "Live"
              ? "bg-red-500 text-white animate-pulse"
              : data.status === "completed" || data.category === "Past"
              ? "bg-gray-500 text-white"
              : "bg-white text-slate-900"
          }`}
        >
          {data.status === "live" ? "● LIVE" : data.status === "completed" ? "Ended" : data.category}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 z-20 text-white">
        <div className="font-bold text-lg">{data.price}</div>
      </div>
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center">
          <Calendar size={12} className="text-pink-500 mr-1.5" /> {data.date}
        </span>
        <span className="flex items-center">
          <Clock size={12} className="text-pink-500 mr-1.5" /> {data.time}
        </span>
      </div>

      <h3 className="text-lg font-extrabold text-slate-900 mb-3 leading-snug group-hover:text-pink-600 transition-colors">
        {data.title}
      </h3>

      <div className="flex items-center space-x-3 mb-6 mt-auto pt-4 border-t border-dashed border-gray-100">
        <img
          src={`https://i.pravatar.cc/150?u=${data.speaker}`}
          className="w-8 h-8 rounded-full"
          alt="Sp"
        />
        <div>
          <div className="text-xs font-bold text-slate-800">{data.speaker}</div>
          <div className="text-[10px] text-gray-400">{data.role}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onClick(data)}
          className="flex-1 bg-gray-50 text-slate-900 text-sm font-bold py-2.5 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition border border-gray-200"
        >
          {actionLabel}
        </button>
        {secondaryAction}
      </div>
    </div>
  </div>
);

// --- Main App ---

const UserWebinarPortal = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("home");
  const [events, setEvents] = useState<Webinar[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null
  );

  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [selectedWebinarForRecordings, setSelectedWebinarForRecordings] = useState<number | null>(null);

  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [recordingSearchTerm, setRecordingSearchTerm] = useState('');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);

  // --- Auth check ---
  useEffect(() => {
    const loadMe = async () => {
      // Check if user is authenticated first
      if (!authService.isAuthenticated()) {
        setAuthChecked(true);
        return;
      }
      
      try {
        const { data } = await apiClient.get("/users/profile/me/");
        setUserName(data?.name || data?.username || "User");
      } catch (err: any) {
        if (err?.response?.status === 401) {
          navigate("/auth");
        }
      } finally {
        setAuthChecked(true);
      }
    };
    loadMe();
  }, [navigate]);

  // --- Fetch events ---
  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const { data } = await apiClient.get<EventApi[]>("/webinars/");
      const mapped = data.map(mapEvent);
      setEvents(mapped);
    } catch (err: any) {
      if (err?.response?.status === 401) navigate("/auth");
      setEventsError("Unable to load events. Please try again.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRecordings();
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Handle query param for direct details access ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");
    if (eventId) {
      const id = Number(eventId);
      const found = events.find((e) => e.id === id);
      if (found) {
        setSelectedWebinar(found);
        setView("details");
      } else {
        // fetch single if not in list
        apiClient
          .get<EventApi>(`/webinars/${id}/`)
          .then((res: any) => {
            const mapped = mapEvent(res.data);
            setSelectedWebinar(mapped);
            setView("details");
          })
          .catch(() => {
            setEventsError("Event not found or inaccessible.");
            setView("listing");
          });
      }
    }
  }, [events]);

  const handleWebinarClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setView("details");
    const url = new URL(window.location.href);
    url.searchParams.set("eventId", String(webinar.id));
    window.history.replaceState({}, "", url.toString());
  };

  // Filtered events based on search term
  const filteredEvents = useMemo(() => {
    if (!eventSearchTerm.trim()) return events;
    const term = eventSearchTerm.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term) ||
      event.speaker.toLowerCase().includes(term) ||
      event.category.toLowerCase().includes(term)
    );
  }, [events, eventSearchTerm]);

  // --- Registration ---
  const registerForEvent = async () => {
    if (!selectedWebinar) return;
    if (selectedWebinar.isRegistered) {
      setView("confirmation");
      return;
    }
    setIsRegistering(true);
    try {
      const { data } = await apiClient.post<RegistrationResponse>(
        `/webinars/${selectedWebinar.id}/register/`,
        {}
      );
      // refresh events to update registration flags
      await fetchEvents();
      setSelectedWebinar((prev) =>
        prev ? { ...prev, isRegistered: true } : prev
      );
      setConfirmationEmail(data?.email || null);
      setView("confirmation");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate("/auth");
      } else if (err?.response?.status === 400) {
        setEventsError("You are already registered for this event.");
        setSelectedWebinar((prev) =>
          prev ? { ...prev, isRegistered: true } : prev
        );
      } else {
        setEventsError("Registration failed. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // --- Recordings ---
  const fetchRecordings = async () => {
    setLoadingRecordings(true);
    try {
      const { data } = await apiClient.get("/recordings/");
      // Handle both paginated response {results: [...]} and direct array [...]
      const recordingsArray = data.results || data || [];
      setRecordings(recordingsArray);
    } catch (err: any) {
      if (err?.response?.status === 401) navigate("/auth");
    } finally {
      setLoadingRecordings(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get("/notifications/recent/");
      setNotifications(data || []);
      
      const countRes = await apiClient.get("/notifications/unread_count/");
      setUnreadCount(countRes.data.unread_count || 0);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/mark_as_read/`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post("/notifications/mark_all_as_read/");
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const liveRegistrations = useMemo(
    () => events.filter((e) => e.category === "Live" && e.isRegistered),
    [events]
  );

  const myRegistered = useMemo(
    () => events.filter((e) => e.isRegistered),
    [events]
  );

  const filteredForHome = useMemo(
    () => events.slice(0, 3),
    [events]
  );

  const HomeScreen = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="relative bg-[#1e1b4b] rounded-3xl overflow-hidden shadow-2xl min-h-[300px] flex items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777] opacity-90"></div>
        <div className="absolute top-10 left-10 opacity-30">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-t from-pink-500 to-purple-600 rounded-full blur-3xl opacity-40"></div>

        <div className="relative z-10 p-10 md:p-16 w-full md:w-2/3 text-white">
          <span className="text-pink-400 font-bold tracking-widest text-xs mb-3 block uppercase">
            Welcome Back, {userName || "User"}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Ready to Learn <br /> Something New?
          </h1>
          <p className="text-gray-300 mb-8 max-w-lg leading-relaxed">
            {`You have ${myRegistered.filter(
              (e) => e.category === "Upcoming" || e.category === "Live"
            ).length} upcoming sessions.`}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setView("listing")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition"
            >
              Browse Events
            </button>
            <button
              onClick={() => setView("my-webinars")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-bold backdrop-blur-md transition"
            >
              My Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Registered", val: myRegistered.length, color: "bg-pink-500" },
          {
            label: "Completed",
            val: myRegistered.filter((e) => e.category === "Past").length,
            color: "bg-orange-500",
          },
          { label: "Certificates", val: "—", color: "bg-[#6d28d9]" },
          { label: "Hours Watched", val: "—", color: "bg-blue-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} rounded-2xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition duration-300`}
          >
            <div className="text-4xl font-extrabold mb-1">{stat.val}</div>
            <div className="text-xs opacity-80 uppercase tracking-wide font-semibold">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-pink-500 font-bold text-sm tracking-wide">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Popular This Week
            </h2>
          </div>
          <button
            onClick={() => setView("listing")}
            className="flex items-center text-slate-500 hover:text-pink-600 font-bold text-sm transition"
          >
            View All Events <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingEvents && <div className="text-sm text-gray-500">Loading events...</div>}
          {!loadingEvents &&
            filteredForHome.map((w) => (
              <WebinarCard key={w.id} data={w} onClick={handleWebinarClick} />
            ))}
          {!loadingEvents && filteredForHome.length === 0 && (
            <div className="text-sm text-gray-500">No events available.</div>
          )}
        </div>
      </div>
    </div>
  );

  const ListingScreen = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Find Your Next Event
          </h1>
          <p className="text-gray-500 text-sm">
            Search through hundreds of live and recorded sessions.
          </p>
        </div>
        <div className="flex-1 w-full flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search events..."
              value={eventSearchTerm}
              onChange={(e) => setEventSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
            />
          </div>
          <button className="bg-[#1e1b4b] text-white px-5 rounded-xl hover:bg-slate-800 transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingEvents && <div className="text-sm text-gray-500">Loading events...</div>}
        {!loadingEvents &&
          filteredEvents.map((w) => (
            <WebinarCard key={w.id} data={w} onClick={handleWebinarClick} />
          ))}
        {!loadingEvents && filteredEvents.length === 0 && events.length > 0 && (
          <div className="col-span-full text-center text-sm text-gray-500 py-8">
            No events match your search. Try different keywords.
          </div>
        )}
        {!loadingEvents && events.length === 0 && (
          <div className="text-sm text-gray-500">No events found.</div>
        )}
      </div>
    </div>
  );

  const DetailsScreen = () => {
    if (!selectedWebinar) return null;
    return (
      <div className="animate-in zoom-in-95 duration-300">
        <button
          onClick={() => {
            setView("listing");
            const url = new URL(window.location.href);
            url.searchParams.delete("eventId");
            window.history.replaceState({}, "", url.toString());
          }}
          className="group flex items-center text-gray-500 hover:text-pink-600 mb-8 font-bold text-sm transition"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-pink-500 transition">
            <ArrowLeft size={16} />
          </div>
          Back to Listings
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="rounded-3xl overflow-hidden shadow-2xl relative mb-10 group">
              <img
                src={selectedWebinar.image}
                className="w-full h-[400px] object-cover group-hover:scale-105 transition duration-700"
                alt="Cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-10 text-white w-full">
                <span className="bg-pink-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-lg">
                  {selectedWebinar.category}
                </span>
                <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                  {selectedWebinar.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm font-medium text-gray-200">
                  <span className="flex items-center">
                    <Calendar size={18} className="mr-2 text-pink-500" />{" "}
                    {selectedWebinar.date}
                  </span>
                  <span className="flex items-center">
                    <Clock size={18} className="mr-2 text-pink-500" />{" "}
                    {selectedWebinar.time}
                  </span>
                  <span className="flex items-center">
                    <MapPin size={18} className="mr-2 text-pink-500" /> Online
                  </span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Event Description
              </h3>
              <p className="text-gray-600 leading-8 mb-8">
                {selectedWebinar.description}
              </p>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Meet Your Speaker
              </h3>
              <div className="flex items-center space-x-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500 rounded-full blur-sm opacity-20"></div>
                  <img
                    src={`https://i.pravatar.cc/150?u=${selectedWebinar.speaker}`}
                    className="w-20 h-20 rounded-full relative z-10 border-2 border-white"
                    alt="Speaker"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {selectedWebinar.speaker}
                  </h4>
                  <p className="text-pink-500 font-medium">
                    {selectedWebinar.role}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition cursor-pointer"
                      >
                        <User size={12} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-28">
              <div className="text-center mb-8">
                <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                  Ticket Price
                </span>
                <div className="text-5xl font-extrabold text-slate-900 mt-2">
                  {selectedWebinar.price}
                </div>
              </div>

              {/* Status-based action buttons */}
              {selectedWebinar.status === "live" && selectedWebinar.isRegistered ? (
                <button
                  onClick={() => setView("live")}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(239,68,68,0.3)] transition transform hover:-translate-y-1 flex items-center justify-center gap-2 animate-pulse"
                >
                  <Play size={20} fill="white" />
                  Join Live Session
                </button>
              ) : selectedWebinar.status === "completed" ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={24} />
                    </div>
                    <div className="font-bold text-gray-800">
                      Event Ended
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      This webinar has concluded
                    </div>
                  </div>
                  {selectedWebinar.isRegistered && (
                    <button
                      onClick={() => {
                        // Navigate to recordings for this specific webinar
                        setView("recordings");
                        setSelectedWebinarForRecordings(selectedWebinar.id);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Video size={18} />
                      Watch Recording
                    </button>
                  )}
                </div>
              ) : selectedWebinar.isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={24} />
                  </div>
                  <div className="font-bold text-green-800">
                    You're Registered!
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Check your email for details. Join when it goes live!
                  </div>
                </div>
              ) : (
                <button
                  onClick={registerForEvent}
                  disabled={isRegistering}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(236,72,153,0.3)] transition transform hover:-translate-y-1 disabled:opacity-60"
                >
                  {isRegistering ? "Processing..." : "Get Ticket Now"}
                </button>
              )}

              <div className="mt-8 space-y-4 pt-8 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-bold text-slate-800">
                    {selectedWebinar.duration}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Language</span>
                  <span className="font-bold text-slate-800">English</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Certificate</span>
                  <span className="font-bold text-slate-800">
                    Yes, Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmationScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner relative">
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
        <CheckCircle className="text-green-600 w-10 h-10" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
        Registration Confirmed!
      </h2>
      <p className="text-gray-500 max-w-md mb-10 text-lg">
        You are all set. We have sent a calendar invite to{" "}
        <span className="text-slate-900 font-bold">
          {confirmationEmail || "your email"}
        </span>
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => setView("my-webinars")}
          className="bg-[#1e1b4b] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-purple-900/20 transition"
        >
          Go to My Schedule
        </button>
        <button
          onClick={() => setView("listing")}
          className="px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );

  const MyWebinarsScreen = () => (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">My Schedule</h1>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          {["Upcoming", "Past"].map((t) => (
            <button
              key={t}
              className="px-4 py-1.5 text-sm font-bold rounded-md hover:bg-gray-50 text-gray-500"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {liveRegistrations.map((w) => (
        <div
          key={w.id}
          className="bg-[#1e1b4b] rounded-2xl p-8 mb-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-20"></div>

          <div className="flex items-center space-x-8 relative z-10">
            <div className="relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <img
                src={w.image}
                className="w-32 h-24 object-cover rounded-lg border-2 border-white/20"
                alt="Thumb"
              />
            </div>
            <div>
              <div className="text-pink-400 font-bold tracking-widest text-xs uppercase mb-2 animate-pulse">
                Happening Now
              </div>
              <h3 className="text-2xl font-bold mb-1">{w.title}</h3>
              <p className="text-gray-400 text-sm">
                Started • {w.speaker}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedWebinar(w);
              setView("live");
            }}
            className="mt-6 md:mt-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] text-white px-10 py-3 rounded-full font-bold transition transform group-hover:scale-105"
          >
            Join Room
          </button>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {myRegistered
          .filter((w) => w.category !== "Live")
          .map((w) => (
            <WebinarCard key={w.id} data={w} onClick={handleWebinarClick} />
          ))}
        {myRegistered.length === 0 && (
          <div className="text-sm text-gray-500">No registrations yet.</div>
        )}
      </div>
    </div>
  );

  const LiveSessionScreen = () => {
    const [chatMessages, setChatMessages] = React.useState<any[]>([]);
    const [messageInput, setMessageInput] = React.useState("");
    const [isLoadingChat, setIsLoadingChat] = React.useState(false);
    const [sendingMessage, setSendingMessage] = React.useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages update
    React.useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Fetch chat messages
    const fetchChatMessages = React.useCallback(async () => {
      if (!selectedWebinar || selectedWebinar.status !== "live") return;
      
      try {
        setIsLoadingChat(true);
        const response = await fetch(
          `http://localhost:8000/api/chat/messages/?event_id=${selectedWebinar.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setChatMessages(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      } finally {
        setIsLoadingChat(false);
      }
    }, [selectedWebinar]);

    // Fetch messages on mount and set up polling
    React.useEffect(() => {
      fetchChatMessages();
      
      const interval = setInterval(() => {
        fetchChatMessages();
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
    }, [fetchChatMessages]);

    // Handle sending message
    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageInput.trim() || !selectedWebinar || sendingMessage) return;

      const optimisticMessage = {
        id: Date.now(),
        event: selectedWebinar.id,
        message: messageInput,
        username: localStorage.getItem("username") || "You",
        first_name: localStorage.getItem("first_name") || "",
        last_name: localStorage.getItem("last_name") || "",
        created_at: new Date().toISOString(),
      };

      // Add optimistically
      setChatMessages((prev) => [...prev, optimisticMessage]);
      setMessageInput("");
      setSendingMessage(true);

      try {
        const response = await fetch("http://localhost:8000/api/chat/messages/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            event: selectedWebinar.id,
            message: messageInput,
          }),
        });

        if (!response.ok) {
          // Remove optimistic message on error
          setChatMessages((prev) =>
            prev.filter((m) => m.id !== optimisticMessage.id)
          );
          console.error("Error sending message:", response.statusText);
        }
      } catch (error) {
        // Remove optimistic message on error
        setChatMessages((prev) =>
          prev.filter((m) => m.id !== optimisticMessage.id)
        );
        console.error("Error sending message:", error);
      } finally {
        setSendingMessage(false);
      }
    };

    if (!selectedWebinar) return null;
    
    return (
      <div className="h-[85vh] bg-black rounded-2xl overflow-hidden flex animate-in zoom-in-95 duration-500 shadow-2xl relative">
        <div className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col z-20">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-slate-900">Live Chat</h3>
            <div className="text-xs text-green-500 font-bold flex items-center mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>{" "}
              Live Now
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {isLoadingChat && chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                Loading messages...
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <>
                {chatMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                      {(msg.first_name || msg.username)[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs font-bold text-slate-800">
                          {msg.first_name && msg.last_name
                            ? `${msg.first_name} ${msg.last_name}`
                            : msg.username}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-white p-2 rounded-lg shadow-sm border border-gray-100 mt-1">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="bg-transparent flex-1 text-sm outline-none"
                placeholder="Type your message..."
                disabled={selectedWebinar.status !== "live"}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sendingMessage || selectedWebinar.status !== "live"}
                className="text-pink-500 font-bold hover:text-pink-600 disabled:opacity-50"
              >
                <Share2 size={16} />
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 relative bg-slate-900 flex flex-col">
          <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between text-white z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase animate-pulse">
                  ● LIVE
                </span>
                <h1 className="font-bold text-xl tracking-tight">
                  {selectedWebinar.title}
                </h1>
              </div>
              <p className="text-sm text-gray-300">
                {selectedWebinar.speaker}
              </p>
            </div>
            <button
              onClick={() => setView("my-webinars")}
              className="bg-red-500/20 text-red-100 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition"
            >
              Leave Session
            </button>
          </div>

          <div className="flex-1 relative">
            {selectedWebinar.live_stream_url ? (
              <iframe
                src={selectedWebinar.live_stream_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Live Stream"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 text-center text-white">
                  <Video size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Stream will start soon...</p>
                  <p className="text-sm text-gray-300 mt-2">Please wait while the organizer sets up the stream</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RecordingsScreen = () => {
    // Filter to show only recordings for:
    // 1. Webinars that the user has registered for (any status)
    const registeredWebinars = events.filter((ev) => ev.isRegistered);
    
    // Filter registered webinars by search term
    const filteredRegisteredWebinars = useMemo(() => {
      if (!recordingSearchTerm.trim()) return registeredWebinars;
      const term = recordingSearchTerm.toLowerCase();
      return registeredWebinars.filter(webinar =>
        webinar.title.toLowerCase().includes(term) ||
        webinar.description.toLowerCase().includes(term) ||
        webinar.speaker.toLowerCase().includes(term)
      );
    }, [registeredWebinars, recordingSearchTerm]);
    
    // Map webinars to their IDs for quick lookup
    const registeredWebinarIds = new Set(registeredWebinars.map((w) => w.id));
    
    // Filter recordings to only those from registered webinars
    const relevantRecordings = recordings.filter((rec) => {
      const eventId = rec.event || rec.event_id;
      return eventId && registeredWebinarIds.has(eventId);
    });
    
    // Group recordings by webinar for better organization
    const recordingsByWebinar = registeredWebinars.reduce<
      Record<number, RecordingApi[]>
    >((acc, webinar) => {
      acc[webinar.id] = relevantRecordings.filter((rec) => {
        const eventId = rec.event_id || rec.event;
        return eventId === webinar.id;
      });
      return acc;
    }, {});

    // Get webinars that have recordings (filtered by search)
    const webinarsWithRecordings = filteredRegisteredWebinars.filter(
      (w) => (recordingsByWebinar[w.id] || []).length > 0
    );

    // If a webinar is selected, show its recordings
    if (selectedWebinarForRecordings) {
      const selectedWebinar = webinarsWithRecordings.find(
        (w) => w.id === selectedWebinarForRecordings
      );
      const selectedRecordings = recordingsByWebinar[selectedWebinarForRecordings] || [];

      return (
        <div className="animate-in fade-in duration-500">
          <button
            onClick={() => setSelectedWebinarForRecordings(null)}
            className="mb-6 flex items-center text-pink-600 hover:text-pink-700 font-semibold transition"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Recordings
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedWebinar?.title}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {selectedRecordings.length} recording{selectedRecordings.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {selectedRecordings.map((rec) => {
              const videoUrl = rec.recording_link || rec.video_url;
              const title = rec.event_title || rec.title || "Recording";

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer"
                  onClick={() => videoUrl && window.open(videoUrl, "_blank")}
                >
                  <div className="h-40 bg-slate-800 relative group-hover:opacity-90 transition">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition border border-white">
                        <Play
                          className="text-white ml-1"
                          fill="currentColor"
                          size={20}
                        />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                      {rec.duration_seconds
                        ? new Date(rec.duration_seconds * 1000)
                            .toISOString()
                            .substring(11, 19)
                        : "—"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {rec.recorded_on
                        ? `Recorded on ${formatDate(rec.recorded_on)}`
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Show webinar cards with recording counts
    return (
      <div className="animate-in fade-in duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Session Recordings
          </h1>
          <div className="relative max-w-md">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search recordings..."
              value={recordingSearchTerm}
              onChange={(e) => setRecordingSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
            />
          </div>
        </div>
        {loadingRecordings && (
          <div className="text-sm text-gray-500">Loading recordings...</div>
        )}
        {!loadingRecordings && webinarsWithRecordings.length === 0 && (
          <div className="text-sm text-gray-500">
            {recordingSearchTerm.trim() && filteredRegisteredWebinars.length === 0
              ? "No recordings match your search. Try different keywords."
              : registeredWebinars.length === 0
              ? "You haven't registered for any webinars yet."
              : "No recordings available yet for your registered webinars."}
          </div>
        )}

        {/* Grid of webinars with recordings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {webinarsWithRecordings.map((webinar) => {
            const webinarRecordings = recordingsByWebinar[webinar.id] || [];
            const recordingCount = webinarRecordings.length;

            return (
              <div
                key={webinar.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer"
                onClick={() => setSelectedWebinarForRecordings(webinar.id)}
              >
                <div className="h-48 bg-gradient-to-br from-pink-400 to-pink-600 relative group-hover:opacity-90 transition flex items-center justify-center">
                  <Film className="text-white" size={48} opacity={0.3} />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug group-hover:text-pink-600 transition">
                    {webinar.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Calendar size={14} className="text-pink-500 mr-1.5" />
                      {webinar.date}
                    </span>
                  </div>
                  <div className="bg-pink-50 text-pink-700 px-3 py-2 rounded-lg text-sm font-semibold text-center">
                    {recordingCount} recording{recordingCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const [profileData, setProfileData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editName, setEditName] = React.useState("");
    const [error, setError] = React.useState("");
    const [changePasswordForm, setChangePasswordForm] = React.useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    React.useEffect(() => {
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const response = await fetch("http://localhost:8000/api/users/profile/me/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
            setEditName(data.user_info?.first_name || "");
          } else {
            setError("Failed to load profile");
          }
        } catch (err) {
          setError("Error loading profile");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }, []);

    const handleUpdateName = async () => {
      if (!editName.trim()) {
        setError("Name cannot be empty");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/users/profile/me/", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            user_info: {
              first_name: editName.trim(),
            },
          }),
        });

        if (response.ok) {
          const updated = await response.json();
          setProfileData(updated);
          setIsEditing(false);
          setError("");
        } else {
          setError("Failed to update name");
        }
      } catch (err) {
        setError("Error updating name");
        console.error(err);
      }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword) {
        setError("All password fields are required");
        return;
      }

      if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (changePasswordForm.newPassword.length < 8) {
        setError("New password must be at least 8 characters");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/auth/change-password/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
              current_password: changePasswordForm.currentPassword,
              new_password: changePasswordForm.newPassword,
            }),
          }
        );

        if (response.ok) {
          setChangePasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setError("");
          alert("Password changed successfully");
        } else {
          setError("Failed to change password. Check your current password.");
        }
      } catch (err) {
        setError("Error changing password");
        console.error(err);
      }
    };

    const handleLogout = () => {
      authService.logout();
      navigate("/login");
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      );
    }

    if (!profileData) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Failed to load profile"}</p>
          <button
            onClick={() => setView("home")}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Go Back
          </button>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500">
        <button
          onClick={() => setView("home")}
          className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="max-w-2xl">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full border-4 border-pink-500 p-1">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {profileData.user_info?.first_name ||
                      profileData.user_info?.username}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {profileData.user_info?.email}
                  </p>
                  <div className="mt-3 flex items-center space-x-3 text-sm">
                    <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-semibold">
                      {profileData.user_info?.role === "admin"
                        ? "Administrator"
                        : "Participant"}
                    </span>
                    <span className="text-gray-600">
                      Member since{" "}
                      {new Date(profileData.joined_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">
                  {profileData.total_registrations || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Events Registered</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {profileData.completed_webinars || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Completed Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {(profileData.total_registrations || 0) -
                    (profileData.completed_webinars || 0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Upcoming Events</p>
              </div>
            </div>
          </div>

          {/* Edit Name Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleUpdateName}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(profileData.user_info?.first_name || "");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800">
                      {profileData.user_info?.first_name ||
                        profileData.user_info?.username}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-pink-500 hover:text-pink-600 text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                  {profileData.user_info?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-600 flex flex-col">
      <Header 
        setView={setView} 
        currentView={view} 
        userName={userName}
        notifications={notifications}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {eventsError && (
          <div className="text-sm text-red-500 mb-4">{eventsError}</div>
        )}
        {view === "home" && <HomeScreen />}
        {view === "listing" && <ListingScreen />}
        {view === "details" && <DetailsScreen />}
        {view === "confirmation" && <ConfirmationScreen />}
        {view === "my-webinars" && <MyWebinarsScreen />}
        {view === "live" && <LiveSessionScreen />}
        {view === "recordings" && <RecordingsScreen />}
        {view === "profile" && <ProfileScreen />}
      </main>
      <Footer />
    </div>
  );
};

export default UserWebinarPortal;