import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET() {
  try {
    console.log("📊 GET /api/company/stats - Starting request");

    // Get token from cookies (cookie-based authentication)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📊 API: No auth token found in cookies");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Decode token to get user info
    let userId: string;
    let userRole: string;
    
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.id;
        userRole = payload.role;
        console.log('📊 API: User from JWT:', { id: userId, role: userRole });
      } catch (error) {
        console.error("📊 API: JWT verification failed:", error);
        return NextResponse.json(
          { error: "Token de autenticación inválido" },
          { status: 401 }
        );
      }
    } else {
      console.log("📊 API: Invalid token format");
      return NextResponse.json(
        { error: "Token de autenticación inválido" },
        { status: 401 }
      );
    }

    // Get user from database to get complete info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    if (!user || !user.isActive) {
      console.log("📊 API: User not found or inactive:", userId);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check if user has permission to view company stats
    const allowedRoles = ['SUPERADMIN', 'MUNICIPAL_GOVERNMENTS'];
    if (!allowedRoles.includes(user.role || '')) {
      console.log("❌ Access denied - Role not allowed:", user.role);
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    console.log("📊 Calling CompanyService.getCompanyStats() with user info");
    const result = await CompanyService.getCompanyStats(
      user.id,
      user.role,
      user.profile?.municipalityId
    );
    console.log("📊 CompanyService stats result:", result);

    if (result.success) {
      console.log("✅ Success - Returning stats:", result.data);
      return NextResponse.json(result.data);
    } else {
      console.log("❌ CompanyService stats failed:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 Error in GET /api/company/stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 