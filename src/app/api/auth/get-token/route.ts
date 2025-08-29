import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 GET-TOKEN API - Extracting JWT token from cookies');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    // Debug: log all available cookies
    const allCookies = cookieStore.getAll();
    console.log('🔐 GET-TOKEN API - Available cookies:', allCookies.map(c => c.name));
    
    console.log('🔐 GET-TOKEN API - cemse-auth-token value:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      console.log('🔐 GET-TOKEN API - No auth token found in cookies');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Check if it's a JWT token (has 3 parts separated by dots)
    if (token.includes('.') && token.split('.').length === 3) {
      console.log('🔐 GET-TOKEN API - JWT token found, returning for external API use');
      return NextResponse.json({ token });
    }

    // For database tokens, we can't pass them as Bearer tokens to external APIs
    // The external API expects JWT tokens
    console.log('🔐 GET-TOKEN API - Database token found, but external API needs JWT');
    return NextResponse.json(
      { error: 'Database token cannot be used for external API calls' },
      { status: 400 }
    );
  } catch (error) {
    console.error('🔐 GET-TOKEN API - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}