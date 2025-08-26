import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // const user = await prisma.user.findUnique({
    //   where: { id: decoded.id },
    // });

    // Mock user for now - replace with backend call
    const user = {
      id: decoded.id,
      username: 'demo_user',
      role: 'JOVENES',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let profile = null;
    try {
      // profile = await prisma.profile.findUnique({
      //   where: { userId: user.id },
      // });

      // Mock profile for now - replace with backend call
      profile = {
        firstName: 'Usuario',
        lastName: 'Demo',
        email: 'usuario@demo.com',
        phone: '+591 12345678',
        avatarUrl: null
      };
    } catch (error) {
      console.log('No profile found for user:', user.id);
    }

    const userData = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        profilePicture: profile?.avatarUrl || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}