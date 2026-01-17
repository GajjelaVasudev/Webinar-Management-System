import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import styles from './ScheduleWebinar.module.css';

const ScheduleWebinar = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isAdmin()) {
        navigate('/');
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.date || !formData.time) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            await apiClient.post('/webinars/', {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to schedule webinar');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className={styles.scheduleWebinar}>
            <div className={styles.container}>
                <h1>Schedule New Webinar</h1>
                <p className={styles.subtitle}>Create and manage your upcoming webinar sessions</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>✓ Webinar scheduled successfully!</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Webinar Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter webinar title"
                            maxLength="200"
                            required
                        />
                        <span className={styles.charCount}>{formData.title.length}/200</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter webinar description (optional)"
                            rows="5"
                            maxLength="1000"
                        />
                        <span className={styles.charCount}>{formData.description.length}/1000</span>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="date">Date *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={getTodayDate()}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="time">Time *</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.preview}>
                        <h3>Preview</h3>
                        <div className={styles.previewCard}>
                            <p><strong>Title:</strong> {formData.title || '(No title yet)'}</p>
                            <p><strong>Date:</strong> {formData.date ? new Date(formData.date).toLocaleDateString() : '(Not set)'}</p>
                            <p><strong>Time:</strong> {formData.time || '(Not set)'}</p>
                            {formData.description && (
                                <p><strong>Description:</strong> {formData.description}</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Webinar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleWebinar;

