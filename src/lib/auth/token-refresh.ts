// Automatic JWT Token Refresh Utility
// Handles automatic token refresh before expiration

import { JWTAuthService } from './jwt-service';

export class TokenRefreshManager {
  private static refreshTimeout: NodeJS.Timeout | null = null;
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Start automatic token refresh cycle
   * This should be called after successful login
   */
  static startAutoRefresh(token: string): void {
    console.log('🔄 Starting auto-refresh for token');
    
    // Clear any existing refresh timeout
    this.stopAutoRefresh();

    // Get token expiry time
    const expirySeconds = JWTAuthService.getTokenExpiry(token);
    
    if (!expirySeconds || expirySeconds <= 0) {
      console.log('🔄 Token already expired or invalid, cannot start auto-refresh');
      return;
    }

    // Refresh token when 80% of lifetime has passed (or 2 minutes before expiry, whichever is sooner)
    const refreshTime = Math.min(
      expirySeconds * 0.8, // 80% of token lifetime
      expirySeconds - 120   // 2 minutes before expiry
    );

    // Ensure we don't refresh immediately (minimum 30 seconds)
    const refreshDelayMs = Math.max(refreshTime * 1000, 30000);

    console.log(`🔄 Auto-refresh scheduled in ${Math.round(refreshDelayMs / 1000)} seconds`);

    this.refreshTimeout = setTimeout(() => {
      this.performRefresh();
    }, refreshDelayMs);
  }

  /**
   * Stop automatic token refresh
   */
  static stopAutoRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      console.log('🔄 Auto-refresh stopped');
    }
  }

  /**
   * Perform token refresh
   * Returns a promise that resolves to true if refresh was successful
   */
  static async performRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔄 Refresh already in progress, waiting...');
      return await this.refreshPromise;
    }

    console.log('🔄 Performing token refresh...');
    this.isRefreshing = true;

    this.refreshPromise = this.doRefresh();
    const success = await this.refreshPromise;
    
    this.isRefreshing = false;
    this.refreshPromise = null;

    return success;
  }

  /**
   * Internal method to perform the actual refresh
   */
  private static async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
      });

      if (!response.ok) {
        console.log('🔄 Token refresh failed with status:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.token) {
        console.log('🔄 Token refresh successful');
        
        // Update localStorage with new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.token);
        }

        // Schedule next refresh
        this.startAutoRefresh(data.token);
        
        return true;
      } else {
        console.log('🔄 Token refresh response missing token');
        return false;
      }
    } catch (error) {
      console.error('🔄 Token refresh error:', error);
      return false;
    }
  }

  /**
   * Check if current token needs refresh
   * Returns true if token should be refreshed soon
   */
  static shouldRefreshToken(token: string): boolean {
    const expirySeconds = JWTAuthService.getTokenExpiry(token);
    
    if (!expirySeconds || expirySeconds <= 0) {
      return true; // Token expired
    }

    // Refresh if less than 5 minutes remaining
    return expirySeconds < 300;
  }

  /**
   * Create an HTTP interceptor for automatic token refresh
   * This can be used with fetch or axios to automatically refresh tokens on 401 responses
   */
  static createFetchInterceptor() {
    const originalFetch = window.fetch;

    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // First attempt
      const response = await originalFetch(input, init);

      // If we get 401 Unauthorized, try to refresh token and retry
      if (response.status === 401 && !response.url.includes('/api/auth/')) {
        console.log('🔄 Got 401 response, attempting token refresh...');
        
        const refreshSuccess = await this.performRefresh();
        
        if (refreshSuccess) {
          // Get new token and retry the request
          const newToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
          
          if (newToken && init?.headers) {
            // Update Authorization header with new token
            const headers = new Headers(init.headers);
            headers.set('Authorization', `Bearer ${newToken}`);
            
            const newInit = { ...init, headers };
            console.log('🔄 Retrying request with new token...');
            return originalFetch(input, newInit);
          }
        }
      }

      return response;
    };
  }

  /**
   * Setup automatic token refresh for the application
   */
  static setup(): void {
    // Replace global fetch with interceptor
    if (typeof window !== 'undefined') {
      window.fetch = this.createFetchInterceptor();
      console.log('🔄 Token refresh interceptor installed');
    }
  }
}