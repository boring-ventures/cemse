import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Same secret as auth routes

// GET: List all companies (for Super Admin)
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Admin companies API - Getting token from cookies");

    // Get token from cookies instead of Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🔍 Admin companies API - No auth token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized. No authentication token found." },
        { status: 401 }
      );
    }

    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log("🔐 Admin companies API - Mock token detected, allowing access");
      // Mock tokens are considered admin for development
    } else {
      // Verify JWT token using proper JWT verification
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        console.log("🔍 Admin companies API - JWT payload:", {
          id: payload.id,
          username: payload.username,
          role: payload.role,
          type: payload.type
        });

        // Also check the user's actual role in the database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, username: true, role: true, isActive: true }
          });
          console.log("🔍 Admin companies API - User from database:", dbUser);
        } catch (dbError) {
          console.error("🔍 Admin companies API - Database user lookup failed:", dbError);
        }

        // Check if user has admin permissions (multiple roles can manage companies)
        const userRole = payload.type || payload.role;
        const allowedRoles = ["SUPERADMIN", "MUNICIPAL_GOVERNMENTS", "INSTRUCTOR", "TRAINING_CENTERS", "NGOS_AND_FOUNDATIONS"];
        
        console.log(`🔍 Admin companies API - Detailed role check:`, {
          payloadRole: payload.role,
          payloadType: payload.type,
          finalUserRole: userRole,
          allowedRoles: allowedRoles,
          isAllowed: allowedRoles.includes(userRole),
          username: payload.username
        });
        
        if (!allowedRoles.includes(userRole)) {
          console.log(`🔍 Admin companies API - Insufficient permissions. Role: ${userRole}, Allowed: ${allowedRoles.join(', ')}`);
          return NextResponse.json(
            { error: "Unauthorized. Admin access required." },
            { status: 401 }
          );
        }

        console.log(`✅ Admin companies API - Role ${userRole} has permission to access companies`);
      } catch (error) {
        console.error("🔍 Admin companies API - JWT verification failed:", error);
        return NextResponse.json(
          { error: "Unauthorized. Invalid or expired token." },
          { status: 401 }
        );
      }
    }

    console.log("✅ Admin companies API - Authentication successful");

    // Fetch all companies from database using Prisma
    try {
      console.log("🔍 Admin companies API - Fetching companies from database with Prisma");
      
      const companies = await prisma.company.findMany({
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true,
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`✅ Admin companies API - Successfully fetched ${companies.length} companies from database`);
      
      // Transform the data to match the expected format
      const transformedCompanies = companies.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        businessSector: company.businessSector,
        companySize: company.companySize,
        foundedYear: company.foundedYear,
        website: company.website,
        email: company.email,
        phone: company.phone,
        address: company.address,
        isActive: company.isActive,
        username: company.username,
        loginEmail: company.loginEmail,
        municipality: company.municipality,
        creator: company.creator,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      }));

      return NextResponse.json(transformedCompanies);
      
    } catch (error) {
      console.error("❌ Admin companies API - Error fetching companies from database:", error);
      return NextResponse.json(
        { error: "Failed to fetch companies from database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
