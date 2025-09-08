import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

console.log("🚨 ROUTE FILE LOADED: /api/company/[id]/route.ts");

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    // Basic authentication check
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required - please log in first" },
        { status: 401 }
      );
    }

    // For development, accept any token format
    const isAuthenticated =
      token.startsWith("mock-dev-token-") || token.length > 10;

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();

    console.log(`🔄 PUT /api/company/${resolvedParams.id} - Updating company`);

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingCompany) {
      console.log(
        "🔧 Company Update API - Company not found, attempting to create from user data"
      );

      // Try to create company from user/profile data
      try {
        // Get the user who should own this company
        // First try to find by company ID (for self-created companies)
        let user = await prisma.user.findUnique({
          where: { id: resolvedParams.id },
        });

        // If not found, try to find by company credentials (for admin-created companies)
        if (!user) {
          console.log(
            "🔧 Company Update API - User not found by ID, trying to find by company credentials"
          );
          const company = await prisma.company.findUnique({
            where: { id: resolvedParams.id },
          });

          if (company) {
            user = await prisma.user.findFirst({
              where: {
                OR: [
                  { username: company.username },
                  { email: company.loginEmail },
                ],
              },
            });
          }
        }

        if (!user || user.role !== "COMPANIES") {
          console.log(
            "❌ Company Update API - User not found or not a company user"
          );
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        // Get profile data
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        if (!profile) {
          console.log("❌ Company Update API - Profile not found");
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        // Get a default municipality (Cochabamba)
        const defaultMunicipality = await prisma.municipality.findFirst({
          where: { name: "Cochabamba" },
        });

        if (!defaultMunicipality) {
          console.log("❌ Company Update API - Default municipality not found");
          return NextResponse.json(
            { error: "Default municipality not found" },
            { status: 500 }
          );
        }

        // Create the company
        const newCompany = await prisma.company.create({
          data: {
            id: resolvedParams.id, // Use the provided ID
            name:
              profile.companyName ||
              profile.firstName ||
              body.name ||
              "Mi Empresa",
            description: profile.companyDescription || body.description || null,
            businessSector:
              profile.businessSector || body.businessSector || null,
            companySize: profile.companySize || body.companySize || "SMALL",
            foundedYear: profile.foundedYear || body.foundedYear || null,
            website: profile.website || body.website || null,
            email: profile.email || body.email || `${user.username}@cemse.dev`,
            phone: profile.phone || body.phone || null,
            address: profile.address || body.address || null,
            taxId: profile.taxId || body.taxId || null,
            legalRepresentative:
              profile.legalRepresentative || body.legalRepresentative || null,
            logoUrl: body.logoUrl || null,
            municipalityId: defaultMunicipality.id,
            createdBy: user.id,
            loginEmail: profile.email || `${user.username}@cemse.dev`,
            username: user.username,
            password: user.password,
          },
          include: {
            municipality: {
              select: {
                id: true,
                name: true,
                department: true,
              },
            },
            creator: {
              select: {
                username: true,
                role: true,
              },
            },
          },
        });

        console.log(
          "✅ Company Update API - Company created successfully:",
          newCompany.name
        );

        // Now update the newly created company with the provided data
        const updatedCompany = await prisma.company.update({
          where: { id: resolvedParams.id },
          data: {
            name: body.name,
            description: body.description,
            businessSector: body.businessSector,
            companySize: body.companySize,
            foundedYear: body.foundedYear,
            website: body.website,
            email: body.email,
            phone: body.phone,
            address: body.address,
            taxId: body.taxId,
            legalRepresentative: body.legalRepresentative,
            isActive: body.isActive !== undefined ? body.isActive : true,
            municipalityId: body.municipalityId || newCompany.municipalityId,
          },
          include: {
            municipality: {
              select: {
                id: true,
                name: true,
                department: true,
              },
            },
            creator: {
              select: {
                username: true,
                role: true,
              },
            },
          },
        });

        console.log(
          "✅ Company Update API - Company updated successfully:",
          updatedCompany.name
        );

        // Transform the data to match the expected format
        const transformedCompany = {
          id: updatedCompany.id,
          name: updatedCompany.name,
          description: updatedCompany.description,
          businessSector: updatedCompany.businessSector,
          companySize: updatedCompany.companySize,
          foundedYear: updatedCompany.foundedYear,
          website: updatedCompany.website,
          email: updatedCompany.email,
          phone: updatedCompany.phone,
          address: updatedCompany.address,
          taxId: updatedCompany.taxId,
          legalRepresentative: updatedCompany.legalRepresentative,
          isActive: updatedCompany.isActive,
          username: updatedCompany.username,
          loginEmail: updatedCompany.loginEmail,
          municipality: updatedCompany.municipality,
          creator: updatedCompany.creator,
          createdAt: updatedCompany.createdAt.toISOString(),
          updatedAt: updatedCompany.updatedAt.toISOString(),
        };

        return NextResponse.json(transformedCompany, { status: 200 });
      } catch (createError) {
        console.error(
          "❌ Company Update API - Failed to create company:",
          createError
        );
        return NextResponse.json(
          { error: "Company not found and could not be created" },
          { status: 404 }
        );
      }
    }

    // Update company using Prisma
    const updatedCompany = await prisma.company.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        description: body.description,
        businessSector: body.businessSector,
        companySize: body.companySize,
        foundedYear: body.foundedYear,
        website: body.website,
        email: body.email,
        phone: body.phone,
        address: body.address,
        taxId: body.taxId,
        legalRepresentative: body.legalRepresentative,
        logoUrl: body.logoUrl,
        isActive:
          body.isActive !== undefined
            ? body.isActive
            : existingCompany.isActive,
        municipalityId: body.municipalityId || existingCompany.municipalityId,
      },
      include: {
        municipality: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        creator: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    console.log("✅ Company updated successfully:", updatedCompany.name);

    // Transform the data to match the expected format
    const transformedCompany = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      description: updatedCompany.description,
      businessSector: updatedCompany.businessSector,
      companySize: updatedCompany.companySize,
      foundedYear: updatedCompany.foundedYear,
      website: updatedCompany.website,
      email: updatedCompany.email,
      phone: updatedCompany.phone,
      address: updatedCompany.address,
      taxId: updatedCompany.taxId,
      legalRepresentative: updatedCompany.legalRepresentative,
      isActive: updatedCompany.isActive,
      username: updatedCompany.username,
      loginEmail: updatedCompany.loginEmail,
      municipality: updatedCompany.municipality,
      creator: updatedCompany.creator,
      createdAt: updatedCompany.createdAt.toISOString(),
      updatedAt: updatedCompany.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedCompany, { status: 200 });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log(
      `🗑️ DELETE /api/company/${resolvedParams.id} - Starting deletion`
    );

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    console.log("🔍 DEBUG: Cookie inspection:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + "..." || "N/A",
    });

    // Basic authentication check - allow if token exists (mock or real)
    if (!token) {
      console.log("❌ No authentication token found in cookies");
      return NextResponse.json(
        { error: "Authentication required - please log in first" },
        { status: 401 }
      );
    }

    // For development, accept any token format
    const isAuthenticated =
      token.startsWith("mock-dev-token-") || token.length > 10;

    if (!isAuthenticated) {
      console.log("❌ Invalid authentication token");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    console.log(`🔑 Authentication successful, proceeding with deletion`);

    // Decode token to get current user ID to prevent session corruption
    let currentUserId: string | null = null;
    try {
      if (token && token.includes(".")) {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const base64Url = tokenParts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          currentUserId = payload.id || payload.userId || payload.sub;
          console.log(`🔍 Current authenticated user ID: ${currentUserId}`);
        }
      }
    } catch (decodeError) {
      console.warn("⚠️ Could not decode token to get user ID:", decodeError);
    }

    // Use Prisma to delete the company with cascade operations
    const companyId = resolvedParams.id;

    // Check if company exists first
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        municipality: {
          select: { name: true },
        },
      },
    });

    if (!existingCompany) {
      console.log(`❌ Company not found: ${companyId}`);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log(`🏢 Deleting company: ${existingCompany.name} (${companyId})`);

    // Perform cascade deletion using Prisma transaction
    const deletionResult = await prisma.$transaction(async (tx) => {
      // Count related data before deletion for reporting
      const jobOffersCount = await tx.jobOffer.count({
        where: { companyId: companyId },
      });

      const jobApplicationsCount = await tx.jobApplication.count({
        where: {
          jobOffer: { companyId: companyId },
        },
      });

      // Count news articles and comments created by the company
      const newsArticlesCount = await tx.newsArticle.count({
        where: {
          authorId: existingCompany.createdBy,
        },
      });

      const newsCommentsCount = await tx.newsComment.count({
        where: {
          userId: existingCompany.createdBy,
        },
      });

      // Delete related data in correct order (foreign key constraints)

      // 1. Delete news comments first (they reference news articles)
      await tx.newsComment.deleteMany({
        where: {
          userId: existingCompany.createdBy,
        },
      });

      // 2. Delete news articles created by the company
      await tx.newsArticle.deleteMany({
        where: {
          authorId: existingCompany.createdBy,
        },
      });

      // 3. Delete job applications
      await tx.jobApplication.deleteMany({
        where: {
          jobOffer: { companyId: companyId },
        },
      });

      // 4. Delete job offers
      await tx.jobOffer.deleteMany({
        where: { companyId: companyId },
      });

      // 5. Delete youth application interests
      const youthInterestsCount =
        await tx.youthApplicationCompanyInterest.count({
          where: { companyId: companyId },
        });

      await tx.youthApplicationCompanyInterest.deleteMany({
        where: { companyId: companyId },
      });

      // 6. Disconnect profiles associated with the company
      const profilesCount = await tx.profile.count({
        where: { companyId: companyId },
      });

      // Check if current user's profile would be affected
      let currentUserProfile = null;
      if (currentUserId) {
        currentUserProfile = await tx.profile.findUnique({
          where: { userId: currentUserId },
        });

        if (currentUserProfile?.companyId === companyId) {
          console.warn(
            `⚠️ Current user's profile is associated with company being deleted. This could affect their session.`
          );
        }
      }

      // Safely disconnect profiles from the company
      // This operation sets companyId to null for all profiles linked to the company
      await tx.profile.updateMany({
        where: { companyId: companyId },
        data: { companyId: null },
      });

      console.log(
        `🔄 Disconnected ${profilesCount} profiles from company ${companyId}`
      );

      // 7. Delete the company
      await tx.company.delete({
        where: { id: companyId },
      });

      // 8. Finally, delete the user account that created the company
      // This will also cascade delete any refresh tokens
      await tx.user.delete({
        where: { id: existingCompany.createdBy },
      });

      return {
        company: existingCompany.name,
        municipality: existingCompany.municipality?.name || "Unknown",
        jobOffers: jobOffersCount,
        jobApplications: jobApplicationsCount,
        newsArticles: newsArticlesCount,
        newsComments: newsCommentsCount,
        disconnectedProfiles: profilesCount,
        youthApplicationInterests: youthInterestsCount,
        userAccountDeleted: true,
      };
    });

    console.log("✅ Company deletion successful:", deletionResult);

    // Prepare response
    const response = NextResponse.json(
      {
        message:
          "Empresa eliminada exitosamente con eliminación en cascada completa",
        deletedData: deletionResult,
        // Include a flag if current user might need to refresh their session
        requiresSessionRefresh:
          currentUserId && deletionResult.disconnectedProfiles > 0,
      },
      { status: 200 }
    );

    // If current user's profile was affected, add a header to indicate session refresh needed
    if (currentUserId && deletionResult.disconnectedProfiles > 0) {
      response.headers.set("X-Session-Refresh-Recommended", "true");
      console.log(
        `ℹ️ Added session refresh recommendation due to profile disconnection`
      );
    }

    return response;
  } catch (error) {
    console.error("❌ Error in DELETE /api/company/[id]:", error);

    if (error instanceof Error) {
      // Handle specific Prisma errors
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Cannot delete company with existing dependencies" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    // Basic authentication check
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required - please log in first" },
        { status: 401 }
      );
    }

    // For development, accept any token format
    const isAuthenticated =
      token.startsWith("mock-dev-token-") || token.length > 10;

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    console.log(`🔍 GET /api/company/${resolvedParams.id} - Fetching company`);

    // Fetch company using Prisma
    const company = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
      include: {
        municipality: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        creator: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    if (!company) {
      console.log(
        "🔧 Company GET API - Company not found, attempting to create from user data"
      );

      // Try to create company from user/profile data
      try {
        // Get the user who should own this company
        // First try to find by company ID (for self-created companies)
        let user = await prisma.user.findUnique({
          where: { id: resolvedParams.id },
        });

        // If not found, try to find by company credentials (for admin-created companies)
        if (!user) {
          console.log(
            "🔧 Company GET API - User not found by ID, trying to find by company credentials"
          );
          const company = await prisma.company.findUnique({
            where: { id: resolvedParams.id },
          });

          if (company) {
            user = await prisma.user.findFirst({
              where: {
                OR: [
                  { username: company.username },
                  { email: company.loginEmail },
                ],
              },
            });
          }
        }

        if (!user || user.role !== "COMPANIES") {
          console.log(
            "❌ Company GET API - User not found or not a company user"
          );
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        // Get profile data
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        if (!profile) {
          console.log("❌ Company GET API - Profile not found");
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }

        // Get a default municipality (Cochabamba)
        const defaultMunicipality = await prisma.municipality.findFirst({
          where: { name: "Cochabamba" },
        });

        if (!defaultMunicipality) {
          console.log("❌ Company GET API - Default municipality not found");
          return NextResponse.json(
            { error: "Default municipality not found" },
            { status: 500 }
          );
        }

        // Create the company
        const newCompany = await prisma.company.create({
          data: {
            id: resolvedParams.id, // Use the provided ID
            name: profile.companyName || profile.firstName || "Mi Empresa",
            description: profile.companyDescription || null,
            businessSector: profile.businessSector || null,
            companySize: profile.companySize || "SMALL",
            foundedYear: profile.foundedYear || null,
            website: profile.website || null,
            email: profile.email || `${user.username}@cemse.dev`,
            phone: profile.phone || null,
            address: profile.address || null,
            taxId: profile.taxId || null,
            legalRepresentative: profile.legalRepresentative || null,
            logoUrl: null,
            municipalityId: defaultMunicipality.id,
            createdBy: user.id,
            loginEmail: profile.email || `${user.username}@cemse.dev`,
            username: user.username,
            password: user.password,
          },
          include: {
            municipality: {
              select: {
                id: true,
                name: true,
                department: true,
              },
            },
            creator: {
              select: {
                username: true,
                role: true,
              },
            },
          },
        });

        console.log(
          "✅ Company GET API - Company created successfully:",
          newCompany.name
        );

        // Transform the data to match the expected format
        const transformedCompany = {
          id: newCompany.id,
          name: newCompany.name,
          description: newCompany.description,
          businessSector: newCompany.businessSector,
          companySize: newCompany.companySize,
          foundedYear: newCompany.foundedYear,
          website: newCompany.website,
          email: newCompany.email,
          phone: newCompany.phone,
          address: newCompany.address,
          taxId: newCompany.taxId,
          legalRepresentative: newCompany.legalRepresentative,
          isActive: newCompany.isActive,
          username: newCompany.username,
          loginEmail: newCompany.loginEmail,
          municipality: newCompany.municipality,
          creator: newCompany.creator,
          createdAt: newCompany.createdAt.toISOString(),
          updatedAt: newCompany.updatedAt.toISOString(),
        };

        console.log("✅ Company fetched successfully:", newCompany.name);
        return NextResponse.json({ company: transformedCompany });
      } catch (createError) {
        console.error(
          "❌ Company GET API - Failed to create company:",
          createError
        );
        return NextResponse.json(
          { error: "Company not found and could not be created" },
          { status: 404 }
        );
      }
    }

    // Transform the data to match the expected format
    const transformedCompany = {
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
      taxId: company.taxId,
      legalRepresentative: company.legalRepresentative,
      isActive: company.isActive,
      username: company.username,
      loginEmail: company.loginEmail,
      municipality: company.municipality,
      creator: company.creator,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };

    console.log("✅ Company fetched successfully:", company.name);
    return NextResponse.json({ company: transformedCompany });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
