// New authentication system using the NestJS backend
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { backendApi } from './backend-api';

interface User {
  id: string;
  email: string;
  name?: string;
  admin?: boolean;
}

interface AuthContextType {
  readonly user: User | null;
  readonly loading: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (email: string, password: string, name?: string) => Promise<void>;
  readonly logout: () => void;
  readonly updateProfile: (name: string) => Promise<void>;
  readonly updateProfileEmail: (email: string) => Promise<void>;
  readonly resetPassword: (email: string, newPassword: string) => Promise<void>;
  readonly forgotPassword: (email: string) => Promise<void>;
  readonly refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Avoid double initializations
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
          // Invalid token, remove it completely
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      setLoading(false);
      console.log("AuthContext: Authentication initialization complete");
    };

    initAuth();
  }, [isInitialized]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await backendApi.login(email, password);

    // Store the token in localStorage and cookies
    localStorage.setItem('access_token', response.access_token);

    // Also store in cookies for the middleware
    document.cookie = `access_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours

    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const response = await backendApi.register(email, password, name);
    localStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');

    // Also remove the cookie
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    const updatedUser = await backendApi.updateProfile(name);
    setUser(updatedUser);
  }, []);

  const updateProfileEmail = useCallback(async (email: string) => {
    const updatedUser = await backendApi.updateProfileEmail(email);
    setUser(updatedUser);
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await backendApi.resetPassword(email, newPassword);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await backendApi.forgotPassword(email);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await backendApi.getProfile();
      setUser(profile);
    } catch (error) {
      // If the error is due to an invalid token, log out the user
      localStorage.removeItem('access_token');
      setUser(null);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [user, loading, login, register, logout, updateProfile, updateProfileEmail, resetPassword, forgotPassword, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
