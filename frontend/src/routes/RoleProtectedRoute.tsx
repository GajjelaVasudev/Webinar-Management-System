import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * Component to protect routes based on user role
 * Usage: <RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect based on their actual role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/user-portal" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
