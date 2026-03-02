import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    state: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('codered_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch {
                    localStorage.removeItem('codered_token');
                    localStorage.removeItem('codered_user');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('codered_token', data.token);
        localStorage.setItem('codered_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };

    /** Used after Google OAuth redirect – we already have the token */
    const loginWithToken = async (newToken: string) => {
        localStorage.setItem('codered_token', newToken);
        setToken(newToken);
        // Fetch the user profile using the new token
        const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${newToken}` },
        });
        localStorage.setItem('codered_user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('codered_token');
        localStorage.removeItem('codered_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, loginWithToken, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
