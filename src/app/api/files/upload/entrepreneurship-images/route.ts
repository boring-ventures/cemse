import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Received entrepreneurship images upload request');
    
    // Get the form data from the request
    const formData = await request.formData();
    const imageFiles = formData.getAll('images') as File[];
    
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Validate number of images (max 10)
    if (imageFiles.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'entrepreneurships');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedImages = [];

    for (const imageFile of imageFiles) {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${imageFile.name} must be an image` },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${imageFile.name} must be less than 5MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const extension = imageFile.name.split('.').pop();
      const filename = `entrepreneurship-${timestamp}-${random}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Convert File to Buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Add to uploaded images array
      uploadedImages.push({
        imageUrl: `/uploads/entrepreneurships/${filename}`,
        filename,
        originalName: imageFile.name,
        size: imageFile.size,
        mimetype: imageFile.type
      });
    }
    
    console.log('✅ API: Images upload successful:', uploadedImages.length, 'images');
    return NextResponse.json({
      images: uploadedImages,
      count: uploadedImages.length,
      message: 'Images uploaded successfully'
    });
    
  } catch (error) {
    console.error('❌ API: Error in entrepreneurship images upload:', error);
    return NextResponse.json(
      { error: 'Error al subir las imágenes' },
      { status: 500 }
    );
  }
}
