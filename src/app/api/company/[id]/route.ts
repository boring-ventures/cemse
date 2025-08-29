import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

console.log("🚨 ROUTE FILE LOADED: /api/company/[id]/route.ts");

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const isAuthenticated = token.startsWith('mock-dev-token-') || token.length > 10;
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const resolvedParams = params;
    const body = await request.json();
    
    console.log(`🔄 PUT /api/company/${resolvedParams.id} - Updating company`);

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
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
        isActive: body.isActive !== undefined ? body.isActive : existingCompany.isActive,
        municipalityId: body.municipalityId || existingCompany.municipalityId,
      },
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
      }
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
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params;
    console.log(`🗑️ DELETE /api/company/${resolvedParams.id} - Starting deletion`);

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    console.log("🔍 DEBUG: Cookie inspection:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + '...' || 'N/A',
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
    const isAuthenticated = token.startsWith('mock-dev-token-') || token.length > 10;
    
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
      if (token && token.includes('.')) {
        const tokenParts = token.split('.');
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
          select: { name: true }
        }
      }
    });

    if (!existingCompany) {
      console.log(`❌ Company not found: ${companyId}`);
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    console.log(`🏢 Deleting company: ${existingCompany.name} (${companyId})`);

    // Perform cascade deletion using Prisma transaction
    const deletionResult = await prisma.$transaction(async (tx) => {
      // Count related data before deletion for reporting
      const jobOffersCount = await tx.jobOffer.count({
        where: { companyId: companyId }
      });

      const jobApplicationsCount = await tx.jobApplication.count({
        where: { 
          jobOffer: { companyId: companyId }
        }
      });

      // Delete related data in correct order (foreign key constraints)
      
      // 1. Delete job applications first
      await tx.jobApplication.deleteMany({
        where: {
          jobOffer: { companyId: companyId }
        }
      });

      // 2. Delete job offers
      await tx.jobOffer.deleteMany({
        where: { companyId: companyId }
      });

      // 3. Delete youth application interests
      const youthInterestsCount = await tx.youthApplicationCompanyInterest.count({
        where: { companyId: companyId }
      });
      
      await tx.youthApplicationCompanyInterest.deleteMany({
        where: { companyId: companyId }
      });

      // 4. Disconnect profiles associated with the company
      const profilesCount = await tx.profile.count({
        where: { companyId: companyId }
      });

      // Check if current user's profile would be affected
      let currentUserProfile = null;
      if (currentUserId) {
        currentUserProfile = await tx.profile.findUnique({
          where: { userId: currentUserId }
        });
        
        if (currentUserProfile?.companyId === companyId) {
          console.warn(`⚠️ Current user's profile is associated with company being deleted. This could affect their session.`);
        }
      }

      // Safely disconnect profiles from the company
      // This operation sets companyId to null for all profiles linked to the company
      await tx.profile.updateMany({
        where: { companyId: companyId },
        data: { companyId: null }
      });
      
      console.log(`🔄 Disconnected ${profilesCount} profiles from company ${companyId}`);

      // 5. Finally delete the company
      await tx.company.delete({
        where: { id: companyId }
      });

      return {
        company: existingCompany.name,
        municipality: existingCompany.municipality?.name || "Unknown",
        jobOffers: jobOffersCount,
        jobApplications: jobApplicationsCount,
        jobQuestions: 0, // Not tracked in current schema
        disconnectedProfiles: profilesCount,
        youthApplicationInterests: youthInterestsCount,
      };
    });

    console.log("✅ Company deletion successful:", deletionResult);

    // Prepare response
    const response = NextResponse.json({
      message: "Empresa eliminada exitosamente",
      deletedData: deletionResult,
      // Include a flag if current user might need to refresh their session
      requiresSessionRefresh: currentUserId && deletionResult.disconnectedProfiles > 0
    }, { status: 200 });

    // If current user's profile was affected, add a header to indicate session refresh needed
    if (currentUserId && deletionResult.disconnectedProfiles > 0) {
      response.headers.set('X-Session-Refresh-Recommended', 'true');
      console.log(`ℹ️ Added session refresh recommendation due to profile disconnection`);
    }

    return response;

  } catch (error) {
    console.error("❌ Error in DELETE /api/company/[id]:", error);
    
    if (error instanceof Error) {
      // Handle specific Prisma errors
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
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
  { params }: { params: { id: string } }
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
    const isAuthenticated = token.startsWith('mock-dev-token-') || token.length > 10;
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const resolvedParams = params;
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
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
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