// Nouveau système d'authentification utilisant le backend NestJS
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { backendApi } from './backend-api';

interface User {
  id: number;
  email: string;
  name?: string;
  admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await backendApi.getProfile();
          setUser(profile);
        } catch (error) {
          // Token invalide, le supprimer
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await backendApi.login(email, password);
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await backendApi.register(email, password, name);
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const updateProfile = async (name: string) => {
    try {
      const updatedUser = await backendApi.updateProfile(name);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      await backendApi.resetPassword(email, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
