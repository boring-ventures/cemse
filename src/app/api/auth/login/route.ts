import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database - using backend instead of Prisma
    // const user = await prisma.user.findUnique({
    //   where: { username },
    // });

    // Mock user for now - replace with backend call
    const user = {
      id: '1',
      username: username,
      role: 'JOVENES',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: '$2b$10$mock.password.hash'
    };

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password - using backend instead of Prisma
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === 'password'; // Mock validation for now
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get user profile if exists - using backend instead of Prisma
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

    // Return success response
    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        profilePicture: profile?.avatarUrl || null,
      },
    };

    // Create response and set cookie
    const jsonResponse = NextResponse.json(response);
    
    // Set HTTP-only cookie for server-side authentication checks
    jsonResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🔐 Login API - Token cookie set');
    
    return jsonResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}