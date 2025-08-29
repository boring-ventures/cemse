import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Mock authentication check for development
    const mockUserRole = "SUPERADMIN";
    
    if (mockUserRole !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const municipality = await prisma.municipality.findUnique({
      where: { id: resolvedParams.id },
      include: {
        companies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            businessSector: true,
            isActive: true
          }
        }
      }
    });

    if (!municipality) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ municipality });
  } catch (error) {
    console.error("Error fetching municipality:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("✏️ PUT /api/municipality - Starting municipality update");

    // Get token from cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Handle mock development tokens
    let decoded = null;
    if (token.startsWith('mock-dev-token-')) {
      decoded = { role: 'SUPERADMIN', type: 'SUPERADMIN' };
    } else {
      decoded = decodeToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: "Token inválido" },
          { status: 403 }
        );
      }
    }

    // Check if user has SUPERADMIN role
    const userRole = decoded.role || decoded.type;
    if (userRole !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo super administradores pueden editar municipios." },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    console.log("✏️ Update data received:", body);

    const {
      name,
      department,
      region,
      address,
      website,
      phone,
      email,
      institutionType,
      customType,
      primaryColor,
      secondaryColor,
      isActive
    } = body;

    // Validate required fields
    if (!name || !department || !email || !institutionType) {
      return NextResponse.json(
        { error: "Nombre, departamento, email e tipo de institución son campos obligatorios" },
        { status: 400 }
      );
    }

    // Check if municipality exists
    const existingMunicipality = await prisma.municipality.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingMunicipality) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    // Check for duplicates (excluding current municipality)
    const duplicateCheck = await prisma.municipality.findFirst({
      where: {
        OR: [
          { name, department, id: { not: resolvedParams.id } },
          { email, id: { not: resolvedParams.id } }
        ]
      }
    });

    if (duplicateCheck) {
      let errorMessage = "Ya existe una institución con estos datos";
      if (duplicateCheck.name === name && duplicateCheck.department === department) {
        errorMessage = "Ya existe una institución con este nombre en el departamento";
      } else if (duplicateCheck.email === email) {
        errorMessage = "El email ya está registrado por otra institución";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Use transaction to update both municipality and user records
    const result = await prisma.$transaction(async (tx) => {
      // Update municipality record
      const updatedMunicipality = await tx.municipality.update({
        where: { id: resolvedParams.id },
        data: {
          name: name.trim(),
          department: department.trim(),
          region: region?.trim() || null,
          address: address?.trim() || null,
          website: website?.trim() || null,
          phone: phone?.trim() || null,
          email: email.trim(),
          institutionType,
          customType: customType?.trim() || null,
          primaryColor: primaryColor || existingMunicipality.primaryColor,
          secondaryColor: secondaryColor || existingMunicipality.secondaryColor,
          isActive: isActive !== undefined ? isActive : existingMunicipality.isActive,
        },
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
              businessSector: true,
              isActive: true
            }
          }
        }
      });

      // Update associated user account if email changed
      if (email !== existingMunicipality.email) {
        await tx.user.updateMany({
          where: { username: existingMunicipality.username },
          data: { 
            // Note: We don't update username as it might break authentication
            // Only update if necessary and handle carefully
          }
        });
      }

      console.log("✏️ Municipality updated successfully:", updatedMunicipality.name);
      return updatedMunicipality;
    });

    return NextResponse.json(
      {
        message: "Institución actualizada exitosamente",
        municipality: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating municipality:", error);
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
    console.log("🗑️ DELETE /api/municipality - Starting municipality deletion");

    // Get token from cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Handle mock development tokens
    let decoded = null;
    if (token.startsWith('mock-dev-token-')) {
      decoded = { role: 'SUPERADMIN', type: 'SUPERADMIN' };
    } else {
      decoded = decodeToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: "Token inválido" },
          { status: 403 }
        );
      }
    }

    // Check if user has SUPERADMIN role
    const userRole = decoded.role || decoded.type;
    if (userRole !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo super administradores pueden eliminar municipios." },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    console.log("🗑️ Deleting municipality with ID:", resolvedParams.id);

    // Check if municipality exists and get all related data
    const municipality = await prisma.municipality.findUnique({
      where: { id: resolvedParams.id },
      include: {
        companies: {
          include: {
            jobOffers: true,
            profiles: true,
            youthApplicationInterests: true
          }
        }
      }
    });

    if (!municipality) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    // Find the associated user account for this municipality
    const municipalityUser = await prisma.user.findUnique({
      where: { username: municipality.username }
    });

    // Use transaction for cascade deletion to ensure data consistency
    await prisma.$transaction(async (tx) => {
      console.log("🗑️ Starting cascade deletion transaction");

      // 1. Delete all companies and their related data
      for (const company of municipality.companies) {
        console.log(`🗑️ Deleting company: ${company.name}`);
        
        // Delete job applications for company's job offers
        await tx.jobApplication.deleteMany({
          where: {
            jobOffer: {
              companyId: company.id
            }
          }
        });

        // Delete job offers
        await tx.jobOffer.deleteMany({
          where: { companyId: company.id }
        });

        // Delete youth application interests
        await tx.youthApplicationCompanyInterest.deleteMany({
          where: { companyId: company.id }
        });

        // Update profiles to remove company association
        await tx.profile.updateMany({
          where: { companyId: company.id },
          data: { companyId: null }
        });
      }

      // 2. Delete all companies associated with this municipality
      await tx.company.deleteMany({
        where: { municipalityId: municipality.id }
      });

      // 3. Find and delete news articles created by municipality users
      if (municipalityUser) {
        // Find profiles associated with this municipality user
        const municipalityProfile = await tx.profile.findUnique({
          where: { userId: municipalityUser.id }
        });

        if (municipalityProfile) {
          console.log("🗑️ Deleting news articles created by municipality");
          
          // Delete news comments first (due to foreign key constraints)
          await tx.newsComment.deleteMany({
            where: {
              news: {
                authorId: municipalityProfile.userId
              }
            }
          });

          // Delete news articles
          await tx.newsArticle.deleteMany({
            where: { authorId: municipalityProfile.userId }
          });

          // Delete the profile
          await tx.profile.delete({
            where: { userId: municipalityUser.id }
          });
        }

        // Delete refresh tokens
        await tx.refreshToken.deleteMany({
          where: { userId: municipalityUser.id }
        });

        // Delete the user account
        console.log("🗑️ Deleting municipality user account");
        await tx.user.delete({
          where: { id: municipalityUser.id }
        });
      }

      // 4. Finally, delete the municipality itself
      console.log("🗑️ Deleting municipality record");
      await tx.municipality.delete({
        where: { id: resolvedParams.id }
      });

      console.log("✅ Cascade deletion completed successfully");
    });

    return NextResponse.json(
      {
        message: "Municipio y todos sus datos relacionados eliminados exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting municipality:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 