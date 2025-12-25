import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Credits } from '@/types';
import { mockUsers, hasValidCredits, getUserCredits, getCompanyProfile, getDriverProfile } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  credits: Credits | null;
  isAuthenticated: boolean;
  hasCredits: boolean;
  login: (login: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);

  const login = useCallback(async (login: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedLogin = login.trim().toLowerCase();

    // Demo credentials (mock-only)
    const demoLoginToEmail: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@flux.com', password: 'admin' },
      loja: { email: 'empresa@flux.com', password: 'loja' },
      entregador: { email: 'joao@entregador.com', password: 'entregador' },
    };

    const resolved = demoLoginToEmail[normalizedLogin];
    const resolvedEmail = resolved?.email ?? normalizedLogin;

    const foundUser = mockUsers.find(u => u.email.toLowerCase() === resolvedEmail);

    if (!foundUser) {
      return { success: false, error: 'Login ou senha incorretos' };
    }

    // If using one of the 3 demo logins, enforce its password
    if (resolved && password !== resolved.password) {
      return { success: false, error: 'Login ou senha incorretos' };
    }

    if (foundUser.isBanned) {
      return { success: false, error: 'Usuário bloqueado. Entre em contato com o suporte.' };
    }

    const userCredits = getUserCredits(foundUser.id);

    setUser(foundUser);
    setCredits(userCredits || null);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCredits(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const hasCreditsActive = user ? hasValidCredits(user) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isAuthenticated: !!user,
        hasCredits: hasCreditsActive,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
