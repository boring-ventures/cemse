import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Helper function to decode JWT token
function decodeToken(token: string) {
  try {
    const tokenParts = token.split(".");
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

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 TEST /api/company/test - Starting diagnostic test");

    // Step 1: Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;
    
    console.log("🔍 TEST - Cookie auth token:", token ? 'Present' : 'Missing');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "No authentication token found",
        step: "authentication"
      }, { status: 401 });
    }

    // Step 2: Decode token
    let decoded = null;
    if (token.startsWith('mock-dev-token-')) {
      decoded = {
        id: 'mock-user-id',
        role: 'ADMIN',
        type: 'ADMIN',
        firstName: 'Mock',
        lastName: 'User',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
    } else {
      decoded = decodeToken(token);
    }

    if (!decoded) {
      return NextResponse.json({
        success: false,
        error: "Invalid token format",
        step: "token_decode"
      }, { status: 401 });
    }

    console.log("✅ TEST - Token decoded:", { 
      id: decoded.id, 
      role: decoded.role || decoded.type 
    });

    // Step 3: Check role permissions
    const userRole = decoded?.role || decoded?.type;
    const allowedRoles = ['SUPERADMIN', 'MUNICIPAL_GOVERNMENTS'];
    
    if (!token.startsWith('mock-dev-token-') && !allowedRoles.includes(userRole)) {
      return NextResponse.json({
        success: false,
        error: `Insufficient permissions. Role '${userRole}' not in allowed roles`,
        allowedRoles,
        userRole,
        step: "role_check"
      }, { status: 403 });
    }

    // Step 4: Test database connection
    try {
      const testConnection = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✅ TEST - Database connection successful:", testConnection);
    } catch (dbError) {
      console.error("❌ TEST - Database connection failed:", dbError);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        step: "database_connection"
      }, { status: 500 });
    }

    // Step 5: Test municipality query
    try {
      const municipalities = await prisma.municipality.findMany({
        take: 2
      });
      console.log("✅ TEST - Municipality query successful, found:", municipalities.length);
    } catch (municipalityError) {
      console.error("❌ TEST - Municipality query failed:", municipalityError);
      return NextResponse.json({
        success: false,
        error: "Municipality query failed",
        details: municipalityError instanceof Error ? municipalityError.message : 'Unknown municipality error',
        step: "municipality_query"
      }, { status: 500 });
    }

    // Step 6: Test user creation (dry run)
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: 'test_company_user' }
      });
      console.log("✅ TEST - User query successful, existing user:", !!existingUser);
    } catch (userError) {
      console.error("❌ TEST - User query failed:", userError);
      return NextResponse.json({
        success: false,
        error: "User query failed",
        details: userError instanceof Error ? userError.message : 'Unknown user error',
        step: "user_query"
      }, { status: 500 });
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: "All diagnostic tests passed",
      token: {
        present: !!token,
        type: token?.startsWith('mock-dev-token-') ? 'mock' : 'real',
        role: userRole
      },
      database: {
        connected: true,
        municipalityTableAccessible: true,
        userTableAccessible: true
      },
      environment: {
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error("❌ TEST - Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: "Unexpected error in diagnostic test",
      details: error instanceof Error ? error.message : 'Unknown error',
      step: "unexpected_error"
    }, { status: 500 });
  }
}
