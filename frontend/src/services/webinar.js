import apiClient from './api';

const webinarService = {
    getWebinars: async () => {
        const response = await apiClient.get('/webinars/');
        return response.data;
    },

    getWebinar: async (id) => {
        const response = await apiClient.get(`/webinars/${id}/`);
        return response.data;
    },

    registerWebinar: async (webinarId) => {
        const response = await apiClient.post(`/webinars/${webinarId}/register/`);
        return response.data;
    },

    getRecordings: async () => {
        const response = await apiClient.get('/recordings/');
        return response.data;
    },

    getRecording: async (id) => {
        const response = await apiClient.get(`/recordings/${id}/`);
        return response.data;
    },
};

export default webinarService;
