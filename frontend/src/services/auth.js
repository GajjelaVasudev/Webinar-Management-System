import apiClient from './api';

const authService = {
    login: async (username, password) => {
        const response = await apiClient.post('/auth/login/', {
            username,
            password,
        });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await apiClient.post('/auth/register/', {
            username,
            email,
            password,
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    getToken: () => {
        return localStorage.getItem('access_token');
    },
};

export default authService;
