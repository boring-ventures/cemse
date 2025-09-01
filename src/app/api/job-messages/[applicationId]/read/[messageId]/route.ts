import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 Read Message API - verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 Read Message API - Mock development token detected');
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
    console.log('🔍 Read Message API - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 Read Message API - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 Read Message API - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; messageId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('🔍 PUT Read Message API - Marking message as read:', resolvedParams.messageId);
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 Read Message API - No auth token found in cookies');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 Read Message API - Token verification failed');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('🔍 Read Message API - User authenticated:', decoded.username || decoded.id);

    // Check if message exists and user has permission
    const message = await prisma.jobApplicationMessage.findUnique({
      where: { id: resolvedParams.messageId },
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

    // Check if user can mark this message as read
    const isApplicant = decoded.id === message.application.applicant.id;
    const isCompanyOwner = decoded.role === 'COMPANIES' && 
                          (decoded.id === message.application.jobOffer.company.id || 
                           decoded.companyId === message.application.jobOffer.company.id);
    const isAdmin = decoded.role === 'SUPERADMIN';
    
    if (!isApplicant && !isCompanyOwner && !isAdmin) {
      console.log('🔍 Read Message API - Insufficient permissions for user:', decoded.username);
      return NextResponse.json({ error: 'Sin permisos para marcar este mensaje' }, { status: 403 });
    }

    // Mark message as read
    const updatedMessage = await prisma.jobApplicationMessage.update({
      where: { id: resolvedParams.messageId },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    console.log('✅ Read Message API - Successfully marked message as read:', updatedMessage.id);
    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('❌ Read Message API - Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Error al marcar mensaje como leído' },
      { status: 500 }
    );
  }
}
