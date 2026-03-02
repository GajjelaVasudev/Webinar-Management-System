import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import Avatar from '../components/Avatar';
import { Upload, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './UserProfilePage.css';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, logout, refreshUserData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [profileData, setProfileData] = useState(user);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate('/auth');
      return;
    }
    refreshUserData().catch(() => {
      addToast('Failed to refresh profile data', 'error');
    });
  }, [authLoading, user, navigate, refreshUserData]);

  useEffect(() => {
    setProfileData(user);
  }, [user]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await apiClient.post(
        `/accounts/users/${user.id}/upload_profile_picture/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const newUrl = response.data?.profile_picture_url;
      if (newUrl) {
        setProfileData((prev) => (prev ? { ...prev, profile_picture_url: newUrl } : prev));
      }
      addToast('Profile picture updated successfully', 'success');
      await refreshUserData();
    } catch (error: any) {
      addToast(
        error.response?.data?.detail || 'Failed to upload profile picture',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      addToast('New password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/accounts/auth/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        new_password_confirm: passwordForm.new_password_confirm,
      });

      addToast('Password changed successfully', 'success');
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      addToast(
        error.response?.data?.old_password?.[0] ||
          error.response?.data?.detail ||
          'Failed to change password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  if (authLoading || !profileData) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="user-profile-page min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              <Avatar
                username={profileData.username}
                imageUrl={profileData.profile_picture_url || profileData.profile?.profile_picture_url}
                size="xl"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Profile Picture</p>
              <p className="text-gray-900 font-medium">{profileData.username}</p>
              <p className="text-gray-600 text-sm mt-1">Click the camera icon to update</p>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                disabled
                className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Not set'}
                disabled
                className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300">
                <span className="capitalize font-medium">
                  {role === 'admin' ? '👑 Administrator' : '👤 Student'}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-6 bg-gray-50 p-6 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, old_password: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
                    required
                    minLength={8}
                    className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                  <p className="text-gray-600 text-xs mt-1">At least 8 characters</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password_confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        new_password_confirm: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                    className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                  >
                    Save Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-xs">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            } text-white`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfilePage;
