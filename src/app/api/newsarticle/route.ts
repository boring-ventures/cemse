import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle, NewsType, NewsStatus, NewsPriority } from '@/types/news';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// JWT token verification function
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// Helper functions
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

const checkPermissions = (user: any, authorId?: string) => {
  if (!user) return false;

  const allowedRoles = ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'SUPERADMIN'];
  if (!allowedRoles.includes(user.role)) return false;

  // Si se proporciona authorId, verificar que coincida con el usuario actual
  if (authorId && user.id !== authorId) return false;

  return true;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const authorType = searchParams.get('authorType');
    
    // Build where clause
    const where: any = {};
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (category) {
      where.category = category;
    }
    
    if (authorType) {
      where.authorType = authorType.toUpperCase();
    }
    
    // Default to published news only if no status filter and no authorId (public view)
    if (!status && !authorId) {
      where.status = 'PUBLISHED';
    }

    console.log('📰 Fetching news with filters:', where);

    const newsArticles = await prisma.newsArticle.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert to frontend format
    const responseNews: NewsArticle[] = newsArticles.map(news => ({
      id: news.id,
      title: news.title,
      summary: news.summary,
      content: news.content,
      category: news.category,
      imageUrl: news.imageUrl || '',
      videoUrl: news.videoUrl || '',
      authorId: news.authorId,
      authorName: news.authorName,
      authorType: news.authorType as NewsType,
      authorLogo: news.authorLogo || '',
      status: news.status as NewsStatus,
      priority: news.priority as NewsPriority,
      featured: news.featured,
      tags: news.tags,
      targetAudience: news.targetAudience,
      region: news.region || '',
      relatedLinks: news.relatedLinks as any || [],
      publishedAt: news.publishedAt?.toISOString() || '',
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      viewCount: news.viewCount,
      likeCount: news.likeCount,
      commentCount: news.commentCount,
      expiresAt: news.expiresAt?.toISOString() || ''
    }));

    console.log("📰 Fetched news count:", responseNews.length);
    return NextResponse.json(responseNews);

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
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('📰 POST /api/newsarticle - Authenticated user:', decoded.username);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (!checkPermissions(user)) {
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
      imageType: imageFile?.type
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

    // Obtener el perfil del usuario para obtener información adicional
    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        company: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Procesar imagen si existe
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      console.log('📰 Processing image file:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });

      try {
        // Crear directorio de uploads si no existe
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'news');
        await mkdir(uploadsDir, { recursive: true });

        // Generar nombre único para la imagen
        const fileExtension = imageFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueFileName);

        // Guardar archivo
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Generar URL pública
        imageUrl = `/uploads/news/${uniqueFileName}`;
        console.log('📰 Saved image to:', imageUrl);
      } catch (imageError) {
        console.error('❌ Error processing image:', imageError);
        // Continuar sin imagen en caso de error
      }
    }

    // Procesar tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    
    // Procesar target audience
    const targetAudienceArray = targetAudience 
      ? targetAudience.split(',').map(audience => audience.trim()).filter(audience => audience.length > 0)
      : ['YOUTH'];

    // Procesar related links
    let relatedLinksJson = null;
    if (relatedLinks && relatedLinks.trim()) {
      try {
        relatedLinksJson = JSON.parse(relatedLinks);
      } catch (e) {
        console.warn('Invalid relatedLinks JSON, ignoring:', relatedLinks);
      }
    }

    // Determinar authorType basado en el rol del usuario
    let authorType: NewsType = 'GOVERNMENT';
    if (user.role === 'COMPANIES') {
      authorType = 'COMPANY';
    } else if (user.role === 'MUNICIPAL_GOVERNMENTS') {
      authorType = 'GOVERNMENT';
    } else if (user.role === 'SUPERADMIN') {
      authorType = 'GOVERNMENT';
    }

    // Crear nueva noticia usando Prisma
    const newNews = await prisma.newsArticle.create({
      data: {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category: category.trim(),
        imageUrl,
        videoUrl: videoUrl?.trim() || null,
        authorId: userProfile.userId,
        authorName: userProfile.company?.name || `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Unknown Author',
        authorType,
        authorLogo: userProfile.avatarUrl || null,
        status: (status as NewsStatus) || 'DRAFT',
        priority: (priority as NewsPriority) || 'MEDIUM',
        featured: featured || false,
        tags: tagsArray,
        targetAudience: targetAudienceArray,
        region: region?.trim() || null,
        relatedLinks: relatedLinksJson,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        expiresAt: null // Could be added as a form field if needed
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log('📰 Created news article with Prisma:', {
      id: newNews.id,
      title: newNews.title,
      status: newNews.status,
      authorName: newNews.authorName,
      hasImage: !!newNews.imageUrl
    });

    // Convertir a formato esperado por el frontend
    const responseNews: NewsArticle = {
      id: newNews.id,
      title: newNews.title,
      summary: newNews.summary,
      content: newNews.content,
      category: newNews.category,
      imageUrl: newNews.imageUrl || '',
      videoUrl: newNews.videoUrl || '',
      authorId: newNews.authorId,
      authorName: newNews.authorName,
      authorType: newNews.authorType as NewsType,
      authorLogo: newNews.authorLogo || '',
      status: newNews.status as NewsStatus,
      priority: newNews.priority as NewsPriority,
      featured: newNews.featured,
      tags: newNews.tags,
      targetAudience: newNews.targetAudience,
      region: newNews.region || '',
      relatedLinks: newNews.relatedLinks as any || [],
      publishedAt: newNews.publishedAt?.toISOString() || '',
      createdAt: newNews.createdAt.toISOString(),
      updatedAt: newNews.updatedAt.toISOString(),
      viewCount: newNews.viewCount,
      likeCount: newNews.likeCount,
      commentCount: newNews.commentCount,
      expiresAt: newNews.expiresAt?.toISOString() || ''
    };

    return NextResponse.json(responseNews, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/newsarticle:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}