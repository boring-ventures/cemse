import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/company/stats - Starting request');
    
    // Mock stats data
    const mockStats = {
      totalCompanies: 25,
      activeCompanies: 22,
      totalJobOffers: 45,
      activeJobOffers: 38,
      totalApplications: 156,
      pendingApplications: 23
    };
    
    console.log('📊 Returning mock stats:', mockStats);
    
    return NextResponse.json(mockStats, { status: 200 });
  } catch (error) {
    console.error('💥 Error in GET /api/company/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}