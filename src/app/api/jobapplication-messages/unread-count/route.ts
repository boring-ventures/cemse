import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 Unread Count API - verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 Unread Count API - Mock development token detected');
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
    console.log('🔍 Unread Count API - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 Unread Count API - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 Unread Count API - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET Unread Count API called');
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 Unread Count API - No auth token found in cookies');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔍 Unread Count API - Token verification failed');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('🔍 Unread Count API - User authenticated:', decoded.username || decoded.id);

    // Count unread messages where user is the recipient
    let unreadCount = 0;
    
    if (decoded.role === 'COMPANIES') {
      // For companies, count unread messages from applicants in their job applications
      unreadCount = await prisma.jobApplicationMessage.count({
        where: {
          status: { in: ['SENT', 'DELIVERED'] }, // Not READ yet
          senderType: 'APPLICANT', // Messages from applicants to company
          application: {
            jobOffer: {
              OR: [
                { companyId: decoded.id },
                { companyId: decoded.companyId }
              ]
            }
          }
        }
      });
    } else {
      // For applicants/youth, count unread messages from companies in their applications
      unreadCount = await prisma.jobApplicationMessage.count({
        where: {
          status: { in: ['SENT', 'DELIVERED'] }, // Not READ yet
          senderType: 'COMPANY', // Messages from company to applicant
          application: {
            applicantId: decoded.id
          }
        }
      });
    }

    console.log('✅ Unread Count API - Successfully counted unread messages:', unreadCount);
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('❌ Unread Count API - Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Error al obtener contador de mensajes no leídos' },
      { status: 500 }
    );
  }
}
