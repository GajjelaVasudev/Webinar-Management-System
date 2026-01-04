import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import webinarService from '../services/webinar';
import styles from './WebinarDetail.module.css';

const WebinarDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [webinar, setWebinar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        fetchWebinar();
    }, [id]);

    const fetchWebinar = async () => {
        try {
            const data = await webinarService.getWebinar(id);
            setWebinar(data);
        } catch (err) {
            setError('Failed to load webinar details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            await webinarService.registerWebinar(id);
            setRegistered(true);
            alert('Successfully registered for the webinar!');
        } catch (err) {
            if (err.response?.status === 400) {
                setError('You are already registered for this webinar');
            } else {
                setError('Failed to register. Please try again.');
            }
            console.error(err);
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading webinar details...</div>;
    }

    if (!webinar) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Webinar not found</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
                ← Back to Webinars
            </button>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>{webinar.title}</h1>
                    <p className={styles.meta}>
                        📅 {new Date(webinar.start_time).toLocaleDateString()} at{' '}
                        {new Date(webinar.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.details}>
                    <div className={styles.main}>
                        <h2>Description</h2>
                        <p>{webinar.description}</p>

                        {webinar.speaker && (
                            <div className={styles.speaker}>
                                <h2>Speaker</h2>
                                <p>{webinar.speaker}</p>
                            </div>
                        )}

                        {webinar.content && (
                            <div className={styles.section}>
                                <h2>Content</h2>
                                <p>{webinar.content}</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.card}>
                            <h3>Webinar Info</h3>
                            <div className={styles.info}>
                                <span className={styles.label}>Start:</span>
                                <span>
                                    {new Date(webinar.start_time).toLocaleString()}
                                </span>
                            </div>
                            {webinar.end_time && (
                                <div className={styles.info}>
                                    <span className={styles.label}>End:</span>
                                    <span>
                                        {new Date(webinar.end_time).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {!registered && (
                                <button
                                    className={styles.registerBtn}
                                    onClick={handleRegister}
                                    disabled={registering || registered}
                                >
                                    {registering
                                        ? 'Registering...'
                                        : 'Register Now'}
                                </button>
                            )}
                            {registered && (
                                <div className={styles.success}>
                                    ✓ Registered
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebinarDetail;
