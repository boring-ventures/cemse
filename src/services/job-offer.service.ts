import { apiCall, getAuthHeaders, getToken } from '@/lib/api';
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
   * Get all job offers (general method)
   */
  static async getJobOffers(): Promise<JobOffer[]> {
    try {
      console.log('🔍 JobOfferService.getJobOffers - Fetching job offers');
      
      const response = await apiCall('/joboffer', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobOfferService.getJobOffers - Job offers fetched:', response);
      
      // Handle both backend response format and mock data format
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          // Backend returns array directly
          return response;
        } else if (response.jobOffers && Array.isArray(response.jobOffers)) {
          // Mock data format: { jobOffers: [...] }
          return response.jobOffers;
        }
      }
      
      // Fallback: return empty array if response is unexpected
      console.warn('⚠️ JobOfferService.getJobOffers - Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('❌ JobOfferService.getJobOffers - Error:', error);
      throw error;
    }
  }
}