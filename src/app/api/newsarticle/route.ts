import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NewsArticle, NewsType, NewsStatus, NewsPriority } from '@/types/news';
import { API_BASE } from '@/lib/api';

// Mock data - será reemplazado por Prisma
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Noticia de ejemplo - Empresa',
    summary: 'Esta es una noticia de ejemplo de una empresa',
    content: 'Contenido completo de la noticia de ejemplo de una empresa',
    category: 'General',
    authorId: 'company-1',
    authorName: 'Empresa Ejemplo',
    authorType: 'COMPANY',
    status: 'PUBLISHED',
    priority: 'MEDIUM',
    featured: false,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ['ejemplo', 'empresa'],
    targetAudience: ['YOUTH'],
    region: 'Nacional',
    videoUrl: '',
    relatedLinks: [],
    imageUrl: ''
  },
  {
    id: '2',
    title: 'Noticia Municipal - Desarrollo Local',
    summary: 'Nuevas iniciativas para el desarrollo económico local',
    content: 'El gobierno municipal ha anunciado nuevas iniciativas para promover el desarrollo económico local, incluyendo programas de apoyo a emprendedores y mejoras en la infraestructura.',
    category: 'Desarrollo',
    authorId: 'cmemo5inx00019ybpwv3fu7bk',
    authorName: 'Diego Rocha',
    authorType: 'GOVERNMENT',
    status: 'PUBLISHED',
    priority: 'HIGH',
    featured: true,
    viewCount: 45,
    likeCount: 12,
    commentCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ['desarrollo', 'municipal', 'economía'],
    targetAudience: ['YOUTH', 'COMPANIES'],
    region: 'Cochabamba',
    videoUrl: '',
    relatedLinks: [],
    imageUrl: ''
  },
  {
    id: '3',
    title: 'Programa de Empleo Juvenil',
    summary: 'Nuevo programa para crear oportunidades de empleo para jóvenes',
    content: 'Se ha lanzado un nuevo programa municipal destinado a crear oportunidades de empleo para jóvenes de la localidad, con el objetivo de reducir el desempleo juvenil.',
    category: 'Empleo',
    authorId: 'cmemo5inx00019ybpwv3fu7bk',
    authorName: 'Diego Rocha',
    authorType: 'GOVERNMENT',
    status: 'PUBLISHED',
    priority: 'URGENT',
    featured: false,
    viewCount: 78,
    likeCount: 23,
    commentCount: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ['empleo', 'jóvenes', 'municipal'],
    targetAudience: ['YOUTH'],
    region: 'Cochabamba',
    videoUrl: '',
    relatedLinks: [],
    imageUrl: ''
  },
  {
    id: '4',
    title: 'Noticia en Borrador - Municipal',
    summary: 'Esta es una noticia en borrador del municipio',
    content: 'Contenido de la noticia en borrador que aún no ha sido publicada.',
    category: 'General',
    authorId: 'cmemo5inx00019ybpwv3fu7bk',
    authorName: 'Diego Rocha',
    authorType: 'GOVERNMENT',
    status: 'DRAFT',
    priority: 'MEDIUM',
    featured: false,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: '',
    tags: ['borrador'],
    targetAudience: ['YOUTH'],
    region: 'Cochabamba',
    videoUrl: '',
    relatedLinks: [],
    imageUrl: ''
  }
];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const validateNewsData = (data: any) => {
  const { title, content, summary, category } = data;

  if (!title || !content || !summary || !category) {
    return {
      isValid: false,
      message: "Title, content, summary, and category are required"
    };
  }

  return { isValid: true };
};

const checkPermissions = (session: any, authorId?: string) => {
  if (!session) return false;

  const allowedRoles = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'SUPERADMIN'];
  if (!allowedRoles.includes(session.user.role)) return false;

  // Si se proporciona authorId, verificar que coincida con el usuario actual
  if (authorId && session.user.id !== authorId) return false;

  return true;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Si no está autenticado, devolver noticias públicas
    if (!session) {
      const publicNews = mockNews.filter(news => news.status === 'PUBLISHED');
      return NextResponse.json(publicNews);
    }

    // Obtener datos del backend real
    console.log("🔍 Fetching from real backend...");

    // Construir URL con parámetros
    const backendUrl = new URL('https://cemse-back-production-56da.up.railway.app/api/newsarticle');
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const authorType = searchParams.get('authorType');

    if (authorId) backendUrl.searchParams.set('authorId', authorId);
    if (status) backendUrl.searchParams.set('status', status);
    if (category) backendUrl.searchParams.set('category', category);
    if (authorType) backendUrl.searchParams.set('authorType', authorType);

    console.log("🔍 Backend URL:", backendUrl.toString());

    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const realData = await response.json();
      console.log("✅ Successfully fetched from real backend:", realData);
      return NextResponse.json(realData);
    } else {
      console.log("❌ Backend returned error:", response.status, response.statusText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }


  } catch (error) {
    console.error('Error in GET /api/newsarticle:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verificar permisos
    if (!checkPermissions(session)) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.log('📰 POST /api/newsarticle - Starting request processing');
    console.log('📰 Content-Type:', request.headers.get('content-type'));

    // Parse multipart/form-data
    const formData = await request.formData();

    console.log('📰 FormData received, processing fields...');

    // Extraer datos del FormData
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const priority = formData.get('priority') as string;
    const status = formData.get('status') as string;
    const featured = formData.get('featured') === 'true';
    const targetAudience = formData.get('targetAudience') as string;
    const region = formData.get('region') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const relatedLinks = formData.get('relatedLinks') as string;
    const imageFile = formData.get('image') as File;

    // Extraer campos específicos del autor
    const authorId = formData.get('authorId') as string;
    const authorName = formData.get('authorName') as string;
    const authorType = formData.get('authorType') as string;

    console.log('📰 Extracted form data:', {
      title,
      summary: summary?.substring(0, 50) + '...',
      content: content?.substring(0, 50) + '...',
      category,
      tags,
      priority,
      status,
      featured,
      targetAudience,
      region,
      videoUrl,
      relatedLinks,
      hasImage: !!imageFile,
      imageSize: imageFile?.size,
      imageType: imageFile?.type,
      authorId,
      authorName,
      authorType
    });

    // Validar datos requeridos
    const validation = validateNewsData({ title, content, summary, category });
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.message);
      return NextResponse.json(
        { message: validation.message },
        { status: 400 }
      );
    }

    // Procesar imagen si existe
    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
      console.log('📰 Processing image file:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });

      // Aquí se procesaría la imagen y se subiría a un servicio de almacenamiento
      // Por ahora, simulamos una URL completa
      imageUrl = `${API_BASE}/uploads/${Date.now()}-${imageFile.name}`;
      console.log('📰 Generated image URL:', imageUrl);
    }

    // Crear nueva noticia
    const newNews: NewsArticle = {
      id: generateId(),
      title,
      summary,
      content,
      category,
      authorId: authorId || (session.user as any)?.id || 'unknown',
      authorName: authorName || (session.user as any)?.name || 'Unknown Author',
      authorType: (authorType as NewsType) || ((session.user as any)?.role as NewsType) || 'GOVERNMENT',
      status: (status as NewsStatus) || 'DRAFT',
      priority: (priority as NewsPriority) || 'MEDIUM',
      featured: featured || false,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      targetAudience: targetAudience ? targetAudience.split(',').map(audience => audience.trim()) : ['YOUTH'],
      region: region || '',
      videoUrl: videoUrl || '',
      relatedLinks: relatedLinks ? JSON.parse(relatedLinks) : [],
      imageUrl
    };

    console.log('📰 Created news article:', {
      id: newNews.id,
      title: newNews.title,
      status: newNews.status,
      hasImage: !!newNews.imageUrl
    });

    // Agregar a la lista de noticias
    mockNews.push(newNews);

    console.log('📰 Successfully added news to mock data');

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/newsarticle:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
