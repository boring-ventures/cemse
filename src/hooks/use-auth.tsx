import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { AuthService } from "@/services/auth.service";
import { User, LoginResponse } from "@/types/api";
import { mapBackendRoleToFrontend } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<LoginResponse>;
  register: (userData: {
    username: string;
    password: string;
    role: string;
  }) => Promise<{ message: string }>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount using real session
    const initAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      console.log("🔐 initAuth - Checking session from server");

      try {
        // Get current user from session API (which reads cookies)
        const result = await AuthService.getCurrentUser();
        setUser(result.user);
      } catch (error) {
        // Handle expected unauthenticated state silently
        if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
          setUser(null);
        } else {
          console.log("🔐 initAuth - Session check failed:", error);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [router]);

  /**
   * Login with cookie-based authentication
   */
  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log("🔐 useAuth.login - Starting cookie-based login...");
      const response = await AuthService.login(credentials);
      console.log("🔐 useAuth.login - Login successful:", response);

      // Handle different response types from the backend
      if (response.user) {
        // Handle regular users (including youth)
        const userData = response.user;
        console.log("🔐 User data from response:", userData);

        // Ensure the user object has the correct structure
        const normalizedUser = {
          id: userData.id,
          username: userData.username,
          role: mapBackendRoleToFrontend(userData.role || response.role),
          firstName: userData.firstName || userData.first_name || "",
          lastName: userData.lastName || userData.last_name || "",
          email: userData.email,
          phone: userData.phone,
          profilePicture: userData.profilePicture || userData.profile_picture || null,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          createdAt: userData.createdAt || userData.created_at,
          updatedAt: userData.updatedAt || userData.updated_at,
        };

        setUser(normalizedUser);
        console.log("🔐 User set from login response (user):", normalizedUser);
      } else if (response.municipality) {
        // Convert municipality to user format
        const municipalityUser = {
          id: response.municipality.id,
          username: response.municipality.username,
          role: "GOBIERNOS_MUNICIPALES",
          firstName: response.municipality.name,
          lastName: "",
          email: response.municipality.email,
          phone: response.municipality.phone,
          profilePicture: null,
          isActive: response.municipality.isActive,
          createdAt: response.municipality.createdAt,
          updatedAt: response.municipality.updatedAt,
          primaryColor: response.municipality.primaryColor,
          secondaryColor: response.municipality.secondaryColor,
        };

        setUser(municipalityUser);
        console.log("🔐 Municipality user set:", municipalityUser);
      } else if (response.company) {
        // Convert company to user format
        const companyUser = {
          id: response.company.id,
          username: response.company.username || response.company.name,
          role: "EMPRESAS",
          firstName: response.company.name,
          lastName: "",
          email: response.company.email,
          phone: response.company.phone,
          profilePicture: null,
          isActive: response.company.isActive,
          createdAt: response.company.createdAt,
          updatedAt: response.company.updatedAt,
          company: response.company,
        };
        setUser(companyUser);
        console.log("🔐 Company user set:", companyUser);
      }

      console.log("🔐 useAuth.login - User set successfully");
      return response;
    } catch (error) {
      console.error("🔐 useAuth.login - Login failed:", error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: {
    username: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await AuthService.register(userData);
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 useAuth.signOut - Starting logout process");
      
      // Set loading state to prevent race conditions
      setLoading(true);
      
      // Clear React state immediately
      setUser(null);
      
      // Call the AuthService logout which handles cookies and redirect
      await AuthService.logout();
      console.log("✅ useAuth.signOut - Logout completed");
      
    } catch (error) {
      console.error("❌ useAuth.signOut - Logout failed:", error);
      
      // Even if logout API fails, clear state and redirect
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get current user from backend (for API calls)
   */
  const getCurrentUser = async () => {
    try {
      const result = await AuthService.getCurrentUser();
      return result.user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    signOut,
    getCurrentUser,
    isAuthenticated: !!user,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authValue = useAuth();

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
