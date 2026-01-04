import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import webinarService from '../services/webinar';
import styles from './Home.module.css';

const Home = () => {
    const [webinars, setWebinars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWebinars();
    }, []);

    const fetchWebinars = async () => {
        try {
            const data = await webinarService.getWebinars();
            setWebinars(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setError('Failed to load webinars');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading webinars...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Available Webinars</h1>
                <p>Join our upcoming webinars and learn from industry experts</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {webinars.length === 0 ? (
                <div className={styles.empty}>
                    <p>No webinars available at the moment.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {webinars.map((webinar) => (
                        <div key={webinar.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h2>{webinar.title}</h2>
                                <p className={styles.description}>
                                    {webinar.description}
                                </p>
                                <div className={styles.meta}>
                                    <span className={styles.date}>
                                        📅 {new Date(webinar.start_time).toLocaleDateString()}
                                    </span>
                                    <span className={styles.time}>
                                        🕐 {new Date(webinar.start_time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                {webinar.speaker && (
                                    <p className={styles.speaker}>
                                        👤 {webinar.speaker}
                                    </p>
                                )}
                            </div>
                            <Link
                                to={`/webinar/${webinar.id}`}
                                className={styles.button}
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
