import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('📝 API: Received request for quizzes');
    
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
    console.log('📝 API: Authenticated user:', decoded.username);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    let whereClause: any = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
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
        },
        _count: {
          select: {
            attempts: true,
            questions: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    console.log('📝 API: Found quizzes:', quizzes.length);
    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in quizzes route:', error);
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
    console.log('📝 API: Received request to create quiz');
    
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
    console.log('📝 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { 
      courseId, 
      lessonId, 
      title, 
      description, 
      timeLimit, 
      passingScore, 
      showCorrectAnswers,
      questions 
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        courseId: courseId || null,
        lessonId: lessonId || null,
        title,
        description: description || null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        passingScore: passingScore ? parseInt(passingScore) : 70,
        showCorrectAnswers: showCorrectAnswers || false,
        questions: questions ? {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            points: q.points || 1,
            orderIndex: index
          }))
        } : undefined
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log('📝 API: Quiz created:', quiz.id);
    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating quiz:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
