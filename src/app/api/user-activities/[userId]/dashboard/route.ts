import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    console.log('📊 API: Fetching dashboard data for user:', params.userId);

    const userId = params.userId;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    try {
      // Fetch statistics and activities from backend
      const backendUrl = `${API_BASE}/user-activities/${userId}/dashboard`;

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📊 API: Backend error:', errorText);
        throw new Error(`Backend error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 API: Dashboard data received successfully');

      return NextResponse.json(data);
    } catch (backendError) {
      console.log('📊 API: Backend not available, using mock data');

      // Return mock data when backend is not available
      const mockData = {
        statistics: {
          totalCourses: 15,
          totalJobs: 25,
          totalEntrepreneurships: 8,
          totalInstitutions: 12,
          userCourses: 3,
          userJobApplications: 5,
          userEntrepreneurships: 1
        },
        recentActivities: [
          {
            id: '1',
            icon: '🎓',
            title: 'Curso completado',
            description: 'Completaste el curso "Desarrollo Web Básico"',
            timestamp: '2024-01-15T10:30:00Z',
            type: 'course_completion'
          },
          {
            id: '2',
            icon: '💼',
            title: 'Postulación enviada',
            description: 'Postulaste al trabajo "Desarrollador Frontend" en TechCorp',
            timestamp: '2024-01-14T14:20:00Z',
            type: 'job_application'
          },
          {
            id: '3',
            icon: '📚',
            title: 'Lección completada',
            description: 'Completaste la lección "Introducción a React"',
            timestamp: '2024-01-13T16:45:00Z',
            type: 'lesson_completion'
          },
          {
            id: '4',
            icon: '🏢',
            title: 'Emprendimiento creado',
            description: 'Creaste el emprendimiento "Mi Startup Digital"',
            timestamp: '2024-01-12T09:15:00Z',
            type: 'entrepreneurship_creation'
          },
          {
            id: '5',
            icon: '📝',
            title: 'Quiz completado',
            description: 'Completaste el quiz "Fundamentos de JavaScript" con 85%',
            timestamp: '2024-01-11T11:30:00Z',
            type: 'quiz_completion'
          }
        ],
        total: 5
      };

      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error('📊 API: Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
