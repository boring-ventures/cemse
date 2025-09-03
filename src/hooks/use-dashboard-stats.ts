import { useQuery } from "@tanstack/react-query";

export interface DashboardUser {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture: string | null;
  municipality: string;
  department: string;
  profileCompletion: number;
}

export interface DashboardGlobalStats {
  totalCourses: number;
  totalJobOffers: number;
  totalCompanies: number;
  totalUsers: number;
  totalInstitutions: number;
  totalEntrepreneurships: number;
  totalNewsArticles: number;
  totalCertificates: number;
  totalEnrollments: number;
  totalJobApplications: number;
  totalYouthApplications: number;
  totalMunicipalities: number;
}

export interface DashboardRoleStats {
  // Youth/Adolescent stats
  enrolledCourses?: number;
  completedCourses?: number;
  certificates?: number;
  jobApplications?: number;
  entrepreneurships?: number;
  youthApplications?: number;
  completionPercentage?: number;

  // Company stats
  jobOffers?: number;
  jobApplications?: number;
  youthApplicationInterests?: number;

  // Institution stats
  courses?: number;
  enrollments?: number;
  certificates?: number;

  // SuperAdmin stats
  totalProfiles?: number;
  inactiveUsers?: number;
  pendingUsers?: number;
  recentRegistrations?: number;
}

export interface DashboardActivity {
  id: string;
  type:
    | "course_enrollment"
    | "job_application"
    | "job_offer_created"
    | "job_application_received"
    | "course_completion"
    | "entrepreneurship_creation";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface DashboardData {
  user: DashboardUser;
  globalStats: DashboardGlobalStats;
  roleStats: DashboardRoleStats;
  recentActivities: DashboardActivity[];
  lastUpdated: string;
}

async function fetchDashboardStats(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard/stats", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardStatsRefetch() {
  const query = useDashboardStats();

  return {
    ...query,
    refetch: () => query.refetch(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  };
}
