import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST: JobOffer API called without auth');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    console.log('🧪 TEST: Company ID:', companyId);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }
    
    // Fetch job offers without authentication (test)
    const jobOffers = await prisma.jobOffer.findMany({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('🧪 TEST: Found job offers:', jobOffers.length);
    
    // Add some debug info
    const response = {
      success: true,
      count: jobOffers.length,
      companyId,
      jobOffers,
      debug: {
        timestamp: new Date().toISOString(),
        url: request.url
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('🧪 TEST: Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        companyId: new URL(request.url).searchParams.get('companyId')
      },
      { status: 500 }
    );
  }
}
