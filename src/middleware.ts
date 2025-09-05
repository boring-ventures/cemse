import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle large file uploads for video API routes
  if (request.nextUrl.pathname.startsWith('/api/lesson/with-video')) {
    // Set headers for large file uploads
    const response = NextResponse.next();
    
    // Increase timeout for large uploads
    response.headers.set('Connection', 'keep-alive');
    response.headers.set('Keep-Alive', 'timeout=300, max=1000');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/lesson/with-video/:path*',
  ],
};