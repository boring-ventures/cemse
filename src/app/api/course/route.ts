import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('📚 API: Received request for courses');
    
    // Get auth token (optional for public courses)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | null = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
        console.log('📚 API: Authenticated user:', decoded.username);
      } catch (error) {
        console.log('📚 API: Invalid token, proceeding without auth');
      }
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const institutionId = searchParams.get('institutionId');
    const isActive = searchParams.get('isActive');
    
    // Build filter conditions
    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (institutionId) where.instructorId = institutionId;
    if (isActive !== null) where.isActive = isActive === 'true';
    
    // Get courses from database
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            jobTitle: true,
          }
        },
        modules: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          }
        }
      },
      orderBy: [
        { isMandatory: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform courses to match expected format
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      videoPreview: course.videoPreview,
      objectives: course.objectives,
      prerequisites: course.prerequisites,
      duration: course.duration,
      level: course.level,
      category: course.category,
      isMandatory: course.isMandatory,
      isActive: course.isActive,
      price: Number(course.price || 0),
      rating: Number(course.rating || 0),
      studentsCount: course.studentsCount,
      enrollmentCount: course._count.enrollments,
      completionRate: Number(course.completionRate || 0),
      totalLessons: course.totalLessons,
      totalQuizzes: course.totalQuizzes,
      totalResources: course.totalResources,
      tags: course.tags,
      certification: course.certification,
      includedMaterials: course.includedMaterials,
      instructorId: course.instructorId,
      institutionName: course.institutionName,
      instructor: course.instructor ? {
        id: course.instructor.userId,
        name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || 'Sin nombre',
        title: course.instructor.jobTitle || 'Instructor',
        avatar: course.instructor.avatarUrl || '/avatars/default.jpg'
      } : null,
      organization: {
        id: '1',
        name: course.institutionName || 'CEMSE',
        logo: '/logos/cemse.png'
      },
      publishedAt: course.publishedAt?.toISOString(),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString()
    }));

    console.log('📚 API: Returning courses from database:', transformedCourses.length);
    return NextResponse.json({ courses: transformedCourses }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in courses route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 API: Received POST request for course creation');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📚 API: Authenticated user:', decoded.username);

    const body = await request.json();
    console.log('📚 API: Course data received:', body);
    
    // Generate unique slug
    let baseSlug = body.slug || body.title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check for slug uniqueness
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    console.log('📚 API: Using slug:', slug);

    // Check if user profile exists
    const userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id }
    });
    
    console.log('📚 API: User profile found:', !!userProfile);

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug: slug,
        description: body.description,
        shortDescription: body.shortDescription || null,
        thumbnail: body.thumbnail || null,
        videoPreview: body.videoPreview || null,
        objectives: body.objectives || [],
        prerequisites: body.prerequisites || [],
        duration: parseInt(body.duration) || 0,
        level: body.level || 'BEGINNER',
        category: body.category,
        isMandatory: body.isMandatory || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        price: parseFloat(body.price) || 0,
        rating: 0,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        totalResources: 0,
        tags: body.tags || [],
        certification: body.certification !== undefined ? body.certification : true,
        includedMaterials: body.includedMaterials || [],
        instructorId: userProfile ? decoded.id : null, // Only set if profile exists
        institutionName: body.institutionName || 'CEMSE',
        publishedAt: new Date(), // Set published date
      },
      include: {
        instructor: userProfile ? {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            jobTitle: true,
          }
        } : false
      }
    });

    console.log('✅ Course created successfully:', course.id);
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating course:', error);
    
    const errorDetails = error instanceof Error ? {
      message: error.message,
      code: (error as any).code,
      meta: (error as any).meta
    } : { message: 'Unknown error' };
    
    console.error('❌ Error details:', errorDetails);
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}