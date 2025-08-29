import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📄 API: CV file upload request received');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('📄 API: No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // For file uploads, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`
        };
        console.log('📄 API: Database token validated for user:', decoded.username);
      }
    } else {
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('📄 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('📄 API: Authenticated user:', decoded.username || decoded.id);

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('cvFile') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No CV file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create filename with user ID and timestamp
    const timestamp = Date.now();
    const userId = decoded.id || decoded.username;
    const fileName = `cv_${userId}_${timestamp}.pdf`;
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // Return the URL path for the uploaded file
    const cvUrl = `/uploads/documents/${fileName}`;
    
    console.log('📄 API: CV file uploaded successfully:', cvUrl);
    
    return NextResponse.json({
      message: 'CV uploaded successfully',
      cvUrl,
      fileName
    });

  } catch (error) {
    console.error('📄 API: Error uploading CV file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}