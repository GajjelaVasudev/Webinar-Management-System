import React from 'react';
import RoleProtectedRoute from './RoleProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Convenience wrapper for admin-only routes
 * Usage: <AdminRoute><AdminDashboard /></AdminRoute>
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      {children}
    </RoleProtectedRoute>
  );
};

export default AdminRoute;
