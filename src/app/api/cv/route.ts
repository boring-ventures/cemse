import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// GET /api/cv - Obtener CV del usuario actual
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for CV data');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // For CV API, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`
        };
        console.log('🔍 API: Database token validated for user:', decoded.username);
      }
    } else {
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('🔍 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 API: Authenticated user:', decoded.username);

    const profile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Estructurar datos del CV
    const cvData = {
      personalInfo: {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        municipality: profile.municipality || "",
        department: profile.department || "",
        country: profile.country || "Bolivia",
        birthDate: profile.birthDate,
        gender: profile.gender || "",
        documentType: profile.documentType || "",
        documentNumber: profile.documentNumber || "",
      },
      education: {
        level: profile.educationLevel || "",
        institution: profile.currentInstitution || "",
        graduationYear: profile.graduationYear,
        isStudying: profile.isStudying || false,
        currentDegree: profile.currentDegree || "",
        universityName: profile.universityName || "",
        universityStartDate: profile.universityStartDate,
        universityEndDate: profile.universityEndDate,
        universityStatus: profile.universityStatus || "",
        gpa: profile.gpa,
        academicAchievements: profile.academicAchievements || [],
        educationHistory: profile.educationHistory || [],
      },
      professional: {
        skills: profile.skills || [],
        skillsWithLevel: profile.skillsWithLevel || [],
        interests: profile.interests || [],
        workExperience: profile.workExperience || [],
        jobTitle: profile.jobTitle || "",
        languages: profile.languages || [],
        websites: profile.websites || [],
      },
      additional: {
        achievements: profile.achievements || [],
        extracurricularActivities: profile.extracurricularActivities || [],
        projects: profile.projects || [],
      },
      coverLetter: {
        recipient: profile.coverLetterRecipient || "",
        subject: profile.coverLetterSubject || "",
        content: profile.coverLetterContent || "",
        template: profile.coverLetterTemplate || "default",
      },
      metadata: {
        profileCompletion: profile.profileCompletion || 0,
        lastUpdated: profile.updatedAt,
        createdAt: profile.createdAt,
      }
    };

    console.log('🔍 API: CV data prepared for user:', decoded.username);
    return NextResponse.json(cvData);
  } catch (error) {
    console.error("Error al obtener CV:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/cv - Actualizar datos del CV
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 API: Received request to update CV data');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // For CV API, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`
        };
        console.log('🔍 API: Database token validated for user:', decoded.username);
      }
    } else {
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('🔍 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 API: Authenticated user:', decoded.username);

    const body = await request.json();
    console.log('🔍 API: Request body:', body);

    const { personalInfo, education, professional, additional, coverLetter } = body;

    const updateData: any = {};

    // Actualizar información personal
    if (personalInfo) {
      updateData.firstName = personalInfo.firstName;
      updateData.lastName = personalInfo.lastName;
      updateData.email = personalInfo.email;
      updateData.phone = personalInfo.phone;
      updateData.address = personalInfo.address;
      updateData.municipality = personalInfo.municipality;
      updateData.department = personalInfo.department;
      updateData.country = personalInfo.country;
      updateData.birthDate = personalInfo.birthDate ? new Date(personalInfo.birthDate) : null;
      updateData.gender = personalInfo.gender;
      updateData.documentType = personalInfo.documentType;
      updateData.documentNumber = personalInfo.documentNumber;
    }

    // Actualizar educación
    if (education) {
      updateData.educationLevel = education.level;
      updateData.currentInstitution = education.institution;
      updateData.graduationYear = education.graduationYear;
      updateData.isStudying = education.isStudying;
      updateData.currentDegree = education.currentDegree;
      updateData.universityName = education.universityName;
      updateData.universityStartDate = education.universityStartDate ? new Date(education.universityStartDate) : null;
      updateData.universityEndDate = education.universityEndDate ? new Date(education.universityEndDate) : null;
      updateData.universityStatus = education.universityStatus;
      updateData.gpa = education.gpa;
      updateData.academicAchievements = education.academicAchievements;
      updateData.educationHistory = education.educationHistory;
    }

    // Actualizar información profesional
    if (professional) {
      if (professional.skills) updateData.skills = professional.skills;
      if (professional.skillsWithLevel) updateData.skillsWithLevel = professional.skillsWithLevel;
      if (professional.interests) updateData.interests = professional.interests;
      if (professional.workExperience) updateData.workExperience = professional.workExperience;
      if (professional.jobTitle) updateData.jobTitle = professional.jobTitle;
      if (professional.languages) updateData.languages = professional.languages;
      if (professional.websites) updateData.websites = professional.websites;
    }

    // Actualizar información adicional
    if (additional) {
      if (additional.achievements) updateData.achievements = additional.achievements;
      if (additional.extracurricularActivities) updateData.extracurricularActivities = additional.extracurricularActivities;
      if (additional.projects) updateData.projects = additional.projects;
    }

    // Actualizar carta de presentación
    if (coverLetter) {
      updateData.coverLetterRecipient = coverLetter.recipient;
      updateData.coverLetterSubject = coverLetter.subject;
      updateData.coverLetterContent = coverLetter.content;
      updateData.coverLetterTemplate = coverLetter.template;
    }

    // Calculate profile completion percentage
    const completionFields = [
      updateData.firstName, updateData.lastName, updateData.email, updateData.phone,
      updateData.municipality, updateData.educationLevel, updateData.skills,
      updateData.interests
    ];
    const completedFields = completionFields.filter(field => field && (Array.isArray(field) ? field.length > 0 : true));
    updateData.profileCompletion = Math.round((completedFields.length / completionFields.length) * 100);

    const updatedProfile = await prisma.profile.update({
      where: { userId: decoded.id },
      data: updateData,
    });

    console.log('🔍 API: CV updated for user:', decoded.username);
    return NextResponse.json({
      message: "CV actualizado exitosamente",
      profileCompletion: updateData.profileCompletion,
      updatedAt: updatedProfile.updatedAt,
    });
  } catch (error) {
    console.error("Error al actualizar CV:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}