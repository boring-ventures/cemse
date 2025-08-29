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
    const lessonId = resolvedParams.id;
    console.log('📝 API: Received request for lesson quizzes:', lessonId);
    
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

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId: lessonId },
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

    console.log('📝 API: Found lesson quizzes:', quizzes.length);
    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in lesson quizzes route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
