import { NextRequest, NextResponse } from "next/server";
import { NewsArticle } from "@/types/news";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock news data - esto se reemplazará con Prisma
let mockNews: NewsArticle[] = [
  {
    id: "news-1",
    title: "TechCorp Bolivia Lanza Programa de Becas 2024",
    content:
      "TechCorp Bolivia anuncia su programa anual de becas dirigido a jóvenes talentos en tecnología. El programa incluye 50 becas completas para estudios superiores en ingeniería de sistemas, desarrollo de software y ciencia de datos.\n\nLos beneficiarios recibirán:\n• Beca completa para estudios universitarios\n• Mentoring personalizado con profesionales de la empresa\n• Oportunidad de prácticas profesionales\n• Acceso a cursos especializados en tecnologías emergentes\n\nLas postulaciones están abiertas hasta el 31 de marzo. Los requisitos incluyen promedio mínimo de 80 puntos en bachillerato y demostrar pasión por la tecnología.",
    summary:
      "TechCorp Bolivia ofrece 50 becas completas para jóvenes interesados en carreras tecnológicas, incluyendo mentoring y oportunidades de prácticas.",
    imageUrl: "/api/placeholder/800/400",
    authorId: "company-1",
    authorName: "TechCorp Bolivia",
    authorType: "COMPANY",
    authorLogo: "/logos/techcorp.svg",
    status: "PUBLISHED",
    priority: "HIGH",
    featured: true,
    tags: ["educación", "becas", "tecnología", "oportunidades"],
    category: "Educación y Becas",
    publishedAt: "2024-02-28T09:00:00Z",
    createdAt: "2024-02-27T15:30:00Z",
    updatedAt: "2024-02-28T09:00:00Z",
    viewCount: 1250,
    likeCount: 89,
    commentCount: 23,
    targetAudience: ["YOUTH"],
    region: "Cochabamba",
    relatedLinks: [
      {
        title: "Formulario de Postulación",
        url: "https://techcorp.bo/becas2024",
      },
      {
        title: "Requisitos Detallados",
        url: "https://techcorp.bo/becas-requisitos",
      },
    ],
  },
  {
    id: "news-2",
    title: "Gobierno Municipal Implementa Nueva Política de Empleo Juvenil",
    content:
      "El Gobierno Municipal de Cochabamba anuncia la implementación de una nueva política integral de empleo juvenil que beneficiará a más de 2,000 jóvenes en los próximos 12 meses.\n\nLa política incluye:\n• Programa de primer empleo con subsidio del 50% del salario mínimo\n• Centros de capacitación laboral en oficios técnicos\n• Bolsa de trabajo municipal con prioridad para jóvenes\n• Programa de emprendimiento juvenil con microcréditos\n• Orientación vocacional y laboral gratuita\n\nLa iniciativa tiene un presupuesto de 15 millones de bolivianos y será ejecutada en coordinación con empresas privadas y organizaciones de la sociedad civil.",
    summary:
      "Nueva política municipal creará 2,000 empleos para jóvenes con subsidios, capacitación y programas de emprendimiento.",
    imageUrl: "/api/placeholder/800/400",
    authorId: "gov-1",
    authorName: "Gobierno Municipal de Cochabamba",
    authorType: "GOVERNMENT",
    authorLogo: "/api/placeholder/60/60",
    status: "PUBLISHED",
    priority: "URGENT",
    featured: true,
    tags: ["empleo", "juventud", "política pública", "capacitación"],
    category: "Política Pública",
    publishedAt: "2024-02-27T14:00:00Z",
    createdAt: "2024-02-26T10:15:00Z",
    updatedAt: "2024-02-27T14:00:00Z",
    viewCount: 2100,
    likeCount: 156,
    commentCount: 45,
    targetAudience: ["YOUTH", "COMPANIES"],
    region: "Cochabamba",
  },
];

// Helper function to generate unique ID
const generateId = () => `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to validate news data
const validateNewsData = (data: any) => {
  const requiredFields = ['title', 'content', 'summary', 'category'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Campo requerido: ${field}`);
    }
  }
  
  if (data.priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(data.priority)) {
    throw new Error('Prioridad inválida');
  }
  
  if (data.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(data.status)) {
    throw new Error('Estado inválido');
  }
  
  return true;
};

// Helper function to check permissions
const checkPermissions = (user: any, authorId: string) => {
  if (!user) {
    throw new Error('No autenticado');
  }
  
  // SuperAdmin puede editar cualquier noticia
  if (user.role === 'SUPERADMIN') {
    return true;
  }
  
  // El autor puede editar sus propias noticias
  if (user.id === authorId) {
    return true;
  }
  
  // Companies pueden editar noticias de su empresa
  if (user.role === 'COMPANIES' && user.companyId === authorId) {
    return true;
  }
  
  // Municipal governments pueden editar noticias de su municipio
  if (user.role === 'MUNICIPAL_GOVERNMENTS' && user.municipalityId === authorId) {
    return true;
  }
  
  throw new Error('Sin permisos para editar esta noticia');
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const authorType = searchParams.get('authorType');
    const authorId = searchParams.get('authorId');
    const showAll = searchParams.get('showAll') === 'true';
    
    let filteredNews = [...mockNews];
    
    // Si no está autenticado, solo mostrar noticias públicas
    if (!session) {
      filteredNews = filteredNews.filter(news => news.status === 'PUBLISHED');
    } else {
      // Si está autenticado y no se especifica showAll, filtrar por el usuario autenticado
      if (!showAll && !authorId) {
        filteredNews = filteredNews.filter(news => news.authorId === session.user.id);
        console.log('📰 API: Filtering news by authenticated user:', session.user.id);
      } else if (authorId) {
        // Si se especifica authorId, usar ese filtro
        filteredNews = filteredNews.filter(news => news.authorId === authorId);
      }
    }
    
    // Aplicar filtros adicionales
    if (status) {
      filteredNews = filteredNews.filter(news => news.status === status.toUpperCase());
    }
    
    if (category) {
      filteredNews = filteredNews.filter(news => news.category === category);
    }
    
    if (authorType) {
      filteredNews = filteredNews.filter(news => news.authorType === authorType.toUpperCase());
    }

    console.log('📰 API: Returning filtered news:', {
      total: mockNews.length,
      filtered: filteredNews.length,
      authenticated: !!session,
      userId: session?.user?.id,
      filters: { status, category, authorType, authorId, showAll }
    });
    
    return NextResponse.json(filteredNews);
  } catch (error) {
    console.error('Error getting news:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar permisos para crear noticias
    if (!['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para crear noticias' },
        { status: 403 }
      );
    }
    
    let newsData: any = {};
    let imageFile: File | null = null;
    
    // Verificar si es multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    console.log('🔍 Content-Type:', contentType);
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Debug: mostrar todos los campos del FormData
      console.log('🔍 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Extraer campos de texto
      newsData = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        summary: formData.get('summary') as string,
        category: formData.get('category') as string,
        status: formData.get('status') as string || 'DRAFT',
        priority: formData.get('priority') as string || 'MEDIUM',
        tags: formData.get('tags') as string,
        featured: formData.get('featured') === 'true',
        targetAudience: formData.get('targetAudience') as string,
        region: formData.get('region') as string,
        videoUrl: formData.get('videoUrl') as string,
        relatedLinks: formData.get('relatedLinks') as string,
      };
      
      console.log('🔍 Extracted newsData:', newsData);
      
      // Extraer archivo de imagen
      const image = formData.get('image') as File;
      if (image) {
        imageFile = image;
        // En una implementación real, aquí se subiría la imagen a un servicio de almacenamiento
        newsData.imageUrl = `/uploads/news/${Date.now()}-${image.name}`;
      }
    } else {
      // JSON data
      newsData = await request.json();
    }
    
    console.log('🔍 About to validate newsData:', newsData);
    
    // Validar datos
    validateNewsData(newsData);
    
    // Crear nueva noticia
    const newNews: NewsArticle = {
      id: generateId(),
      title: newsData.title,
      content: newsData.content,
      summary: newsData.summary,
      imageUrl: newsData.imageUrl || '/api/placeholder/800/400',
      videoUrl: newsData.videoUrl,
      authorId: session.user.id,
      authorName: session.user.firstName || session.user.name || 'Autor',
      authorType: session.user.role === 'COMPANIES' ? 'COMPANY' : 
                  session.user.role === 'MUNICIPAL_GOVERNMENTS' ? 'GOVERNMENT' : 'COMPANY',
      authorLogo: session.user.avatar || '/api/placeholder/60/60',
      status: newsData.status || 'DRAFT',
      priority: newsData.priority || 'MEDIUM',
      featured: newsData.featured || false,
      tags: newsData.tags ? newsData.tags.split(',').map((tag: string) => tag.trim()) : [],
      category: newsData.category,
      publishedAt: newsData.status === 'PUBLISHED' ? new Date().toISOString() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      targetAudience: newsData.targetAudience ? newsData.targetAudience.split(',').map((audience: string) => audience.trim()) : ['YOUTH'],
      region: newsData.region,
      relatedLinks: newsData.relatedLinks ? JSON.parse(newsData.relatedLinks) : [],
    };
    
    mockNews.push(newNews);
    
    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 400 }
    );
  }
}
