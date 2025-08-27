import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/api";

// GET /api/events/my-municipality - Get events for the authenticated user's municipality
export async function GET() {
    try {
        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';
        const url = `${backendUrl}/api/events/my-municipality`;

        console.log('🔍 Events My-Municipality API - Forwarding to backend:', url);

        const response = await fetch(url, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('🔍 Events My-Municipality API - Backend error:', response.status, response.statusText);
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔍 Events My-Municipality API - Backend response:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching my municipality events:", error);
        return NextResponse.json(
            { error: "Error al obtener eventos del municipio" },
            { status: 500 }
        );
    }
} 