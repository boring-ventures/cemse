import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 verifyToken - Mock development token detected');
      const tokenParts = token.split('-');
      const userId = tokenParts.length >= 3 ? tokenParts.slice(3, -1).join('-') || 'mock-user' : 'mock-user';
      const isCompanyToken = token.includes('mock-dev-token-company-') || userId.includes('company');
      
      return {
        id: userId,
        userId: userId,
        username: isCompanyToken ? `company_${userId}` : userId,
        role: isCompanyToken ? 'COMPANIES' : 'SUPERADMIN',
        type: 'mock',
        companyId: isCompanyToken ? userId : null,
      };
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('🔍 API: Received GET request for job application:', resolvedParams.id);
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 API: Token verification failed');
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Get job application from database
    const application = await prisma.jobApplication.findUnique({
      where: { id: resolvedParams.id },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    console.log('✅ API: Job application found:', resolvedParams.id);
    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error('Error in job application GET route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    console.log('🔍 API: Received PUT request for job application:', resolvedParams.id);
    console.log('🔍 API: Update data:', body);
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 API: Token verification failed');
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if application exists
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id: resolvedParams.id },
      include: {
        jobOffer: {
          select: {
            companyId: true
          }
        }
      }
    });

    if (!existingApplication) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Authorization check - only company owners can update application status
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === existingApplication.jobOffer.companyId || 
                           decoded.companyId === existingApplication.jobOffer.companyId);
    const isAdmin = decoded.role === 'SUPERADMIN' || decoded.role === 'INSTRUCTOR';
    
    if (!isCompanyOwner && !isAdmin) {
      console.log('🔍 API: Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    // Update job application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: resolvedParams.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes && { notes: body.notes }),
        ...(body.rating && { rating: body.rating }),
        ...(body.coverLetter && { coverLetter: body.coverLetter }),
        reviewedAt: new Date(),
      },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('✅ API: Job application updated successfully:', resolvedParams.id);
    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (error) {
    console.error('Error in job application update route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('🔍 API: Received DELETE request for job application:', resolvedParams.id);
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 API: Token verification failed');
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if application exists and user has permission
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id: resolvedParams.id },
      include: {
        jobOffer: {
          select: {
            companyId: true
          }
        }
      }
    });

    if (!existingApplication) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Authorization check - applicant can cancel their own application, or admin/company owner can delete
    const isApplicant = decoded.id === existingApplication.applicantId;
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === existingApplication.jobOffer.companyId || 
                           decoded.companyId === existingApplication.jobOffer.companyId);
    const isAdmin = decoded.role === 'SUPERADMIN';
    
    if (!isApplicant && !isCompanyOwner && !isAdmin) {
      console.log('🔍 API: Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete job application
    await prisma.jobApplication.delete({
      where: { id: resolvedParams.id }
    });

    console.log('✅ API: Job application deleted successfully:', resolvedParams.id);
    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in job application deletion route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
