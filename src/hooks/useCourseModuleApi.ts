import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  prerequisites: string[];
  hasCertificate: boolean;
  certificateTemplate?: string;
  lessons: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModuleData {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration: number;
  prerequisites?: string[];
  hasCertificate?: boolean;
  certificateTemplate?: string;
}

export interface UpdateModuleData {
  id: string;
  title?: string;
  description?: string;
  orderIndex?: number;
  estimatedDuration?: number;
  isLocked?: boolean;
  prerequisites?: string[];
  hasCertificate?: boolean;
  certificateTemplate?: string;
}

// Fetch modules for a course
export const useCourseModules = (courseId?: string) => {
  return useQuery({
    queryKey: ['courseModules', courseId],
    queryFn: async () => {
      if (!courseId) return { modules: [] };
      
      const params = new URLSearchParams({ courseId });
      const data = await apiCall(`/coursemodule?${params}`);
      
      // Si la respuesta es un array directo, lo envuelvo en el formato esperado
      if (Array.isArray(data)) {
        return { modules: data };
      }
      return data;
    },
    enabled: !!courseId,
  });
};

// Fetch a single module
export const useCourseModule = (moduleId?: string) => {
  return useQuery({
    queryKey: ['courseModule', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      
      const params = new URLSearchParams({ id: moduleId });
      const data = await apiCall(`/coursemodule?${params}`);
      return data.module;
    },
    enabled: !!moduleId,
  });
};

// Create module mutation
export const useCreateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (moduleData: CreateModuleData) => {
      const data = await apiCall('/coursemodule', {
        method: 'POST',
        body: JSON.stringify(moduleData),
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch modules for the course
      queryClient.invalidateQueries({
        queryKey: ['courseModules', variables.courseId],
      });
    },
  });
};

// Update module mutation
export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (moduleData: UpdateModuleData) => {
      const data = await apiCall('/coursemodule', {
        method: 'PUT',
        body: JSON.stringify(moduleData),
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch modules for the course
      queryClient.invalidateQueries({
        queryKey: ['courseModules'],
      });
      queryClient.invalidateQueries({
        queryKey: ['courseModule', variables.id],
      });
    },
  });
};

// Delete module mutation
export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const params = new URLSearchParams({ id: moduleId });
      const data = await apiCall(`/coursemodule?${params}`, {
        method: 'DELETE',
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch all modules
      queryClient.invalidateQueries({
        queryKey: ['courseModules'],
      });
    },
  });
}; 