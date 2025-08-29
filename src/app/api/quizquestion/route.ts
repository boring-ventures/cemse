import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('❓ API: Received request for quiz questions');
    
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
    console.log('❓ API: Authenticated user:', decoded.username);

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');

    let whereClause: any = {};
    
    if (quizId) {
      whereClause.quizId = quizId;
    }

    const questions = await prisma.quizQuestion.findMany({
      where: whereClause,
      include: {
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    console.log('❓ API: Found quiz questions:', questions.length);
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in quiz questions route:', error);
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
    console.log('❓ API: Received request to create quiz question');
    
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
    console.log('❓ API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { 
      quizId, 
      question, 
      type, 
      options, 
      correctAnswer, 
      explanation, 
      points, 
      orderIndex 
    } = body;

    if (!quizId || !question || !type || !correctAnswer) {
      return NextResponse.json(
        { error: 'quizId, question, type, and correctAnswer are required' },
        { status: 400 }
      );
    }

    // Create quiz question
    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question,
        type,
        options: options || [],
        correctAnswer,
        explanation: explanation || null,
        points: points || 1,
        orderIndex: orderIndex || 0
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log('❓ API: Quiz question created:', quizQuestion.id);
    return NextResponse.json({ question: quizQuestion }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating quiz question:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
