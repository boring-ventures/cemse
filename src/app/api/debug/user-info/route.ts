import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      const parts = token.split('-');
      if (parts.length >= 4) {
        const username = parts.slice(3, -1).join('-');
        return {
          id: username,
          username: username,
          role: 'EMPRESAS',
          type: 'mock'
        };
      }
    }
    
    // Try multiple possible JWT secrets
    const possibleSecrets = [
      JWT_SECRET,
      'supersecretkey',
      process.env.JWT_SECRET,
      'your-secret-key',
      'cemse-secret'
    ].filter(Boolean);
    
    for (const secret of possibleSecrets) {
      try {
        const decoded = jwt.verify(token, secret as string) as any;
        return decoded;
      } catch (secretError) {
        continue;
      }
    }
    
    throw new Error('No valid JWT secret found');
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === DEBUG USER INFO API CALLED ===');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // Verify the user exists and is active
        const tokenUser = await prisma.user.findUnique({
          where: { id: tokenUserId, isActive: true }
        });
        
        if (tokenUser) {
          decoded = {
            id: tokenUser.id,
            username: tokenUser.username,
            role: tokenUser.role,
            type: 'database'
          };
        }
      }
    } else {
      // JWT token or mock token
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user information
    const userId = decoded.id || decoded.userId;
    
    // Check if user exists in users table
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Check if there's a company with this ID
    const companyById = await prisma.company.findUnique({
      where: { id: userId }
    });

    // Check if there's a company created by this user
    const companyByCreator = await prisma.company.findFirst({
      where: { createdBy: userId }
    });

    // Get all companies for reference
    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true, username: true, loginEmail: true, createdBy: true },
      take: 5
    });

    const debugInfo = {
      token: {
        type: token.startsWith('auth-token-') ? 'database' : token.includes('.') ? 'jwt' : 'unknown',
        decoded: decoded
      },
      user: {
        exists: !!user,
        data: user ? {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive
        } : null
      },
      companies: {
        byId: companyById ? {
          id: companyById.id,
          name: companyById.name,
          username: companyById.username
        } : null,
        byCreator: companyByCreator ? {
          id: companyByCreator.id,
          name: companyByCreator.name,
          username: companyByCreator.username
        } : null,
        all: allCompanies
      },
      recommendations: []
    };

    // Add recommendations
    if (!user) {
      debugInfo.recommendations.push('User not found in database - token might be invalid');
    } else if (user.role === 'COMPANIES' || user.role === 'EMPRESAS') {
      if (!companyById && !companyByCreator) {
        debugInfo.recommendations.push('Company user found but no associated company record - need to create company');
      } else if (companyById) {
        debugInfo.recommendations.push(`Use company ID: ${companyById.id} for job creation`);
      } else if (companyByCreator) {
        debugInfo.recommendations.push(`Use company ID: ${companyByCreator.id} for job creation`);
      }
    }

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Error in debug user info:', error);
    return NextResponse.json(
      { error: 'Error getting user info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
