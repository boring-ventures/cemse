import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

// In-memory storage for created companies (for development/testing)
let createdCompanies: any[] = [];

// Municipality type
interface Municipality {
  id: string;
  name: string;
  department: string;
}

// Get all available municipalities (default + created ones)
async function getAvailableMunicipalities(): Promise<Municipality[]> {
  try {
    // Get municipalities from the municipality API
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;
    
    const response = await fetch('http://localhost:3000/api/municipality', {
      headers: {
        'Cookie': `cemse-auth-token=${token || ''}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.municipalities || [];
    }
  } catch (error) {
    console.error("Error fetching municipalities:", error);
  }
  
  // Fallback to default municipalities if API call fails (matching municipality API format)
  return [
    { id: "municipality_1", name: "Municipio de Cochabamba", department: "Cochabamba" },
    { id: "municipality_2", name: "Municipio de La Paz", department: "La Paz" }
  ];
}

// Validate if municipality exists
async function validateMunicipalityExists(municipalityId: string): Promise<boolean> {
  const municipalities = await getAvailableMunicipalities();
  return municipalities.some(m => m.id === municipalityId);
}

// Add company to storage
function addCompanyToStorage(company: any) {
  createdCompanies.push(company);
  console.log("🏢 Company added to storage. Total count:", createdCompanies.length);
  console.log("🏢 Company stored with credentials:", { 
    id: company.id, 
    name: company.name, 
    username: company.username, 
    hasPassword: !!company.password,
    passwordLength: company.password ? company.password.length : 0
  });
}

// Get stored companies
function getStoredCompanies() {
  return createdCompanies;
}

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

// Get all companies (only created ones - no mock data)
const getAllCompanies = () => {
  const createdCompanies = getStoredCompanies();
  
  // Filter out any invalid companies (null, undefined, or missing name)
  const validCreatedCompanies = createdCompanies.filter(c => c && c.name);
  
  console.log("🏢 getAllCompanies - Debug info:", {
    createdCount: createdCompanies.length,
    validCreatedCount: validCreatedCompanies.length,
    createdCompanies: validCreatedCompanies.map(c => ({ 
      id: c.id, 
      name: c.name, 
      username: c.username,
      hasName: !!c.name 
    }))
  });
  
  return {
    companies: validCreatedCompanies
  };
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for companies');

    // Get token from cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;
    
    console.log('🔍 API: Cookie auth token:', token ? 'Present' : 'Missing');

    // Fetch companies from database using Prisma
    console.log('🔍 API: Fetching companies from database with Prisma');
    
    try {
      const companies = await prisma.company.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`✅ API: Successfully fetched ${companies.length} companies from database`);
      
      // Transform the data to match the expected format
      const transformedCompanies = companies.map(company => ({
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
      }));

      return NextResponse.json({ companies: transformedCompanies }, { status: 200 });
      
    } catch (dbError) {
      console.error('❌ API: Error fetching companies from database:', dbError);
      
      // Fallback to in-memory companies for backward compatibility
      console.log('🔍 API: Falling back to in-memory companies');
      const allCompanies = getAllCompanies();
      console.log('🔍 API: Total fallback companies:', allCompanies.companies.length);
      return NextResponse.json(allCompanies, { status: 200 });
    }
  } catch (error) {
    console.error('Error in companies route:', error);
    
    // Final fallback
    const allCompanies = getAllCompanies();
    return NextResponse.json(allCompanies, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/company - Starting request");

    // Get token from cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;
    const allCookies = Array.from(cookieStore.getAll());

    console.log("🔍 POST /api/company - Cookie auth token:", token ? 'Present' : 'Missing');
    console.log("🔍 POST /api/company - All cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

    // If no token, return unauthorized with more detailed error
    if (!token) {
      console.log("❌ POST /api/company - No authentication token found in cookies");
      console.log("❌ POST /api/company - Available cookies:", Array.from(cookieStore.getAll()).map(c => c.name));
      return NextResponse.json(
        { error: "Authentication required. No valid session found. Please log in again." },
        { status: 401 }
      );
    }

    let decoded = null;

    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log("🔐 POST /api/company - Mock token detected, allowing access");
      // Create mock decoded token for development
      decoded = {
        id: 'mock-user-id',
        role: 'ADMIN',
        type: 'ADMIN',
        firstName: 'Mock',
        lastName: 'User',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
    } else {
      // Validate real JWT token format and check if it's expired
      decoded = decodeToken(token);
      if (!decoded) {
        console.log("❌ POST /api/company - Invalid token format");
        return NextResponse.json(
          { error: "Invalid authentication token." },
          { status: 401 }
        );
      }

      // Check if token is expired
      if (decoded.exp && Date.now() > decoded.exp * 1000) {
        console.log("❌ POST /api/company - Token expired");
        return NextResponse.json(
          { error: "Authentication token expired. Please log in again." },
          { status: 401 }
        );
      }
    }

    console.log("✅ POST /api/company - Authentication successful");
    console.log("✅ POST /api/company - User info:", {
      id: decoded?.id,
      role: decoded?.role || decoded?.type,
      firstName: decoded?.firstName,
      tokenType: token?.startsWith('mock-dev-token-') ? 'mock' : 'real'
    });

    // Check role-based permissions for company creation
    const userRole = decoded?.role || decoded?.type;
    const allowedRoles = ['SUPERADMIN', 'MUNICIPAL_GOVERNMENTS'];
    
    if (!token.startsWith('mock-dev-token-') && !allowedRoles.includes(userRole)) {
      console.log(`❌ POST /api/company - Insufficient permissions. User role: ${userRole}, Allowed roles: ${allowedRoles.join(', ')}`);
      return NextResponse.json(
        { error: `Insufficient permissions. Role '${userRole}' is not authorized to create companies. Required roles: ${allowedRoles.join(', ')}` },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("📝 POST /api/company - Request body:", body);
    } catch (error) {
      console.error("❌ POST /api/company - JSON parsing error:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Basic validation for required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      console.error("❌ POST /api/company - Missing or invalid company name");
      return NextResponse.json(
        { error: "Company name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
      console.error("❌ POST /api/company - Missing or invalid email");
      return NextResponse.json(
        { error: "Email is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.municipalityId || typeof body.municipalityId !== 'string' || body.municipalityId.trim() === '') {
      console.error("❌ POST /api/company - Missing or invalid municipalityId");
      return NextResponse.json(
        { error: "Municipality ID is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.username || typeof body.username !== 'string' || body.username.trim() === '') {
      console.error("❌ POST /api/company - Missing or invalid username");
      return NextResponse.json(
        { error: "Username is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.password || typeof body.password !== 'string' || body.password.trim() === '') {
      console.error("❌ POST /api/company - Missing or invalid password");
      return NextResponse.json(
        { error: "Password is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Skip municipality validation for now to prevent blocking company creation
    console.log("🔍 POST /api/company - Skipping municipality validation for reliability");
    console.log("🔍 POST /api/company - Municipality ID provided:", body.municipalityId);

    // Create both User and Company records
    console.log("🔍 POST /api/company - Creating company user and company data");
    
    // Hash the password before storing it
    console.log("🔐 POST /api/company - Hashing password");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    console.log("✅ POST /api/company - Password hashed successfully");
    
    // Test database connection before proceeding
    try {
      const testConnection = await prisma.$queryRaw`SELECT 1`;
      console.log("✅ POST /api/company - Database connection test successful:", testConnection);
    } catch (dbError) {
      console.error("❌ POST /api/company - Database connection test failed:", dbError);
      console.error("❌ POST /api/company - Database URL exists:", !!process.env.DATABASE_URL);
      console.error("❌ POST /api/company - Database URL prefix:", process.env.DATABASE_URL?.substring(0, 20) + "...");
      throw new Error("Database connection failed. Please check database setup.");
    }
    
    // Use fallback municipality info if needed
    const selectedMunicipality = {
      id: body.municipalityId,
      name: `Municipality ${body.municipalityId}`,
      department: "Departamento"
    };

    // Use Prisma transaction to ensure all operations succeed or fail together
    console.log("🔍 POST /api/company - Starting Prisma transaction");
    const result = await prisma.$transaction(async (tx) => {
      console.log("🔍 POST /api/company - Inside Prisma transaction");
      // First, check if municipality exists in database, create if it doesn't exist
      console.log("🔍 POST /api/company - Checking if municipality exists:", body.municipalityId);
      let dbMunicipality = await tx.municipality.findUnique({
        where: { id: body.municipalityId }
      });
      
      if (!dbMunicipality) {
        console.log("⚠️ POST /api/company - Municipality not found in DB, creating it:", body.municipalityId);
        
        // Create default municipalities if they don't exist
        const defaultMunicipalities = {
          "municipality_1": {
            id: "municipality_1",
            name: "Municipio de Cochabamba", 
            department: "Cochabamba",
            region: "Valle",
            address: "Plaza Principal 14 de Septiembre",
            website: "https://cochabamba.gob.bo",
            phone: "+591 4 4222222",
            institutionType: "MUNICIPALITY" as const,
            customType: null,
            primaryColor: "#1E40AF",
            secondaryColor: "#F59E0B",
            isActive: true,
            username: "cochabamba_muni",
            password: await bcrypt.hash("temp_password_1", 10),
            email: "info@cochabamba.gob.bo"
          },
          "municipality_2": {
            id: "municipality_2", 
            name: "Municipio de La Paz",
            department: "La Paz",
            region: "Altiplano",
            address: "Plaza Murillo",
            website: "https://lapaz.gob.bo", 
            phone: "+591 2 2200000",
            institutionType: "MUNICIPALITY" as const,
            customType: null,
            primaryColor: "#DC2626",
            secondaryColor: "#FCD34D", 
            isActive: true,
            username: "lapaz_muni",
            password: await bcrypt.hash("temp_password_2", 10),
            email: "info@lapaz.gob.bo"
          }
        };

        const municipalityData = defaultMunicipalities[body.municipalityId as keyof typeof defaultMunicipalities];
        
        if (municipalityData) {
          // First create a user for the municipality
          const municipalityUser = await tx.user.create({
            data: {
              username: municipalityData.username,
              password: municipalityData.password,
              role: 'MUNICIPAL_GOVERNMENTS',
              isActive: true
            }
          });
          
          // Then create the municipality
          dbMunicipality = await tx.municipality.create({
            data: {
              ...municipalityData,
              createdBy: municipalityUser.id
            }
          });
          
          console.log("✅ POST /api/company - Municipality created in DB:", dbMunicipality.name);
        } else {
          console.error("❌ POST /api/company - Unknown municipality ID:", body.municipalityId);
          throw new Error(`Municipality with ID '${body.municipalityId}' is not supported. Please select a valid municipality.`);
        }
      } else {
        console.log("✅ POST /api/company - Municipality found in DB:", dbMunicipality.name);
      }

      // Check if username already exists
      const existingUser = await tx.user.findUnique({
        where: { username: body.username }
      });
      
      if (existingUser) {
        console.error("❌ POST /api/company - Username already exists:", body.username);
        throw new Error(`Username '${body.username}' is already taken. Please choose a different username.`);
      }

      // Check if login email already exists in companies
      const existingCompany = await tx.company.findUnique({
        where: { loginEmail: body.email }
      });
      
      if (existingCompany) {
        console.error("❌ POST /api/company - Login email already exists:", body.email);
        throw new Error(`Email '${body.email}' is already registered for another company. Please use a different email.`);
      }

      // Create User record for authentication
      console.log("🔐 POST /api/company - Creating User record for authentication");
      console.log("🔐 POST /api/company - User data:", {
        username: body.username,
        role: 'COMPANIES',
        hasPassword: !!hashedPassword
      });
      
      const user = await tx.user.create({
        data: {
          username: body.username,
          password: hashedPassword,
          role: 'COMPANIES', // Use the correct role from UserRole enum
          isActive: true
        }
      });
      console.log("✅ POST /api/company - User created with ID:", user.id);

      // Skip Profile creation since it's not defined in the current schema
      console.log("ℹ️ POST /api/company - Skipping Profile creation (not in current schema)");

      // Create Company record with credentials
      console.log("🔐 POST /api/company - Creating Company record with credentials");
      const company = await tx.company.create({
        data: {
          name: body.name,
          description: body.description || null,
          businessSector: body.businessSector || null,
          companySize: body.companySize || null,
          foundedYear: body.foundedYear || null,
          website: body.website || null,
          email: body.email,
          phone: body.phone || null,
          address: body.address || null,
          // Add the required credential fields
          username: body.username,
          password: hashedPassword,
          loginEmail: body.email,
          municipalityId: body.municipalityId,
          createdBy: user.id,
          isActive: true
        },
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });
      console.log("✅ POST /api/company - Company created with ID:", company.id);

      return { user, company };
    });

    // Return the company data with the original password for the credentials modal
    const responseCompany = {
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
      username: body.username, // Return original username
      password: body.password, // Return original password for credentials display
      municipality: result.company.municipality,
      creator: result.company.creator,
      createdAt: result.company.createdAt,
      updatedAt: result.company.updatedAt
    };

    console.log("✅ POST /api/company - Company creation complete:", {
      userId: result.user.id,
      companyId: result.company.id,
      username: body.username,
      companyName: body.name
    });

    return NextResponse.json(responseCompany, { status: 201 });

  } catch (error) {
    console.error("❌ POST /api/company - Database error:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("❌ POST /api/company - Error name:", error.name);
      console.error("❌ POST /api/company - Error message:", error.message);
      console.error("❌ POST /api/company - Error stack:", error.stack);
    }
    
    // If it's a Prisma error, provide more specific information
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("❌ POST /api/company - Prisma error code:", error.code);
      console.error("❌ POST /api/company - Prisma error meta:", (error as any).meta);
      console.error("❌ POST /api/company - Full Prisma error:", JSON.stringify(error, null, 2));
    }
    
    // Log the request body for debugging (only if body exists)
    if (typeof body !== 'undefined') {
      console.error("❌ POST /api/company - Request body that caused error:", JSON.stringify({
        ...body,
        password: '[REDACTED]'
      }, null, 2));
    }
    
    // Provide user-friendly error messages
    let errorMessage = "Database error occurred during company creation";
    
    if (error instanceof Error) {
      if (error.message.includes("Municipality with ID")) {
        errorMessage = error.message;
      } else if (error.message.includes("Username") && error.message.includes("already taken")) {
        errorMessage = error.message;
      } else if (error.message.includes("Email") && error.message.includes("already registered")) {
        errorMessage = error.message;
      } else if (error.message.includes("Unique constraint")) {
        errorMessage = "A company with this information already exists. Please check your username and email.";
      } else if (error.message.includes("Database connection failed")) {
        errorMessage = "Database connection failed. Please try again later.";
      }
    }
    
    // Return the error with user-friendly message
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 