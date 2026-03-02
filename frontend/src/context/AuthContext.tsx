import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService from '../services/auth';
import { useNavigate } from 'react-router-dom';

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

interface AuthContextType {
    user: User | null;
    role: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshUserData: () => Promise<void>;
    isAdmin: () => boolean;
    isStudent: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Bootstrap auth state on mount
    useEffect(() => {
        const bootstrap = async () => {
            const token = authService.getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);
            try {
                const me = await authService.getMe();
                const userRole = me.role || 'student';
                
                setUser(me);
                setRole(userRole);
                
                localStorage.setItem('user', JSON.stringify(me));
                localStorage.setItem('user_role', userRole);
            } catch (error) {
                authService.logout();
                setIsAuthenticated(false);
                setUser(null);
                setRole(null);
                localStorage.removeItem('user');
                localStorage.removeItem('user_role');
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    // Refresh user profile data
    const refreshUserData = useCallback(async () => {
        try {
            const me = await authService.getMe();
            const userRole = me.role || 'student';
            
            setUser(me);
            setRole(userRole);
            
            localStorage.setItem('user', JSON.stringify(me));
            localStorage.setItem('user_role', userRole);
        } catch (error) {
            // If refresh fails, logout user
            logout();
        }
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<any> => {
        try {
            const response = await authService.login(username, password);
            const userData = response.user;
            const userRole = userData.role || 'student';
            
            setUser(userData);
            setIsAuthenticated(true);
            setRole(userRole);
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('user_role', userRole);
            
            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            await authService.register(username, email, password);
            return true;
        } catch (error) {
            throw error;
        }
    }, []);

    const logout = useCallback((): void => {
        // Clear auth service
        authService.logout();
        
        // Clear state
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }, []);

    const isAdmin = useCallback((): boolean => {
        return role === 'admin';
    }, [role]);

    const isStudent = useCallback((): boolean => {
        return role === 'student';
    }, [role]);

    const value: AuthContextType = {
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUserData,
        isAdmin,
        isStudent,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
