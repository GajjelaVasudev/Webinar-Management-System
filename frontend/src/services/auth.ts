import apiClient from './api';

interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

interface RegisterResponse {
    message?: string;
    user?: User;
}

interface UserProfile {
    id: number;
    username: string;
    email: string;
    role: string;
}

const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            console.log('Auth service: Sending login request to /accounts/auth/login/');
            const response = await apiClient.post<LoginResponse>('/accounts/auth/login/', {
                username,
                password,
            });
            console.log('Auth service: Login response received', response.data);
            
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: any) {
            console.error('Auth service: Login failed', error.response?.data || error.message);
            throw error;
        }
    },

    register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
        try {
            console.log('Auth service: Sending registration request');
            const response = await apiClient.post<RegisterResponse>('/accounts/auth/register/', {
                username,
                email,
                password,
            });
            console.log('Auth service: Registration successful');
            return response.data;
        } catch (error: any) {
            console.error('Auth service: Registration failed', error.response?.data || error.message);
            throw error;
        }
    },

    logout: (): void => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
    },

    getUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('access_token');
    },

    getToken: (): string | null => {
        return localStorage.getItem('access_token');
    },

    getUserProfile: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>('/accounts/users/me/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            throw error;
        }
    },

    getMe: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>('/accounts/users/me/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            throw error;
        }
    },
};

export default authService;
