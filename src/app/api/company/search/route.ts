import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for company search');

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const municipalityId = searchParams.get('municipalityId');
    const name = searchParams.get('name');
    const sector = searchParams.get('sector');
    
    console.log('🔍 API: Search parameters:', { municipalityId, name, sector });

    // Build query filters
    const whereClause: any = {
      isActive: true
    };
    
    if (municipalityId && municipalityId !== '') {
      whereClause.municipalityId = municipalityId;
    }
    
    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive'
      };
    }
    
    if (sector) {
      whereClause.sector = sector;
    }

    // Fetch companies from database
    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        municipality: {
          select: {
            id: true,
            name: true,
            department: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            role: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('🔍 API: Companies found:', companies.length);
    
    // Transform the data to match the expected format
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      businessSector: company.businessSector,
      companySize: company.companySize,
      foundedYear: company.foundedYear,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      isActive: company.isActive,
      username: company.username,
      loginEmail: company.loginEmail,
      municipality: company.municipality,
      creator: company.creator,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({ companies: transformedCompanies }, { status: 200 });
  } catch (error) {
    console.error('Error in company search route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
