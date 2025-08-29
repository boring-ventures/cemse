import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function verifyToken(token: string) {
  try {
    console.log('🔍 File API - verifyToken - Attempting to verify token');
    
    // Handle mock development tokens
    if (token.startsWith('mock-dev-token-')) {
      console.log('🔍 File API - Mock development token detected');
      const tokenParts = token.split('-');
      const userId = tokenParts.length >= 3 ? tokenParts.slice(3, -1).join('-') || 'mock-user' : 'mock-user';
      const isCompanyToken = token.includes('mock-dev-token-company-') || userId.includes('company');
      
      return {
        id: userId,
        userId: userId,
        username: isCompanyToken ? `company_${userId}` : userId,
        role: isCompanyToken ? 'COMPANIES' : 'SUPERADMIN',
        type: 'mock',
        companyId: isCompanyToken ? userId : null,
      };
    }
    
    // For JWT tokens, use jwt.verify
    console.log('🔍 File API - Attempting JWT verification');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔍 File API - JWT verified successfully');
    return decoded;
  } catch (error) {
    console.log('🔍 File API - Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        console.log('🔍 File API - Received request for file:', params.filename);
        
        // Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('cemse-auth-token')?.value;
        
        if (!token) {
            console.log('🔍 File API - No auth token found in cookies');
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            console.log('🔍 File API - Token verification failed');
            return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }

        console.log('🔍 File API - User authenticated:', decoded.username || decoded.id);

        const filename = params.filename;

        // Validar el nombre del archivo para evitar path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json(
                { error: "Nombre de archivo inválido" },
                { status: 400 }
            );
        }

        const filePath = join(process.cwd(), 'public', 'uploads', 'documents', filename);
        console.log('🔍 File API - Looking for file at:', filePath);

        if (!existsSync(filePath)) {
            console.log('🔍 File API - File not found at:', filePath);
            return NextResponse.json(
                { error: "Archivo no encontrado" },
                { status: 404 }
            );
        }

        console.log('🔍 File API - File found, reading file...');
        // Leer el archivo
        const fileBuffer = await readFile(filePath);
        console.log('🔍 File API - File read successfully, size:', fileBuffer.length, 'bytes');

        // Determinar el tipo MIME basado en la extensión
        const extension = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        if (extension === 'pdf') {
            contentType = 'application/pdf';
        } else if (extension === 'doc') {
            contentType = 'application/msword';
        } else if (extension === 'docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Crear la respuesta con los headers apropiados
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving document:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 