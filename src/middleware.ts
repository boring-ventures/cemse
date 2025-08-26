import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configure runtime for middleware
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/company/:path*',
    '/courses/:path*',
    '/jobs/:path*',
    '/entrepreneurship/:path*',
    '/my-applications/:path*',
    '/my-courses/:path*',
    '/my-entrepreneurships/:path*',
    '/my-interviews/:path*',
    '/cv-builder/:path*',
    '/mentorship/:path*',
    '/municipalities/:path*',
    '/institutions/:path*',
    '/youth-content/:path*',
    '/business-plan-simulator/:path*',
    '/certificates/:path*',
    '/development/:path*',
    '/publish-entrepreneurship/:path*',
    '/job-publishing/:path*',
    // Auth routes
    '/sign-in',
    '/sign-up',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/magic-link',
    '/auth/callback'
  ],
};

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/company',
  '/courses',
  '/jobs',
  '/entrepreneurship',
  '/my-applications',
  '/my-courses',
  '/my-entrepreneurships',
  '/my-interviews',
  '/cv-builder',
  '/mentorship',
  '/municipalities',
  '/institutions',
  '/youth-content',
  '/business-plan-simulator',
  '/certificates',
  '/development',
  '/publish-entrepreneurship',
  '/job-publishing'
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/magic-link'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get the access token from cookies only (skip JWT verification in middleware)
  const token = req.cookies.get('access_token')?.value;

  // Simple token existence check (no verification in middleware)
  const hasToken = !!token;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to sign-in if accessing protected route without token
  if (isProtectedRoute && !hasToken) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes with token
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Let the client-side auth context handle detailed role-based access control
  return NextResponse.next();
}