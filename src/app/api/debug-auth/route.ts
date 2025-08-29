import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

console.log('🔍 Debug Auth - JWT_SECRET configured:', !!JWT_SECRET);
console.log('🔍 Debug Auth - JWT_SECRET length:', JWT_SECRET.length);
console.log('🔍 Debug Auth - JWT_SECRET preview:', JWT_SECRET.substring(0, 10) + '...');

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    const result: any = {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      tokenValid: false,
      decoded: null,
      error: null
    };

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        result.tokenValid = true;
        result.decoded = {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
          exp: decoded.exp,
          iat: decoded.iat
        };
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
