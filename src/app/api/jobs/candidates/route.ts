import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      const tokenParts = token.split('-');
      const userId = tokenParts.length >= 3 ? tokenParts.slice(3, -1).join('-') || 'mock-user' : 'mock-user';
      const timestamp = tokenParts[tokenParts.length - 1];
      
      if (timestamp && !isNaN(parseInt(timestamp))) {
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (tokenAge > maxAge) {
          return null;
        }
      }
      
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
    
    // For JWT tokens
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for candidates');
    
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const sortBy = searchParams.get('sortBy') || 'appliedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('🔍 API: Query parameters:', { page, limit, search, status, jobId, sortBy, sortOrder });

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (jobId && jobId !== 'all') {
      where.jobOfferId = jobId;
    }
    
    if (search) {
      where.OR = [
        {
          applicant: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          jobOffer: {
            title: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'applicantName') {
      orderBy.applicant = { firstName: sortOrder };
    } else if (sortBy === 'jobTitle') {
      orderBy.jobOffer = { title: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count for pagination
    const total = await prisma.jobApplication.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch candidates with pagination
    const candidates = await prisma.jobApplication.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            municipality: true,
            department: true,
            phone: true,
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        questionAnswers: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate statistics
    const stats = await prisma.jobApplication.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const byStatus = {
      sent: 0,
      underReview: 0,
      preSelected: 0,
      rejected: 0,
      hired: 0,
    };

    stats.forEach(stat => {
      if (stat.status === 'SENT') byStatus.sent = stat._count.status;
      else if (stat.status === 'UNDER_REVIEW') byStatus.underReview = stat._count.status;
      else if (stat.status === 'PRE_SELECTED') byStatus.preSelected = stat._count.status;
      else if (stat.status === 'REJECTED') byStatus.rejected = stat._count.status;
      else if (stat.status === 'HIRED') byStatus.hired = stat._count.status;
    });

    // Get job statistics
    const jobStats = await prisma.jobApplication.groupBy({
      by: ['jobOfferId'],
      _count: {
        jobOfferId: true
      }
    });

    const byJob: Record<string, { jobTitle: string; count: number }> = {};
    
    for (const stat of jobStats) {
      const jobOffer = await prisma.jobOffer.findUnique({
        where: { id: stat.jobOfferId },
        select: { title: true }
      });
      
      if (jobOffer) {
        byJob[stat.jobOfferId] = {
          jobTitle: jobOffer.title,
          count: stat._count.jobOfferId
        };
      }
    }

    // Calculate average rating
    const ratingStats = await prisma.jobApplication.aggregate({
      where: {
        rating: { not: null }
      },
      _avg: {
        rating: true
      }
    });

    const averageRating = ratingStats._avg.rating || 0;

    const response = {
      candidates,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        total,
        byStatus,
        byJob,
        averageRating,
      },
    };

    console.log('🔍 API: Returning candidates data:', {
      count: candidates.length,
      total,
      page,
      totalPages
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('🔍 API: Error fetching candidates:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 API: Received PUT request for updating candidate');
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateId, updates } = body;

    if (!candidateId) {
      return NextResponse.json(
        { message: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Update the candidate
    const updatedCandidate = await prisma.jobApplication.update({
      where: { id: candidateId },
      data: updates,
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            municipality: true,
            department: true,
            phone: true,
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        questionAnswers: true,
      },
    });

    console.log('🔍 API: Candidate updated successfully:', candidateId);

    return NextResponse.json(updatedCandidate);

  } catch (error) {
    console.error('🔍 API: Error updating candidate:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
