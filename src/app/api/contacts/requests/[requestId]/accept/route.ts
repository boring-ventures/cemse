import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { requestId: string } }
) {
    try {
        console.log('🔍 Contacts Accept Request API called for requestId:', params.requestId); // Debug
        const authHeader = request.headers.get('authorization');

        // Use the same backend URL structure as institutions
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

        const url = `${backendUrl}/api/contacts/requests/${params.requestId}/accept`;

        console.log('🔍 Contacts Accept Request API - Calling backend URL:', url); // Debug
        console.log('🔍 Contacts Accept Request API - Authorization header:', authHeader ? 'Present' : 'Missing');

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        console.log('🔍 Contacts Accept Request API - Backend response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔍 Contacts Accept Request API - Backend error:', errorText);
            return NextResponse.json(
                { message: `Backend error: ${response.status} ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('🔍 Contacts Accept Request API - Backend data received:', data);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('🔍 Contacts Accept Request API - Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 