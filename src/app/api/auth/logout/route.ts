import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 Logout API - Starting logout process");

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear all authentication cookies by setting them to empty values with past expiration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Clear new auth cookies
    response.cookies.set("cemse-auth-token", "", cookieOptions);
    response.cookies.set("cemse-refresh-token", "", cookieOptions);
    
    // Also clear any legacy cookies that might exist
    response.cookies.set("token", "", cookieOptions);
    response.cookies.set("refreshToken", "", cookieOptions);
    response.cookies.set("auth-token", "", cookieOptions);

    console.log("🚪 Logout API - All authentication cookies cleared");

    return response;
  } catch (error) {
    console.error("🚪 Logout API - Logout error:", error);
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json(
      { success: false, error: "Logout error occurred" },
      { status: 500 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };

    response.cookies.set("cemse-auth-token", "", cookieOptions);
    response.cookies.set("cemse-refresh-token", "", cookieOptions);
    response.cookies.set("token", "", cookieOptions);

    return response;
  }
}