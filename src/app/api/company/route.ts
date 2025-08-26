import { NextRequest, NextResponse } from 'next/server';

// Mock data for companies
const getMockCompanies = () => ({
  companies: [
    {
      id: '1',
      name: 'TechCorp',
      description: 'Empresa de tecnología innovadora',
      location: 'Buenos Aires',
      industry: 'Tecnología',
      website: 'https://techcorp.com',
      email: 'contact@techcorp.com'
    },
    {
      id: '2',
      name: 'DesignStudio',
      description: 'Estudio de diseño creativo',
      location: 'Córdoba',
      industry: 'Diseño',
      website: 'https://designstudio.com',
      email: 'hello@designstudio.com'
    }
  ]
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for companies');
    
    // For now, always return mock data
    console.log('🔍 API: Returning mock data');
    const mockData = getMockCompanies();
    return NextResponse.json(mockData, { status: 200 });
  } catch (error) {
    console.error('Error in companies route:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/company - Starting request");
    
    const body = await request.json();
    console.log("📝 Request body:", body);
    
    // Mock backend call for POST
    const mockBackendResponse = {
      success: true,
      data: {
        message: "Empresa creada exitosamente",
        company: {
          id: "mock-company-id",
          name: body.name,
          address: body.address,
          phone: body.phone,
          email: body.email,
          createdAt: new Date().toISOString(),
        },
      },
      status: 201,
    };
    console.log("📊 Mock backend response:", mockBackendResponse);

    return NextResponse.json(
      mockBackendResponse,
      { status: mockBackendResponse.status }
    );
  } catch (error) {
    console.error("💥 Error in POST /api/company:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}