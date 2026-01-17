import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { 
  LayoutDashboard, CalendarPlus, Users, Video, 
  LogOut, Search, Bell, Plus, Upload, 
  MoreVertical, Trash, Edit, CheckCircle, 
  FileText, Calendar, Clock, Save, UserCircle, MessageSquare
} from 'lucide-react';

// --- Types ---
type AdminView = 'dashboard' | 'schedule' | 'registrations' | 'recordings' | 'users' | 'announcements';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface Stats {
    totalWebinars: number;
    totalRegistrations: number;
    upcomingWebinars: number;
    completedWebinars: number;
}

interface Webinar {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    start_time: string;
    attendees_count: number;
    organizer_name: string;
    thumbnail?: string;
    thumbnail_url?: string;
}

interface Registration {
  id: number;
  event: number;
  event_title: string;
  user: {
    id: number;
    username: string;
    email: string;
    role?: string;
  };
  registered_on: string;
}

interface Recording {
  id: number;
  event: number;
  event_title: string;
  recording_link: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role?: string;
}

// --- Sub-Components ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-300 border-l-4 ${
      active 
        ? 'bg-white/10 border-pink-500 text-white' 
        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} className={active ? 'text-pink-500' : ''} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('100', '600')} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 text-xs font-medium text-green-500 flex items-center">
        <span className="bg-green-100 px-2 py-0.5 rounded-full mr-2">+{trend}%</span>
        <span className="text-gray-400">from last month</span>
      </div>
    )}
  </div>
);

// --- Screen Component Definitions (outside main component to prevent remounting) ---
const ScheduleFormComponent = ({ 
  formData, 
  onTitleChange, 
  onDateChange, 
  onTimeChange,
  onDurationChange,
  onPriceChange,
  onThumbnailChange,
  onDescriptionChange,
  onLiveStreamUrlChange,
  onSubmit, 
  onCancel, 
  actionLoading, 
  editingId 
}: any) => (
  <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{editingId ? 'Edit Webinar' : 'Schedule New Webinar'}</h1>
      <p className="text-gray-500">{editingId ? 'Update the details for this webinar.' : 'Create a new event and invite participants.'}</p>
    </div>

    <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Webinar Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={onTitleChange}
            placeholder="e.g. Masterclass in UX Design" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-slate-900 placeholder-slate-500" 
            autoComplete="off"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={onDateChange}
              className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="time" 
              required
              value={formData.time}
              onChange={onTimeChange}
              className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Duration (minutes)</label>
          <input 
            type="number" 
            required
            min="15"
            max="480"
            value={formData.duration}
            onChange={onDurationChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Price (USD)</label>
          <input 
            type="number" 
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={onPriceChange}
            placeholder="0 for free"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500" 
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail Image</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={onThumbnailChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900" 
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 1200x600px</p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Live Stream URL</label>
          <input 
            type="url"
            value={formData.live_stream_url}
            onChange={onLiveStreamUrlChange}
            placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500" 
          />
          <p className="text-xs text-gray-500 mt-1">Embeddable live stream URL (YouTube, Vimeo, etc.)</p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
          <textarea 
            rows={4} 
            value={formData.description}
            onChange={onDescriptionChange}
            placeholder="What will be covered..." 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full text-gray-500 font-bold hover:bg-gray-100 transition">Cancel</button>
        <button type="submit" disabled={actionLoading} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] text-white px-10 py-3 rounded-full font-bold transition flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <Save size={18} />
          <span>{editingId ? 'Save Changes' : 'Create Schedule'}</span>
        </button>
      </div>
    </form>
  </div>
);

// --- Recording Form Component ---
const RecordingFormComponent = React.memo(({
  recordingForm,
  onEventChange,
  onLinkChange,
  onSubmit,
  actionLoading,
  webinars
}: any) => (
  <form onSubmit={onSubmit} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">Webinar</label>
      <select
        required
        value={recordingForm.event}
        onChange={onEventChange}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900"
      >
        <option value="">Select webinar</option>
        {webinars.map((w: Webinar) => (
          <option key={w.id} value={w.id}>{w.title}</option>
        ))}
      </select>
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-bold text-slate-700 mb-1">Recording Link</label>
      <input
        required
        type="url"
        value={recordingForm.recording_link}
        onChange={onLinkChange}
        placeholder="https://..."
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 placeholder-slate-500"
        autoComplete="off"
      />
    </div>
    <div className="md:col-span-3 flex justify-end">
      <button type="submit" disabled={actionLoading} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed">
        <Upload size={16} />
        <span>Add Recording</span>
      </button>
    </div>
  </form>
));

const AdminDashboard: React.FC = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalWebinars: 0,
    totalRegistrations: 0,
    upcomingWebinars: 0,
    completedWebinars: 0,
  });
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [recordingForm, setRecordingForm] = useState({ event: '', recording_link: '' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [webinarSearchTerm, setWebinarSearchTerm] = useState<string>('');
  const [sliderScrollPosition, setSliderScrollPosition] = useState<number>(0);
  const webinarSliderRef = useRef<HTMLDivElement>(null);
  const [roleManagementForm, setRoleManagementForm] = useState({ username: '', role: 'user' });
  
  // Form state for scheduling
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    price: 0,
    thumbnail: null as File | null,
    live_stream_url: '',
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
      onCancel: () => setConfirmModal({ ...confirmModal, isOpen: false }),
    });
  };

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [webinarsRes, recordingsRes, registrationsRes, statsRes, usersRes, announcementsRes] = await Promise.all([
        apiClient.get('/webinars/'),
        apiClient.get('/recordings/'),
        apiClient.get('/registrations/'),
        apiClient.get('/stats/dashboard/'),
        apiClient.get('/users/admin/'),
        apiClient.get('/announcements/'),
      ]);
      
      const webinarsData = webinarsRes.data.results || webinarsRes.data;
      const recordingsData = recordingsRes.data.results || recordingsRes.data;
      const registrationsData = registrationsRes.data.results || registrationsRes.data;
      const statsData = statsRes.data;
      const usersData = usersRes.data.results || usersRes.data;
      const announcementsData = announcementsRes.data.results || announcementsRes.data;
      
      setWebinars(webinarsData);
      setRecordings(recordingsData);
      setRegistrations(registrationsData);
      setUsers(usersData);
      setAnnouncements(announcementsData);
      
      // Fetch notifications separately
      fetchNotifications();
      
      setStats({
        totalWebinars: statsData.total_webinars ?? webinarsData.length,
        totalRegistrations: statsData.total_registrations ?? registrationsData.length,
        upcomingWebinars: statsData.upcoming_webinars ?? 0,
        completedWebinars: statsData.completed_webinars ?? 0,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      addToast('error', 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      addToast('error', error);
    }
  }, [error]);

  const handleDeleteWebinar = async (webinarId: number): Promise<void> => {
    showConfirm(
      'Delete Webinar',
      'Are you sure? This action cannot be undone.',
      async () => {
        try {
          await apiClient.delete(`/webinars/${webinarId}/`);
          setWebinars(webinars.filter(w => w.id !== webinarId));
          fetchDashboardData();
          addToast('success', 'Webinar deleted');
        } catch (err) {
          addToast('error', 'Failed to delete webinar');
          console.error(err);
        }
      }
    );
  };

  const handleEditWebinar = (webinar: Webinar) => {
    setEditingId(webinar.id);
    setFormData({
      title: webinar.title,
      description: webinar.description,
      date: webinar.date,
      time: webinar.time,
      duration: webinar.duration || 60,
      price: 0,
      thumbnail: null,
      live_stream_url: (webinar as any).live_stream_url || '',
    });
    setView('schedule');
  };

  const handleRecordingCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post('/recordings/', {
        event: Number(recordingForm.event),
        recording_link: recordingForm.recording_link,
      });
      setRecordingForm({ event: '', recording_link: '' });
      fetchDashboardData();
      addToast('success', 'Recording added');
    } catch (err: any) {
      addToast('error', 'Failed to create recording');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordingDelete = async (recordingId: number) => {
    showConfirm(
      'Delete Recording',
      'This will permanently remove the recording from the system.',
      async () => {
        try {
          await apiClient.delete(`/recordings/${recordingId}/`);
          setRecordings(recordings.filter(r => r.id !== recordingId));
          addToast('success', 'Recording deleted');
        } catch (err) {
          addToast('error', 'Failed to delete recording');
          console.error(err);
        }
      }
    );
  };

  const handleAnnouncementSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      addToast('error', 'Please fill all announcement fields');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post('/announcements/send_to_all/', announcementForm);
      setAnnouncements([response.data, ...announcements]);
      setAnnouncementForm({ title: '', content: '' });
      addToast('success', 'Announcement sent to all users');
    } catch (err: any) {
      addToast('error', err?.response?.data?.error || 'Failed to send announcement');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnouncementDelete = async (announcementId: number) => {
    showConfirm(
      'Delete Announcement',
      'This will permanently remove the announcement.',
      async () => {
        try {
          await apiClient.delete(`/announcements/${announcementId}/`);
          setAnnouncements(announcements.filter(a => a.id !== announcementId));
          addToast('success', 'Announcement deleted');
        } catch (err) {
          addToast('error', 'Failed to delete announcement');
          console.error(err);
        }
      }
    );
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/notifications/recent/');
      setNotifications(data || []);
      
      const countRes = await apiClient.get('/notifications/unread_count/');
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
      await apiClient.post('/notifications/mark_all_as_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteRegistration = async (registrationId: number): Promise<void> => {
    showConfirm(
      'Remove Registration',
      'This will unregister the user from the webinar.',
      async () => {
        try {
          await apiClient.delete(`/registrations/${registrationId}/`);
          setRegistrations(registrations.filter(r => r.id !== registrationId));
          fetchDashboardData();
          addToast('success', 'Registration removed');
        } catch (err) {
          addToast('error', 'Failed to remove registration');
          console.error(err);
        }
      }
    );
  };

  const handleScheduleWebinar = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('duration', String(formData.duration));
      data.append('price', String(formData.price));
      if (formData.live_stream_url) {
        data.append('live_stream_url', formData.live_stream_url);
      }
      if (formData.thumbnail) {
        data.append('thumbnail', formData.thumbnail);
      }

      if (editingId) {
        await apiClient.put(`/webinars/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('success', 'Webinar updated');
      } else {
        await apiClient.post('/webinars/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('success', 'Webinar scheduled');
      }
      setFormData({ title: '', description: '', date: '', time: '', duration: 60, price: 0, thumbnail: null, live_stream_url: '' });
      setEditingId(null);
      setView('dashboard');
      fetchDashboardData();
    } catch (err: any) {
      addToast('error', (editingId ? 'Failed to update' : 'Failed to schedule') + ' webinar');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Calculate filtered webinars before useCallback definitions
  const filteredWebinars = webinars.filter(w =>
    w.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
    (w.description || '').toLowerCase().includes(filterTerm.toLowerCase())
  );

  // Render screen content based on view without component recreation
  const renderScreenContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
                 <p className="text-gray-500 mt-1">Welcome back, {user?.username}. Here is what's happening today.</p>
              </div>
              <button onClick={() => setView('schedule')} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-pink-500/30 transition flex items-center">
                 <Plus size={18} className="mr-2" /> Create Webinar
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Webinars" value={stats.totalWebinars} icon={Video} color="bg-purple-100" trend="12" />
              <StatCard label="Total Registrations" value={stats.totalRegistrations} icon={Users} color="bg-pink-100" trend="8" />
              <StatCard label="Upcoming Events" value={stats.upcomingWebinars} icon={Calendar} color="bg-blue-100" trend="4" />
              <StatCard label="Completed Events" value={stats.completedWebinars} icon={CheckCircle} color="bg-green-100" trend="15" />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Webinars Table */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">All Webinars</h3>
                  <input
                    type="text"
                    value={webinarSearchTerm}
                    onChange={(e) => setWebinarSearchTerm(e.target.value)}
                    placeholder="Search webinars by title..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                  />
                </div>
                
                {/* Horizontal Slider Container */}
                <div className="relative">
                  {/* Left Arrow Button */}
                  <button
                    onClick={() => {
                      if (webinarSliderRef.current) {
                        webinarSliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                      }
                    }}
                    disabled={sliderScrollPosition === 0}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Webinars Slider */}
                  <div
                    ref={webinarSliderRef}
                    onScroll={() => {
                      if (webinarSliderRef.current) {
                        setSliderScrollPosition(webinarSliderRef.current.scrollLeft);
                      }
                    }}
                    className="flex gap-4 overflow-x-hidden scroll-smooth"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {filteredWebinars
                      .filter(w => w.title.toLowerCase().includes(webinarSearchTerm.toLowerCase()))
                      .map((webinar) => (
                        <div
                          key={webinar.id}
                          className="flex-shrink-0 w-72 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">{webinar.title}</h4>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-2">
                              <button
                                onClick={() => handleEditWebinar(webinar)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteWebinar(webinar.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Date:</span>
                              <span>{new Date(webinar.start_time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Organizer:</span>
                              <span className="truncate">{webinar.organizer_name}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Registrations:</span>
                              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-bold">{webinar.attendees_count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    onClick={() => {
                      if (webinarSliderRef.current) {
                        webinarSliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                      }
                    }}
                    disabled={webinarSliderRef.current ? sliderScrollPosition >= webinarSliderRef.current.scrollWidth - webinarSliderRef.current.clientWidth - 10 : false}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Active Webinars Sidebar */}
              <div className="bg-[#1e1b4b] rounded-2xl p-6 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[50px] opacity-20"></div>
                 
                 <h3 className="font-bold text-lg mb-6 relative z-10">Upcoming Webinars</h3>
                 <div className="space-y-4 relative z-10">
                   {filteredWebinars.filter(w => new Date(w.start_time) >= new Date()).slice(0, 3).map(w => (
                       <div key={w.id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:bg-white/20 transition cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-sm">{w.title}</h4>
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500">Upcoming</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-300">
                             <span>{new Date(w.start_time).toLocaleDateString()}</span>
                             <span>{w.attendees_count} Regs</span>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button onClick={() => setView('recordings')} className="w-full mt-6 py-3 rounded-xl border border-white/20 hover:bg-white hover:text-[#1e1b4b] font-bold text-sm transition">
                    Manage Recordings
                 </button>
              </div>
            </div>
          </div>
        );
      case 'registrations':
        return (
          <div className="animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                   <h1 className="text-3xl font-extrabold text-slate-900">Manage Registrations</h1>
                   <p className="text-gray-500 mt-1">View participant registrations across all webinars.</p>
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">User</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Webinar</th>
                        <th className="px-4 py-3">Registered</th>
                        <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-700">{reg.user.username}</td>
                          <td className="px-4 py-3 text-gray-600">{reg.user.email}</td>
                          <td className="px-4 py-3 text-gray-600">{reg.event_title}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(reg.registered_on).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right space-x-3">
                            <button onClick={() => handleDeleteRegistration(reg.id)} className="text-red-500 hover:text-red-700">
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {registrations.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">No registrations yet</p>
                  </div>
                )}
             </div>
          </div>
        );
      case 'users':
        return (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Users & Roles</h1>
                <p className="text-gray-500 mt-1">Manage users and their roles.</p>
              </div>
            </div>

            {/* Role Management Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Update User Role</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!roleManagementForm.username.trim()) {
                    addToast('error', 'Please enter a username');
                    return;
                  }
                  const targetUser = users.find(u => u.username.toLowerCase() === roleManagementForm.username.toLowerCase());
                  if (!targetUser) {
                    addToast('error', 'User not found');
                    return;
                  }
                  if (targetUser.username === user?.username) {
                    addToast('error', 'You cannot change your own role');
                    return;
                  }
                  addToast('success', `${targetUser.username}'s role updated to ${roleManagementForm.role}`);
                  setRoleManagementForm({ username: '', role: 'user' });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={roleManagementForm.username}
                      onChange={(e) => setRoleManagementForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                    <select
                      value={roleManagementForm.role}
                      onChange={(e) => setRoleManagementForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-900"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={!roleManagementForm.username.trim()}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <UserCircle size={18} />
                      Update Role
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
              <h2 className="text-lg font-bold text-slate-900 mb-6">All Users</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => {
                    const isOwnUser = u.username === user?.username;
                    return (
                      <tr key={u.id} className={`${isOwnUser ? 'bg-blue-50' : 'hover:bg-gray-50'} transition`}>
                        <td className="px-4 py-3 font-bold text-slate-700 flex items-center space-x-2">
                          <UserCircle size={18} className="text-pink-500" />
                          <span>{u.username}{isOwnUser && <span className="text-xs ml-2 text-blue-600 font-semibold">(You)</span>}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setRoleManagementForm({ username: u.username, role: u.role || 'user' })}
                            disabled={isOwnUser}
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">No users found</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'recordings':
        return (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900">Session Recordings</h1>
                <p className="text-gray-500 mt-1">View and manage recorded webinar sessions.</p>
             </div>

             <RecordingFormComponent
               recordingForm={recordingForm}
               onEventChange={handleRecordingEventChange}
               onLinkChange={handleRecordingLinkChange}
               onSubmit={handleRecordingCreate}
               actionLoading={actionLoading}
               webinars={webinars}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recordings.map(recording => (
                   <div key={recording.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <Video size={24} />
                         </div>
                         <button onClick={() => handleRecordingDelete(recording.id)} className="text-red-500 hover:text-red-700">
                          <Trash size={16} />
                         </button>
                      </div>
                      
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{recording.event_title}</h3>
                      <p className="text-xs text-gray-500 mb-6">Recording available</p>

                      <div className="mt-auto">
                         <a href={recording.recording_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-bold text-sm transition">
                            View Recording
                         </a>
                      </div>
                   </div>
                ))}
                
                {recordings.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Video size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">No recordings available yet</p>
                  </div>
                )}
             </div>
          </div>
        );
      case 'announcements':
        return (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900">Announcements</h1>
              <p className="text-gray-500 mt-1">Send announcements to all registered users.</p>
            </div>

            {/* Announcement Form */}
            <form onSubmit={handleAnnouncementSend} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Send New Announcement</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={handleAnnouncementTitleChange}
                    placeholder="Announcement title"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-900"
                    required
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={handleAnnouncementContentChange}
                    placeholder="Announcement message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={20} />
                      Send to All Users
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Announcements List */}
            <h2 className="text-xl font-bold text-slate-900 mb-6">Previous Announcements</h2>
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{announcement.title}</h3>
                      <p className="text-sm text-gray-500">
                        By {announcement.sender_username} • {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAnnouncementDelete(announcement.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                  <p className="text-gray-700">{announcement.content}</p>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">No announcements yet</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Callback functions for form inputs to prevent state object replacement
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, title: e.target.value}));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, date: e.target.value}));
  }, []);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, time: e.target.value}));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({...prev, description: e.target.value}));
  }, []);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, duration: parseInt(e.target.value) || 60}));
  }, []);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}));
  }, []);

  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({...prev, thumbnail: file}));
    }
  }, []);

  const handleLiveStreamUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, live_stream_url: e.target.value}));
  }, []);

  const handleScheduleCancel = useCallback(() => {
    setView('dashboard');
    setEditingId(null);
    setFormData({ title: '', description: '', date: '', time: '', duration: 60, price: 0, thumbnail: null, live_stream_url: '' });
  }, []);

  // Recording form handlers
  const handleRecordingEventChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordingForm(prev => ({...prev, event: e.target.value}));
  }, []);

  const handleRecordingLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRecordingForm(prev => ({...prev, recording_link: e.target.value}));
  }, []);

  // Announcement form handlers
  const handleAnnouncementTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAnnouncementForm(prev => ({...prev, title: e.target.value}));
  }, []);

  const handleAnnouncementContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnnouncementForm(prev => ({...prev, content: e.target.value}));
  }, []);

  const handleFilterTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTerm(e.target.value);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1b4b] flex flex-col relative shadow-2xl z-20 hidden md:flex">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1e1b4b] to-[#0f0e24] z-0"></div>
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#db2777] to-transparent opacity-20 z-0"></div>

         <div className="relative z-10 px-6 py-8">
            <div className="text-2xl font-extrabold text-white tracking-widest flex items-center space-x-2">
               <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg"></div>
               <span>ADMIN</span>
            </div>
         </div>

         <nav className="relative z-10 flex-1 py-4">
            <div className="px-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Main Menu</div>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <SidebarItem icon={CalendarPlus} label="Schedule Event" active={view === 'schedule'} onClick={() => setView('schedule')} />
            <SidebarItem icon={Users} label="Registrations" active={view === 'registrations'} onClick={() => setView('registrations')} />
            <SidebarItem icon={Video} label="Recordings" active={view === 'recordings'} onClick={() => setView('recordings')} />
            <SidebarItem icon={MessageSquare} label="Announcements" active={view === 'announcements'} onClick={() => setView('announcements')} />
            <SidebarItem icon={UserCircle} label="Users" active={view === 'users'} onClick={() => setView('users')} />
         </nav>

         <div className="relative z-10 p-6 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
               <LogOut size={20} />
               <span>Logout</span>
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Header */}
         <header className="bg-white border-b border-gray-100 h-20 px-8 flex justify-between items-center shadow-sm z-10">
            <div className="md:hidden text-[#1e1b4b] font-bold">ADMIN PANEL</div>
            
            <div className="hidden md:flex relative w-96">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input 
                 type="text" 
                 value={filterTerm}
                 onChange={handleFilterTermChange}
                 placeholder="Search webinars..." 
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition text-sm text-slate-900 placeholder-slate-500" 
               />
            </div>

            <div className="flex items-center space-x-6">
               <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="cursor-pointer"
                  >
                    <Bell size={20} className="text-gray-500 hover:text-pink-500 transition" />
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
                            onClick={markAllAsRead}
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
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
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
               <div className="h-8 w-[1px] bg-gray-200"></div>
               <div className="flex items-center space-x-3">
                  <div className="text-right">
                     <div className="text-sm font-bold text-slate-800">{user?.username}</div>
                      <div className="text-xs text-gray-500 uppercase">{role || 'admin'}</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
               </div>
            </div>
         </header>

         {/* Content Area */}
         <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50 relative">
          {view === 'schedule' ? (
            <ScheduleFormComponent 
              formData={formData}
              onTitleChange={handleTitleChange}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
              onDurationChange={handleDurationChange}
              onPriceChange={handlePriceChange}
              onThumbnailChange={handleThumbnailChange}
              onDescriptionChange={handleDescriptionChange}
              onLiveStreamUrlChange={handleLiveStreamUrlChange}
              onSubmit={handleScheduleWebinar}
              onCancel={handleScheduleCancel}
              actionLoading={actionLoading}
              editingId={editingId}
            />
          ) : (
            renderScreenContent()
          )}
         </main>
      </div>

      {/* Confirmation Modal Overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in scale-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-900">{confirmModal.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{confirmModal.message}</p>
            </div>
            <div className="px-6 pb-6 flex justify-end space-x-3">
              <button
                onClick={confirmModal.onCancel}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-slate-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Overlay */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] px-4 py-3 rounded-xl shadow-lg border text-sm text-white flex items-start space-x-3 animate-in slide-in-from-bottom-4 duration-200
              ${toast.type === 'success' ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-200' : ''}
              ${toast.type === 'error' ? 'bg-red-500 border-red-200' : ''}
              ${toast.type === 'info' ? 'bg-slate-700 border-slate-500' : ''}
            `}
          >
            <div className="pt-0.5 font-semibold uppercase text-[11px] tracking-wide opacity-80">{toast.type}</div>
            <div className="font-medium leading-snug">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

