import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const attemptId = resolvedParams.id;
    console.log('🎯 API: Received request for quiz attempt:', attemptId);
    
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

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
            showCorrectAnswers: true,
            timeLimit: true
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
                points: true,
                orderIndex: true
              }
            }
          },
          orderBy: {
            question: {
              orderIndex: 'asc'
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Quiz attempt not found' },
        { status: 404 }
      );
    }

    // Check if user owns this attempt
    if (attempt.studentId !== userProfile.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to quiz attempt' },
        { status: 403 }
      );
    }

    console.log('🎯 API: Found quiz attempt:', attempt.id);
    return NextResponse.json({ attempt }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in quiz attempt route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
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
    const attemptId = resolvedParams.id;
    console.log('🎯 API: Received request to delete quiz attempt:', attemptId);
    
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

    // Check if attempt exists and user owns it
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Quiz attempt not found' },
        { status: 404 }
      );
    }

    if (attempt.studentId !== userProfile.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to quiz attempt' },
        { status: 403 }
      );
    }

    // Delete quiz attempt (cascade will handle answers)
    await prisma.quizAttempt.delete({
      where: { id: attemptId }
    });

    console.log('🎯 API: Quiz attempt deleted:', attemptId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error deleting quiz attempt:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
