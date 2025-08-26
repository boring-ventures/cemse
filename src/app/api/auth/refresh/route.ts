// JWT Token Refresh API Route
// Handles automatic token refresh using httpOnly refresh token cookies

import { NextRequest, NextResponse } from 'next/server';
import { JWTAuthService } from '@/lib/auth/jwt-service';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 /refresh endpoint - Attempting token refresh');

    // Get refresh token from httpOnly cookie
    const refreshTokenCookie = request.cookies.get(authConfig.cookies.refreshToken.name);
    
    if (!refreshTokenCookie?.value) {
      console.log('🔄 /refresh - No refresh token cookie found');
      return NextResponse.json(
        { message: 'No refresh token provided.' },
        { status: 401 }
      );
    }

    const refreshToken = refreshTokenCookie.value;
    console.log('🔄 /refresh - Refresh token found:', refreshToken.substring(0, 20) + '...');

    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!storedToken) {
      console.log('🔄 /refresh - Invalid or expired refresh token');
      return NextResponse.json(
        { message: 'Invalid or expired refresh token.' },
        { status: 401 }
      );
    }

    // Verify user is still active
    if (!storedToken.user || !storedToken.user.isActive) {
      console.log('🔄 /refresh - User not found or inactive');
      return NextResponse.json(
        { message: 'User account is not active.' },
        { status: 401 }
      );
    }

    console.log('🔄 /refresh - Valid refresh token for user:', storedToken.user.username);

    // Generate new access token
    const { accessToken } = JWTAuthService.createTokensForEntity({
      id: storedToken.user.id,
      username: storedToken.user.username,
      type: 'user',
      role: storedToken.user.role
    });

    console.log('🔄 /refresh - New access token generated');

    // Create response with new access token
    const response = NextResponse.json({
      token: accessToken,
      message: 'Token refreshed successfully'
    });

    // Set new access token cookie
    response.cookies.set(
      authConfig.cookies.accessToken.name,
      accessToken,
      authConfig.cookies.accessToken.options
    );

    console.log('🔄 /refresh - Token refresh successful');
    return response;

  } catch (error) {
    console.error('🔄 /refresh - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}