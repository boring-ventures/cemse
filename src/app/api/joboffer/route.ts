import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract authorization header from the incoming request
    const authHeader = request.headers.get('authorization');

    // Forward all search parameters to backend
    const url = new URL(`${BACKEND_URL}/api/joboffer`);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    console.log('🔍 API Route - Forwarding request to:', url.toString());
    console.log('🔍 API Route - Auth header present:', !!authHeader);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    console.log('🔍 API Route - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Route - Backend error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Route - Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ API Route - Error fetching job offers:', error);
    return NextResponse.json(
      { error: 'Error al cargar ofertas de trabajo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract authorization header from the incoming request
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/joboffer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating job offer:', error);
    return NextResponse.json(
      { error: 'Error al crear oferta de trabajo' },
      { status: 500 }
    );
  }
}


