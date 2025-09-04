import { useState } from "react";

export interface UserData {
  username: string;
  password?: string; // Make password optional for updates
  role: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality?: string;
  department?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  educationLevel?: string;
  currentInstitution?: string;
  graduationYear?: number;
  isStudying?: boolean;
  skills?: string[];
  interests?: string[];
  status?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    municipality?: string;
    department?: string;
    country?: string;
    birthDate?: string;
    gender?: string;
    educationLevel?: string;
    currentInstitution?: string;
    graduationYear?: number;
    isStudying?: boolean;
    skills: string[];
    interests: string[];
    status: string;
    active: boolean;
    profileCompletion: number;
    avatarUrl?: string; // Add avatarUrl property
  };
}

export function useUserManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: UserData): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const result = await response.json();
      return result.user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    userData: Partial<UserData>
  ): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update user";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (filters?: {
    role?: string;
    search?: string;
  }): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.role && filters.role !== "all") {
        params.append("role", filters.role);
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const users = await response.json();
      return users;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    updateUser,
    deleteUser,
    getUsers,
    loading,
    error,
  };
}
