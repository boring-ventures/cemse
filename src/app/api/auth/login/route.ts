// Login API Route
// Migrated from cemse-back/routes/auth.ts login endpoint

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { JWTAuthService } from '@/lib/auth/jwt-service'
import { authConfig } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required.' },
        { status: 400 }
      )
    }

    console.log('🔐 Login attempt for username:', username)

    // Try to find user in regular users table first
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (user && user.isActive) {
      console.log('🔐 User found:', { id: user.id, username: user.username, role: user.role })

      // Verify password for regular user
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        console.log('🔐 Invalid password for user:', username)
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 401 }
        )
      }

      console.log('🔐 Password verified for user:', username)

      // Generate tokens using JWT service
      const { accessToken, refreshTokenId } = JWTAuthService.createTokensForEntity({
        id: user.id,
        username: user.username,
        type: 'user',
        role: user.role
      })

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await prisma.refreshToken.create({
        data: {
          token: refreshTokenId,
          userId: user.id,
          expiresAt,
        }
      })

      console.log('🔐 Tokens generated and refresh token stored for user:', username)

      // Create response with user data
      const response = NextResponse.json({
        token: accessToken,
        refreshToken: refreshTokenId,
        role: user.role,
        type: 'user',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      })

      // Set HttpOnly cookie for refresh token
      response.cookies.set(
        authConfig.cookies.refreshToken.name,
        refreshTokenId,
        authConfig.cookies.refreshToken.options
      )

      // Set access token cookie (not HttpOnly so client can read it)
      response.cookies.set(
        authConfig.cookies.accessToken.name,
        accessToken,
        authConfig.cookies.accessToken.options
      )

      console.log('🔐 Login successful for user:', username)
      return response
    }

    // TODO: Add Municipality and Company authentication in next phase
    console.log('🔐 User not found or invalid credentials:', username)
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 401 }
    )

  } catch (error) {
    console.error('🔐 Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    )
  }
}