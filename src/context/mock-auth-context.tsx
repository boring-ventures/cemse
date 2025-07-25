"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
type UserRole = "YOUTH" | "COMPANIES" | "MUNICIPAL_GOVERNMENTS";

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | null;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    completionPercentage: number;
  } | null;
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: UserRole
  ) => Promise<void>;
  signOut: () => void;
  updateUserRole: (role: UserRole) => void;
  setUser: (user: MockUser) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(
  undefined
);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(
    async (email: string, password: string, role?: UserRole) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data - set role immediately if provided
        const mockUser: MockUser = {
          id: "mock-user-id",
          email,
          name: email.split("@")[0],
          role: role || null, // Set role immediately if provided
          profile: role
            ? {
                id: "mock-profile-id",
                firstName: email.split("@")[0],
                lastName: "",
                profilePicture: null,
                completionPercentage: 75,
              }
            : null,
        };

        setUserState(mockUser);

        // Store in localStorage for persistence
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Sign in failed"));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string, role?: UserRole) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data - set role immediately if provided
        const mockUser: MockUser = {
          id: "mock-user-id",
          email,
          name,
          role: role || null, // Set role immediately if provided
          profile: role
            ? {
                id: "mock-profile-id",
                firstName: name.split(" ")[0] || name,
                lastName: name.split(" ")[1] || "",
                profilePicture: null,
                completionPercentage: 75,
              }
            : null,
        };

        setUserState(mockUser);

        // Store in localStorage for persistence
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Sign up failed"));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(() => {
    setUserState(null);
    localStorage.removeItem("mockUser");
  }, []);

  const updateUserRole = useCallback(
    (role: UserRole) => {
      if (!user) return;

      const updatedUser: MockUser = {
        ...user,
        role,
        profile: {
          id: "mock-profile-id",
          firstName: user.name.split(" ")[0] || user.name,
          lastName: user.name.split(" ")[1] || "",
          profilePicture: null,
          completionPercentage: 75,
        },
      };

      setUserState(updatedUser);
      localStorage.setItem("mockUser", JSON.stringify(updatedUser));
    },
    [user]
  );

  const setUser = useCallback((user: MockUser) => {
    setUserState(user);
    localStorage.setItem("mockUser", JSON.stringify(user));
  }, []);

  // Load user from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("mockUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("mockUser");
      }
    }
  }, []);

  const value: MockAuthContextType = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    setUser,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}
