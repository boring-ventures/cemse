import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const institutionId = resolvedParams.id;

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

                // Filter to show only institutions (not municipalities) and find the specific one
                const institutions = data.filter((item: { institutionType?: string }) =>
                    item.institutionType &&
                    item.institutionType !== 'MUNICIPALITY'
                );

                const institution = institutions.find((item: { id: string }) => item.id === institutionId);

                if (!institution) {
                    return NextResponse.json(
                        { error: 'Institución no encontrada' },
                        { status: 404 }
                    );
                }

                return NextResponse.json(institution);
            }
        } catch {
            console.log('Backend not available, using mock data');
        }

        // If backend is not available, return mock institution data
        const mockInstitution = {
            id: institutionId,
            name: "TechCorp Academy",
            description: "Centro de formación tecnológica líder en Bolivia",
            longDescription: "TechCorp Academy es un centro de formación tecnológica comprometido con el desarrollo de talento digital en Bolivia. Ofrecemos programas de formación en desarrollo de software, diseño UX/UI, data science y más.",
            location: "La Paz, Bolivia",
            department: "La Paz",
            region: "La Paz",
            institutionType: "CENTROS_DE_FORMACION",
            logo: "/logos/techcorp.svg",
            coverImage: "/images/institutions/default-cover.jpg",
            website: "https://techcorp.edu.bo",
            email: "contacto@techcorp.edu.bo",
            phone: "+591 2 1234567",
            address: "Av. 16 de Julio, La Paz, Bolivia",
            socialMedia: {
                facebook: "https://facebook.com/techcorp",
                instagram: "https://instagram.com/techcorp",
                linkedin: "https://linkedin.com/company/techcorp",
            },
            servicesOffered: [
                "Formación en desarrollo de software",
                "Cursos de diseño UX/UI",
                "Programas de data science",
                "Capacitación empresarial"
            ],
            focusAreas: [
                "Tecnología",
                "Educación",
                "Innovación",
                "Emprendimiento"
            ],
            posts: [
                {
                    id: "1",
                    title: "Nuevo programa de becas para jóvenes desarrolladores",
                    content: "Nos complace anunciar nuestro nuevo programa de becas para jóvenes desarrolladores que incluye formación completa en tecnologías modernas y oportunidades de empleo.",
                    image: "/images/institutions/post-1.jpg",
                    date: "2024-03-15",
                    author: "María González",
                    category: "Becas",
                },
                {
                    id: "2",
                    title: "Taller gratuito de introducción a React",
                    content: "Únete a nuestro taller gratuito de introducción a React y aprende los fundamentos de esta popular biblioteca de JavaScript.",
                    image: "/images/institutions/post-2.jpg",
                    date: "2024-03-10",
                    author: "Carlos Rodríguez",
                    category: "Talleres",
                }
            ]
        };

        return NextResponse.json(mockInstitution);
    } catch (error) {
        console.error('Error fetching institution details:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
