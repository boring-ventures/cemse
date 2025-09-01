import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 Send Message API - verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 Send Message API - Mock development token detected');
      const tokenParts = token.split('-');
      const userId = tokenParts.length >= 3 ? tokenParts.slice(3, -1).join('-') || 'mock-user' : 'mock-user';
      const isCompanyToken = token.includes('mock-dev-token-company-') || userId.includes('company');
      
      return {
        id: userId,
        userId: userId,
        username: isCompanyToken ? `company_${userId}` : userId,
        role: isCompanyToken ? 'COMPANIES' : 'SUPERADMIN',
        type: 'mock',
        companyId: isCompanyToken ? userId : null,
      };
    }
    
    // For JWT tokens, use jwt.verify
    console.log('🔍 Send Message API - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 Send Message API - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 Send Message API - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 POST Send Message API - Route called');
  try {
    const body = await request.json();
    const { applicationId, content, messageType = 'TEXT' } = body;
    
    console.log('🔍 POST Send Message API - Sending message for application:', applicationId);
    console.log('🔍 POST Send Message API - Message data:', { content, messageType });
    
    if (!applicationId || !content) {
      return NextResponse.json({ error: 'applicationId y content son requeridos' }, { status: 400 });
    }
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 Send Message API - No auth token found in cookies');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 Send Message API - Token verification failed');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('🔍 Send Message API - User authenticated:', decoded.username || decoded.id);

    // Check if application exists and user has permission
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: { select: { id: true } },
        jobOffer: { 
          include: { 
            company: { select: { id: true } } 
          } 
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }

    // Check if user can send messages for this application
    const isApplicant = decoded.id === application.applicantId;
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === application.jobOffer.company.id || 
                           decoded.companyId === application.jobOffer.company.id);
    const isAdmin = decoded.role === 'SUPERADMIN';
    
    if (!isApplicant && !isCompanyOwner && !isAdmin) {
      console.log('🔍 Send Message API - Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ error: 'Sin permisos para enviar mensajes' }, { status: 403 });
    }

    // Determine sender type (schema only supports COMPANY and APPLICANT)
    let senderType: 'COMPANY' | 'APPLICANT' = 'APPLICANT';
    if (isCompanyOwner) {
      senderType = 'COMPANY';
    }
    // Note: ADMIN users will send as COMPANY type for now

    console.log('🔍 Send Message API - Creating message with:', {
      applicationId,
      senderId: decoded.id,
      senderType: senderType,
      content: content.substring(0, 50) + '...',
      messageType
    });

    // Create message in database
    const newMessage = await prisma.jobApplicationMessage.create({
      data: {
        applicationId,
        content,
        messageType,
        senderId: decoded.id,
        senderType: senderType,
        status: 'SENT'
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            jobOffer: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    website: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('✅ Send Message API - Successfully created message:', newMessage.id);
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('❌ Send Message API - Error sending message:', error);
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
