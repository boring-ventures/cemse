import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log("🏛️ GET /api/municipality/auth/me - Starting request");

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ GET /api/municipality/auth/me - No valid authorization header");
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("🏛️ GET /api/municipality/auth/me - Token extracted, calling backend");

    // Call the backend directly
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '${BACKEND_URL}';
    const response = await fetch(`${backendUrl}/api/municipality/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("❌ GET /api/municipality/auth/me - Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
