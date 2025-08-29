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

// GET: Listar postulaciones de jóvenes
export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API: Received request for youth applications');
        
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

        // Decode token to get user info (for logging purposes)
        let userId: string | null = null;
        
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

        // Get youth applications from database
        const youthApplications = await prisma.youthApplication.findMany({
            include: {
                youthProfile: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                _count: {
                    select: {
                        messages: true,
                        companyInterests: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('🔍 API: Found', youthApplications.length, 'youth applications');
        return NextResponse.json(youthApplications);
    } catch (error) {
        console.error('Error in youth applications route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Crear nueva postulación de joven
export async function POST(request: NextRequest) {
    try {
        console.log('🔍 API: Received request to create youth application');

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
                console.log('🔍 API: User ID from JWT:', userId);
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
            console.log('🔍 API: User ID from decoded token:', userId);
        }

        // Get JSON body
        const body = await request.json();
        console.log('🔍 API: Request body received:', body);

        const { title, description, isPublic, cvUrl, coverLetterUrl } = body;

        if (!title || !description) {
            return NextResponse.json(
                { message: 'Title and description are required' },
                { status: 400 }
            );
        }

        // Create youth application in database
        const youthApplication = await prisma.youthApplication.create({
            data: {
                title,
                description,
                isPublic: isPublic ?? true,
                status: 'ACTIVE',
                youthProfileId: userId, // User ID from cookie token
                cvUrl: cvUrl || null,
                coverLetterUrl: coverLetterUrl || null,
            },
            include: {
                youthProfile: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                _count: {
                    select: {
                        messages: true,
                        companyInterests: true
                    }
                }
            }
        });

        console.log('🔍 API: Youth application created:', youthApplication.id);
        return NextResponse.json(youthApplication, { status: 201 });
    } catch (error) {
        console.error('Error in create youth application route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 