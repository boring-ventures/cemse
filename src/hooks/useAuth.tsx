import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import { User, LoginRequest, RegisterRequest } from '@/types/api';
import { clearTokens, getToken } from '@/lib/api';
import { mapBackendRoleToFrontend } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Clear tokens if there's an error (backend not available, invalid token, etc.)
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    // Prevent multiple simultaneous login attempts
    if (loading) {
      console.log('🔐 Login already in progress, skipping...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔐 Starting login process...');
      const response = await AuthService.login(credentials);
      console.log('🔐 Login successful, using user info from response...');
      
      // Use user info from login response instead of calling getCurrentUser
      if (response.user) {
        // Handle regular users (including youth)
        const userData = response.user;
        console.log('🔐 User data from response:', userData);
        
        

         // Ensure the user object has the correct structure
         const normalizedUser = {
           id: userData.id,
           username: userData.username,
           role: mapBackendRoleToFrontend(userData.role || response.role), // Map backend role to frontend role
           firstName: userData.firstName || userData.first_name || '',
           lastName: userData.lastName || userData.last_name || '',
           email: userData.email,
           phone: userData.phone,
           profilePicture: userData.profilePicture || userData.profile_picture || null,
           isActive: userData.isActive !== undefined ? userData.isActive : true,
           createdAt: userData.createdAt || userData.created_at,
           updatedAt: userData.updatedAt || userData.updated_at
         };
        
        setUser(normalizedUser);
        console.log('🔐 User set from login response (user):', normalizedUser);
        console.log('🔐 User role:', normalizedUser.role);
      } else if (response.municipality) {
        // Convert municipality to user format
        const municipalityUser = {
          id: response.municipality.id,
          username: response.municipality.username,
          role: 'GOBIERNOS_MUNICIPALES', // Map to correct role in permissions system
          firstName: response.municipality.name,
          lastName: '',
          email: response.municipality.email,
          phone: response.municipality.phone,
          profilePicture: null,
          isActive: response.municipality.isActive,
          createdAt: response.municipality.createdAt,
          updatedAt: response.municipality.updatedAt
        };
        setUser(municipalityUser);
        console.log('🔐 User set from login response (municipality):', municipalityUser);
        console.log('🔐 Municipality role mapped to:', municipalityUser.role);
      } else if (response.company) {
        // Convert company to user format
        const companyUser = {
          id: response.company.id,
          username: response.company.username || response.company.name,
          role: 'EMPRESAS', // Map to correct role in permissions system
          firstName: response.company.name,
          lastName: '',
          email: response.company.email,
          phone: response.company.phone,
          profilePicture: null,
          isActive: response.company.isActive,
          createdAt: response.company.createdAt,
          updatedAt: response.company.updatedAt,
          // Add company-specific fields
          company: {
            id: response.company.id,
            name: response.company.name,
            description: response.company.description,
            businessSector: response.company.businessSector,
            companySize: response.company.companySize,
            foundedYear: response.company.foundedYear,
            website: response.company.website,
            address: response.company.address,
            taxId: response.company.taxId
          }
        };
        setUser(companyUser);
        console.log('🔐 User set from login response (company):', companyUser);
        console.log('🔐 Company role mapped to:', companyUser.role);
      } else {
        console.log('🔐 No user info in login response, attempting getCurrentUser...');
        // Fallback to getCurrentUser if no user info in response
        const userResponse = await AuthService.getCurrentUser();
        setUser(userResponse.user);
      }
      console.log('🔐 Login process completed successfully');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await AuthService.register(userData);
      // Registration doesn't automatically log in the user
      // They need to login separately
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('🚪 useAuth.logout - Starting logout');
      await AuthService.logout();
      console.log('✅ useAuth.logout - AuthService logout completed');
    } catch (error) {
      console.error('❌ useAuth.logout - Logout failed:', error);
    } finally {
      // Clear React state
      setUser(null);
      setLoading(false);
      console.log('✅ useAuth.logout - React state cleared');
      
      // Force redirect to login page
      if (typeof window !== 'undefined') {
        console.log('🔄 useAuth.logout - Redirecting to login');
        window.location.href = '/sign-in';
      }
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      clearTokens();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 