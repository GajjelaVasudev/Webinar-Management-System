import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UserWebinarPortal from './pages/UserWebinarPortal';
import AdminDashboard from './pages/AdminDashboard';
import InboxPage from './pages/InboxPage';
import UserProfilePage from './pages/UserProfilePage';
import { ProtectedRoute, AdminRoute, StudentRoute } from './routes';

// Component to redirect authenticated users from auth page
const AuthRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin' : '/user-portal'} replace />;
  }
  
  return <AuthPage />;
};

function AppRoutes() { 
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRedirect />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      {/* Protected Routes - Require Authentication */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-portal" 
        element={
          <StudentRoute>
            <UserWebinarPortal />
          </StudentRoute>
        } 
      />
      <Route 
        path="/inbox" 
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Only Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* Catch-all - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
