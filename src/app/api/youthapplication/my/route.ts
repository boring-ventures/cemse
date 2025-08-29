import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Function to decode JWT token from cookies
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

// GET: Get current user's youth applications
export async function GET(request: NextRequest) {
    try {
        console.log('👥 API: Getting my youth applications');

        // Get token from cookies (cookie-based authentication)
        const cookieStore = await cookies();
        const token = cookieStore.get("cemse-auth-token")?.value;

        if (!token) {
            console.log("👥 API: No auth token found in cookies");
            return NextResponse.json(
                { error: "No authentication token found" },
                { status: 401 }
            );
        }

        // Decode token to get user info
        let userId: string;
        
        if (token.includes('.') && token.split('.').length === 3) {
            // JWT token
            console.log("👥 API: JWT token detected");
            try {
                const payload = jwt.verify(token, JWT_SECRET) as any;
                userId = payload.id;
                console.log('👥 API: User ID from JWT:', userId);
            } catch (error) {
                console.error("👥 API: JWT verification failed:", error);
                return NextResponse.json(
                    { error: "Invalid authentication token" },
                    { status: 401 }
                );
            }
        } else {
            // Simple token format
            const decoded = decodeToken(token);
            if (!decoded || !decoded.id) {
                console.log("👥 API: Invalid token format");
                return NextResponse.json(
                    { error: "Invalid authentication token" },
                    { status: 401 }
                );
            }
            userId = decoded.id;
            console.log('👥 API: User ID from decoded token:', userId);
        }

        // Get user to verify they exist and are active
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.isActive) {
            console.log("👥 API: User not found or inactive:", userId);
            return NextResponse.json(
                { error: "User not found or inactive" },
                { status: 404 }
            );
        }

        console.log('👥 API: Getting applications for user:', user.username);

        // Get youth applications for this user
        const youthApplications = await prisma.youthApplication.findMany({
            where: {
                youthProfileId: userId
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('✅ API: Found', youthApplications.length, 'youth applications for user:', user.username);
        return NextResponse.json(youthApplications);
    } catch (error) {
        console.error('❌ API: Error getting my youth applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
