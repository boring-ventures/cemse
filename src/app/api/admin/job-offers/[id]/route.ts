import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";

// GET: Get job offer by ID (for Super Admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            businessSector: true,
            website: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        jobQuestions: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "Job offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error("Error fetching job offer:", error);
    return NextResponse.json(
      { error: "Failed to fetch job offer" },
      { status: 500 }
    );
  }
}

// PUT: Update job offer (for Super Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    // Check if job offer exists
    const existingJobOffer = await prisma.jobOffer.findUnique({
      where: { id },
    });

    if (!existingJobOffer) {
      return NextResponse.json(
        { error: "Job offer not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = { ...updates };

    // If companyId is being updated, verify the new company exists and handle the relation
    if (updates.companyId && updates.companyId !== existingJobOffer.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: updates.companyId },
      });

      if (!company || !company.isActive) {
        return NextResponse.json(
          { error: "Invalid or inactive company" },
          { status: 400 }
        );
      }

      // Add company relation to update data
      updateData.company = {
        connect: { id: updates.companyId },
      };
    }

    // Remove companyId from update data as it should be handled separately
    delete updateData.companyId;

    // Handle numeric fields
    if (updateData.salaryMin !== undefined) {
      updateData.salaryMin = updateData.salaryMin
        ? parseFloat(updateData.salaryMin)
        : null;
    }
    if (updateData.salaryMax !== undefined) {
      updateData.salaryMax = updateData.salaryMax
        ? parseFloat(updateData.salaryMax)
        : null;
    }

    // Handle date fields
    if (updateData.applicationDeadline !== undefined) {
      updateData.applicationDeadline = updateData.applicationDeadline
        ? new Date(updateData.applicationDeadline)
        : null;
    }
    if (updateData.expiresAt !== undefined) {
      updateData.expiresAt = updateData.expiresAt
        ? new Date(updateData.expiresAt)
        : null;
    }

    // Handle coordinates (latitude/longitude)
    if (updateData.coordinates && Array.isArray(updateData.coordinates)) {
      updateData.latitude = updateData.coordinates[0] || null;
      updateData.longitude = updateData.coordinates[1] || null;
      delete updateData.coordinates;
    }

    // Update job offer
    const updatedJobOffer = await prisma.jobOffer.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            businessSector: true,
            website: true,
          },
        },
      },
    });

    return NextResponse.json(updatedJobOffer);
  } catch (error) {
    console.error("Error updating job offer:", error);
    return NextResponse.json(
      { error: "Failed to update job offer" },
      { status: 500 }
    );
  }
}

// DELETE: Delete job offer (for Super Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if job offer exists
    const existingJobOffer = await prisma.jobOffer.findUnique({
      where: { id },
    });

    if (!existingJobOffer) {
      return NextResponse.json(
        { error: "Job offer not found" },
        { status: 404 }
      );
    }

    // Delete related records first to avoid foreign key constraint violations
    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      console.log(`🗑️ Deleting job offer ${id} and related records...`);

      // Delete job applications (these don't have cascade delete)
      const deletedApplications = await tx.jobApplication.deleteMany({
        where: { jobOfferId: id },
      });
      console.log(`🗑️ Deleted ${deletedApplications.count} job applications`);

      // Note: JobQuestions have onDelete: Cascade, so they'll be deleted automatically
      // when we delete the JobOffer

      // Now delete the job offer (this will cascade delete job questions)
      await tx.jobOffer.delete({
        where: { id },
      });
      console.log(`✅ Job offer ${id} deleted successfully`);
    });

    return NextResponse.json(
      { message: "Job offer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job offer:", error);
    return NextResponse.json(
      { error: "Failed to delete job offer" },
      { status: 500 }
    );
  }
}
