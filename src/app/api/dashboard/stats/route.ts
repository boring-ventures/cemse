import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    let token: string | null = null;
    let decoded: any = null;

    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      decoded = verifyToken(token);
    } else {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get("cemse-auth-token")?.value;

      if (!cookieToken) {
        return NextResponse.json(
          { error: "No authentication token found" },
          { status: 401 }
        );
      }

      if (cookieToken.includes(".") && cookieToken.split(".").length === 3) {
        decoded = verifyToken(cookieToken);
      } else if (cookieToken.startsWith("auth-token-")) {
        const tokenParts = cookieToken.split("-");
        if (tokenParts.length >= 4) {
          const tokenUserId = tokenParts[3];
          const tokenUser = await prisma.user.findUnique({
            where: { id: tokenUserId, isActive: true },
          });

          if (tokenUser) {
            decoded = {
              id: tokenUser.id,
              username: tokenUser.username,
              role: tokenUser.role,
            };
          }
        }
      }
    }

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
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

    // Get comprehensive dashboard statistics
    const [
      totalCourses,
      totalJobOffers,
      totalCompanies,
      totalUsers,
      totalInstitutions,
      totalEntrepreneurships,
      totalNewsArticles,
      totalCertificates,
      totalEnrollments,
      totalJobApplications,
      totalYouthApplications,
      totalMunicipalities,
    ] = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.jobOffer.count({ where: { isActive: true } }),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.institution.count({ where: { isActive: true } }),
      prisma.entrepreneurship.count({ where: { isActive: true } }),
      prisma.newsArticle.count({ where: { status: "PUBLISHED" } }),
      prisma.certificate.count(),
      prisma.courseEnrollment.count(),
      prisma.jobApplication.count(),
      prisma.youthApplication.count({ where: { status: "ACTIVE" } }),
      prisma.municipality.count({ where: { isActive: true } }),
    ]);

    // Role-specific statistics
    let roleStats = {};

    if (["YOUTH", "ADOLESCENTS"].includes(user.role)) {
      const [
        userEnrollments,
        userCompletedCourses,
        userCertificates,
        userJobApplications,
        userEntrepreneurships,
        userYouthApplications,
      ] = await Promise.all([
        prisma.courseEnrollment.count({ where: { studentId: user.id } }),
        prisma.courseEnrollment.count({
          where: {
            studentId: user.id,
            status: "COMPLETED",
          },
        }),
        prisma.certificate.count({ where: { userId: user.id } }),
        prisma.jobApplication.count({ where: { applicantId: user.id } }),
        prisma.entrepreneurship.count({ where: { ownerId: user.id } }),
        prisma.youthApplication.count({ where: { youthProfileId: user.id } }),
      ]);

      roleStats = {
        enrolledCourses: userEnrollments,
        completedCourses: userCompletedCourses,
        certificates: userCertificates,
        jobApplications: userJobApplications,
        entrepreneurships: userEntrepreneurships,
        youthApplications: userYouthApplications,
        completionPercentage: profile?.profileCompletion || 0,
      };
    }

    if (user.role === "COMPANIES") {
      const company = await prisma.company.findFirst({
        where: { createdBy: user.id },
      });

      if (company) {
        const [
          companyJobOffers,
          companyJobApplications,
          companyYouthApplicationInterests,
        ] = await Promise.all([
          prisma.jobOffer.count({ where: { companyId: company.id } }),
          prisma.jobApplication.count({
            where: {
              jobOffer: { companyId: company.id },
            },
          }),
          prisma.youthApplicationCompanyInterest.count({
            where: { companyId: company.id },
          }),
        ]);

        roleStats = {
          jobOffers: companyJobOffers,
          jobApplications: companyJobApplications,
          youthApplicationInterests: companyYouthApplicationInterests,
        };
      }
    }

    if (
      [
        "MUNICIPAL_GOVERNMENTS",
        "TRAINING_CENTERS",
        "NGOS_AND_FOUNDATIONS",
      ].includes(user.role)
    ) {
      const [
        institutionCourses,
        institutionEnrollments,
        institutionCertificates,
      ] = await Promise.all([
        prisma.course.count({
          where: {
            instructorId: user.id,
            isActive: true,
          },
        }),
        prisma.courseEnrollment.count({
          where: {
            course: { instructorId: user.id },
          },
        }),
        prisma.certificate.count({
          where: {
            course: { instructorId: user.id },
          },
        }),
      ]);

      roleStats = {
        courses: institutionCourses,
        enrollments: institutionEnrollments,
        certificates: institutionCertificates,
      };
    }

    if (user.role === "SUPERADMIN") {
      const [
        totalProfiles,
        totalInactiveUsers,
        totalPendingUsers,
        recentRegistrations,
      ] = await Promise.all([
        prisma.profile.count(),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      roleStats = {
        totalProfiles,
        inactiveUsers: totalInactiveUsers,
        pendingUsers: totalPendingUsers,
        recentRegistrations,
      };
    }

    // Get recent activities based on user role
    let recentActivities = [];

    try {
      if (["YOUTH", "ADOLESCENTS"].includes(user.role)) {
        const recentEnrollments = await prisma.courseEnrollment.findMany({
          where: { studentId: user.id },
          include: { course: true },
          orderBy: { enrolledAt: "desc" },
          take: 5,
        });

        const recentJobApplications = await prisma.jobApplication.findMany({
          where: { applicantId: user.id },
          include: {
            jobOffer: {
              select: { title: true, company: { select: { name: true } } },
            },
          },
          orderBy: { appliedAt: "desc" },
          take: 5,
        });

        recentActivities = [
          ...recentEnrollments.map((enrollment) => ({
            id: enrollment.id,
            type: "course_enrollment" as const,
            title: `Inscrito en ${enrollment.course.title}`,
            description: `Progreso: ${enrollment.progress}%`,
            timestamp: enrollment.enrolledAt.toISOString(),
            icon: "📚",
          })),
          ...recentJobApplications.map((application) => ({
            id: application.id,
            type: "job_application" as const,
            title: `Aplicación enviada`,
            description: `${application.jobOffer.title} en ${application.jobOffer.company.name}`,
            timestamp: application.appliedAt.toISOString(),
            icon: "💼",
          })),
        ];
      }

      if (user.role === "COMPANIES") {
        const company = await prisma.company.findFirst({
          where: { createdBy: user.id },
        });

        if (company) {
          const recentJobOffers = await prisma.jobOffer.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: "desc" },
            take: 5,
          });

          const recentApplications = await prisma.jobApplication.findMany({
            where: {
              jobOffer: { companyId: company.id },
            },
            include: {
              applicant: { select: { firstName: true, lastName: true } },
              jobOffer: { select: { title: true } },
            },
            orderBy: { appliedAt: "desc" },
            take: 5,
          });

          recentActivities = [
            ...recentJobOffers.map((offer) => ({
              id: offer.id,
              type: "job_offer_created" as const,
              title: `Oferta de trabajo creada`,
              description: offer.title,
              timestamp: offer.createdAt.toISOString(),
              icon: "📋",
            })),
            ...recentApplications.map((app) => ({
              id: app.id,
              type: "job_application_received" as const,
              title: `Nueva aplicación`,
              description: `${app.applicant.firstName} ${app.applicant.lastName} para ${app.jobOffer.title}`,
              timestamp: app.appliedAt.toISOString(),
              icon: "👤",
            })),
          ];
        }
      }
    } catch (error) {
      console.log("Could not fetch recent activities:", error);
    }

    // Sort activities by timestamp
    recentActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

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
        municipality: profile?.municipality || "",
        department: profile?.department || "",
        profileCompletion: profile?.profileCompletion || 0,
      },
      globalStats: {
        totalCourses,
        totalJobOffers,
        totalCompanies,
        totalUsers,
        totalInstitutions,
        totalEntrepreneurships,
        totalNewsArticles,
        totalCertificates,
        totalEnrollments,
        totalJobApplications,
        totalYouthApplications,
        totalMunicipalities,
      },
      roleStats,
      recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
