import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API Route - Getting entrepreneurship:', params.id);

    // Get entrepreneurship with owner profile
    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            municipality: true,
            phone: true,
            avatarUrl: true,
          }
        }
      }
    });

    if (!entrepreneurship) {
      console.log('🔍 API Route - Entrepreneurship not found:', params.id);
      return NextResponse.json(
        { error: 'Emprendimiento no encontrado' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.entrepreneurship.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } }
    });

    console.log('🔍 API Route - Entrepreneurship data:', entrepreneurship);
    return NextResponse.json(entrepreneurship);
  } catch (error) {
    console.error('🔍 API Route - Error:', error);
    return NextResponse.json(
      { error: 'Error al cargar emprendimiento' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('🔍 API Route - Updating entrepreneurship:', params.id, body);

    // Update entrepreneurship in local database
    const updatedEntrepreneurship = await prisma.entrepreneurship.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory,
        businessStage: body.businessStage,
        logo: body.logo,
        images: body.images,
        website: body.website,
        email: body.email,
        phone: body.phone,
        address: body.address,
        municipality: body.municipality,
        department: body.department,
        socialMedia: body.socialMedia,
        founded: body.founded ? new Date(body.founded) : null,
        employees: body.employees,
        annualRevenue: body.annualRevenue,
        businessModel: body.businessModel,
        targetMarket: body.targetMarket,
        isPublic: body.isPublic,
        isActive: body.isActive,
      },
      include: {
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            municipality: true,
            phone: true,
            avatarUrl: true,
          }
        }
      }
    });

    console.log('🔍 API Route - Updated entrepreneurship:', updatedEntrepreneurship);
    return NextResponse.json(updatedEntrepreneurship);
  } catch (error) {
    console.error('🔍 API Route - Error updating entrepreneurship:', error);
    return NextResponse.json(
      { error: 'Error al actualizar emprendimiento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API Route - Deleting entrepreneurship:', params.id);

    // Delete entrepreneurship from local database
    await prisma.entrepreneurship.delete({
      where: { id: params.id }
    });

    console.log('🔍 API Route - Entrepreneurship deleted successfully');
    return NextResponse.json({ message: 'Emprendimiento eliminado exitosamente' });
  } catch (error) {
    console.error('🔍 API Route - Error deleting entrepreneurship:', error);
    return NextResponse.json(
      { error: 'Error al eliminar emprendimiento' },
      { status: 500 }
    );
  }
}
