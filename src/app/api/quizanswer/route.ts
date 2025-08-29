import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('💬 API: Received request to create quiz answer');
    
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
    console.log('💬 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { attemptId, questionId, answer, timeSpent } = body;

    if (!attemptId || !questionId || answer === undefined) {
      return NextResponse.json(
        { error: 'attemptId, questionId, and answer are required' },
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

    // Verify the attempt belongs to the user
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true
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

    if (attempt.studentId !== userProfile.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to quiz attempt' },
        { status: 403 }
      );
    }

    // Get the question to check correct answer
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = answer === question.correctAnswer;

    // Create or update quiz answer
    const quizAnswer = await prisma.quizAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId
        }
      },
      update: {
        answer,
        isCorrect,
        timeSpent: timeSpent || 0
      },
      create: {
        attemptId,
        questionId,
        answer,
        isCorrect,
        timeSpent: timeSpent || 0
      },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            type: true,
            correctAnswer: true,
            explanation: true,
            points: true
          }
        }
      }
    });

    console.log('💬 API: Quiz answer created/updated:', quizAnswer.id, 'Correct:', isCorrect);
    return NextResponse.json({ answer: quizAnswer, isCorrect }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating quiz answer:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
