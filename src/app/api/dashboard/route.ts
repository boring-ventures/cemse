import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user and profile data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile = null;
    try {
      profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
    } catch (error) {
      console.log("No profile found for user:", user.id);
    }

    // Get dashboard stats based on user role
    let stats = {
      totalCourses: 0,
      enrolledCourses: 0,
      completedCourses: 0,
      certificates: 0,
      jobApplications: 0,
      totalJobOffers: 0,
      totalCompanies: 0,
      totalUsers: 0,
    };

    try {
      // Get basic stats from database
      const [totalCourses, totalUsers] = await Promise.all([
        prisma.course.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: true } }),
      ]);

      stats.totalCourses = totalCourses;
      stats.totalUsers = totalUsers;

      // Role-specific stats
      if (user.role === "SUPERADMIN") {
        const [totalCompanies, totalJobOffers] = await Promise.all([
          prisma.company.count({ where: { isActive: true } }),
          prisma.jobOffer.count({ where: { isActive: true } }),
        ]);
        stats.totalCompanies = totalCompanies;
        stats.totalJobOffers = totalJobOffers;
      }

      if (["YOUTH", "ADOLESCENTS"].includes(user.role) && profile) {
        const [enrollments, certificates, applications] = await Promise.all([
          prisma.courseEnrollment.count({ where: { studentId: user.id } }),
          prisma.certificate.count({ where: { userId: user.id } }),
          prisma.jobApplication.count({ where: { applicantId: user.id } }),
        ]);

        stats.enrolledCourses = enrollments;
        stats.certificates = certificates;
        stats.jobApplications = applications;

        const completedEnrollments = await prisma.courseEnrollment.count({
          where: {
            studentId: user.id,
            status: "COMPLETED",
          },
        });
        stats.completedCourses = completedEnrollments;
      }

      if (user.role === "EMPRESAS") {
        const company = await prisma.company.findFirst({
          where: { createdBy: user.id },
        });

        if (company) {
          const jobOffers = await prisma.jobOffer.count({
            where: { companyId: company.id },
          });
          stats.totalJobOffers = jobOffers;
        }
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      // Continue with default stats
    }

    // Return dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        profilePicture: profile?.avatarUrl || null,
      },
      stats,
      recentActivity: [], // Empty for now
      notifications: [], // Empty for now
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
