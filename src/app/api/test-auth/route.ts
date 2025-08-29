import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 /api/test-auth - Testing authentication');

    // Debug: Log all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('🧪 /api/test-auth - All cookies received:', allCookies);
    
    // Get token from cookies
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    console.log('🧪 /api/test-auth - Auth token found:', token ? 'YES' : 'NO');
    console.log('🧪 /api/test-auth - Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
    
    return NextResponse.json({
      success: true,
      cookiesReceived: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      hasAuthToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      message: token ? 'Authentication token found' : 'No authentication token found'
    });

  } catch (error) {
    console.error('🧪 /api/test-auth - Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

