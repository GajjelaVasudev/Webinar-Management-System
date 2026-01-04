import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link to="/">🎤 Webinar System</Link>
                </div>
                <ul className={styles.menu}>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li>
                                <Link to="/dashboard">Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/recordings">Recordings</Link>
                            </li>
                            <li className={styles.user}>
                                <span>{user?.username}</span>
                            </li>
                            <li>
                                <button
                                    className={styles.logoutBtn}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
