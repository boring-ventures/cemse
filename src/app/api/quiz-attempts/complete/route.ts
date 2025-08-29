import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API: Received request to complete quiz');
    
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

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Quiz ID and answers are required' },
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
      let isCorrect = false;
      
      if (userAnswer && userAnswer.answer) {
        // Handle different question types
        if (question.type === 'MULTIPLE_SELECT') {
          // For multiple select, compare arrays
          const userAnswers = userAnswer.answer.split(', ').sort();
          const correctAnswers = question.correctAnswer.split(', ').sort();
          isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
        } else {
          // For single answer questions
          isCorrect = userAnswer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        }
      }
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      processedAnswers.push({
        questionId: question.id,
        answer: userAnswer?.answer || '',
        isCorrect,
        timeSpent: userAnswer?.timeSpent || 0,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });
    }

    const score = earnedPoints;
    const passed = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 >= quiz.passingScore : false;
    const totalTimeSpent = processedAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId: enrollmentId || null,
        studentId: userProfile.userId,
        score: earnedPoints,
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
          },
          orderBy: {
            question: {
              orderIndex: 'asc'
            }
          }
        }
      }
    });

    console.log('🎯 API: Quiz attempt completed:', attempt.id, 'Score:', earnedPoints, 'Passed:', passed);
    
    // Return the completion result in the expected format
    const completionResult = {
      id: attempt.id,
      enrollmentId: attempt.enrollmentId,
      quizId: attempt.quizId,
      studentId: attempt.studentId,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt!.toISOString(),
      score: attempt.score,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      answers: attempt.answers.map(answer => ({
        id: answer.id,
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        correctAnswer: answer.question?.correctAnswer,
        explanation: answer.question?.explanation
      }))
    };
    
    return NextResponse.json(completionResult, { status: 200 });
  } catch (error) {
    console.error('❌ Error completing quiz:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
