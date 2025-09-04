import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";

// GET: List all job offers (for Super Admin)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    console.log("🔍 Authenticated user:", user);
    console.log("🔍 User role:", user.role);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      console.log("⚠️ Insufficient privileges for user role:", user.role);
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const companyId = searchParams.get("companyId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { municipality: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get job offers with company information
    const jobOffers = await prisma.jobOffer.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            businessSector: true,
            website: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.jobOffer.count({ where });

    return NextResponse.json({
      jobOffers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching job offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch job offers" },
      { status: 500 }
    );
  }
}

// POST: Create new job offer (for Super Admin)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    console.log("🔍 Authenticated user:", user);
    console.log("🔍 User role:", user.role);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      console.log("⚠️ Insufficient privileges for user role:", user.role);
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    const jobData = await request.json();

    const {
      title,
      description,
      requirements,
      benefits,
      salaryMin,
      salaryMax,
      salaryCurrency = "BOB",
      contractType,
      workSchedule,
      workModality,
      location,
      municipality,
      department = "Cochabamba",
      experienceLevel,
      educationRequired,
      skillsRequired = [],
      desiredSkills = [],
      applicationDeadline,
      companyId,
      status = "ACTIVE",
      featured = false,
      expiresAt,
      coordinates,
    } = jobData;

    // Validate required fields
    if (
      !title ||
      !description ||
      !requirements ||
      !location ||
      !contractType ||
      !workSchedule ||
      !workModality ||
      !experienceLevel ||
      !companyId ||
      !municipality
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, requirements, location, contractType, workSchedule, workModality, experienceLevel, companyId, municipality",
        },
        { status: 400 }
      );
    }

    // Verify company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || !company.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive company" },
        { status: 400 }
      );
    }

    // Create job offer
    const newJobOffer = await prisma.jobOffer.create({
      data: {
        title,
        description,
        requirements,
        benefits,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        salaryCurrency,
        contractType,
        workSchedule,
        workModality,
        location,
        municipality,
        department,
        experienceLevel,
        educationRequired,
        skillsRequired,
        desiredSkills,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        companyId,
        status,
        featured,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        latitude: coordinates?.[0] || null,
        longitude: coordinates?.[1] || null,
        isActive: true,
      },
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

    return NextResponse.json(newJobOffer, { status: 201 });
  } catch (error) {
    console.error("Error creating job offer:", error);
    return NextResponse.json(
      { error: "Failed to create job offer" },
      { status: 500 }
    );
  }
}

// PUT: Update job offer (for Super Admin)
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    console.log("🔍 Authenticated user:", user);
    console.log("🔍 User role:", user.role);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      console.log("⚠️ Insufficient privileges for user role:", user.role);
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    // Extract ID from the URL path since this is a PUT request
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "Job offer ID is required" },
        { status: 400 }
      );
    }

    const jobData = await request.json();

    // Update job offer
    const updatedJobOffer = await prisma.jobOffer.update({
      where: { id },
      data: {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        salaryMin: jobData.salaryMin ? parseFloat(jobData.salaryMin) : null,
        salaryMax: jobData.salaryMax ? parseFloat(jobData.salaryMax) : null,
        salaryCurrency: jobData.salaryCurrency,
        contractType: jobData.contractType,
        workSchedule: jobData.workSchedule,
        workModality: jobData.workModality,
        location: jobData.location,
        municipality: jobData.municipality,
        department: jobData.department,
        experienceLevel: jobData.experienceLevel,
        educationRequired: jobData.educationRequired,
        skillsRequired: jobData.skillsRequired,
        desiredSkills: jobData.desiredSkills,
        applicationDeadline: jobData.applicationDeadline
          ? new Date(jobData.applicationDeadline)
          : null,
        status: jobData.status,
        featured: jobData.featured,
        expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt) : null,
        latitude: jobData.coordinates?.[0] || null,
        longitude: jobData.coordinates?.[1] || null,
      },
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
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user using JWT token from cookies
    const user = await authenticateUser(request);

    console.log("🔍 Authenticated user:", user);
    console.log("🔍 User role:", user.role);

    // Check if user has admin privileges
    if (
      !["SUPERADMIN", "ADMIN", "TRAINING_CENTERS", "COMPANIES"].includes(
        user.role
      )
    ) {
      console.log("⚠️ Insufficient privileges for user role:", user.role);
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin access required. Current role: " + user.role,
        },
        { status: 401 }
      );
    }

    // Extract ID from the URL path since this is a DELETE request
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "Job offer ID is required" },
        { status: 400 }
      );
    }

    // Delete job offer
    await prisma.jobOffer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Job offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting job offer:", error);
    return NextResponse.json(
      { error: "Failed to delete job offer" },
      { status: 500 }
    );
  }
}
