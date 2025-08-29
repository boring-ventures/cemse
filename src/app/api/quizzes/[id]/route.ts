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
    const quizId = resolvedParams.id;
    console.log('📝 API: Received request for quiz:', quizId);
    
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

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            attempts: true,
            questions: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    console.log('📝 API: Found quiz:', quiz.id);
    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in quiz route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quizId = resolvedParams.id;
    console.log('📝 API: Received request to update quiz:', quizId);
    
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
      title, 
      description, 
      timeLimit, 
      passingScore, 
      showCorrectAnswers,
      isActive,
      questions 
    } = body;

    // Update quiz
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit ? parseInt(timeLimit) : null;
    if (passingScore !== undefined) updateData.passingScore = parseInt(passingScore);
    if (showCorrectAnswers !== undefined) updateData.showCorrectAnswers = showCorrectAnswers;
    if (isActive !== undefined) updateData.isActive = isActive;

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await prisma.quizQuestion.deleteMany({
        where: { quizId: quizId }
      });

      // Create new questions
      await prisma.quizQuestion.createMany({
        data: questions.map((q: any, index: number) => ({
          quizId: quizId,
          question: q.question,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          points: q.points || 1,
          orderIndex: index
        }))
      });
    }

    // Fetch updated quiz with questions
    const updatedQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log('📝 API: Quiz updated:', quizId);
    return NextResponse.json({ quiz: updatedQuiz }, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating quiz:', error);
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
    const quizId = resolvedParams.id;
    console.log('📝 API: Received request to delete quiz:', quizId);
    
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

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete quiz (cascade will handle questions and attempts)
    await prisma.quiz.delete({
      where: { id: quizId }
    });

    console.log('📝 API: Quiz deleted:', quizId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error deleting quiz:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
