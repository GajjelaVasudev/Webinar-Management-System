export interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

declare const authService: {
    login: (username: string, password: string) => Promise<LoginResponse>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    getUser: () => User | null;
    getToken: () => string | null;
    getUserProfile: (token: string) => Promise<{ role: string }>;
};

export default authService;