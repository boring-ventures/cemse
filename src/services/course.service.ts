import { apiCall } from '@/lib/api';
import { Course } from '@/types/api';

export class CourseService {
  static async getAll(): Promise<Course[]> {
    console.log("📚 CourseService.getAll() - Calling apiCall('/course')");
    try {
      const result = await apiCall('/course');
      console.log("✅ CourseService.getAll() - Success:", result);
      // Extract courses array from the response object
      return result.courses || result || [];
    } catch (error) {
      console.error("❌ CourseService.getAll() - Error:", error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Course> {
    console.log("📚 CourseService.getById() - Calling apiCall(`/course/${id}`)");
    try {
      const result = await apiCall(`/course/${id}`);
      console.log("✅ CourseService.getById() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CourseService.getById() - Error:", error);
      throw error;
    }
  }

  static async create(data: Partial<Course>): Promise<Course> {
    console.log("📚 CourseService.create() - Calling apiCall('/course') with data:", data);
    try {
      const result = await apiCall('/course', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      console.log("✅ CourseService.create() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CourseService.create() - Error:", error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<Course>): Promise<Course> {
    console.log("📚 CourseService.update() - Calling apiCall(`/course/${id}`) with data:", data);
    try {
      const result = await apiCall(`/course/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      console.log("✅ CourseService.update() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CourseService.update() - Error:", error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    console.log("📚 CourseService.delete() - Calling apiCall(`/course/${id}`)");
    try {
      await apiCall(`/course/${id}`, { method: 'DELETE' });
      console.log("✅ CourseService.delete() - Success");
    } catch (error) {
      console.error("❌ CourseService.delete() - Error:", error);
      throw error;
    }
  }
} 