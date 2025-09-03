import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(request: NextRequest) {
  try {
    console.log("🏢 Companies API - Starting request");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🏢 Companies API - No auth token found");
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

      console.log("🏢 Companies API - User authenticated:", {
        userId,
        userRole,
        username: payload.username,
      });
    } catch (error) {
      console.error("🏢 Companies API - JWT verification failed:", error);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if user has permission to view companies
    const allowedRoles = ["SUPERADMIN", "MUNICIPAL_GOVERNMENTS", "INSTRUCTOR"];

    if (!allowedRoles.includes(userRole)) {
      console.log(`🏢 Companies API - Access denied for role: ${userRole}`);
      return NextResponse.json(
        { error: "Insufficient permissions to view companies" },
        { status: 403 }
      );
    }

    // Fetch companies from database with proper relations
    console.log("🏢 Companies API - Fetching companies from database");

    const companies = await prisma.company.findMany({
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
            id: true,
            username: true,
            role: true,
          },
        },
        jobOffers: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            jobOffers: true,
            profiles: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `🏢 Companies API - Successfully fetched ${companies.length} companies`
    );

    // Transform the data to include computed fields
    const transformedCompanies = companies.map((company) => ({
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
      // Login credentials (for admin view)
      username: company.username,
      loginEmail: company.loginEmail,
      // Relations
      municipality: company.municipality,
      creator: company.creator,
      // Computed fields
      jobOffersCount: company._count.jobOffers,
      employeesCount: company._count.profiles,
      activeJobOffers: company.jobOffers.filter(
        (job) => job.status === "ACTIVE"
      ).length,
      // Timestamps
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      companies: transformedCompanies,
      total: transformedCompanies.length,
      metadata: {
        totalActive: transformedCompanies.filter((c) => c.isActive).length,
        totalInactive: transformedCompanies.filter((c) => !c.isActive).length,
        totalJobOffers: transformedCompanies.reduce(
          (sum, c) => sum + c.jobOffersCount,
          0
        ),
        totalEmployees: transformedCompanies.reduce(
          (sum, c) => sum + c.employeesCount,
          0
        ),
      },
    });
  } catch (error) {
    console.error("🏢 Companies API - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🏢 Companies API - Creating new company");

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
        { error: "Insufficient permissions to create companies" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "municipalityId",
      "username",
      "password",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if municipality exists
    const municipality = await prisma.municipality.findUnique({
      where: { id: data.municipalityId },
    });

    if (!municipality) {
      return NextResponse.json(
        { error: "Municipality not found" },
        { status: 400 }
      );
    }

    // Use Prisma transaction to ensure both User and Company are created
    const result = await prisma.$transaction(async (tx) => {
      // Check if username already exists
      const existingUser = await tx.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        throw new Error(
          `Username '${data.username}' is already taken. Please choose a different username.`
        );
      }

      // Check if login email already exists in companies
      const existingCompany = await tx.company.findUnique({
        where: { loginEmail: data.email },
      });

      if (existingCompany) {
        throw new Error(
          `Email '${data.email}' is already registered for another company. Please use a different email.`
        );
      }

      // Hash the password before storing it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create User record for authentication
      console.log("🔐 Companies API - Creating User record for authentication");
      const user = await tx.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: "COMPANIES", // Use the correct role from UserRole enum
          isActive: true,
        },
      });
      console.log("✅ Companies API - User created with ID:", user.id);

      // Create the company
      const newCompany = await tx.company.create({
        data: {
          name: data.name,
          description: data.description || null,
          businessSector: data.businessSector || null,
          companySize: data.companySize || null,
          foundedYear: data.foundedYear || null,
          website: data.website || null,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          username: data.username,
          password: hashedPassword, // Use hashed password
          loginEmail: data.email, // Use the same email for login
          municipalityId: data.municipalityId,
          createdBy: user.id, // Use the newly created user ID
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
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      console.log(
        "✅ Companies API - Company created successfully:",
        newCompany.name
      );
      return { user, company: newCompany };
    });

    return NextResponse.json(
      {
        company: {
          id: result.company.id,
          name: result.company.name,
          description: result.company.description,
          businessSector: result.company.businessSector,
          companySize: result.company.companySize,
          foundedYear: result.company.foundedYear,
          website: result.company.website,
          email: result.company.email,
          phone: result.company.phone,
          address: result.company.address,
          isActive: result.company.isActive,
          username: result.company.username,
          loginEmail: result.company.loginEmail,
          municipality: result.company.municipality,
          creator: result.company.creator,
          createdAt: result.company.createdAt.toISOString(),
          updatedAt: result.company.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("🏢 Companies API - Creation error:", error);

    // Handle specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("Username") &&
        error.message.includes("already taken")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (
        error.message.includes("Email") &&
        error.message.includes("already registered")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      if (error.message.includes("username")) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      if (error.message.includes("loginEmail")) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
