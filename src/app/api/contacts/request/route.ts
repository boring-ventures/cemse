import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Contacts Request API called'); // Debug
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    // Use the same backend URL structure as institutions
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

    const url = `${backendUrl}/api/contacts/request`;

    console.log('🔍 Contacts Request API - Calling backend URL:', url); // Debug
    console.log('🔍 Contacts Request API - Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('🔍 Contacts Request API - Request body:', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(body),
    });

    console.log('🔍 Contacts Request API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Contacts Request API - Backend error:', errorText);
      return NextResponse.json(
        { message: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Contacts Request API - Backend data received:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('🔍 Contacts Request API - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
