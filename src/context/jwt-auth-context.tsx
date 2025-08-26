"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JWTAuthService } from '@/lib/auth/jwt-service';
import { authConfig } from '@/lib/auth-config';
import { TokenRefreshManager } from '@/lib/auth/token-refresh';
import type { UserRole } from '@prisma/client';

// JWT Auth User Interface (simplified from existing types)
export interface JWTUser {
  id: string;
  username: string;
  role: UserRole;
  type: 'user' | 'municipality' | 'company';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  companyId?: string;
}

interface JWTAuthContextType {
  // Auth State
  user: JWTUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth Methods
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Utility Methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getAccessToken: () => string | null;
}

const JWTAuthContext = createContext<JWTAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => false,
  hasRole: () => false,
  hasAnyRole: () => false,
  getAccessToken: () => null,
});

export function JWTAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get access token from cookie or localStorage
  const getAccessToken = useCallback((): string | null => {
    // Try cookie first
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${authConfig.cookies.accessToken.name}=`)
      );
      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
    }
    
    // Fallback to localStorage (for Bearer token usage)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    
    return null;
  }, []);

  // Store access token in localStorage for API calls
  const setAccessToken = useCallback((token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  // Fetch current user from /api/auth/me
  const fetchCurrentUser = useCallback(async (): Promise<JWTUser | null> => {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log('🔍 fetchCurrentUser - Response not ok:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('🔍 fetchCurrentUser - Success:', data);
      
      return data.user as JWTUser;
    } catch (error) {
      console.error('🔍 fetchCurrentUser - Error:', error);
      return null;
    }
  }, [getAccessToken]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 JWTAuthProvider - Initializing auth...');
      setIsLoading(true);

      // Setup automatic token refresh
      TokenRefreshManager.setup();

      try {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          console.log('🔍 JWTAuthProvider - User authenticated:', currentUser);
          
          // Start automatic refresh for existing token
          const token = getAccessToken();
          if (token) {
            TokenRefreshManager.startAutoRefresh(token);
          }
        } else {
          console.log('🔍 JWTAuthProvider - No authenticated user');
        }
      } catch (error) {
        console.error('🔍 JWTAuthProvider - Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchCurrentUser, getAccessToken]);

  // Login method
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    console.log('🔐 JWT login attempt for:', username);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('🔐 JWT login successful:', data);

      // Store access token for Bearer auth
      if (data.token) {
        setAccessToken(data.token);
        // Start automatic token refresh
        TokenRefreshManager.startAutoRefresh(data.token);
      }

      // Fetch user data immediately after successful login
      const userData = await fetchCurrentUser();
      if (userData) {
        setUser(userData);
        console.log('🔐 JWT login - User set:', userData);
        
        // Navigate to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Failed to fetch user data after login');
      }
    } catch (error) {
      console.error('🔐 JWT login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, router, setAccessToken]);

  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    console.log('🔐 JWT logout');

    try {
      // Call logout API endpoint (will be implemented in next phase)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error('🔐 JWT logout API call failed:', error);
    } finally {
      // Stop automatic token refresh
      TokenRefreshManager.stopAutoRefresh();
      
      // Clear tokens and user state
      setAccessToken(null);
      setUser(null);
      
      // Clear cookies by setting them to expire
      if (typeof document !== 'undefined') {
        document.cookie = `${authConfig.cookies.accessToken.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${authConfig.cookies.refreshToken.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      
      // Navigate to sign-in page
      router.push('/sign-in');
    }
  }, [getAccessToken, router, setAccessToken]);

  // Refresh token method using TokenRefreshManager
  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('🔄 JWT refresh token attempt via context');
    return await TokenRefreshManager.performRefresh();
  }, []);

  // Role-based access control helpers
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const contextValue: JWTAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    getAccessToken,
  };

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}

// Custom hook to use JWT auth context
export function useJWTAuth(): JWTAuthContextType {
  const context = useContext(JWTAuthContext);
  if (!context) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}

// Export context for advanced usage
export { JWTAuthContext };