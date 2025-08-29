import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 API: Received request for quiz attempts');
    
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
    console.log('🎯 API: Received request to create quiz attempt');
    
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
    const { quizId, enrollmentId, answers } = body;

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

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const processedAnswers: any[] = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      
      const userAnswer = answers.find((a: any) => a.questionId === question.id);
      const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      processedAnswers.push({
        questionId: question.id,
        answer: userAnswer?.answer || '',
        isCorrect,
        timeSpent: userAnswer?.timeSpent || 0,
        correctAnswer: question.correctAnswer
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;
    const totalTimeSpent = processedAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId: enrollmentId || null,
        studentId: userProfile.userId,
        score,
        passed,
        timeSpent: totalTimeSpent,
        completedAt: new Date(),
        answers: {
          create: processedAnswers.map(answer => ({
            questionId: answer.questionId,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            timeSpent: answer.timeSpent
          }))
        }
      },
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
          }
        }
      }
    });

    console.log('🎯 API: Quiz attempt created:', attempt.id, 'Score:', score, 'Passed:', passed);
    return NextResponse.json({ 
      attempt, 
      score, 
      passed, 
      totalPoints, 
      earnedPoints 
    }, { status: 201 });
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
