import { clearAllAuthData } from "@/lib/client-auth-utils";
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from "@/types/api";
import { API_BASE } from "@/lib/api";

export class AuthService {
  /**
   * Login user using cookie-based authentication
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log("🔐 AuthService.login - Starting cookie-based login");

    try {
      // Use the new login API that sets cookies
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("🔐 AuthService.login - Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🔐 AuthService.login - Login failed:", errorData);
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log(
        "🔐 AuthService.login - Login successful, cookies set by server"
      );

      // Log user details if present
      if (data.user) {
        console.log("🔐 AuthService.login - User data:", {
          id: data.user.id,
          username: data.user.username,
          role: data.user.role || data.role,
          firstName: data.user.firstName,
        });
      }

      // Log municipality details if present
      if (data.municipality) {
        console.log("🔐 AuthService.login - Municipality data:", {
          id: data.municipality.id,
          name: data.municipality.name,
          username: data.municipality.username,
        });
      }

      // Log company details if present
      if (data.company) {
        console.log("🔐 AuthService.login - Company data:", {
          id: data.company.id,
          name: data.company.name,
          username: data.company.username,
        });
      }

      return data;
    } catch (error) {
      console.error("🔐 AuthService.login - Login error:", error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async register(
    userData: RegisterRequest
  ): Promise<{ message: string }> {
    console.log("Attempting registration to:", `${API_BASE}/auth/register`);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Registration response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration failed with status:", response.status);
        console.error("Error response:", errorText);
        throw new Error(
          `Registration failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Registration successful");
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `No se pudo conectar al servidor. Verifica que el backend esté ejecutándose en ${API_BASE.replace("/api", "")}`
        );
      }
      throw error;
    }
  }

  /**
   * Get current authenticated user from cookie session
   */
  static async getCurrentUser(): Promise<{ user: User }> {
    try {
      // Call our session API that reads from cookies
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
      });

      if (!response.ok) {
        // Handle 401 as expected behavior (user not authenticated)
        if (response.status === 401) {
          throw new Error("UNAUTHENTICATED");
        } else {
          const errorText = await response.text();
          console.error(
            "🔍 AuthService.getCurrentUser - Unexpected error:",
            errorText
          );
          throw new Error(`Failed to get current user: ${response.status}`);
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Handle expected unauthenticated state silently
      if (error instanceof Error && error.message === "UNAUTHENTICATED") {
        throw error;
      } else {
        console.error("🔍 AuthService.getCurrentUser - Error:", error);
        throw error;
      }
    }
  }

  /**
   * Logout user using cookie-based authentication
   */
  static async logout(): Promise<void> {
    try {
      console.log("🚪 AuthService.logout - Starting logout process");

      // Call the logout API to clear cookies
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          "⚠️ AuthService.logout - Server logout failed, but continuing with client cleanup"
        );
      } else {
        console.log(
          "✅ AuthService.logout - Server logout successful, cookies cleared"
        );
      }
    } catch (error) {
      console.warn("⚠️ AuthService.logout - Logout API call failed:", error);
    } finally {
      // Always clear client-side authentication data
      console.log(
        "🧹 AuthService.logout - Clearing client-side authentication data"
      );
      clearAllAuthData();

      // Clear any cached data
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }

      // Force redirect to home page
      console.log("🔄 AuthService.logout - Redirecting to home page");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      console.log("✅ AuthService.logout - Logout process completed");
    }
  }
}
