import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import styles from './ManageRegistrations.module.css';

const ManageRegistrations = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [webinars, setWebinars] = useState([]);
    const [selectedWebinar, setSelectedWebinar] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
            return;
        }
        fetchWebinars();
    }, []);

    const fetchWebinars = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/webinars/');
            setWebinars(response.data.results || response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load webinars');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectWebinar = async (webinarId) => {
        setSelectedWebinar(webinarId);
        try {
            const response = await apiClient.get(`/webinars/${webinarId}/`);
            const attendees = response.data.attendees || [];
            setRegistrations(attendees);
            setError(null);
        } catch (err) {
            setError('Failed to load registrations');
            console.error(err);
        }
    };

    const handleRemoveRegistration = async (userId) => {
        if (window.confirm('Remove this user from the webinar?')) {
            try {
                // This would require a custom endpoint
                await apiClient.post(`/webinars/${selectedWebinar}/unregister/`, {
                    user_id: userId,
                });
                setRegistrations(registrations.filter(r => r.id !== userId));
                alert('User removed successfully');
            } catch (err) {
                alert('Failed to remove user');
                console.error(err);
            }
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedWebinarData = webinars.find(w => w.id === selectedWebinar);

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.manageRegistrations}>
            <div className={styles.container}>
                <h1>Manage Registrations</h1>
                <p className={styles.subtitle}>View and manage attendee registrations for your webinars</p>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.content}>
                    {/* Webinars List */}
                    <div className={styles.webinarsList}>
                        <h2>Webinars</h2>
                        <div className={styles.webinarsGrid}>
                            {webinars.map(webinar => (
                                <div
                                    key={webinar.id}
                                    className={`${styles.webinarCard} ${selectedWebinar === webinar.id ? styles.active : ''}`}
                                    onClick={() => handleSelectWebinar(webinar.id)}
                                >
                                    <h3>{webinar.title}</h3>
                                    <p className={styles.date}>
                                        📅 {new Date(webinar.start_time).toLocaleDateString()}
                                    </p>
                                    <p className={styles.attendees}>
                                        👥 {webinar.attendees_count || 0} attendees
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registrations Details */}
                    {selectedWebinar ? (
                        <div className={styles.registrationsPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>{selectedWebinarData?.title}</h2>
                                    <p className={styles.webinarInfo}>
                                        {new Date(selectedWebinarData?.start_time).toLocaleDateString()} •{' '}
                                        {new Date(selectedWebinarData?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statNumber}>{filteredRegistrations.length}</span>
                                        <span className={styles.statLabel}>Registered</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Search attendees by username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>

                            {filteredRegistrations.length > 0 ? (
                                <div className={styles.registrationsList}>
                                    {filteredRegistrations.map((registration, index) => (
                                        <div key={registration.id} className={styles.registrationItem}>
                                            <div className={styles.itemNumber}>{index + 1}</div>
                                            <div className={styles.itemInfo}>
                                                <p className={styles.username}>{registration.username}</p>
                                                <p className={styles.userId}>User ID: {registration.id}</p>
                                            </div>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => handleRemoveRegistration(registration.id)}
                                                title="Remove from webinar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyMessage}>
                                    {searchTerm ? 'No matching attendees found' : 'No registrations yet'}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className={styles.placeholderPanel}>
                            <p>👆 Select a webinar to view registrations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageRegistrations;

