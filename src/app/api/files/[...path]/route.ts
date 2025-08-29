import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getMimeType } from '@/lib/file-upload';

// GET /api/files/[...path] - Serve uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath);
    
    console.log('📁 File request for:', filePath);
    console.log('📁 Full path:', fullPath);
    
    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Get the filename for mime type detection
    const filename = params.path[params.path.length - 1];
    const mimeType = getMimeType(filename);
    
    console.log('📁 Serving file:', filename, 'with mime type:', mimeType);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { success: false, message: 'File not found' },
      { status: 404 }
    );
  }
}
