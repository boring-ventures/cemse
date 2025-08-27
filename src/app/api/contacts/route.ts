import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Contacts API called'); // Debug
    const authHeader = request.headers.get('authorization');

    // Use the same backend URL structure as institutions
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

    const url = `${backendUrl}/api/contacts`;

    console.log('🔍 Contacts API - Calling backend URL:', url); // Debug
    console.log('🔍 Contacts API - Authorization header:', authHeader ? 'Present' : 'Missing');

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Contacts API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Contacts API - Backend error:', errorText);
      return NextResponse.json(
        { message: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Contacts API - Backend data received, contacts count:', data.contacts?.length || 0);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('🔍 Contacts API - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
