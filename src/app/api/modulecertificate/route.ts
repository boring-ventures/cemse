import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// GET /api/modulecertificate - Get module certificates for authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('🏅 API: Received request for module certificates');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🏅 API: Authenticated user:', decoded.username);

    // Get module certificates from database
    const certificates = await prisma.moduleCertificate.findMany({
      where: {
        studentId: decoded.id,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Return actual certificates from database

    console.log('🏅 API: Found', certificates.length, 'module certificates');
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error in module certificates route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏅 API: Received request to create module certificate');

    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🏅 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { moduleId, grade = 100 } = body;

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId is required' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.moduleCertificate.findFirst({
      where: {
        moduleId,
        studentId: decoded.id,
      }
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: 'Ya tienes un certificado para este módulo' },
        { status: 400 }
      );
    }

    // Create new module certificate
    const certificate = await prisma.moduleCertificate.create({
      data: {
        moduleId,
        studentId: decoded.id,
        certificateUrl: `/certificates/module-${moduleId}-${decoded.id}.pdf`,
        issuedAt: new Date(),
        grade,
        completedAt: new Date(),
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    console.log('🏅 API: Module certificate created:', certificate.id);
    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Error creating module certificate:', error);
    return NextResponse.json(
      { error: 'Error al crear certificado del módulo' },
      { status: 500 }
    );
  }
}