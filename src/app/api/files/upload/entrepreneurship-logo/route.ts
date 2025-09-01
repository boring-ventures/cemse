import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Received entrepreneurship logo upload request');
    
    // Get the form data from the request
    const formData = await request.formData();
    const logoFile = formData.get('logo') as File;
    
    if (!logoFile) {
      return NextResponse.json(
        { error: 'No logo file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (logoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'entrepreneurships');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = logoFile.name.split('.').pop();
    const filename = `logo-${timestamp}-${random}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const logoUrl = `/uploads/entrepreneurships/${filename}`;
    
    console.log('✅ API: Logo upload successful:', logoUrl);
    return NextResponse.json({
      logoUrl,
      filename,
      message: 'Logo uploaded successfully'
    });
    
  } catch (error) {
    console.error('❌ API: Error in entrepreneurship logo upload:', error);
    return NextResponse.json(
      { error: 'Error al subir el logo' },
      { status: 500 }
    );
  }
}
