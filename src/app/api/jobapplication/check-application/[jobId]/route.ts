import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Same secret as auth/me

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// GET /api/jobapplication/check-application/{jobId} - Check if user has applied to job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('🔍 API: Checking application status for job:', jobId);

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
      console.log('🔍 API: JWT token found in cookies');
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log('🔍 API: Database token found in cookies');
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
          console.log('🔍 API: Database token validated for user:', tokenUser.username);
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('🔍 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 API: Checking application for user:', decoded.username || decoded.id);

    // Check if user has already applied to this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobOfferId: jobId,
        applicantId: decoded.id,
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
      }
    });

    const hasApplied = !!existingApplication;

    console.log('🔍 API: Application check result:', { hasApplied, application: existingApplication });

    return NextResponse.json({
      hasApplied,
      application: existingApplication || null
    });
  } catch (error) {
    console.error('Error checking job application:', error);
    return NextResponse.json(
      { error: 'Error al verificar aplicación' },
      { status: 500 }
    );
  }
}