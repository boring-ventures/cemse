import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { Course } from '@/types/api';

export const useCourses = (municipalityId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with municipality filter if provided
      let url = '/course';
      if (municipalityId) {
        url += `?municipalityId=${municipalityId}`;
      }

      const data = await apiCall(url);
      console.log('🔍 useCourses - Fetched data:', data);

      // El backend puede devolver los cursos en diferentes formatos
      const coursesData = data.courses || data || [];
      setCourses(coursesData);

      console.log('🔍 useCourses - Set courses:', coursesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los cursos';
      setError(errorMessage);
      console.error('Error in fetchCourses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseById = async (courseId: string): Promise<Course | null> => {
    try {
      const data = await apiCall(`/course/${courseId}`);
      return data.course || data;
    } catch (err) {
      console.error('Error in getCourseById:', err);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCourses();
  }, [municipalityId]); // Add municipalityId as dependency

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCourseById
  };
};
