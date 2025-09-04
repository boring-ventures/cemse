import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";
import { Course } from "@/types/api";

// Extended Course type with comprehensive data
export interface ComprehensiveCourse extends Course {
  modules: Array<{
    id: string;
    courseId: string;
    title: string;
    description: string;
    orderIndex: number;
    estimatedDuration: number;
    isLocked: boolean;
    prerequisites: string[];
    hasCertificate: boolean;
    certificateTemplate: string | null;
    lessons: Array<{
      id: string;
      moduleId: string;
      title: string;
      description: string;
      content: string;
      contentType: string;
      videoUrl: string | null;
      duration: number;
      orderIndex: number;
      isRequired: boolean;
      isPreview: boolean;
      resources: Array<{
        id: string;
        title: string;
        type: string;
        url: string;
        fileSize: number | null;
      }>;
    }>;
  }>;
}

export interface ComprehensiveCoursesResponse {
  courses: ComprehensiveCourse[];
}

// Hook to fetch comprehensive course data (courses + modules + lessons + resources) in one call
export const useComprehensiveCourses = () => {
  return useQuery<ComprehensiveCoursesResponse>({
    queryKey: ["comprehensive-courses"],
    queryFn: async () => {
      console.log("📚 useComprehensiveCourses - Starting...");
      try {
        const result = await apiCall("/courses/comprehensive");
        console.log("✅ useComprehensiveCourses - Success:", result);
        return result as ComprehensiveCoursesResponse;
      } catch (error) {
        console.error("❌ useComprehensiveCourses - Error:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
