// JWT Logout API Route
// Handles user logout and token cleanup

import { NextRequest, NextResponse } from 'next/server';
import { JWTAuthService } from '@/lib/auth/jwt-service';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔓 /logout endpoint - Processing logout request');

    // Get access token to identify user
    let token: string | null = null;

    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('🔓 /logout - Token found in Authorization header');
    }

    // Fallback to access_token cookie
    if (!token) {
      token = request.cookies.get('access_token')?.value || null;
      if (token) {
        console.log('🔓 /logout - Token found in access_token cookie');
      }
    }

    // If we have a token, invalidate the user's refresh tokens
    if (token) {
      try {
        const payload = JWTAuthService.verifyAccessToken(token);
        
        if (payload && payload.id) {
          console.log('🔓 /logout - Invalidating refresh tokens for user:', payload.username);
          
          // Mark all user's refresh tokens as revoked
          await prisma.refreshToken.updateMany({
            where: {
              userId: payload.id,
              revoked: false
            },
            data: {
              revoked: true
            }
          });
          
          console.log('🔓 /logout - Refresh tokens invalidated');
        }
      } catch (error) {
        console.log('🔓 /logout - Token verification failed (may be expired), continuing with logout');
      }
    }

    // Get refresh token from cookie to specifically revoke it
    const refreshTokenCookie = request.cookies.get(authConfig.cookies.refreshToken.name);
    if (refreshTokenCookie?.value) {
      console.log('🔓 /logout - Revoking specific refresh token');
      
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshTokenCookie.value,
          revoked: false
        },
        data: {
          revoked: true
        }
      });
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear authentication cookies
    response.cookies.set(
      authConfig.cookies.accessToken.name,
      '',
      {
        ...authConfig.cookies.accessToken.options,
        maxAge: 0,
        expires: new Date(0)
      }
    );

    response.cookies.set(
      authConfig.cookies.refreshToken.name,
      '',
      {
        ...authConfig.cookies.refreshToken.options,
        maxAge: 0,
        expires: new Date(0)
      }
    );

    console.log('🔓 /logout - Logout successful');
    return response;

  } catch (error) {
    console.error('🔓 /logout - Error:', error);
    
    // Even if there's an error, clear cookies for safety
    const response = NextResponse.json(
      { message: 'Logout completed with errors' },
      { status: 200 }
    );

    response.cookies.set(
      authConfig.cookies.accessToken.name,
      '',
      {
        ...authConfig.cookies.accessToken.options,
        maxAge: 0,
        expires: new Date(0)
      }
    );

    response.cookies.set(
      authConfig.cookies.refreshToken.name,
      '',
      {
        ...authConfig.cookies.refreshToken.options,
        maxAge: 0,
        expires: new Date(0)
      }
    );

    return response;
  }
}