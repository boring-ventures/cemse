import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// POST /api/resource/[id]/rate - Calificar un recurso
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // For now, just update the average rating
    // In a real implementation, you'd store individual ratings and calculate the average
    const newRating = (existingResource.rating + rating) / 2;

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        rating: newRating,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      resource,
      message: 'Rating submitted successfully' 
    });

  } catch (error) {
    console.error('Error rating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error submitting rating' },
      { status: 500 }
    );
  }
}