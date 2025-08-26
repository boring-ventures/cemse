// Unified JWT Authentication Hook
// This hook provides a clean interface for JWT authentication throughout the app

import { useCallback } from 'react';
import { useJWTAuth as useJWTAuthContext, type JWTUser } from '@/context/jwt-auth-context';
import type { UserRole } from '@prisma/client';

export interface AuthUser extends JWTUser {
  // Backward compatibility aliases
  user?: JWTUser;
}

export interface UseAuthReturn {
  // User state
  user: JWTUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  login: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  
  // Token management
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  
  // Role-based access control
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  
  // Utility methods for backward compatibility
  getCurrentUser: () => Promise<JWTUser | null>;
  register?: (userData: any) => Promise<any>; // Placeholder for future implementation
}

/**
 * Primary authentication hook for the application
 * Uses JWT-based authentication with role-based access control
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    isLoading,
    isAuthenticated,
    login: jwtLogin,
    logout: jwtLogout,
    refreshToken,
    hasRole,
    hasAnyRole,
    getAccessToken,
  } = useJWTAuthContext();

  // Unified login method
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    await jwtLogin(username, password);
  }, [jwtLogin]);

  // Unified logout/signOut method
  const signOut = useCallback(async (): Promise<void> => {
    await jwtLogout();
  }, [jwtLogout]);

  // Get current user (for backward compatibility)
  const getCurrentUser = useCallback(async (): Promise<JWTUser | null> => {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.user as JWTUser;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }, [getAccessToken]);

  // Placeholder register method for backward compatibility
  const register = useCallback(async (userData: any): Promise<any> => {
    throw new Error('Registration not implemented in JWT auth phase. Use direct API calls.');
  }, []);

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    login,
    signOut,
    logout: signOut, // Alias
    refreshToken,
    getAccessToken,
    hasRole,
    hasAnyRole,
    getCurrentUser,
    register,
  };
}

// Export for backward compatibility
export default useAuth;