import React, { Context } from 'react';

export type UserRole = string | null;

export interface AuthUser {
    id?: number | string;
    username?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

export interface LoginResponse {
    access?: string;
    refresh?: string;
    user: AuthUser;
}

export interface AuthContextValue {
    user: AuthUser | null;
    role: UserRole;
    viewingAsRole: UserRole;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<LoginResponse>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    switchRole: (role: UserRole) => void;
    getEffectiveRole: () => UserRole;
    isAdmin: () => boolean;
    isViewingAs: (role: string) => boolean;
}

export const AuthContext: Context<AuthContextValue | undefined>;
export const AuthProvider: React.FC<React.PropsWithChildren<unknown>>;
export function useAuth(): AuthContextValue;
