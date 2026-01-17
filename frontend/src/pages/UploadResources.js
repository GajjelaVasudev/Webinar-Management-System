import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import styles from './UploadResources.module.css';

const UploadResources = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [webinars, setWebinars] = useState([]);
    const [selectedWebinar, setSelectedWebinar] = useState(null);
    const [recordingLink, setRecordingLink] = useState('');
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

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
            setRecordings(response.data.recordings || []);
            setRecordingLink('');
            setError(null);
        } catch (err) {
            setError('Failed to load recordings');
            console.error(err);
        }
    };

    const handleUploadRecording = async (e) => {
        e.preventDefault();

        if (!selectedWebinar) {
            setError('Please select a webinar first');
            return;
        }

        if (!recordingLink.trim()) {
            setError('Please enter a recording link');
            return;
        }

        // Basic URL validation
        try {
            new URL(recordingLink);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(false);

            const response = await apiClient.post('/recordings/', {
                event: selectedWebinar,
                recording_link: recordingLink,
            });

            setRecordings([...recordings, response.data]);
            setRecordingLink('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload recording');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRecording = async (recordingId) => {
        if (window.confirm('Delete this recording?')) {
            try {
                await apiClient.delete(`/recordings/${recordingId}/`);
                setRecordings(recordings.filter(r => r.id !== recordingId));
                alert('Recording deleted successfully');
            } catch (err) {
                alert('Failed to delete recording');
                console.error(err);
            }
        }
    };

    const selectedWebinarData = webinars.find(w => w.id === selectedWebinar);

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.uploadResources}>
            <div className={styles.container}>
                <h1>Upload Resources</h1>
                <p className={styles.subtitle}>Manage webinar recordings and learning materials</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>✓ Recording uploaded successfully!</div>}

                <div className={styles.content}>
                    {/* Webinars List */}
                    <div className={styles.webinarsList}>
                        <h2>Select Webinar</h2>
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
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources Upload Panel */}
                    {selectedWebinar ? (
                        <div className={styles.uploadPanel}>
                            <div className={styles.panelHeader}>
                                <h2>{selectedWebinarData?.title}</h2>
                                <p className={styles.webinarInfo}>
                                    {new Date(selectedWebinarData?.start_time).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Upload Form */}
                            <form onSubmit={handleUploadRecording} className={styles.uploadForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="recordingLink">Recording Link</label>
                                    <p className={styles.helpText}>
                                        Paste the link to the recorded webinar (YouTube, Vimeo, Drive, etc.)
                                    </p>
                                    <input
                                        type="url"
                                        id="recordingLink"
                                        value={recordingLink}
                                        onChange={(e) => {
                                            setRecordingLink(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="https://youtu.be/... or https://vimeo.com/..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.uploadBtn}
                                    disabled={uploading || !recordingLink.trim()}
                                >
                                    {uploading ? 'Uploading...' : '📤 Upload Recording'}
                                </button>
                            </form>

                            {/* Recordings List */}
                            <div className={styles.recordingsSection}>
                                <h3>Uploaded Recordings ({recordings.length})</h3>

                                {recordings.length > 0 ? (
                                    <div className={styles.recordingsList}>
                                        {recordings.map((recording, index) => (
                                            <div key={recording.id} className={styles.recordingItem}>
                                                <div className={styles.recordingNumber}>{index + 1}</div>
                                                <div className={styles.recordingInfo}>
                                                    <p className={styles.recordingLink}>
                                                        <a
                                                            href={recording.recording_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.link}
                                                        >
                                                            {recording.recording_link}
                                                        </a>
                                                    </p>
                                                </div>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteRecording(recording.id)}
                                                    title="Delete recording"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.emptyMessage}>No recordings uploaded yet</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.placeholderPanel}>
                            <p>👆 Select a webinar to upload resources</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadResources;

