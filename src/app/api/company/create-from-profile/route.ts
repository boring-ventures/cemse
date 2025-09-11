import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Company Creation API - Creating company from profile data");

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    console.log("🔧 Company Creation API - Token exists:", !!token);

    if (!token) {
      console.log("❌ Company Creation API - No authentication token");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    console.log("🔧 Company Creation API - User ID:", userId);

    if (!userId) {
      console.log("❌ Company Creation API - No user ID provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user and profile data
    console.log("🔧 Company Creation API - Fetching user data");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("🔧 Company Creation API - User found:", !!user, user?.role);

    if (!user || user.role !== "COMPANIES") {
      console.log(
        "❌ Company Creation API - User not found or not a company user"
      );
      return NextResponse.json(
        { error: "User not found or not a company user" },
        { status: 404 }
      );
    }

    console.log("🔧 Company Creation API - Fetching profile data");
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    console.log("🔧 Company Creation API - Profile found:", !!profile);

    if (!profile) {
      console.log("❌ Company Creation API - Profile not found");
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if company already exists
    console.log("🔧 Company Creation API - Checking for existing company");
    const existingCompany = await prisma.company.findFirst({
      where: { createdBy: user.id },
    });

    console.log(
      "🔧 Company Creation API - Existing company found:",
      !!existingCompany
    );

    if (existingCompany) {
      console.log("❌ Company Creation API - Company already exists");
      return NextResponse.json(
        { error: "Company already exists" },
        { status: 409 }
      );
    }

    // Get a default municipality (Cochabamba)
    const defaultMunicipality = await prisma.municipality.findFirst({
      where: { name: "Cochabamba" },
    });

    if (!defaultMunicipality) {
      return NextResponse.json(
        { error: "Default municipality not found" },
        { status: 500 }
      );
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
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
        municipalityId: defaultMunicipality.id,
        createdBy: user.id,
        loginEmail: profile.email || `${user.username}@cemse.dev`,
        username: user.username,
        password: user.password, // This should be hashed, but we'll use what's in the user record
      },
      include: {
        municipality: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    console.log("✅ Company created successfully:", company.name);

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
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedCompany, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating company from profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
