import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            apiBase: process.env.NEXT_PUBLIC_API_BASE_PROD || 'Not configured',
            message: 'Local API is running correctly'
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}


