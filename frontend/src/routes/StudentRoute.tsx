import React from 'react';
import RoleProtectedRoute from './RoleProtectedRoute';

interface StudentRouteProps {
  children: React.ReactNode;
}

/**
 * Convenience wrapper for student-only routes
 * Usage: <StudentRoute><StudentPortal /></StudentRoute>
 */
const StudentRoute: React.FC<StudentRouteProps> = ({ children }) => {
  return (
    <RoleProtectedRoute allowedRoles={['student']}>
      {children}
    </RoleProtectedRoute>
  );
};

export default StudentRoute;
