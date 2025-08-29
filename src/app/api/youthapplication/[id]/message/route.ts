import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Function to decode JWT token from cookies (consistent with other endpoints)
function decodeToken(token: string) {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// GET: Obtener mensajes de una postulación
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request for youth application messages:', id);

        // Get token from cookies (cookie-based authentication)
        const cookieStore = await cookies();
        const token = cookieStore.get("cemse-auth-token")?.value;

        if (!token) {
            console.log("🔍 API: No auth token found in cookies");
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Decode token to get user info
        let userId: string;
        
        if (token.includes('.') && token.split('.').length === 3) {
            // JWT token
            console.log("🔍 API: JWT token detected");
            try {
                const payload = jwt.verify(token, JWT_SECRET) as any;
                userId = payload.id;
                console.log('🔍 API: Authenticated user ID:', userId);
            } catch (error) {
                console.error("🔍 API: JWT verification failed:", error);
                return NextResponse.json(
                    { message: 'Invalid authentication token' },
                    { status: 401 }
                );
            }
        } else {
            // Simple token format
            const decoded = decodeToken(token);
            if (!decoded || !decoded.id) {
                console.log("🔍 API: Invalid token format");
                return NextResponse.json(
                    { message: 'Invalid authentication token' },
                    { status: 401 }
                );
            }
            userId = decoded.id;
            console.log('🔍 API: Authenticated user ID:', userId);
        }

        // Check if application exists
        const youthApplication = await prisma.youthApplication.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Get messages for this application
        const messages = await prisma.youthApplicationMessage.findMany({
            where: { applicationId: id },
            orderBy: { createdAt: 'asc' }
        });

        console.log('🔍 API: Found', messages.length, 'messages');
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error in get youth application messages route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Enviar mensaje en una postulación
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request to send message in youth application:', id);

        // Get token from cookies (cookie-based authentication)
        const cookieStore = await cookies();
        const token = cookieStore.get("cemse-auth-token")?.value;

        if (!token) {
            console.log("🔍 API: No auth token found in cookies");
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Decode token to get user info
        let userId: string;
        
        if (token.includes('.') && token.split('.').length === 3) {
            // JWT token
            console.log("🔍 API: JWT token detected");
            try {
                const payload = jwt.verify(token, JWT_SECRET) as any;
                userId = payload.id;
                console.log('🔍 API: Authenticated user ID:', userId);
            } catch (error) {
                console.error("🔍 API: JWT verification failed:", error);
                return NextResponse.json(
                    { message: 'Invalid authentication token' },
                    { status: 401 }
                );
            }
        } else {
            // Simple token format
            const decoded = decodeToken(token);
            if (!decoded || !decoded.id) {
                console.log("🔍 API: Invalid token format");
                return NextResponse.json(
                    { message: 'Invalid authentication token' },
                    { status: 401 }
                );
            }
            userId = decoded.id;
            console.log('🔍 API: Authenticated user ID:', userId);
        }

        const body = await request.json();
        console.log('🔍 API: Request body:', body);

        const { content } = body;

        if (!content) {
            return NextResponse.json(
                { message: 'Content is required' },
                { status: 400 }
            );
        }

        // Check if application exists
        const youthApplication = await prisma.youthApplication.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Get user profile to determine sender type
        const userProfile = await prisma.profile.findUnique({
            where: { userId: userId },
            select: { role: true, userId: true }
        });

        if (!userProfile) {
            return NextResponse.json(
                { message: 'User profile not found' },
                { status: 404 }
            );
        }

        // Determine sender type based on user role
        const senderType = userProfile.role === 'COMPANIES' ? 'COMPANY' : 'YOUTH';
        console.log('🔍 API: Determined sender type:', senderType, 'for user role:', userProfile.role);

        // Create message
        const message = await prisma.youthApplicationMessage.create({
            data: {
                applicationId: id,
                senderId: userId,
                senderType,
                content,
                messageType: 'TEXT',
                status: 'SENT'
            }
        });

        console.log('🔍 API: Message created:', message.id);
        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Error in send youth application message route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 