import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import webinarService from '../services/webinar';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        registeredWebinars: 0,
        recordingsAvailable: 0,
    });
    const [registeredWebinars, setRegisteredWebinars] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch webinars
            const webinarsData = await webinarService.getWebinars();
            const webinarsList = Array.isArray(webinarsData)
                ? webinarsData
                : webinarsData.results || [];

            // Fetch recordings
            const recordingsData = await webinarService.getRecordings();
            const recordingsList = Array.isArray(recordingsData)
                ? recordingsData
                : recordingsData.results || [];

            setRegisteredWebinars(webinarsList);
            setRecordings(recordingsList);
            setStats({
                registeredWebinars: webinarsList.length,
                recordingsAvailable: recordingsList.length,
            });
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Welcome, {user?.username}!</h1>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Registered Webinars</h3>
                    <p className={styles.statNumber}>
                        {stats.registeredWebinars}
                    </p>
                </div>
                <div className={styles.statCard}>
                    <h3>Available Recordings</h3>
                    <p className={styles.statNumber}>
                        {stats.recordingsAvailable}
                    </p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Your Registered Webinars</h2>
                {registeredWebinars.length === 0 ? (
                    <p className={styles.empty}>
                        You haven't registered for any webinars yet.
                    </p>
                ) : (
                    <div className={styles.list}>
                        {registeredWebinars.map((webinar) => (
                            <div key={webinar.id} className={styles.item}>
                                <div>
                                    <h3>{webinar.title}</h3>
                                    <p>
                                        {new Date(
                                            webinar.start_time
                                        ).toLocaleDateString()}{' '}
                                        at{' '}
                                        {new Date(
                                            webinar.start_time
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2>Available Recordings</h2>
                {recordings.length === 0 ? (
                    <p className={styles.empty}>
                        No recordings available yet.
                    </p>
                ) : (
                    <div className={styles.list}>
                        {recordings.map((recording) => (
                            <div key={recording.id} className={styles.item}>
                                <div>
                                    <h3>{recording.title}</h3>
                                    <p>
                                        Webinar ID: {recording.webinar_id}
                                    </p>
                                </div>
                                {recording.video_url && (
                                    <a
                                        href={recording.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                    >
                                        Watch
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
