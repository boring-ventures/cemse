import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Function to validate JWT token from cookies
function isValidToken(token: string): boolean {
  if (!token || token.trim() === '') return false;
  
  // Handle database auth tokens (auth-token-{role}-{userId}-{timestamp})
  if (token.startsWith('auth-token-')) {
    console.log("🔒 Middleware - Database auth token detected, allowing access");
    return true;
  }
  
  // Handle JWT tokens (from database authentication)
  if (token.includes('.') && token.split('.').length === 3) {
    try {
      // Basic JWT format validation - actual verification happens in API routes
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log("🔒 Middleware - JWT token expired");
        return false;
      }
      
      console.log("🔒 Middleware - JWT token detected, allowing access");
      return true;
    } catch (error) {
      console.log("🔒 Middleware - JWT token validation failed:", error);
      return false;
    }
  }
  
  // Handle mock development tokens
  if (token.startsWith('mock-dev-token-')) {
    console.log("🔒 Middleware - Mock development token detected, allowing access");
    return true;
  }
  
  try {
    // Check if token has the correct JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("🔒 Middleware - Invalid token format - expected 3 parts, got:", parts.length);
      return false;
    }
    
    // Decode the payload to check expiration
    let payload;
    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      payload = JSON.parse(atob(base64));
    } catch (decodeError) {
      console.log("🔒 Middleware - Token payload decode error:", decodeError);
      return false;
    }
    
    // Validate payload structure
    if (!payload || typeof payload !== 'object') {
      console.log("🔒 Middleware - Invalid token payload structure");
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      console.log("🔒 Middleware - Token expired at:", new Date(payload.exp * 1000), "current time:", new Date());
      return false;
    }
    
    // Check if token has basic required fields (be more lenient)
    const hasUserIdentifier = payload.id || payload.userId || payload.sub || payload.username;
    if (!hasUserIdentifier) {
      console.log("🔒 Middleware - Token missing user identifier");
      return false;
    }
    
    console.log("🔒 Middleware - Token appears valid for user:", payload.id || payload.userId || payload.sub);
    return true;
  } catch (error) {
    console.log("🔒 Middleware - Token validation error:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get token from secure cookies
  const token = req.cookies.get("cemse-auth-token")?.value;

  // Validate the token if it exists
  const hasValidToken = token ? isValidToken(token) : false;

  console.log("🔒 Middleware - Path:", pathname, "Token exists:", !!token, "Token valid:", hasValidToken);

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/my-applications", "/admin", "/company"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Define auth routes that should redirect away if already authenticated
  const authRoutes = ["/login", "/register", "/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If user is trying to access a protected route without a valid token
  if (isProtectedRoute && !hasValidToken) {
    console.log("🔒 Middleware - Redirecting to login (no valid token for protected route)");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    // Clear invalid token cookie if it exists
    const response = NextResponse.redirect(loginUrl);
    if (token && !hasValidToken) {
      response.cookies.set('cemse-auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      response.cookies.set('cemse-refresh-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      console.log("🔒 Middleware - Cleared invalid auth cookies");
    }
    return response;
  }

  // If user is trying to access auth routes while already authenticated with a VALID token
  // But first check if they have a recent logout cookie (set by the logout process)
  if (isAuthRoute && hasValidToken) {
    // Check for recent logout cookie
    const recentLogoutCookie = req.cookies.get("recent-logout")?.value;
    if (recentLogoutCookie) {
      const logoutTime = parseInt(recentLogoutCookie);
      const timeSinceLogout = Date.now() - logoutTime;
      // Don't redirect for 30 seconds after logout
      if (timeSinceLogout < 30000) {
        console.log("🔒 Middleware - Recent logout detected, allowing access to auth route");
        const response = NextResponse.next();
        // Clear the recent logout cookie after allowing access
        response.cookies.set('recent-logout', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        return response;
      }
    }
    
    console.log("🔒 Middleware - Redirecting to dashboard (authenticated user on auth route)");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user has an invalid token on auth routes, clear it and allow access
  if (isAuthRoute && token && !hasValidToken) {
    console.log("🔒 Middleware - Clearing invalid auth cookies on auth route");
    const response = NextResponse.next();
    response.cookies.set('cemse-auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('cemse-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/my-applications/:path*",
    "/login", 
    "/register", 
    "/sign-in", 
    "/sign-up", 
    "/auth/callback",
    // Add admin routes
    "/admin/:path*",
    // Add other role-specific routes
    "/company/:path*",
    "/companies/:path*",
    "/municipalities/:path*",
    "/institutions/:path*"
  ],
};
