import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile, getMimeType } from '@/lib/file-upload';

// GET /api/resource - Obtener todos los recursos (público)
export async function GET(request: NextRequest) {
  try {
    console.log('📚 API: Received request for resources');
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const authorId = searchParams.get('authorId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || searchParams.get('q');
    const municipalityId = searchParams.get('municipalityId');

    // Build where clause for filtering
    const whereClause: any = {};

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (featured === 'true') {
      // Note: Current schema doesn't have isFeatured field, so we'll skip this filter
      console.log('📚 API: Featured filter requested but not available in schema');
    }

    if (authorId) {
      // Note: Current schema doesn't have authorId field, using author field instead
      whereClause.author = authorId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    // Get resources from database
    const resources = await prisma.resource.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    });

    // Get total count for pagination
    const totalCount = await prisma.resource.count({
      where: whereClause
    });

    console.log('📚 API: Found', resources.length, 'resources in database');
    return NextResponse.json({
      success: true,
      resources,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error getting resources:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving resources' },
      { status: 500 }
    );
  }
}

// POST /api/resource - Crear nuevo recurso (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    console.log('📚 API: Received request to create resource');

    // Verificar autenticación
    const authResult = await authenticateToken(request);
    console.log('📚 API: Authentication result:', authResult.success);

    if (!authResult.success) {
      console.log('📚 API: Authentication failed:', authResult.message);
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verificar si es multipart/form-data (con archivo) o JSON
    const contentType = request.headers.get('content-type') || '';
    console.log('📚 API: Content-Type:', contentType);
    console.log('📚 API: Request headers:', Object.fromEntries(request.headers.entries()));

    let resourceData: any = {};

    if (contentType.includes('multipart/form-data')) {
      // Manejar FormData con archivo
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as string;
      const category = formData.get('category') as string;
      const format = formData.get('format') as string;
      const author = formData.get('author') as string;
      const externalUrl = formData.get('externalUrl') as string;
      const publishedDate = formData.get('publishedDate') as string;
      const tags = formData.get('tags') as string;

      console.log('📚 API: FormData fields received:', {
        title, description, type, category, format, author, externalUrl, tags,
        hasFile: !!file,
        fileName: file?.name
      });

      // Handle file upload if present
      let fileUrl = null;
      if (file) {
        console.log('📚 API: Processing file upload:', file.name);
        try {
          fileUrl = await saveUploadedFile(file, 'resources');
          console.log('📚 API: File saved successfully at:', fileUrl);
        } catch (error) {
          console.error('📚 API: File upload failed:', error);
          return NextResponse.json(
            { success: false, message: 'File upload failed' },
            { status: 500 }
          );
        }
      }

      resourceData = {
        title,
        description,
        type,
        category,
        format: format || (file ? getMimeType(file.name) : 'URL'),
        author: author || (authResult.user?.username) || 'Usuario',
        downloadUrl: fileUrl || externalUrl || null,
        externalUrl: externalUrl || null,
        thumbnail: '/images/resources/default.jpg',
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        downloads: 0,
        rating: 0
      };

    } else {
      // Manejar JSON sin archivo
      const body = await request.json();
      console.log('📚 API: JSON body received:', body);

      resourceData = {
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        format: body.format || 'URL',
        author: body.author || (authResult.user?.username) || 'Usuario',
        downloadUrl: body.downloadUrl || body.externalUrl,
        externalUrl: body.externalUrl,
        thumbnail: body.thumbnail || '/images/resources/default.jpg',
        publishedDate: body.publishedDate ? new Date(body.publishedDate) : new Date(),
        tags: body.tags || [],
        downloads: 0,
        rating: 0
      };
    }

    // Debug: Log the final resourceData before validation
    console.log('📚 API: Final resourceData before validation:', resourceData);
    console.log('📚 API: Validation check:', {
      hasTitle: !!resourceData.title,
      hasDescription: !!resourceData.description,
      hasType: !!resourceData.type,
      hasCategory: !!resourceData.category
    });

    // Validate required fields
    if (!resourceData.title || !resourceData.description || !resourceData.type || !resourceData.category) {
      console.log('📚 API: Validation failed - missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, description, type, category' },
        { status: 400 }
      );
    }

    // Create resource in database
    const resource = await prisma.resource.create({
      data: resourceData
    });

    console.log('📚 API: Resource created in database:', resource.id);
    return NextResponse.json({ success: true, resource }, { status: 201 });

  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resource - Actualizar recurso (requiere autenticación)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Update resource in database
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, resource });

  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resource - Eliminar recurso (requiere autenticación)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Delete resource from database
    await prisma.resource.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Resource deleted successfully' });

  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting resource' },
      { status: 500 }
    );
  }
}