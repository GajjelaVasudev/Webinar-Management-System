import apiClient from './api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    profile_picture_url?: string | null;
    profile?: {
        profile_picture_url?: string | null;
    };
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
    profile_picture_url?: string | null;
}

const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await apiClient.post<LoginResponse>('/accounts/auth/login/', {
                username,
                password,
            });
            
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },

    register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
        try {
            const response = await apiClient.post<RegisterResponse>('/accounts/auth/register/', {
                username,
                email,
                password,
                password_confirm: password,
            });
            return response.data;
        } catch (error: any) {
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
            throw error;
        }
    },

    getMe: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>('/accounts/users/me/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;
