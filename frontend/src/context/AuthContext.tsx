import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth';

interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    role: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    switchRole: (newRole: string) => void;
    getEffectiveRole: () => string | null;
    isAdmin: () => boolean;
    isViewingAs: (checkRole: string) => boolean;
    viewingAsRole: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [viewingAsRole, setViewingAsRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const bootstrap = async () => {
            const token = authService.getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);
            try {
                const profile = await authService.getUserProfile();
                const me = await authService.getMe();
                const mergedUser = { id: me.id, username: me.username, email: me.email, role: profile.role };
                setUser(mergedUser);
                setRole(profile.role);
                localStorage.setItem('user', JSON.stringify(mergedUser));
                localStorage.setItem('user_role', profile.role);
            } catch (error) {
                console.error('Failed to bootstrap auth state:', error);
                setIsAuthenticated(false);
                setUser(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    const fetchUserProfile = async (): Promise<string | null> => {
        try {
            const userProfile = await authService.getUserProfile();
            setRole(userProfile.role);
            localStorage.setItem('user_role', userProfile.role);
            return userProfile.role;
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setRole('user');
            return 'user';
        }
    };

    const login = async (username: string, password: string): Promise<any> => {
        try {
            const response = await authService.login(username, password);
            const latestRole = await fetchUserProfile();
            const mergedUser = { ...response.user, role: latestRole || response.user.role || 'user' };
            setUser(mergedUser);
            setIsAuthenticated(true);
            setRole(mergedUser.role || 'user');
            localStorage.setItem('user', JSON.stringify(mergedUser));
            localStorage.setItem('user_role', mergedUser.role || 'user');
            setViewingAsRole(null);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            await authService.register(username, email, password);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = (): void => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        setViewingAsRole(null);
    };

    const switchRole = (newRole: string): void => {
        if (role === 'admin') {
            setViewingAsRole(newRole === viewingAsRole ? null : newRole);
        }
    };

    const getEffectiveRole = (): string | null => {
        if (viewingAsRole && role === 'admin') {
            return viewingAsRole;
        }
        return role;
    };

    const isAdmin = (): boolean => role === 'admin';

    const isViewingAs = (checkRole: string): boolean => {
        if (!isAdmin()) return false;
        return viewingAsRole === checkRole;
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            isAuthenticated,
            loading,
            login,
            register,
            logout,
            switchRole,
            getEffectiveRole,
            isAdmin,
            isViewingAs,
            viewingAsRole,
        }}>
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
