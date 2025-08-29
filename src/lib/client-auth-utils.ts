/**
 * Client-side authentication utilities
 * These functions can be used in browser environments
 */

/**
 * Clears all client-side authentication data
 */
export function clearAllAuthData(): void {
  if (typeof window === "undefined") {
    return; // Server-side, nothing to clear
  }

  // Clear localStorage
  try {
    localStorage.removeItem("cemse-auth-token");
    localStorage.removeItem("cemse-user");
    localStorage.removeItem("cemse-user-role");
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn("Failed to clear sessionStorage:", error);
  }

  // Note: We don't clear cookies here as they should be handled by the server
  // via the logout API endpoint
}

/**
 * Gets auth token from client-side storage (fallback only)
 * Note: Primary authentication should use server-side cookies
 */
export function getClientAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("cemse-auth-token");
  } catch (error) {
    console.warn("Failed to get auth token from localStorage:", error);
    return null;
  }
}

/**
 * Sets auth token in client-side storage (fallback only)
 * Note: Primary authentication should use server-side cookies
 */
export function setClientAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("cemse-auth-token", token);
  } catch (error) {
    console.warn("Failed to set auth token in localStorage:", error);
  }
}

/**
 * Removes auth token from client-side storage
 */
export function removeClientAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("cemse-auth-token");
  } catch (error) {
    console.warn("Failed to remove auth token from localStorage:", error);
  }
}
