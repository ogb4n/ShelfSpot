'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { backendApi } from './backend-api';

interface User {
  id: string;
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
  updateProfileEmail: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    // Éviter les double-initialisations
    if (isInitialized) {
      console.log("AuthContext: Already initialized, skipping");
      return;
    }

    const initAuth = async () => {
      console.log("AuthContext: Initializing authentication");
      setIsInitialized(true);

      const token = localStorage.getItem('access_token');
      console.log("AuthContext: Token found:", !!token);

      if (token) {
        try {
          console.log("AuthContext: Getting profile from backend");
          const profile = await backendApi.getProfile();
          console.log("AuthContext: Profile received:", profile);
          setUser(profile);
        } catch (error) {
          console.log("AuthContext: Profile fetch failed, removing tokens:", error);
          // Token invalide, le supprimer complètement
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      setLoading(false);
      console.log("AuthContext: Authentication initialization complete");
    };

    initAuth();
  }, [isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      const response = await backendApi.login(email, password);

      // Store both tokens in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store access token in cookies with correct expiration (15 minutes)
      document.cookie = `access_token=${response.access_token}; path=/; max-age=${response.expires_in}`;

      setUser(response.user);

      // Setup automatic token refresh
      setupTokenRefresh(response.expires_in);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await backendApi.register(email, password, name);

      // Store both tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store access token in cookies with correct expiration
      document.cookie = `access_token=${response.access_token}; path=/; max-age=${response.expires_in}`;

      setUser(response.user);

      // Setup automatic token refresh
      setupTokenRefresh(response.expires_in);
    } catch (error) {
      throw error;
    }
  };

  const refreshTokens = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await backendApi.refreshToken(refreshToken);

    // Store new tokens
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    document.cookie = `access_token=${response.access_token}; path=/; max-age=${response.expires_in}`;

    setUser(response.user);

    // Setup next refresh
    setupTokenRefresh(response.expires_in);

    return response;
  };

  const setupTokenRefresh = (expiresIn: number) => {
    // Refresh 1 minute before token expires (or immediately if less than 2 minutes)
    const refreshTime = Math.max((expiresIn - 60) * 1000, 1000);

    setTimeout(async () => {
      try {
        await refreshTokens();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        logout(); // Force logout if refresh fails
      }
    }, refreshTime);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Remove cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

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

  const updateProfileEmail = async (email: string) => {
    try {
      const updatedUser = await backendApi.updateProfileEmail(email);
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

  const forgotPassword = async (email: string) => {
    try {
      await backendApi.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await backendApi.getProfile();
      setUser(profile);
    } catch (error) {
      // Si l'erreur est due à un token invalide, déconnecter l'utilisateur
      localStorage.removeItem('access_token');
      setUser(null);
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
    updateProfileEmail,
    resetPassword,
    forgotPassword,
    refreshUser,
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
