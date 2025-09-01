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
    console.log('🔍 API: Received GET request for job offer:', resolvedParams.id);
    
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

    // Get job offer from database
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            sector: true,
            size: true,
            location: true,
            rating: true,
            reviewCount: true,
            images: true,
            email: true,
          }
        }
      }
    });

    if (!jobOffer) {
      console.log('🔍 API: Job offer not found:', resolvedParams.id);
      return NextResponse.json({ message: 'Job offer not found' }, { status: 404 });
    }

    console.log('✅ API: Job offer found:', resolvedParams.id);
    return NextResponse.json(jobOffer, { status: 200 });
  } catch (error) {
    console.error('Error in job offer GET route:', error);
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
    console.log('🔍 API: Received PUT request for job offer:', resolvedParams.id);
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

    // Check if job offer exists
    const existingJobOffer = await prisma.jobOffer.findUnique({
      where: { id: resolvedParams.id },
      select: { companyId: true }
    });

    if (!existingJobOffer) {
      return NextResponse.json({ message: 'Job offer not found' }, { status: 404 });
    }

    // Authorization check - only company owners can update their job offers
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === existingJobOffer.companyId || 
                           decoded.companyId === existingJobOffer.companyId);
    const isAdmin = decoded.role === 'SUPERADMIN' || decoded.role === 'INSTRUCTOR';
    
    if (!isCompanyOwner && !isAdmin) {
      console.log('🔍 API: Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    // Update job offer
    const updatedJobOffer = await prisma.jobOffer.update({
      where: { id: resolvedParams.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.requirements && { requirements: body.requirements }),
        ...(body.location && { location: body.location }),
        ...(body.contractType && { contractType: body.contractType }),
        ...(body.workSchedule && { workSchedule: body.workSchedule }),
        ...(body.workModality && { workModality: body.workModality }),
        ...(body.experienceLevel && { experienceLevel: body.experienceLevel }),
        ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin }),
        ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax }),
        ...(body.benefits && { benefits: body.benefits }),
        ...(body.skillsRequired && { skillsRequired: body.skillsRequired }),
        ...(body.desiredSkills && { desiredSkills: body.desiredSkills }),
        ...(body.applicationDeadline && { applicationDeadline: body.applicationDeadline }),
        ...(body.status && { status: body.status }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            sector: true,
            size: true,
            location: true,
            rating: true,
            reviewCount: true,
            images: true,
            email: true,
          }
        }
      }
    });

    console.log('✅ API: Job offer updated successfully:', resolvedParams.id);
    return NextResponse.json(updatedJobOffer, { status: 200 });
  } catch (error) {
    console.error('Error in job offer update route:', error);
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
    console.log('🔍 API: Received DELETE request for job offer:', resolvedParams.id);
    
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

    // Check if job offer exists and user has permission
    const existingJobOffer = await prisma.jobOffer.findUnique({
      where: { id: resolvedParams.id },
      select: { companyId: true }
    });

    if (!existingJobOffer) {
      return NextResponse.json({ message: 'Job offer not found' }, { status: 404 });
    }

    // Authorization check - only company owners can delete their job offers
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === existingJobOffer.companyId || 
                           decoded.companyId === existingJobOffer.companyId);
    const isAdmin = decoded.role === 'SUPERADMIN';
    
    if (!isCompanyOwner && !isAdmin) {
      console.log('🔍 API: Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete job offer
    await prisma.jobOffer.delete({
      where: { id: resolvedParams.id }
    });

    console.log('✅ API: Job offer deleted successfully:', resolvedParams.id);
    return NextResponse.json({ message: 'Job offer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in job offer deletion route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
