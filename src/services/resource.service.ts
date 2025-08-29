import { apiCall } from '@/lib/api';
import { Resource } from '@/types/api';

export class ResourceService {
  // Get all resources
  static async getAllResources(filters?: any) {
    try {
      console.log('🔍 ResourceService.getAllResources - Fetching resources with filters:', filters);

      const queryParams = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters?.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.municipalityId) queryParams.append('municipalityId', filters.municipalityId);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.page) queryParams.append('page', filters.page.toString());

      const url = `/resource${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiCall(url);
      
      // Handle both direct array response and structured response
      if (response && typeof response === 'object' && 'resources' in response) {
        return response.resources;
      }
      
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ ResourceService.getAllResources - Error:', error);
      throw error;
    }
  }

  // Get specific resource
  static async getResource(id: string) {
    return await apiCall(`/resource/${id}`);
  }

  // Create resource (without file)
  static async createResource(data: any) {
    // If data is FormData, send as-is; otherwise, send as JSON
    if (data instanceof FormData) {
      return await apiCall('/resource', {
        method: 'POST',
        body: data
      });
    } else {
      return await apiCall('/resource', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }

  // Upload resource with file
  static async uploadResource(formData: FormData) {
    try {
      console.log('🔍 ResourceService.uploadResource - Uploading resource with file');

      return await apiCall('/resource', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('❌ ResourceService.uploadResource - Error:', error);
      throw error;
    }
  }

  // Update resource
  static async updateResource(id: string, data: any) {
    return await apiCall(`/resource/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete resource
  static async deleteResource(id: string) {
    return await apiCall(`/resource/${id}`, {
      method: 'DELETE'
    });
  }

  // Download resource
  static async downloadResource(id: string) {
    const response = await apiCall(`/resource/${id}/download`, { method: 'POST' });
    return response;
  }

  // Rate resource
  static async rateResource(id: string, rating: number) {
    return await apiCall(`/resource/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  }
} 