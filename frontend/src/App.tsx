import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UserWebinarPortal from './pages/UserWebinarPortal';
import AdminDashboard from './pages/AdminDashboard';
import InboxPage from './pages/InboxPage';
import RoleProtectedRoute from './routes/RoleProtectedRoute';

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
      <Route path="/user-portal" element={<UserWebinarPortal />} />
      <Route path="/inbox" element={<InboxPage />} />
      <Route path="/admin" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />
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
