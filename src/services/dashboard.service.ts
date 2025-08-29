import { apiCall, getAuthHeaders } from '@/lib/api';

export interface DashboardStatistics {
    totalCourses: number;
    totalJobs: number;
    totalEntrepreneurships: number;
    totalInstitutions: number;
    userCourses: number;
    userJobApplications: number;
    userEntrepreneurships: number;
}

export interface RecentActivity {
    id: string;
    icon: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'job_application' | 'course_enrollment' | 'course_completion' | 'entrepreneurship_creation' | 'event_registration' | 'quiz_completion' | 'lesson_completion';
}

export interface DashboardData {
    statistics: DashboardStatistics;
    recentActivities: RecentActivity[];
    total: number;
}

export class DashboardService {
    /**
     * Get dashboard data for a specific user
     * Backend endpoint: GET /api/user-activities/{userId}/dashboard
     */
    static async getUserDashboard(userId: string): Promise<DashboardData> {
        try {
            console.log('📊 DashboardService.getUserDashboard - Fetching dashboard data for user:', userId);

            // Use direct fetch to Next.js API route with cookies for authentication
            const response = await fetch(`/api/user-activities/${userId}/dashboard`, {
                method: 'GET',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ DashboardService.getUserDashboard - Dashboard data fetched:', data);
            return data as DashboardData;
        } catch (error) {
            console.error('❌ DashboardService.getUserDashboard - Backend error:', error);
            
            // In production, don't fallback to mock data
            const isProduction = process.env.NODE_ENV === 'production';
            if (isProduction) {
                console.error('❌ DashboardService.getUserDashboard - Production error: Backend unavailable');
                throw new Error('Dashboard service unavailable');
            }
            
            // Only return mock data in development
            console.warn('⚠️ DashboardService.getUserDashboard - Development fallback: returning mock data');
            return this.getMockDashboardData(userId);
        }
    }

    /**
     * Generate mock dashboard data for development/fallback
     */
    private static getMockDashboardData(userId: string): DashboardData {
        console.log('📊 DashboardService.getMockDashboardData - Generating mock data for user:', userId);
        
        return {
            statistics: {
                totalCourses: 12,
                totalJobs: 8,
                totalEntrepreneurships: 5,
                totalInstitutions: 15,
                userCourses: 3,
                userJobApplications: 2,
                userEntrepreneurships: 1
            },
            recentActivities: [
                {
                    id: '1',
                    icon: '🎯',
                    title: 'Aplicaste a un empleo',
                    description: 'Desarrollador Frontend en TechCorp',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    type: 'job_application'
                },
                {
                    id: '2',
                    icon: '📚',
                    title: 'Completaste un curso',
                    description: 'Fundamentos de React',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    type: 'course_completion'
                },
                {
                    id: '3',
                    icon: '🚀',
                    title: 'Creaste un emprendimiento',
                    description: 'EcoTech Solutions',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                    type: 'entrepreneurship_creation'
                }
            ],
            total: 3
        };
    }

    /**
     * Get current user's dashboard data
     */
    static async getCurrentUserDashboard(): Promise<DashboardData> {
        try {
            console.log('📊 DashboardService.getCurrentUserDashboard - Fetching current user dashboard data');

            // First get current user info from our Next.js API route
            const userResponse = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!userResponse.ok) {
                console.error('📊 DashboardService.getCurrentUserDashboard - Auth failed');
                
                // In production, don't fallback to mock data
                const isProduction = process.env.NODE_ENV === 'production';
                if (isProduction) {
                    throw new Error('Authentication failed');
                }
                
                console.warn('⚠️ DashboardService.getCurrentUserDashboard - Development fallback: using mock data');
                return this.getMockDashboardData('fallback-user');
            }

            const userData = await userResponse.json();

            console.log('📊 DashboardService.getCurrentUserDashboard - User response:', userData);

            // The response structure is { user: User }
            const userId = userData.user?.id || userData.id;

            if (!userId) {
                console.error('📊 DashboardService.getCurrentUserDashboard - No user ID found');
                
                // In production, don't fallback to mock data
                const isProduction = process.env.NODE_ENV === 'production';
                if (isProduction) {
                    throw new Error('No user ID found');
                }
                
                console.warn('⚠️ DashboardService.getCurrentUserDashboard - Development fallback: using mock data');
                return this.getMockDashboardData('unknown-user');
            }

            console.log('📊 DashboardService.getCurrentUserDashboard - Using user ID:', userId);

            // Try to get data from backend, fallback to mock data on failure
            return await this.getUserDashboard(userId);
        } catch (error) {
            console.error('❌ DashboardService.getCurrentUserDashboard - Error:', error);
            
            // In production, don't fallback to mock data
            const isProduction = process.env.NODE_ENV === 'production';
            if (isProduction) {
                throw error;
            }
            
            console.warn('⚠️ DashboardService.getCurrentUserDashboard - Development fallback: using mock data');
            return this.getMockDashboardData('error-fallback');
        }
    }


}
