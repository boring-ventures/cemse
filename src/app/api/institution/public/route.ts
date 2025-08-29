import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/institution/public - Get public institutions directory
export async function GET(request: NextRequest) {
  try {
    console.log('🏛️ API: Received request for public institutions');
    
    const { searchParams } = new URL(request.url);
    const municipality = searchParams.get('municipality');
    const department = searchParams.get('department');
    const serviceArea = searchParams.get('serviceArea');
    const specialization = searchParams.get('specialization');
    const search = searchParams.get('search');

    // Build filter conditions for public institutions
    const where: any = {
      role: 'TRAINING_CENTERS', // Filter for institution profiles
      active: true, // Only active institutions
    };

    if (municipality) where.municipality = municipality;
    if (department) where.department = department;
    if (serviceArea) where.serviceArea = serviceArea;
    if (specialization) where.specialization = specialization;
    
    // Add search functionality
    if (search) {
      where.OR = [
        { institutionName: { contains: search, mode: 'insensitive' } },
        { institutionDescription: { contains: search, mode: 'insensitive' } },
        { serviceArea: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get public institution profiles from database
    const institutions = await prisma.profile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        institutionName: true,
        institutionType: true,
        serviceArea: true,
        specialization: true,
        institutionDescription: true,
        email: true,
        phone: true,
        address: true,
        municipality: true,
        department: true,
        country: true,
        website: true,
        avatarUrl: true,
        profileCompletion: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { profileCompletion: 'desc' }, // Show more complete profiles first
        { createdAt: 'desc' }
      ]
    });

    // Transform data to match expected format
    const formattedInstitutions = institutions.map(institution => ({
      id: institution.id,
      userId: institution.userId,
      name: institution.institutionName || 'Sin nombre',
      institutionType: institution.institutionType || 'CENTRO_CAPACITACION',
      customType: institution.serviceArea || 'Educación',
      serviceArea: institution.serviceArea || '',
      specialization: institution.specialization || '',
      description: institution.institutionDescription || '',
      email: institution.email || '',
      phone: institution.phone || '',
      address: institution.address || '',
      municipality: institution.municipality || '',
      department: institution.department || 'Cochabamba',
      region: institution.department || 'Cochabamba',
      country: institution.country || 'Bolivia',
      website: institution.website || '',
      logo: institution.avatarUrl || '',
      profileCompletion: institution.profileCompletion || 0,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
      isActive: true,
    }));



    console.log('🏛️ API: Found', formattedInstitutions.length, 'database institutions');
    return NextResponse.json(formattedInstitutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Error al cargar las instituciones' },
      { status: 500 }
    );
  }
}
