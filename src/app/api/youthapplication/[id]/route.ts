import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// GET: Obtener postulación específica
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request for youth application:', id);

        // Get auth token
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('🔍 API: Authenticated user:', decoded.username);

        // Get youth application from database
        const youthApplication = await prisma.youthApplication.findUnique({
            where: { id },
            include: {
                youthProfile: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                _count: {
                    select: {
                        messages: true,
                        companyInterests: true
                    }
                }
            }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        console.log('🔍 API: Youth application found:', youthApplication.id);
        return NextResponse.json(youthApplication);
    } catch (error) {
        console.error('Error in get youth application route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar postulación
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request to update youth application:', id);

        // Get auth token
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('🔍 API: Authenticated user:', decoded.username);

        // Check if application exists and user has permission
        const existingApplication = await prisma.youthApplication.findUnique({
            where: { id },
            select: { id: true, youthProfileId: true }
        });

        if (!existingApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Only allow the creator to update their application
        if (existingApplication.youthProfileId !== decoded.id) {
            return NextResponse.json(
                { message: 'Permission denied' },
                { status: 403 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const status = formData.get('status') as string;
        const isPublic = formData.get('isPublic') === 'true';
        const cvUrl = formData.get('cvUrl') as string;
        const coverLetterUrl = formData.get('coverLetterUrl') as string;

        // Handle file uploads if provided
        let finalCvUrl = cvUrl;
        let finalCoverLetterUrl = coverLetterUrl;

        const cvFile = formData.get('cvFile') as File;
        const coverLetterFile = formData.get('coverLetterFile') as File;

        if (cvFile && cvFile.size > 0) {
            try {
                // Upload CV file
                const cvFormData = new FormData();
                cvFormData.append('cvFile', cvFile);
                
                const cvUploadResponse = await fetch(`${request.nextUrl.origin}/api/files/upload/cv`, {
                    method: 'POST',
                    headers: {
                        'Cookie': request.headers.get('cookie') || '',
                    },
                    body: cvFormData
                });
                
                if (cvUploadResponse.ok) {
                    const cvResult = await cvUploadResponse.json();
                    finalCvUrl = cvResult.cvUrl;
                    console.log('📄 CV file uploaded successfully:', finalCvUrl);
                } else {
                    console.error('📄 CV file upload failed:', cvUploadResponse.statusText);
                }
            } catch (error) {
                console.error('📄 Error uploading CV file:', error);
            }
        }

        if (coverLetterFile && coverLetterFile.size > 0) {
            try {
                // Upload cover letter file
                const coverLetterFormData = new FormData();
                coverLetterFormData.append('coverLetterFile', coverLetterFile);
                
                const coverLetterUploadResponse = await fetch(`${request.nextUrl.origin}/api/files/upload/cover-letter`, {
                    method: 'POST',
                    headers: {
                        'Cookie': request.headers.get('cookie') || '',
                    },
                    body: coverLetterFormData
                });
                
                if (coverLetterUploadResponse.ok) {
                    const coverLetterResult = await coverLetterUploadResponse.json();
                    finalCoverLetterUrl = coverLetterResult.coverLetterUrl;
                    console.log('📄 Cover letter file uploaded successfully:', finalCoverLetterUrl);
                } else {
                    console.error('📄 Cover letter file upload failed:', coverLetterUploadResponse.statusText);
                }
            } catch (error) {
                console.error('📄 Error uploading cover letter file:', error);
            }
        }

        // Update youth application
        const updatedApplication = await prisma.youthApplication.update({
            where: { id },
            data: {
                title: title || undefined,
                description: description || undefined,
                status: status || undefined,
                isPublic: isPublic !== undefined ? isPublic : undefined,
                cvUrl: finalCvUrl || undefined,
                coverLetterUrl: finalCoverLetterUrl || undefined,
            }
        });

        console.log('🔍 API: Youth application updated successfully:', id);
        return NextResponse.json(updatedApplication);
    } catch (error) {
        console.error('Error in update youth application route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar postulación
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('🔍 API: Received request to delete youth application:', id);

        // Get auth token
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('🔍 API: Authenticated user:', decoded.username);

        // Check if application exists and user has permission
        const youthApplication = await prisma.youthApplication.findUnique({
            where: { id },
            select: { id: true, youthProfileId: true }
        });

        if (!youthApplication) {
            return NextResponse.json(
                { message: 'Youth application not found' },
                { status: 404 }
            );
        }

        // Only allow the creator to delete their application
        if (youthApplication.youthProfileId !== decoded.id) {
            return NextResponse.json(
                { message: 'Permission denied' },
                { status: 403 }
            );
        }

        // Delete youth application
        await prisma.youthApplication.delete({
            where: { id }
        });

        console.log('🔍 API: Youth application deleted successfully:', id);
        return NextResponse.json({ message: 'Youth application deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error in delete youth application route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 