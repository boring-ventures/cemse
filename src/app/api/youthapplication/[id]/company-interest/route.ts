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

// GET: Obtener intereses de empresas en una postulación
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request for company interests in youth application:', id);

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
            select: { id: true, title: true }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Get company interests for this application
        const interests = await prisma.youthApplicationCompanyInterest.findMany({
            where: { applicationId: id },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        businessSector: true,
                        companySize: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('✅ API: Found', interests.length, 'company interests');
        return NextResponse.json(interests);
    } catch (error) {
        console.error('Error in get company interests route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Expresar interés de empresa en una postulación
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request to express company interest in youth application:', id);

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

        // Get request body
        const body = await request.json();
        console.log('🔍 API: Request body:', body);

        const { companyId, status, message } = body;

        if (!companyId || !status) {
            return NextResponse.json(
                { message: 'Company ID and status are required' },
                { status: 400 }
            );
        }

        // Verify that the authenticated user belongs to the company
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true }
        });

        if (!company) {
            return NextResponse.json(
                { message: 'Company not found' },
                { status: 404 }
            );
        }

        // Check if youth application exists
        const youthApplication = await prisma.youthApplication.findUnique({
            where: { id },
            select: { id: true, title: true }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Check if company has already expressed interest
        const existingInterest = await prisma.youthApplicationCompanyInterest.findUnique({
            where: {
                applicationId_companyId: {
                    applicationId: id,
                    companyId: companyId
                }
            }
        });

        if (existingInterest) {
            return NextResponse.json(
                { message: 'Company has already expressed interest in this application' },
                { status: 400 }
            );
        }

        // Create company interest record
        const companyInterest = await prisma.youthApplicationCompanyInterest.create({
            data: {
                applicationId: id,
                companyId: companyId,
                status: status,
                message: message || null,
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        businessSector: true,
                        companySize: true
                    }
                },
                application: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        // Update application's interest count
        await prisma.youthApplication.update({
            where: { id },
            data: {
                applicationsCount: {
                    increment: 1
                }
            }
        });

        console.log('✅ API: Company interest expressed:', companyInterest.id);
        return NextResponse.json(companyInterest, { status: 201 });

    } catch (error) {
        console.error('Error in express company interest route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 