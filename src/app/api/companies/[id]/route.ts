import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🏢 Companies API - Updating company:", id);

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId: string;
    let userRole: string;
    
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      userId = payload.id;
      userRole = payload.role || payload.type;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check permissions
    const allowedRoles = ["SUPERADMIN", "MUNICIPAL_GOVERNMENTS", "INSTRUCTOR"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions to update companies" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if municipality exists (if provided)
    if (data.municipalityId) {
      const municipality = await prisma.municipality.findUnique({
        where: { id: data.municipalityId }
      });

      if (!municipality) {
        return NextResponse.json(
          { error: "Municipality not found" },
          { status: 400 }
        );
      }
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name: data.name || existingCompany.name,
        description: data.description !== undefined ? data.description : existingCompany.description,
        businessSector: data.businessSector !== undefined ? data.businessSector : existingCompany.businessSector,
        companySize: data.companySize !== undefined ? data.companySize : existingCompany.companySize,
        foundedYear: data.foundedYear !== undefined ? data.foundedYear : existingCompany.foundedYear,
        website: data.website !== undefined ? data.website : existingCompany.website,
        email: data.email || existingCompany.email,
        phone: data.phone !== undefined ? data.phone : existingCompany.phone,
        address: data.address !== undefined ? data.address : existingCompany.address,
        username: data.username || existingCompany.username,
        password: data.password || existingCompany.password, // In production, hash if provided
        loginEmail: data.email || existingCompany.loginEmail,
        municipalityId: data.municipalityId || existingCompany.municipalityId,
        isActive: data.isActive !== undefined ? data.isActive : existingCompany.isActive,
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
        },
        _count: {
          select: {
            jobOffers: true,
            profiles: true,
          }
        }
      }
    });

    console.log(`🏢 Companies API - Company updated successfully: ${updatedCompany.name}`);

    return NextResponse.json({
      company: {
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
        jobOffersCount: updatedCompany._count.jobOffers,
        employeesCount: updatedCompany._count.profiles,
        activeJobOffers: 0, // We'll need to calculate this separately if needed
        createdAt: updatedCompany.createdAt.toISOString(),
        updatedAt: updatedCompany.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error("🏢 Companies API - Update error:", error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('username')) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      if (error.message.includes('loginEmail')) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🏢 Companies API - Deleting company:", id);

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId: string;
    let userRole: string;
    
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      userId = payload.id;
      userRole = payload.role || payload.type;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check permissions - only SUPERADMIN can delete companies
    if (userRole !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Only SUPERADMIN can delete companies" },
        { status: 403 }
      );
    }

    // Check if company exists and get related data count
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobOffers: true,
            profiles: true,
            youthApplicationInterests: true,
          }
        }
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    console.log(`🏢 Companies API - Deleting company "${existingCompany.name}" with:`, {
      jobOffers: existingCompany._count.jobOffers,
      profiles: existingCompany._count.profiles,
      youthApplicationInterests: existingCompany._count.youthApplicationInterests,
    });

    // Use transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // 1. Delete job application messages for this company's job offers
      await tx.jobApplicationMessage.deleteMany({
        where: {
          application: {
            jobOffer: {
              companyId: id
            }
          }
        }
      });

      // 2. Delete job question answers for this company's job offers
      await tx.jobQuestionAnswer.deleteMany({
        where: {
          application: {
            jobOffer: {
              companyId: id
            }
          }
        }
      });

      // 3. Delete job applications for this company's job offers
      await tx.jobApplication.deleteMany({
        where: {
          jobOffer: {
            companyId: id
          }
        }
      });

      // 4. Delete job questions for this company's job offers
      await tx.jobQuestion.deleteMany({
        where: {
          jobOffer: {
            companyId: id
          }
        }
      });

      // 5. Delete youth application company interests
      await tx.youthApplicationCompanyInterest.deleteMany({
        where: {
          companyId: id
        }
      });

      // 6. Delete youth application messages where the company was involved
      await tx.youthApplicationMessage.deleteMany({
        where: {
          senderType: 'COMPANY',
          senderId: id
        }
      });

      // 7. Remove company association from profiles (set companyId to null)
      await tx.profile.updateMany({
        where: {
          companyId: id
        },
        data: {
          companyId: null
        }
      });

      // 8. Delete job offers
      await tx.jobOffer.deleteMany({
        where: {
          companyId: id
        }
      });

      // 9. Finally, delete the company itself
      await tx.company.delete({
        where: { id }
      });
    });

    console.log(`🏢 Companies API - Company "${existingCompany.name}" and all related data deleted successfully`);

    return NextResponse.json({
      message: `Company "${existingCompany.name}" and all related data deleted successfully`,
      deletedData: {
        companyName: existingCompany.name,
        jobOffers: existingCompany._count.jobOffers,
        employeeProfiles: existingCompany._count.profiles,
        youthApplicationInterests: existingCompany._count.youthApplicationInterests,
      }
    });

  } catch (error) {
    console.error("🏢 Companies API - Deletion error:", error);
    
    return NextResponse.json(
      { error: "Failed to delete company and related data" },
      { status: 500 }
    );
  }
}
