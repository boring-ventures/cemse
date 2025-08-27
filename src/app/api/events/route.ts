import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/api";

// GET /api/events - List events
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const municipality = searchParams.get("municipality");

        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

        let url: string;
        if (municipality) {
            // Use the specific municipality endpoint with municipality in the path
            url = `${backendUrl}/api/events/by-municipality/${municipality}`;
        } else {
            // Use the general events endpoint
            url = `${backendUrl}/api/events`;
        }

        // Add other query parameters (excluding municipality since it's in the URL path)
        const otherParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== 'municipality') {
                otherParams.append(key, value);
            }
        });

        if (otherParams.toString()) {
            url += `?${otherParams.toString()}`;
        }

        console.log('🔍 Events API - Forwarding to backend:', url);

        const response = await fetch(url, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('🔍 Events API - Backend error:', response.status, response.statusText);
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔍 Events API - Backend response:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Error al obtener eventos" },
            { status: 500 }
        );
    }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
    try {
        // Check if it's FormData or JSON
        const contentType = request.headers.get('content-type') || '';
        let eventData: Record<string, unknown> = {};

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData
            const formData = await request.formData();

            // Extract all form fields
            eventData = {
                title: formData.get('title') as string,
                organizer: formData.get('organizer') as string,
                description: formData.get('description') as string,
                date: formData.get('date') as string,
                time: formData.get('time') as string,
                type: formData.get('type') as string,
                category: formData.get('category') as string,
                location: formData.get('location') as string,
                maxCapacity: formData.get('maxCapacity') ? parseInt(formData.get('maxCapacity') as string) : undefined,
                price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
                status: formData.get('status') as string || 'DRAFT',
                featured: formData.get('featured') === 'true',
                registrationDeadline: formData.get('registrationDeadline') as string,
                imageUrl: formData.get('imageUrl') as string,
            };

            // Handle arrays (tags, requirements, agenda, speakers)
            const tags = formData.get('tags') as string;
            if (tags) {
                try {
                    eventData.tags = JSON.parse(tags);
                } catch {
                    eventData.tags = [];
                }
            }

            const requirements = formData.get('requirements') as string;
            if (requirements) {
                try {
                    eventData.requirements = JSON.parse(requirements);
                } catch {
                    eventData.requirements = [];
                }
            }

            const agenda = formData.get('agenda') as string;
            if (agenda) {
                try {
                    eventData.agenda = JSON.parse(agenda);
                } catch {
                    eventData.agenda = [];
                }
            }

            const speakers = formData.get('speakers') as string;
            if (speakers) {
                try {
                    eventData.speakers = JSON.parse(speakers);
                } catch {
                    eventData.speakers = [];
                }
            }

            // Handle image file if present
            const imageFile = formData.get('image') as File;
            if (imageFile) {
                // In a real implementation, you would upload the file to a storage service
                // For now, we'll just store a placeholder URL
                eventData.imageUrl = `/uploads/events/${Date.now()}-${imageFile.name}`;
            }
        } else {
            // Handle JSON
            eventData = await request.json();
        }

        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';
        const url = `${backendUrl}/api/events`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            { error: "Error al crear evento" },
            { status: 500 }
        );
    }
} 