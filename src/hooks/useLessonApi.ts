import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  contentType: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE";
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  attachments: any[];
  resources: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonData {
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  contentType: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE";
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  isRequired?: boolean;
  isPreview?: boolean;
  attachments?: any[];
}

export interface UpdateLessonData extends Partial<CreateLessonData> {
  id: string;
  moduleId?: string; // Added for proper query invalidation
}

// Fetch lessons for a module
export const useLessons = (moduleId?: string) => {
  return useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: async () => {
      if (!moduleId) return { lessons: [] };

      const data = await apiCall(`/lesson?moduleId=${moduleId}`);

      if (Array.isArray(data)) {
        return { lessons: data };
      }
      return data;
    },
    enabled: !!moduleId,
  });
};

// Alias for useLessons to maintain compatibility
export const useModuleLessons = useLessons;

// Create lesson mutation
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: CreateLessonData) => {
      const data = await apiCall("/lesson", {
        method: "POST",
        body: JSON.stringify(lessonData),
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lessons", variables.moduleId],
      });
    },
  });
};

// Update lesson mutation
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: UpdateLessonData) => {
      const { moduleId, ...dataToSend } = lessonData;
      const data = await apiCall(`/lesson/${lessonData.id}`, {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries for the specific module
      if (variables.moduleId) {
        queryClient.invalidateQueries({
          queryKey: ["lessons", variables.moduleId],
        });
      }
      // Also invalidate general lessons queries
      queryClient.invalidateQueries({
        queryKey: ["lessons"],
      });
    },
  });
};

// Delete lesson mutation
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiCall(`/lesson/${id}`, {
        method: "DELETE",
      });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all lessons queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["lessons"] });

      // If we have moduleId from the response, invalidate specific module lessons
      if (data?.moduleId) {
        queryClient.invalidateQueries({ queryKey: ["lessons", data.moduleId] });
      }
    },
  });
};
