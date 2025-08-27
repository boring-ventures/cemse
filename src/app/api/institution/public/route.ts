import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the same configuration as other API routes
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production-56da.up.railway.app';

    try {
      const response = await fetch(`${backendUrl}/api/municipality/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Filter to show only institutions (not municipalities)
        const institutions = data.filter((item: { institutionType?: string }) =>
          item.institutionType &&
          item.institutionType !== 'MUNICIPALITY'
        );

        return NextResponse.json(institutions);
      }
    } catch {
      console.log('Backend not available, using mock data');
    }

    // If backend is not available, return mock institutions data
    const mockInstitutions = [
      {
        id: 'inst_1',
        name: 'Fundación CEMSE',
        department: 'Cochabamba',
        region: 'Cochabamba',
        institutionType: 'FOUNDATION',
        customType: 'Educación',
        description: 'Fundación dedicada al desarrollo educativo y emprendimiento juvenil',
        address: 'Av. Principal 123, Cochabamba',
        phone: '+591 4 1234567',
        email: 'info@cemse.org.bo',
        website: 'https://cemse.org.bo',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'inst_2',
        name: 'ONG Juventud Activa',
        department: 'La Paz',
        region: 'La Paz',
        institutionType: 'NGO',
        customType: 'Desarrollo Social',
        description: 'Organización no gubernamental enfocada en el desarrollo de la juventud',
        address: 'Calle Comercio 456, La Paz',
        phone: '+591 2 9876543',
        email: 'contacto@juventudactiva.org',
        website: 'https://juventudactiva.org',
        isActive: true,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'inst_3',
        name: 'Centro de Innovación Tecnológica',
        department: 'Santa Cruz',
        region: 'Santa Cruz',
        institutionType: 'OTHER',
        customType: 'Tecnología',
        description: 'Centro especializado en innovación y desarrollo tecnológico',
        address: 'Av. Libertador 789, Santa Cruz',
        phone: '+591 3 5555666',
        email: 'info@cit.org.bo',
        website: 'https://cit.org.bo',
        isActive: true,
        createdAt: '2024-02-01T09:15:00Z',
        updatedAt: '2024-02-01T09:15:00Z'
      },
      {
        id: 'inst_4',
        name: 'Fundación Emprender',
        department: 'Tarija',
        region: 'Tarija',
        institutionType: 'FOUNDATION',
        customType: 'Emprendimiento',
        description: 'Fundación que promueve el emprendimiento y la innovación empresarial',
        address: 'Calle Sucre 321, Tarija',
        phone: '+591 4 7777888',
        email: 'contacto@emprender.org.bo',
        website: 'https://emprender.org.bo',
        isActive: true,
        createdAt: '2024-02-10T16:45:00Z',
        updatedAt: '2024-02-10T16:45:00Z'
      }
    ];

    return NextResponse.json(mockInstitutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Error al cargar las instituciones' },
      { status: 500 }
    );
  }
}
