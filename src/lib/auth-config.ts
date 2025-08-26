// JWT Authentication Configuration
// Based on the backend auth implementation in cemse-back/middleware/auth.ts

export const authConfig = {
  jwt: {
    // JWT secrets are only available server-side for security
    // Use fallback values for client-side (they won't be used for actual verification)
    accessSecret: process.env.JWT_ACCESS_SECRET || 'jwt-access-secret-placeholder',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret-placeholder',
    accessExpiry: '15m', // 15 minutes for access tokens
    refreshExpiry: '7d', // 7 days for refresh tokens
  },
  cookies: {
    accessToken: {
      name: 'access_token',
      options: {
        httpOnly: false, // Need to access from client for API calls
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60, // 15 minutes in seconds
      }
    },
    refreshToken: {
      name: 'refresh_token',
      options: {
        httpOnly: true, // Secure - only accessible by server
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      }
    }
  },
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
  }
} as const

// Only validate JWT secrets on the server side
if (typeof window === 'undefined') {
  if (!process.env.JWT_ACCESS_SECRET) {
    console.warn('JWT_ACCESS_SECRET environment variable is not configured');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('JWT_REFRESH_SECRET environment variable is not configured');
  }
}

// Export types
export type AuthConfig = typeof authConfig