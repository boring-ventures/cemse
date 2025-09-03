import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    console.log(
      "🔐 Company Login API - Starting company authentication for:",
      username
    );

    // Try to authenticate against the Company table
    const company = await prisma.company.findUnique({
      where: {
        OR: [{ username: username }, { loginEmail: username }],
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

    if (!company) {
      console.log("🔐 Company Login API - Company not found:", username);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!company.isActive) {
      console.log("🔐 Company Login API - Company is inactive:", company.id);
      return NextResponse.json(
        { error: "Company account is inactive" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, company.password);

    if (!isValidPassword) {
      console.log(
        "🔐 Company Login API - Invalid password for company:",
        company.id
      );
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(
      "🔐 Company Login API - Company authentication successful:",
      company.name
    );

    // Generate JWT token for company
    const jwtToken = jwt.sign(
      {
        id: company.id,
        username: company.username,
        role: "EMPRESAS",
        type: "COMPANY",
        companyId: company.id,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Prepare company data for response
    const companyData = {
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

    const response = NextResponse.json(
      {
        success: true,
        company: companyData,
        role: "EMPRESAS",
        type: "COMPANY",
        message: "Company authentication successful",
      },
      { status: 200 }
    );

    // Set authentication cookie
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("cemse-auth-token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    console.log(
      "🔐 Company Login API - Company login successful for:",
      company.name
    );
    return response;
  } catch (error) {
    console.error("🔐 Company Login API - Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
