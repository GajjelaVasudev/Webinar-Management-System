import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component to protect routes based on user role
 * Usage: <RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>
 */
const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, getEffectiveRole } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    const effectiveRole = getEffectiveRole();
    
    if (!allowedRoles.includes(effectiveRole)) {
        return <Navigate to="/user-portal" replace />;
    }

    return children;
};

export default RoleProtectedRoute;

