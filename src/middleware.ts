import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Function to decode JWT token and check if it's valid
function isTokenValid(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log("🔒 Middleware - Token is expired");
      return false;
    }

    return true;
  } catch (error) {
    console.log("🔒 Middleware - Error decoding token:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from cookies or headers
  const token = req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  console.log("🔒 Middleware - Path:", pathname, "Token exists:", !!token);

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/company", "/municipalities"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Define auth routes that should redirect away if already authenticated
  const authRoutes = ["/login", "/register", "/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If user is trying to access a protected route without a token or with invalid token
  if (isProtectedRoute && (!token || !isTokenValid(token))) {
    console.log("🔒 Middleware - Redirecting to login (no token or invalid token for protected route)");
    const loginUrl = new URL("/sign-in", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is trying to access auth routes while already authenticated with valid token
  if (isAuthRoute && token && isTokenValid(token)) {
    console.log("🔒 Middleware - Redirecting to dashboard (authenticated user on auth route)");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/sign-in",
    "/sign-up",
    "/auth/callback",
    // Add admin routes
    "/admin/:path*",
    // Add other role-specific routes
    "/company/:path*",
    "/municipalities/:path*",
    "/institutions/:path*"
  ],
};
