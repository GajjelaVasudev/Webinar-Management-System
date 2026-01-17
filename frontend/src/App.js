import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import WebinarDetail from './pages/WebinarDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ScheduleWebinar from './pages/ScheduleWebinar';
import ManageRegistrations from './pages/ManageRegistrations';
import UploadResources from './pages/UploadResources';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import styles from './App.module.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className={styles.app}>
                    <Navbar />
                    <div className={styles.content}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/webinar/:id" element={<WebinarDetail />} />

                            {/* User Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/recordings"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-webinars"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/live-sessions"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <RoleProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/schedule-webinar"
                                element={
                                    <RoleProtectedRoute allowedRoles={['admin']}>
                                        <ScheduleWebinar />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/manage-registrations"
                                element={
                                    <RoleProtectedRoute allowedRoles={['admin']}>
                                        <ManageRegistrations />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/upload-resources"
                                element={
                                    <RoleProtectedRoute allowedRoles={['admin']}>
                                        <UploadResources />
                                    </RoleProtectedRoute>
                                }
                            />

                            {/* Catch all - redirect to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
