import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle, NewsType, NewsStatus, NewsPriority } from '@/types/news';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Buscar la noticia en la base de datos
    const news = await prisma.newsArticle.findUnique({
      where: { id },
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
    
    if (!news) {
      return NextResponse.json(
        { message: 'News article not found' },
        { status: 404 }
      );
    }
    
    // Check authentication for view tracking and private articles
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      isAuthenticated = !!decoded;
    }

    // Si no está autenticado, solo mostrar noticias públicas
    if (!isAuthenticated && news.status !== 'PUBLISHED') {
      return NextResponse.json(
        { message: 'News article not found' },
        { status: 404 }
      );
    }
    
    // Incrementar contador de vistas si está autenticado
    if (isAuthenticated) {
      await prisma.newsArticle.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    // Convertir a formato esperado por el frontend
    const responseNews: NewsArticle = {
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
      viewCount: news.viewCount + (isAuthenticated ? 1 : 0), // Include the increment
      likeCount: news.likeCount,
      commentCount: news.commentCount,
      expiresAt: news.expiresAt?.toISOString() || ''
    };
    
    return NextResponse.json(responseNews);
  } catch (error) {
    console.error('Error in GET /api/newsarticle/[id]:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Buscar la noticia existente
    const existingNews = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        author: true
      }
    });

    if (!existingNews) {
      return NextResponse.json(
        { message: 'News article not found' },
        { status: 404 }
      );
    }
    
    // Verificar permisos
    if (!checkPermissions(user, existingNews.authorId)) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse multipart/form-data
    const formData = await request.formData();
    
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
    
    // Validar datos requeridos
    const validation = validateNewsData({ title, content, summary, category });
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.message },
        { status: 400 }
      );
    }
    
    // Procesar imagen si existe
    let imageUrl = existingNews.imageUrl;
    if (imageFile && imageFile.size > 0) {
      try {
        // Eliminar imagen anterior si existe
        if (existingNews.imageUrl && existingNews.imageUrl.startsWith('/uploads/')) {
          const oldImagePath = join(process.cwd(), 'public', existingNews.imageUrl);
          try {
            await unlink(oldImagePath);
          } catch (e) {
            console.log('Old image not found or could not be deleted:', e);
          }
        }

        // Crear directorio de uploads si no existe
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'news');
        await mkdir(uploadsDir, { recursive: true });

        // Generar nombre único para la nueva imagen
        const fileExtension = imageFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueFileName);

        // Guardar archivo
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Generar URL pública
        imageUrl = `/uploads/news/${uniqueFileName}`;
        console.log('📰 Updated image to:', imageUrl);
      } catch (imageError) {
        console.error('❌ Error processing image:', imageError);
        // Mantener imagen anterior en caso de error
      }
    }

    // Procesar tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : existingNews.tags;
    
    // Procesar target audience
    const targetAudienceArray = targetAudience 
      ? targetAudience.split(',').map(audience => audience.trim()).filter(audience => audience.length > 0)
      : existingNews.targetAudience;

    // Procesar related links
    let relatedLinksJson = existingNews.relatedLinks;
    if (relatedLinks && relatedLinks.trim()) {
      try {
        relatedLinksJson = JSON.parse(relatedLinks);
      } catch (e) {
        console.warn('Invalid relatedLinks JSON, keeping existing:', relatedLinks);
      }
    }
    
    // Actualizar la noticia en la base de datos
    const updatedNews = await prisma.newsArticle.update({
      where: { id },
      data: {
        title: title?.trim() || existingNews.title,
        summary: summary?.trim() || existingNews.summary,
        content: content?.trim() || existingNews.content,
        category: category?.trim() || existingNews.category,
        imageUrl,
        videoUrl: videoUrl?.trim() || existingNews.videoUrl,
        status: (status as NewsStatus) || existingNews.status,
        priority: (priority as NewsPriority) || existingNews.priority,
        featured: featured !== undefined ? featured : existingNews.featured,
        tags: tagsArray,
        targetAudience: targetAudienceArray,
        region: region?.trim() || existingNews.region,
        relatedLinks: relatedLinksJson as any,
        publishedAt: status === 'PUBLISHED' && existingNews.status !== 'PUBLISHED' 
          ? new Date() 
          : existingNews.publishedAt,
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

    // Convertir a formato esperado por el frontend
    const responseNews: NewsArticle = {
      id: updatedNews.id,
      title: updatedNews.title,
      summary: updatedNews.summary,
      content: updatedNews.content,
      category: updatedNews.category,
      imageUrl: updatedNews.imageUrl || '',
      videoUrl: updatedNews.videoUrl || '',
      authorId: updatedNews.authorId,
      authorName: updatedNews.authorName,
      authorType: updatedNews.authorType as NewsType,
      authorLogo: updatedNews.authorLogo || '',
      status: updatedNews.status as NewsStatus,
      priority: updatedNews.priority as NewsPriority,
      featured: updatedNews.featured,
      tags: updatedNews.tags,
      targetAudience: updatedNews.targetAudience,
      region: updatedNews.region || '',
      relatedLinks: updatedNews.relatedLinks as any || [],
      publishedAt: updatedNews.publishedAt?.toISOString() || '',
      createdAt: updatedNews.createdAt.toISOString(),
      updatedAt: updatedNews.updatedAt.toISOString(),
      viewCount: updatedNews.viewCount,
      likeCount: updatedNews.likeCount,
      commentCount: updatedNews.commentCount,
      expiresAt: updatedNews.expiresAt?.toISOString() || ''
    };
    
    return NextResponse.json(responseNews);
  } catch (error) {
    console.error('Error in PUT /api/newsarticle/[id]:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Buscar la noticia existente
    const existingNews = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return NextResponse.json(
        { message: 'News article not found' },
        { status: 404 }
      );
    }
    
    // Verificar permisos
    if (!checkPermissions(user, existingNews.authorId)) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Eliminar imagen asociada si existe
    if (existingNews.imageUrl && existingNews.imageUrl.startsWith('/uploads/')) {
      const imagePath = join(process.cwd(), 'public', existingNews.imageUrl);
      try {
        await unlink(imagePath);
        console.log('📰 Deleted associated image:', existingNews.imageUrl);
      } catch (e) {
        console.log('Could not delete image file:', e);
      }
    }
    
    // Eliminar la noticia de la base de datos
    await prisma.newsArticle.delete({
      where: { id }
    });
    
    console.log('📰 Successfully deleted news article:', id);
    return NextResponse.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/newsarticle/[id]:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}