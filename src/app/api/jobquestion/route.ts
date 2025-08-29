import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, BACKEND_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for job questions');
    const { searchParams } = new URL(request.url);

    // Build backend URL directly (not using API_BASE to avoid circular calls)
    const backendUrl = new URL(`${BACKEND_URL}/api/jobquestion`);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    console.log('🔍 API: Forwarding to backend:', backendUrl.toString());
    console.log('🔍 API: Authorization header:', request.headers.get('authorization') ? 'Present' : 'Missing');

    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 API: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 API: Backend error:', errorText);
      
      // If backend is not available, return mock data
      if (response.status >= 500 || response.status === 0) {
        console.log('🔍 API: Backend not available, returning mock data');
        const mockData = [
          {
            id: 'question_1',
            jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
            question: '¿Por qué te interesa trabajar en nuestra empresa?',
            type: 'TEXT',
            required: true,
            orderIndex: 1,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'question_2',
            jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
            question: '¿Tienes experiencia previa en este tipo de roles?',
            type: 'MULTIPLE_CHOICE',
            required: true,
            options: ['Sí, tengo mucha experiencia', 'Tengo algo de experiencia', 'No, pero estoy dispuesto/a a aprender'],
            orderIndex: 2,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'question_3',
            jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
            question: '¿Estás disponible para trabajar tiempo completo?',
            type: 'BOOLEAN',
            required: true,
            orderIndex: 3,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          }
        ];
        return NextResponse.json(mockData);
      }
      
      return NextResponse.json(
        { message: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 API: Backend data received, questions count:', data.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in job questions route:', error);
    
    // Return mock data on any error (e.g., network error, backend not available)
    console.log('🔍 API: Error occurred, returning mock data');
    const { searchParams } = new URL(request.url);
    const mockData = [
      {
        id: 'question_1',
        jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
        question: '¿Por qué te interesa trabajar en nuestra empresa?',
        type: 'TEXT',
        required: true,
        orderIndex: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'question_2',
        jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
        question: '¿Tienes experiencia previa en este tipo de roles?',
        type: 'MULTIPLE_CHOICE',
        required: true,
        options: ['Sí, tengo mucha experiencia', 'Tengo algo de experiencia', 'No, pero estoy dispuesto/a a aprender'],
        orderIndex: 2,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'question_3',
        jobOfferId: searchParams.get('jobOfferId') || 'mock-job-1',
        question: '¿Estás disponible para trabajar tiempo completo?',
        type: 'BOOLEAN',
        required: true,
        orderIndex: 3,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
    return NextResponse.json(mockData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeaders = getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/api/jobquestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating job question:', error);
    return NextResponse.json(
      { error: 'Error al crear pregunta de trabajo' },
      { status: 500 }
    );
  }
}
