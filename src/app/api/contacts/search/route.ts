import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Contacts Search API called'); // Debug
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Use the same backend URL structure as institutions
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

    const url = query
      ? `${backendUrl}/api/contacts/search?query=${encodeURIComponent(query)}`
      : `${backendUrl}/api/contacts/search`;

    console.log('🔍 Contacts Search API - Calling backend URL:', url); // Debug
    console.log('🔍 Contacts Search API - Authorization header:', request.headers.get('authorization') ? 'Present' : 'Missing');

    const response = await fetch(url, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Contacts Search API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Contacts Search API - Backend error:', errorText);
      return NextResponse.json(
        { message: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Contacts Search API - Backend data received, users count:', data.users?.length || 0);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('🔍 Contacts Search API - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
