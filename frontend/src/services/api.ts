import axios, { AxiosInstance } from 'axios';

// Use environment variable as-is, or default to localhost with /api prefix
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        const requestPath = config.url || '';
        const isAuthEndpoint = requestPath.startsWith('/accounts/auth/');

        if (token && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        const url = error.config?.url || 'unknown';
        const status = error.response?.status || 'no response';
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${url} - Status: ${status}`, error.response?.data);
        return Promise.reject(error);
    }
);

export default apiClient;
