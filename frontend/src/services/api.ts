import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Use environment variable as-is, or default to localhost with /api prefix
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - attach access token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        const requestPath = config.url || '';
        
        // Don't attach token to auth endpoints
        const isAuthEndpoint = requestPath.includes('/auth/login') || 
                               requestPath.includes('/auth/register') ||
                               requestPath.includes('/auth/verify-email') ||
                               requestPath.includes('/auth/resend-otp');

        if (token && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            const requestPath = originalRequest.url || '';
            
            // Don't try to refresh for auth endpoints
            const isAuthEndpoint = requestPath.includes('/auth/login') || 
                                   requestPath.includes('/auth/register') ||
                                   requestPath.includes('/auth/refresh');

            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the current refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No refresh token available, logout
                isRefreshing = false;
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token
                const response = await axios.post(`${apiBaseURL}/accounts/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;
                
                // Store new tokens
                localStorage.setItem('access_token', access);
                if (refresh) {
                    // If rotation is enabled, update refresh token too
                    localStorage.setItem('refresh_token', refresh);
                }

                // Update the authorization header
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;

                // Process queued requests
                processQueue(null, access);
                
                isRefreshing = false;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                processQueue(refreshError as Error, null);
                isRefreshing = false;
                
                localStorage.clear();
                window.location.href = '/auth';
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
