import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 Mark Read API - verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 Mark Read API - Mock development token detected');
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
    console.log('🔍 Mark Read API - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 Mark Read API - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 Mark Read API - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; messageId: string }> }
) {
  try {
    const { applicationId, messageId } = await params;
    console.log('🔍 PUT Mark Read API - Marking message as read:', messageId);
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 Mark Read API - No auth token found in cookies');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 Mark Read API - Token verification failed');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('🔍 Mark Read API - User authenticated:', decoded.username || decoded.id);

    // Check if message exists and user has permission to read it
    const message = await prisma.jobApplicationMessage.findUnique({
      where: { id: messageId },
      include: {
        application: {
          include: {
            applicant: { select: { id: true } },
            jobOffer: { 
              include: { 
                company: { select: { id: true } } 
              } 
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
    }

    if (message.applicationId !== applicationId) {
      return NextResponse.json({ error: 'Mensaje no pertenece a esta aplicación' }, { status: 400 });
    }

    // Check if user can mark this message as read
    const isApplicant = decoded.id === message.application.applicantId;
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === message.application.jobOffer.company.id || 
                           decoded.companyId === message.application.jobOffer.company.id);
    const isAdmin = decoded.role === 'SUPERADMIN';
    
    if (!isApplicant && !isCompanyOwner && !isAdmin) {
      console.log('🔍 Mark Read API - Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ error: 'Sin permisos para marcar el mensaje como leído' }, { status: 403 });
    }

    // Update message as read
    const updatedMessage = await prisma.jobApplicationMessage.update({
      where: { id: messageId },
      data: {
        status: 'READ', // Use MessageStatus enum
        readAt: new Date()
      }
    });

    console.log('✅ Mark Read API - Successfully marked message as read:', messageId);
    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje marcado como leído',
      readAt: updatedMessage.readAt 
    });
  } catch (error) {
    console.error('❌ Mark Read API - Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Error al marcar mensaje como leído' },
      { status: 500 }
    );
  }
}
