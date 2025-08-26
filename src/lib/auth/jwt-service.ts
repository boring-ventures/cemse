// JWT Service for Authentication
// Migrated and adapted from cemse-back/middleware/auth.ts and cemse-back/routes/auth.ts

import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { authConfig } from '../auth-config'
import { UserRole } from '@prisma/client'

// Types based on backend implementation
export interface AuthUser {
  id: string
  username: string
  role: UserRole
  type: 'user' | 'municipality' | 'company'
}

export interface AuthPayload {
  id: string
  username: string
  role: UserRole
  type: 'user' | 'municipality' | 'company'
  iat?: number
  exp?: number
}

export interface RefreshPayload {
  tokenId: string
  userId: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class JWTAuthService {
  /**
   * Generate access token for authenticated user
   * Based on generateAccessToken from cemse-back/routes/auth.ts
   */
  static generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        type: user.type
      },
      authConfig.jwt.accessSecret,
      { expiresIn: authConfig.jwt.accessExpiry }
    )
  }

  /**
   * Generate refresh token
   * Based on generateRefreshToken from cemse-back/routes/auth.ts
   */
  static generateRefreshToken(): string {
    return uuidv4() + uuidv4()
  }

  /**
   * Verify access token and return payload
   * Based on authenticateToken middleware from cemse-back/middleware/auth.ts
   */
  static verifyAccessToken(token: string): AuthPayload | null {
    try {
      const payload = jwt.verify(token, authConfig.jwt.accessSecret) as AuthPayload
      return payload
    } catch (error) {
      console.log('🔍 JWT DEBUG: Token verification failed:', error)
      return null
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshPayload | null {
    try {
      const payload = jwt.verify(token, authConfig.jwt.refreshSecret) as RefreshPayload
      return payload
    } catch (error) {
      console.log('🔍 JWT DEBUG: Refresh token verification failed:', error)
      return null
    }
  }

  /**
   * Create JWT for refresh token (to be stored in database)
   */
  static createRefreshTokenJWT(tokenId: string, userId: string): string {
    return jwt.sign(
      { tokenId, userId },
      authConfig.jwt.refreshSecret,
      { expiresIn: authConfig.jwt.refreshExpiry }
    )
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token)
    } catch (error) {
      console.error('🔍 JWT DEBUG: Token decode error:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTokenExpiry(token: string): number | null {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return null
    
    const currentTime = Math.floor(Date.now() / 1000)
    return Math.max(0, decoded.exp - currentTime)
  }

  /**
   * Create tokens for multi-entity authentication
   * Supports User, Company, and Municipality entities
   */
  static createTokensForEntity(entityData: {
    id: string
    username: string
    type: 'user' | 'municipality' | 'company'
    role?: UserRole
    name?: string
    department?: string
    businessSector?: string
  }): { accessToken: string; refreshTokenId: string } {
    // For municipality and company, assign appropriate role
    let role = entityData.role
    if (!role) {
      if (entityData.type === 'municipality') {
        role = UserRole.MUNICIPAL_GOVERNMENTS
      } else if (entityData.type === 'company') {
        role = UserRole.COMPANIES
      } else {
        throw new Error('Role must be provided for user entities')
      }
    }

    const authUser: AuthUser = {
      id: entityData.id,
      username: entityData.username,
      role,
      type: entityData.type
    }

    const accessToken = this.generateAccessToken(authUser)
    const refreshTokenId = this.generateRefreshToken()

    return { accessToken, refreshTokenId }
  }
}