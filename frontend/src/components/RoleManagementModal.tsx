import React, { useState, useCallback } from 'react';
import apiClient from '../services/api';
import Avatar from './Avatar';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  profile_picture_url?: string | null;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onRoleUpdate?: (userId: number, newRole: string) => void;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onRoleUpdate,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleRoleChange = useCallback(
    async (userId: number, newRole: string) => {
      setUpdatingId(userId);
      try {
        const response = await apiClient.post(
          `/accounts/users/${userId}/update_role/`,
          { role: newRole }
        );

        addToast(response.data.message, 'success');
        onRoleUpdate?.(userId, newRole);
      } catch (error: any) {
        addToast(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            'Failed to update role',
          'error'
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [onRoleUpdate]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto flex-1 p-6">
          {users.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      username={user.username}
                      imageUrl={user.profile_picture_url}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={user.role || 'student'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-200"
                    >
                      <option value="student">👤 Student</option>
                      <option value="admin">👑 Admin</option>
                    </select>

                    {updatingId === user.id && (
                      <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Close
          </button>
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

export default RoleManagementModal;
