import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';

// Helper function to decode JWT token
function decodeToken(token: string) {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}



export async function POST(request: NextRequest) {
  try {
    console.log("🏛️ POST /api/municipality - Starting municipality creation");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("❌ POST /api/municipality - No auth token found in cookies");
      return NextResponse.json(
        { error: "Acceso denegado. Solo super administradores pueden crear instituciones." },
        { status: 403 }
      );
    }

    // Handle mock development tokens
    let decoded = null;
    if (token.startsWith('mock-dev-token-')) {
      console.log("🔐 POST /api/municipality - Mock token detected, allowing access");
      decoded = { role: 'SUPERADMIN', type: 'SUPERADMIN' };
    } else {
      decoded = decodeToken(token);
      if (!decoded) {
        console.log("❌ POST /api/municipality - Invalid token format");
        return NextResponse.json(
          { error: "Acceso denegado. Token inválido." },
          { status: 403 }
        );
      }
    }

    // Check if user has SUPERADMIN role
    const userRole = decoded.role || decoded.type;
    if (userRole !== "SUPERADMIN") {
      console.log(`❌ POST /api/municipality - Insufficient permissions. Role: ${userRole}`);
      return NextResponse.json(
        { error: "Acceso denegado. Solo super administradores pueden crear instituciones." },
        { status: 403 }
      );
    }

    console.log("✅ POST /api/municipality - Authentication successful");

    const body = await request.json();
    const {
      name,
      department,
      region,
      address,
      website,
      username,
      password,
      email,
      phone,
      institutionType,
      customType,
      primaryColor,
      secondaryColor
    } = body;

    // Validate required fields
    if (!name || !department || !username || !password || !email || !institutionType) {
      return NextResponse.json(
        { error: "Nombre, departamento, usuario, contraseña, email e institutionType son campos obligatorios" },
        { status: 400 }
      );
    }

    // Validate institutionType
    const validInstitutionTypes = ["MUNICIPALITY", "NGO", "FOUNDATION", "OTHER"];
    if (!validInstitutionTypes.includes(institutionType)) {
      return NextResponse.json(
        { error: "Tipo de institución inválido" },
        { status: 400 }
      );
    }

    // Get the creator user ID from the token
    const creatorUserId = decoded.id || "admin123"; // fallback for mock tokens

    // Validate unique constraints before creating
    console.log("🔍 Checking for existing municipality with:", { name, department, username, email });
    
    // Check for duplicate name + department combination
    const existingNameDept = await prisma.municipality.findFirst({
      where: {
        AND: [
          { name: name.trim() },
          { department: department.trim() }
        ]
      }
    });

    if (existingNameDept) {
      console.log("❌ Found existing municipality with same name and department:", existingNameDept.name);
      return NextResponse.json(
        { error: "Ya existe una institución con este nombre en el departamento" },
        { status: 400 }
      );
    }

    // Check for duplicate username
    const existingUsername = await prisma.municipality.findFirst({
      where: { username: username.trim() }
    });

    if (existingUsername) {
      console.log("❌ Found existing municipality with same username:", existingUsername.username);
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingEmail = await prisma.municipality.findFirst({
      where: { email: email.trim() }
    });

    if (existingEmail) {
      console.log("❌ Found existing municipality with same email:", existingEmail.email);
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    console.log("✅ No conflicts found, proceeding with creation");

    // Hash the password for secure storage
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Use database transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the municipality record
      const municipality = await tx.municipality.create({
        data: {
          name: name.trim(),
          department: department.trim(),
          region: region?.trim() || null,
          address: address?.trim() || null,
          website: website?.trim() || null,
          phone: phone?.trim() || null,
          institutionType,
          customType: customType?.trim() || null,
          primaryColor: primaryColor || "#1E40AF",
          secondaryColor: secondaryColor || "#F59E0B",
          username: username.trim(),
          password: hashedPassword,
          email: email.trim(),
          createdBy: creatorUserId,
          isActive: true
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });

      // Create a corresponding user account for authentication
      const municipalityUser = await tx.user.create({
        data: {
          username: username.trim(),
          password: hashedPassword,
          role: "MUNICIPAL_GOVERNMENTS", // Map to the correct role
          isActive: true
        }
      });

      console.log("🏛️ Municipality and user created successfully:", {
        municipalityId: municipality.id,
        userId: municipalityUser.id,
        name: municipality.name
      });

      return municipality;
    });

    console.log("✅ Municipality creation transaction completed successfully");

    return NextResponse.json(
      {
        message: "Institución creada exitosamente",
        municipality: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating municipality:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🏛️ GET /api/municipality - Fetching municipalities list");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("❌ GET /api/municipality - No auth token found in cookies");
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Handle mock development tokens
    let decoded = null;
    if (token.startsWith('mock-dev-token-')) {
      console.log("🔐 GET /api/municipality - Mock token detected, allowing access");
      decoded = { role: 'SUPERADMIN', type: 'SUPERADMIN' };
    } else {
      decoded = decodeToken(token);
      if (!decoded) {
        console.log("❌ GET /api/municipality - Invalid token format");
        return NextResponse.json(
          { error: "Acceso denegado. Token inválido." },
          { status: 403 }
        );
      }
    }

    // Check if user has SUPERADMIN role
    const userRole = decoded.role || decoded.type;
    if (userRole !== "SUPERADMIN") {
      console.log(`❌ GET /api/municipality - Insufficient permissions. Role: ${userRole}`);
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    console.log("✅ GET /api/municipality - Authentication successful");

    // Fetch municipalities from database
    const municipalities = await prisma.municipality.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        companies: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log("🏛️ GET municipalities - Returning data from database:", {
      total: municipalities.length,
      active: municipalities.filter(m => m.isActive).length,
      inactive: municipalities.filter(m => !m.isActive).length,
      names: municipalities.map(m => `${m.name} (${m.department})`)
    });

    return NextResponse.json({ municipalities });
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 