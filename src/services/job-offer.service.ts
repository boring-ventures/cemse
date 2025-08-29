import { apiCall, getAuthHeaders, API_BASE } from '@/lib/api';
import { JobOffer, JobStatus, ContractType, WorkModality, ExperienceLevel } from '@/types/jobs';

export interface CreateJobOfferRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  experienceLevel: ExperienceLevel;
  companyId: string;
  municipality: string;
  // Optional fields
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
  educationRequired?: string;
  skillsRequired?: string[];
  desiredSkills?: string[];
  applicationDeadline?: string;
  isActive?: boolean;
}

export interface UpdateJobOfferRequest {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  contractType?: ContractType;
  workSchedule?: string;
  workModality?: WorkModality;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  benefits?: string;
  skillsRequired?: string[];
  desiredSkills?: string[];
  applicationDeadline?: string;
  status?: JobStatus;
  isActive?: boolean;
}

export interface JobOfferResponse {
  id: string;
  title: string;
  status: JobStatus;
  applicationsCount: number;
  createdAt: string;
}

export interface JobOfferListResponse {
  id: string;
  title: string;
  status: JobStatus;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
}

export class JobOfferService {
  /**
   * Create a new job offer (Companies only)
   */
  static async createJobOffer(data: CreateJobOfferRequest): Promise<JobOfferResponse> {
    try {
      console.log('🏢 JobOfferService.createJobOffer - Creating job offer:', data);

      const response = await apiCall('/joboffer', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('✅ JobOfferService.createJobOffer - Job offer created:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.createJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Get all job offers for the company (Companies only)
   */
  static async getCompanyJobOffers(companyId: string, status?: string): Promise<JobOfferListResponse[]> {
    try {
      console.log('🏢 JobOfferService.getCompanyJobOffers - Fetching company job offers for:', companyId, 'status:', status);

      let url = `/joboffer?companyId=${companyId}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await apiCall(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.getCompanyJobOffers - Job offers fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.getCompanyJobOffers - Error:', error);
      throw error;
    }
  }

  /**
   * Get all active job offers (Youth/Students only)
   */
  static async getActiveJobOffers(): Promise<JobOffer[]> {
    try {
      console.log('👥 JobOfferService.getActiveJobOffers - Fetching active job offers');

      const response = await apiCall('/joboffer', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.getActiveJobOffers - Active job offers fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.getActiveJobOffers - Error:', error);
      throw error;
    }
  }

  /**
   * Get specific job offer by ID
   */
  static async getJobOffer(id: string): Promise<JobOffer> {
    try {
      console.log('🔍 JobOfferService.getJobOffer - Fetching job offer:', id);

      const response = await apiCall(`/joboffer/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.getJobOffer - Job offer fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.getJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Update job offer (Companies only)
   */
  static async updateJobOffer(id: string, data: UpdateJobOfferRequest): Promise<JobOffer> {
    try {
      console.log('🏢 JobOfferService.updateJobOffer - Updating job offer:', id, data);

      const response = await apiCall(`/joboffer/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('✅ JobOfferService.updateJobOffer - Job offer updated:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.updateJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Close job offer (Companies only)
   */
  static async closeJobOffer(id: string): Promise<JobOffer> {
    try {
      console.log('🏢 JobOfferService.closeJobOffer - Closing job offer:', id);

      const response = await apiCall(`/joboffer/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'CLOSED',
          isActive: false
        })
      });

      console.log('✅ JobOfferService.closeJobOffer - Job offer closed:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.closeJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Pause job offer (Companies only)
   */
  static async pauseJobOffer(id: string): Promise<JobOffer> {
    try {
      console.log('🏢 JobOfferService.pauseJobOffer - Pausing job offer:', id);

      const response = await apiCall(`/joboffer/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'PAUSED',
          isActive: false
        })
      });

      console.log('✅ JobOfferService.pauseJobOffer - Job offer paused:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.pauseJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Activate job offer (Companies only)
   */
  static async activateJobOffer(id: string): Promise<JobOffer> {
    try {
      console.log('🏢 JobOfferService.activateJobOffer - Activating job offer:', id);

      const response = await apiCall(`/joboffer/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'ACTIVE',
          isActive: true
        })
      });

      console.log('✅ JobOfferService.activateJobOffer - Job offer activated:', response);
      return response;
    } catch (error) {
      console.error('❌ JobOfferService.activateJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Get all job offers (general method)
   */
  static async getJobOffers(): Promise<JobOffer[]> {
    try {
      console.log('🔍 JobOfferService.getJobOffers - Fetching job offers');

      // Use direct fetch to Next.js API route with cookies for authentication
      const response = await fetch('/api/joboffer', {
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
      console.log('✅ JobOfferService.getJobOffers - Job offers fetched:', data);

      // Handle both backend response format and mock data format
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          // Backend returns array directly
          return data;
        } else if (data.jobOffers && Array.isArray(data.jobOffers)) {
          // Mock data format: { jobOffers: [...] }
          return data.jobOffers;
        }
      }

      // Fallback: return empty array if response is unexpected
      console.warn('⚠️ JobOfferService.getJobOffers - Unexpected response format:', data);
      return [];
    } catch (error) {
      console.error('❌ JobOfferService.getJobOffers - Error:', error);
      throw error;
    }
  }

  /**
   * Get job offers by company with optional status filter
   */
  static async getJobOffersByCompany(companyId: string, status?: JobStatus): Promise<JobOffer[]> {
    try {
      console.log('🏢 JobOfferService.getJobOffersByCompany - Fetching job offers for company:', companyId, 'status:', status);

      let url = `/joboffer?companyId=${companyId}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('🏢 JobOfferService.getJobOffersByCompany - Final URL:', url);
      console.log('🏢 JobOfferService.getJobOffersByCompany - Expected full URL:', API_BASE + url);

      const response = await apiCall(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.getJobOffersByCompany - Job offers fetched:', response);
      console.log('✅ JobOfferService.getJobOffersByCompany - Response type:', typeof response);
      console.log('✅ JobOfferService.getJobOffersByCompany - Response length:', Array.isArray(response) ? response.length : 'Not an array');

      return response;
    } catch (error) {
      console.error('❌ JobOfferService.getJobOffersByCompany - Error:', error);
      throw error;
    }
  }

  /**
   * Delete job offer (Companies only)
   */
  static async deleteJobOffer(id: string): Promise<void> {
    try {
      console.log('🏢 JobOfferService.deleteJobOffer - Deleting job offer:', id);

      await apiCall(`/joboffer/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.deleteJobOffer - Job offer deleted');
    } catch (error) {
      console.error('❌ JobOfferService.deleteJobOffer - Error:', error);
      throw error;
    }
  }
}
