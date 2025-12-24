import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Credits } from '@/types';
import { mockUsers, hasValidCredits, getUserCredits, getCompanyProfile, getDriverProfile } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  credits: Credits | null;
  isAuthenticated: boolean;
  hasCredits: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user by email (in real app, validate password too)
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'E-mail ou senha incorretos' };
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
