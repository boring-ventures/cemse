import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Test DB: Testing database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Test DB: Database connection successful');
    
    // Test a simple query
    const jobOfferCount = await prisma.jobOffer.count();
    console.log('✅ Test DB: Job offers count:', jobOfferCount);
    
    // Test company count
    const companyCount = await prisma.company.count();
    console.log('✅ Test DB: Companies count:', companyCount);
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      jobOfferCount,
      companyCount
    });
  } catch (error) {
    console.error('❌ Test DB: Database connection failed:', error);
    return NextResponse.json({ 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
