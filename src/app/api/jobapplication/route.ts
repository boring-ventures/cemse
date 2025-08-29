import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Same secret as auth/me

function verifyToken(token: string) {
  try {
    console.log('🔍 verifyToken - Attempting to verify token');
    
    // Handle mock development tokens (same logic as /api/auth/me)
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 verifyToken - Mock development token detected');
      
      // Extract user info from mock token format: mock-dev-token-{userId}-{timestamp}
      const tokenParts = token.split('-');
      const userId = tokenParts.length >= 3 ? tokenParts.slice(3, -1).join('-') || 'mock-user' : 'mock-user';
      const timestamp = tokenParts[tokenParts.length - 1];
      
      // Check if mock token is too old (optional validation)
      if (timestamp && !isNaN(parseInt(timestamp))) {
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (tokenAge > maxAge) {
          console.log('🔍 verifyToken - Mock token expired');
          return null;
        }
      }
      
      // Check if this is a company token
      const isCompanyToken = token.includes('mock-dev-token-company-') || userId.includes('company');
      
      const mockUser = {
        id: userId,
        userId: userId, // Add userId field for compatibility
        username: isCompanyToken ? `company_${userId}` : userId,
        role: isCompanyToken ? 'COMPANIES' : 'SUPERADMIN',
        type: 'mock',
        companyId: isCompanyToken ? userId : null,
      };
      
      console.log('🔍 verifyToken - Mock user created:', {
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        isCompanyToken
      });
      
      return mockUser;
    }
    
    // For JWT tokens, use jwt.verify
    console.log('🔍 verifyToken - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 verifyToken - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 verifyToken - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for job applications');
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 API: Token verification failed');
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    console.log('🔍 API: Authenticated user:', decoded.username || decoded.id);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const jobOfferId = searchParams.get('jobOfferId');
    const status = searchParams.get('status');

    console.log('🔍 API: Query parameters:', { applicantId, jobOfferId, status });

    // Build filter conditions
    const where: any = {};
    if (applicantId) where.applicantId = applicantId;
    if (jobOfferId) where.jobOfferId = jobOfferId;
    if (status) where.status = status;

    // Get job applications from database
    console.log('🔍 API: Querying job applications with where clause:', where);
    
    try {
      const jobApplications = await prisma.jobApplication.findMany({
        where,
        include: {
          jobOffer: {
            select: {
              id: true,
              title: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              location: true,
              company: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          applicant: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              address: true,
              municipality: true,
              department: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });
      
      console.log('✅ API: Successfully queried job applications, found:', jobApplications.length);
      return NextResponse.json(jobApplications);
    } catch (dbError) {
      console.error('❌ API: Database query failed:', dbError);
      throw new Error(`Database query failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in job applications route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💼 API: Creating new job application');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('💼 API: No auth token found in cookies');
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      console.log('💼 API: JWT token found in cookies');
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log('💼 API: Database token found in cookies');
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
          console.log('💼 API: Database token validated for user:', tokenUser.username);
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('💼 API: Invalid or expired token');
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('💼 API: Authenticated user:', decoded.username || decoded.id);

    // Get request body
    const body = await request.json();
    const { jobOfferId, cvUrl, coverLetterUrl, status, message, questionAnswers } = body;

    console.log('💼 API: Job application data:', {
      jobOfferId,
      applicantId: decoded.id,
      hasCV: !!cvUrl,
      hasCoverLetter: !!coverLetterUrl,
      questionsCount: questionAnswers?.length || 0
    });

    // Debug: Check if user profile exists
    console.log('🔍 Checking if user profile exists for applicantId:', decoded.id);
    let userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
      select: { userId: true, firstName: true, lastName: true }
    });
    console.log('🔍 User profile found:', userProfile);

    // If no profile exists, create a basic one automatically
    if (!userProfile) {
      console.log('🔍 Creating basic profile for user:', decoded.id);
      try {
        userProfile = await prisma.profile.create({
          data: {
            userId: decoded.id,
            firstName: decoded.username || 'Usuario',
            lastName: '',
            role: 'YOUTH', // Default role
          },
          select: { userId: true, firstName: true, lastName: true }
        });
        console.log('🔍 Basic profile created:', userProfile);
      } catch (createError) {
        console.error('🔍 Error creating profile:', createError);
        // Continue without profile - we'll handle this below
      }
    }

    // Validate required fields
    if (!jobOfferId) {
      return NextResponse.json(
        { message: 'Job offer ID is required' },
        { status: 400 }
      );
    }

    // Check if job offer exists
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      select: { id: true, title: true, isActive: true }
    });

    if (!jobOffer) {
      return NextResponse.json(
        { message: 'Job offer not found' },
        { status: 404 }
      );
    }

    if (!jobOffer.isActive) {
      return NextResponse.json(
        { message: 'Job offer is not active' },
        { status: 400 }
      );
    }

    // Check if user has already applied to this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobOfferId: jobOfferId,
        applicantId: decoded.id
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied to this job offer' },
        { status: 409 }
      );
    }

    // Verify user profile exists or was created before creating application
    if (!userProfile) {
      console.error('💼 API: Could not find or create user profile for applicantId:', decoded.id);
      return NextResponse.json(
        { message: 'Could not create user profile. Please complete your profile first.' },
        { status: 400 }
      );
    }

    console.log('💼 API: Creating job application with data:', {
      jobOfferId: jobOfferId,
      applicantId: decoded.id,
      cvFile: cvUrl || null,
      coverLetterFile: coverLetterUrl || null,
      status: status || 'SENT',
      notes: message || null
    });

    // Create the job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        jobOfferId: jobOfferId,
        applicantId: decoded.id,
        cvFile: cvUrl || null,
        coverLetterFile: coverLetterUrl || null,
        status: status || 'SENT',
        notes: message || null,
        appliedAt: new Date()
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Handle question answers if provided
    if (questionAnswers && Array.isArray(questionAnswers) && questionAnswers.length > 0) {
      console.log('💼 API: Creating question answers:', questionAnswers.length);
      
      try {
        const answersData = questionAnswers.map((qa: any) => ({
          applicationId: jobApplication.id,
          questionId: qa.questionId,
          answer: qa.answer
        }));

        await prisma.jobQuestionAnswer.createMany({
          data: answersData
        });
        
        console.log('💼 API: Question answers created successfully');
      } catch (answerError) {
        console.error('💼 API: Error creating question answers:', answerError);
        // Don't fail the whole application if answers fail
      }
    }

    console.log('💼 API: Job application created successfully:', jobApplication.id);
    
    return NextResponse.json({
      message: 'Job application submitted successfully',
      application: jobApplication
    }, { status: 201 });

  } catch (error) {
    console.error('💼 API: Error creating job application:', error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('💼 API: Error name:', error.name);
      console.error('💼 API: Error message:', error.message);
      console.error('💼 API: Error stack:', error.stack);
      
      // Handle specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'You have already applied to this job offer' },
          { status: 409 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { message: 'Invalid job offer or user ID' },
          { status: 400 }
        );
      }
      
      // Return the actual error message in development for easier debugging
      return NextResponse.json(
        { 
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
