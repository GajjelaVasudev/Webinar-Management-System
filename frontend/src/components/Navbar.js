import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { isAuthenticated, user, role, logout, isAdmin, switchRole, viewingAsRole } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const effectiveRole = viewingAsRole || role;
    const isViewingAsUser = isAdmin() && viewingAsRole === 'user';
    const isViewingAsAdmin = isAdmin() && viewingAsRole === 'admin';

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link to="/">🎤 Webinar System</Link>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className={styles.hamburger}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation Menu */}
                <ul className={`${styles.menu} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <li>
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                            Home
                        </Link>
                    </li>

                    {isAuthenticated ? (
                        <>
                            {/* Admin Menu Items */}
                            {isAdmin() && effectiveRole === 'admin' && (
                                <>
                                    <li className={styles.adminItem}>
                                        <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                            📊 Dashboard
                                        </Link>
                                    </li>
                                    <li className={styles.adminItem}>
                                        <Link to="/admin/schedule-webinar" onClick={() => setMobileMenuOpen(false)}>
                                            📅 Schedule Webinar
                                        </Link>
                                    </li>
                                    <li className={styles.adminItem}>
                                        <Link to="/admin/manage-registrations" onClick={() => setMobileMenuOpen(false)}>
                                            👥 Manage Registrations
                                        </Link>
                                    </li>
                                    <li className={styles.adminItem}>
                                        <Link to="/admin/upload-resources" onClick={() => setMobileMenuOpen(false)}>
                                            📁 Upload Resources
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* User Menu Items */}
                            {effectiveRole === 'user' && (
                                <>
                                    <li>
                                        <Link to="/my-webinars" onClick={() => setMobileMenuOpen(false)}>
                                            My Webinars
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/live-sessions" onClick={() => setMobileMenuOpen(false)}>
                                            Live Sessions
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/recordings" onClick={() => setMobileMenuOpen(false)}>
                                            Recordings
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Role Switch for Admins */}
                            {isAdmin() && (
                                <li className={styles.roleSwitch}>
                                    <button
                                        className={`${styles.roleSwitchBtn} ${isViewingAsUser ? styles.active : ''}`}
                                        onClick={() => switchRole('user')}
                                        title="Switch to user view"
                                    >
                                        {isViewingAsUser ? '👁️ User Mode' : '👤 View as User'}
                                    </button>
                                </li>
                            )}

                            {/* User Profile */}
                            <li className={styles.userProfile}>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user?.username}</span>
                                    {role && <span className={styles.roleTag}>{role.toUpperCase()}</span>}
                                </div>
                            </li>

                            {/* Logout Button */}
                            <li>
                                <button
                                    className={styles.logoutBtn}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
