import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Same secret as auth/me

console.log('💼 JobOffer API - JWT_SECRET configured:', !!JWT_SECRET);
console.log('💼 JobOffer API - JWT_SECRET length:', JWT_SECRET.length);
console.log('💼 JobOffer API - JWT_SECRET preview:', JWT_SECRET.substring(0, 10) + '...');



function verifyToken(token: string) {
  try {
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      const parts = token.split('-');
      if (parts.length >= 4) {
        const username = parts.slice(3, -1).join('-');
        return {
          id: username,
          username: username,
          role: 'EMPRESAS',
          type: 'mock'
        };
      }
    }
    
    // Try multiple possible JWT secrets (for debugging)
    const possibleSecrets = [
      JWT_SECRET,
      'supersecretkey',
      process.env.JWT_SECRET,
      'your-secret-key',
      'cemse-secret'
    ].filter(Boolean);
    
    for (const secret of possibleSecrets) {
      try {
        console.log('🔍 Trying JWT secret:', secret?.substring(0, 10) + '...');
        const decoded = jwt.verify(token, secret as string) as any;
        console.log('✅ JWT verified successfully with secret:', secret?.substring(0, 10) + '...');
        return decoded;
      } catch (secretError) {
        console.log('❌ Failed with secret:', secret?.substring(0, 10) + '...', secretError instanceof Error ? secretError.message : 'Unknown');
        continue;
      }
    }
    
    throw new Error('No valid JWT secret found');
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function GET(request: NextRequest) {
  console.log('🔍 === JOBOFFER API ROUTE CALLED ===');
  console.log('🔍 Request URL:', request.url);
  console.log('🔍 Request method:', request.method);
  
  try {
    console.log('🔍 Inside try block - getting job offers...');

    // Get token from cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    console.log('🔍 All cookies:', allCookies.map(c => c.name));
    console.log('🔍 Auth token exists:', !!token);
    console.log('🔍 Token preview:', token ? token.substring(0, 30) + '...' : 'None');
    
    if (!token) {
      console.log('❌ No auth token found in cookies');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // Verify the user exists and is active
        const tokenUser = await prisma.user.findUnique({
          where: { id: tokenUserId, isActive: true }
        });
        
        if (tokenUser) {
          decoded = {
            id: tokenUser.id,
            username: tokenUser.username,
            role: tokenUser.role,
            type: 'database'
          };
        }
      }
    } else {
      // JWT token or mock token
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('❌ Invalid or expired token');
      console.log('❌ Token type detected:', token.startsWith('auth-token-') ? 'database' : token.includes('.') ? 'jwt' : 'unknown');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ Token validated successfully for user:', decoded.username || decoded.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const municipality = searchParams.get('municipality');
    const companyId = searchParams.get('companyId');
    
    console.log('💼 /api/joboffer - Filters:', { status, category, municipality, companyId });

    // Build query filters
    const whereClause: any = {};
    
    // If companyId is provided, filter by company (for company dashboard)
    // Otherwise, only show active jobs (for public/youth view)
    if (companyId) {
      whereClause.companyId = companyId;
    } else {
      whereClause.isActive = true;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (municipality) {
      whereClause.municipality = municipality;
    }

    // Fetch job offers from database
    const jobOffers = await prisma.jobOffer.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // No mock data - return actual database results only

    console.log('💼 /api/joboffer - Found job offers:', jobOffers.length);
    return NextResponse.json(jobOffers);

  } catch (error) {
    console.error('❌ FATAL ERROR in joboffer API:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Error al cargar ofertas de trabajo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let finalCompanyId: string | undefined;
  let jobData: any = {};
  
  try {
    console.log('💼 /api/joboffer POST - Creating job offer');

    // Debug: Log all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('💼 /api/joboffer POST - All cookies received:', allCookies.map(c => c.name));
    
    // Get token from cookies
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    console.log('💼 /api/joboffer POST - Auth token found:', token ? 'YES' : 'NO');
    console.log('💼 /api/joboffer POST - Token preview:', token ? token.substring(0, 20) + '...' : 'N/A');
    
    if (!token) {
      console.log('❌ No auth token found in cookies');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      console.log('💼 /api/joboffer POST - JWT token found in cookies');
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log('💼 /api/joboffer POST - Database token found in cookies');
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // Verify the user exists and is active
        const tokenUser = await prisma.user.findUnique({
          where: { id: tokenUserId, isActive: true }
        });
        
        if (tokenUser) {
          // Create a mock decoded object for database tokens
          decoded = {
            id: tokenUser.id,
            username: tokenUser.username,
            role: tokenUser.role
          };
          console.log('💼 /api/joboffer POST - Database token validated for user:', tokenUser.username);
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ Token validated for user:', decoded.userId || decoded.id);
    console.log('🔍 DEBUG - Full decoded token:', JSON.stringify(decoded, null, 2));
    console.log('🔍 DEBUG - User type from token:', decoded.type);
    console.log('🔍 DEBUG - User role from token:', decoded.role);

    // Check if request has FormData (for image uploads) or JSON
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      console.log('📁 Processing FormData request');
      const formData = await request.formData();
      
      // Extract basic fields from FormData
      jobData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        requirements: formData.get('requirements') as string,
        location: formData.get('location') as string,
        contractType: formData.get('contractType') as string,
        workSchedule: formData.get('workSchedule') as string,
        workModality: formData.get('workModality') as string,
        experienceLevel: formData.get('experienceLevel') as string,
        municipality: formData.get('municipality') as string,
        companyId: formData.get('companyId') as string,
        department: formData.get('department') as string || 'Cochabamba',
        educationRequired: formData.get('educationRequired') as string || null,
      };

      // Handle optional fields
      const salaryMin = formData.get('salaryMin') as string;
      const salaryMax = formData.get('salaryMax') as string;
      const benefits = formData.get('benefits') as string;
      const applicationDeadline = formData.get('applicationDeadline') as string;
      const latitude = formData.get('latitude') as string;
      const longitude = formData.get('longitude') as string;
      
      if (salaryMin) jobData.salaryMin = parseFloat(salaryMin);
      if (salaryMax) jobData.salaryMax = parseFloat(salaryMax);
      if (benefits) jobData.benefits = benefits;
      
      // Safely handle date parsing
      if (applicationDeadline && applicationDeadline.trim() !== '') {
        const parsedDate = new Date(applicationDeadline);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          jobData.applicationDeadline = parsedDate;
        } else {
          console.warn('⚠️ Invalid application deadline provided:', applicationDeadline);
          jobData.applicationDeadline = undefined;
        }
      } else {
        jobData.applicationDeadline = undefined;
      }
      
      if (latitude) jobData.latitude = parseFloat(latitude);
      if (longitude) jobData.longitude = parseFloat(longitude);

      // Handle skills arrays
      const skillsRequired = formData.get('skillsRequired') as string;
      const desiredSkills = formData.get('desiredSkills') as string;
      
      if (skillsRequired) {
        try {
          jobData.skillsRequired = JSON.parse(skillsRequired);
        } catch (e) {
          jobData.skillsRequired = [skillsRequired];
        }
      } else {
        jobData.skillsRequired = ['Sin especificar'];
      }

      if (desiredSkills) {
        try {
          jobData.desiredSkills = JSON.parse(desiredSkills);
        } catch (e) {
          jobData.desiredSkills = [desiredSkills];
        }
      } else {
        jobData.desiredSkills = [];
      }

      // Handle image files (for now, just store empty array - we'll implement file upload later)
      const images = formData.getAll('images') as File[];
      console.log(`📷 Received ${images.length} images`);
      jobData.images = []; // TODO: Implement actual image upload

    } else {
      console.log('📄 Processing JSON request');
      try {
        jobData = await request.json();
        console.log('📄 JSON data parsed successfully:', Object.keys(jobData));
        
        // Set default department if not provided
        if (!jobData.department) {
          jobData.department = 'Cochabamba';
        }
        
        // Safely handle date parsing for JSON requests
        if (jobData.applicationDeadline) {
          if (typeof jobData.applicationDeadline === 'string' && jobData.applicationDeadline.trim() !== '') {
            const parsedDate = new Date(jobData.applicationDeadline);
            // Check if the date is valid
            if (!isNaN(parsedDate.getTime())) {
              jobData.applicationDeadline = parsedDate;
            } else {
              console.warn('⚠️ Invalid application deadline provided:', jobData.applicationDeadline);
              jobData.applicationDeadline = undefined;
            }
          } else if (jobData.applicationDeadline instanceof Date) {
            // Already a Date object, check if valid
            if (isNaN(jobData.applicationDeadline.getTime())) {
              console.warn('⚠️ Invalid Date object provided for application deadline');
              jobData.applicationDeadline = undefined;
            }
          } else {
            // Not a string or Date, set to undefined
            jobData.applicationDeadline = undefined;
          }
        }
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON:', jsonError);
        return NextResponse.json(
          { error: 'Invalid JSON data in request body' },
          { status: 400 }
        );
      }
    }

    console.log('💼 /api/joboffer POST - Job data prepared:', {
      title: jobData.title,
      companyId: jobData.companyId,
      contractType: jobData.contractType,
      workModality: jobData.workModality,
      experienceLevel: jobData.experienceLevel,
      municipality: jobData.municipality,
      department: jobData.department,
      skillsRequired: jobData.skillsRequired,
      desiredSkills: jobData.desiredSkills,
    });
    
    console.log('🔍 DEBUG - Full job data received:', JSON.stringify(jobData, null, 2));
    
    console.log('🔍 DEBUG - About to check if company exists in database...');
    
    // For company users, check if they have a company record or if we need to create one
    let existingCompany = await prisma.company.findUnique({
      where: { id: jobData.companyId }
    });
    
    console.log('🔍 DEBUG - Company exists:', !!existingCompany);
    console.log('🔍 DEBUG - Company data:', existingCompany ? { id: existingCompany.id, name: existingCompany.name } : 'NOT FOUND');

    // If company doesn't exist, check if this is a company user and create the company record
    if (!existingCompany && decoded.role === 'COMPANIES') {
      console.log('🔍 Company user without company record - creating company record...');
      
      try {
        // Get user information for creating company
        const companyUser = await prisma.user.findUnique({
          where: { id: decoded.id }
        });
        
        // Get the user's profile separately
        const userProfile = await prisma.profile.findUnique({
          where: { userId: decoded.id }
        });
        
        if (!companyUser) {
          return NextResponse.json(
            { error: 'Usuario de empresa no encontrado en la base de datos' },
            { status: 400 }
          );
        }

        // Get the first available municipality or use a default
        let municipality = await prisma.municipality.findFirst();
        if (!municipality) {
          return NextResponse.json(
            { error: 'No hay municipios disponibles. Contacta al administrador.' },
            { status: 500 }
          );
        }

        // Get superadmin user for createdBy field
        const superAdmin = await prisma.user.findFirst({
          where: { role: 'SUPERADMIN' }
        });
        
        if (!superAdmin) {
          return NextResponse.json(
            { error: 'No se encontró administrador del sistema. Contacta al soporte técnico.' },
            { status: 500 }
          );
        }

        // Create company record from user data
        existingCompany = await prisma.company.create({
          data: {
            id: companyUser.id, // Use user ID as company ID
            name: userProfile?.companyName || userProfile?.firstName || companyUser.username || 'Mi Empresa',
            description: userProfile?.companyDescription || 'Empresa registrada en el sistema CEMSE',
            username: `empresa_${companyUser.id}`,
            loginEmail: `empresa_${companyUser.id}@cemse.dev`,
            password: companyUser.password, // Use the same password as the user
            municipalityId: municipality.id,
            businessSector: userProfile?.businessSector || 'Servicios',
            companySize: userProfile?.companySize || 'SMALL',
            website: userProfile?.website || '',
            email: userProfile?.email || `${companyUser.username}@cemse.dev`,
            phone: userProfile?.phone || '',
            address: userProfile?.address || '',
            foundedYear: userProfile?.foundedYear || new Date().getFullYear(),
            taxId: userProfile?.taxId || null,
            createdBy: superAdmin.id,
            isActive: true
          }
        });
        
        console.log('✅ Company record created successfully:', {
          id: existingCompany.id,
          name: existingCompany.name
        });
        
      } catch (createError) {
        console.error('❌ Failed to create company record:', createError);
        return NextResponse.json(
          { 
            error: 'No se pudo crear el registro de empresa automáticamente. Contacta al administrador.',
            debug: {
              providedCompanyId: jobData.companyId,
              createError: createError instanceof Error ? createError.message : 'Unknown error'
            }
          },
          { status: 500 }
        );
      }
    }

    // If still no company exists and it's not a company user, return error
    if (!existingCompany) {
      console.log('❌ Company not found in database:', jobData.companyId);
      
      // Try to find companies that might match the user
      const allCompanies = await prisma.company.findMany({
        select: { id: true, name: true, username: true, loginEmail: true },
        take: 10
      });
      
      console.log('🔍 Available companies:');
      allCompanies.forEach(company => {
        console.log(`  - ${company.id} (${company.name}) - username: ${company.username} - email: ${company.loginEmail}`);
      });

      return NextResponse.json(
        { 
          error: 'Empresa no válida. Verifica que tu empresa esté registrada.',
          debug: {
            providedCompanyId: jobData.companyId,
            userRole: decoded.role,
            availableCompanies: allCompanies.map(c => ({ id: c.id, name: c.name }))
          }
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'requirements', 'location', 'contractType', 'workSchedule', 'workModality', 'experienceLevel', 'municipality', 'companyId'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Ensure arrays are properly set
    if (!Array.isArray(jobData.skillsRequired)) {
      jobData.skillsRequired = ['Sin especificar'];
    }
    if (!Array.isArray(jobData.desiredSkills)) {
      jobData.desiredSkills = [];
    }
    if (!Array.isArray(jobData.images)) {
      jobData.images = [];
    }

    // At this point, we should have a valid company (either existing or newly created)
    // Use the company ID from the job data
    finalCompanyId = jobData.companyId;
    console.log('🔍 Final company ID for job offer:', finalCompanyId);

    // Create new job offer in database
    console.log('💼 Creating job offer with data:', {
      title: jobData.title,
      applicationDeadline: jobData.applicationDeadline,
      applicationDeadlineType: typeof jobData.applicationDeadline,
      applicationDeadlineValid: jobData.applicationDeadline ? !isNaN(new Date(jobData.applicationDeadline).getTime()) : 'N/A'
    });
    
    let newJobOffer;
    try {
      newJobOffer = await prisma.jobOffer.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        location: jobData.location,
        contractType: jobData.contractType,
        workSchedule: jobData.workSchedule,
        workModality: jobData.workModality,
        experienceLevel: jobData.experienceLevel,
        municipality: jobData.municipality,
        department: jobData.department,
        companyId: finalCompanyId,
        skillsRequired: jobData.skillsRequired,
        desiredSkills: jobData.desiredSkills,
        images: jobData.images,
        salaryMin: jobData.salaryMin || null,
        salaryMax: jobData.salaryMax || null,
        salaryCurrency: 'BOB',
        benefits: jobData.benefits || null,
        applicationDeadline: jobData.applicationDeadline || null,
        latitude: jobData.latitude || null,
        longitude: jobData.longitude || null,
        educationRequired: jobData.educationRequired || null,
        isActive: true,
        status: 'ACTIVE',
        publishedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
      });
    } catch (prismaError) {
      console.error('❌ Prisma validation error:', prismaError);
      
      // Handle specific Prisma validation errors
      if (prismaError instanceof Error) {
        if (prismaError.message.includes('Expected ISO-8601 DateTime')) {
          return NextResponse.json(
            { 
              error: 'Fecha de aplicación inválida. Por favor verifica el formato de fecha.',
              debug: {
                errorMessage: prismaError.message,
                applicationDeadline: jobData.applicationDeadline
              }
            },
            { status: 400 }
          );
        }
        
        if (prismaError.message.includes('Invalid value')) {
          return NextResponse.json(
            { 
              error: 'Datos inválidos en el formulario. Por favor verifica todos los campos.',
              debug: {
                errorMessage: prismaError.message,
                jobDataSample: {
                  title: jobData.title,
                  companyId: jobData.companyId,
                  applicationDeadline: jobData.applicationDeadline
                }
              }
            },
            { status: 400 }
          );
        }
      }
      
      // Re-throw to be caught by outer try-catch
      throw prismaError;
    }

    console.log('✅ Job offer created successfully:', newJobOffer.id);
    return NextResponse.json(newJobOffer, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating job offer:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      jobData: {
        title: jobData?.title,
        companyId: jobData?.companyId,
        finalCompanyId,
        contractType: jobData?.contractType,
        workModality: jobData?.workModality,
        experienceLevel: jobData?.experienceLevel,
        municipality: jobData?.municipality,
        workSchedule: jobData?.workSchedule
      }
    });
    
    // Ensure we always return a valid JSON response
    try {
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una oferta de trabajo con estos datos' },
          { status: 400 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { 
            error: 'Empresa no válida. Verifica que tu empresa esté registrada.',
            debug: {
              companyId: jobData?.companyId,
              finalCompanyId,
              errorMessage: error.message
            }
          },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid enum value')) {
        return NextResponse.json(
          { 
            error: 'Valor inválido en uno de los campos. Verifica los datos del formulario.',
            debug: {
              errorMessage: error.message
            }
          },
          { status: 400 }
        );
      }
    }
    
      return NextResponse.json(
        { 
          error: 'Error interno del servidor. Contacta al administrador.',
          debug: {
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            jobDataSample: {
              title: jobData?.title,
              companyId: jobData?.companyId,
              contractType: jobData?.contractType,
              workModality: jobData?.workModality,
              experienceLevel: jobData?.experienceLevel
            }
          }
        },
        { status: 500 }
      );
    } catch (responseError) {
      // Fallback if we can't even return a proper error response
      console.error('❌ Failed to create error response:', responseError);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}


