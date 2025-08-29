import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 API: Received request for quiz attempts (quizattempt)');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🎯 API: Authenticated user:', decoded.username);

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const enrollmentId = searchParams.get('enrollmentId');
    const studentId = searchParams.get('studentId');

    // Get user profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    let whereClause: any = {};
    
    if (quizId) {
      whereClause.quizId = quizId;
    }
    
    if (enrollmentId) {
      whereClause.enrollmentId = enrollmentId;
    }
    
    if (studentId) {
      whereClause.studentId = studentId;
    } else {
      // Default to current user's attempts
      whereClause.studentId = userProfile.userId;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: whereClause,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            showCorrectAnswers: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                points: true
              }
            }
          },
          orderBy: {
            question: {
              orderIndex: 'asc'
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    console.log('🎯 API: Found quiz attempts:', attempts.length);
    return NextResponse.json({ attempts }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in quiz attempts route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API: Received request to create quiz attempt (quizattempt)');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🎯 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { quizId, enrollmentId } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create quiz attempt (started but not completed)
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId: enrollmentId || null,
        studentId: userProfile.userId,
        startedAt: new Date()
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true
          }
        }
      }
    });

    console.log('🎯 API: Quiz attempt created:', attempt.id);
    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating quiz attempt:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
