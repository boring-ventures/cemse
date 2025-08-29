import { apiCall, getAuthHeaders } from '@/lib/api';
import { ApplicationStatus } from '@/types/jobs';

export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  coverLetter?: string;
  rating?: number;
  notes?: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobOffer: {
    id: string;
    title: string;
    company?: {
      name: string;
      email: string;
    };
  };
  cvData?: {
    education?: string;
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };
  questionAnswers?: JobQuestionAnswer[];
}

export interface JobQuestionAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface CreateJobApplicationRequest {
  jobOfferId: string;
  studentId: string;
  coverLetter?: string;
  cvData?: {
    education?: string;
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };
  profileImage?: string;
}

export interface UpdateJobApplicationRequest {
  status?: ApplicationStatus;
  notes?: string;
  rating?: number;
  coverLetter?: string;
  cvData?: {
    education?: string;
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };
}

export interface JobApplicationResponse {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobOffer: {
    id: string;
    title: string;
  };
}

export class JobApplicationService {
  /**
   * Create a job application (Youth/Students only)
   */
  static async createJobApplication(data: CreateJobApplicationRequest): Promise<JobApplicationResponse> {
    try {
      console.log('👥 JobApplicationService.createJobApplication - Creating application:', data);
      
      const response = await apiCall('/jobapplication', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('✅ JobApplicationService.createJobApplication - Application created:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.createJobApplication - Error:', error);
      throw error;
    }
  }

  /**
   * Get all applications for the company (Companies only)
   */
  static async getCompanyApplications(): Promise<JobApplication[]> {
    try {
      console.log('🏢 JobApplicationService.getCompanyApplications - Fetching company applications');
      
      const response = await apiCall('/jobapplication', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.getCompanyApplications - Applications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.getCompanyApplications - Error:', error);
      throw error;
    }
  }

  /**
   * Get job applications with filters (Companies only)
   */
  static async getJobApplications(queryParams: string): Promise<JobApplication[]> {
    try {
      console.log('🏢 JobApplicationService.getJobApplications - Fetching applications with params:', queryParams);
      
      // Parse query params to check if we have a jobOfferId
      const params = new URLSearchParams(queryParams);
      const jobOfferId = params.get('jobOfferId');
      
      let endpoint = '/jobapplication';
      
      // If we have a jobOfferId, use the specific endpoint
      if (jobOfferId) {
        endpoint = `/jobapplication/by-job-offer?jobOfferId=${jobOfferId}`;
        // Remove jobOfferId from params since it's now in the URL
        params.delete('jobOfferId');
        // Add remaining params if any
        if (params.toString()) {
          endpoint += `&${params.toString()}`;
        }
      } else {
        // Use the general endpoint with all params
        endpoint = `/jobapplication?${queryParams}`;
      }
      
      const response = await apiCall(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.getJobApplications - Applications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.getJobApplications - Error:', error);
      throw error;
    }
  }

  /**
   * Get user's applications (Youth/Students only)
   */
  static async getUserApplications(): Promise<JobApplication[]> {
    try {
      console.log('👥 JobApplicationService.getUserApplications - Fetching user applications');
      
      const response = await apiCall('/jobapplication', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.getUserApplications - Applications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.getUserApplications - Error:', error);
      throw error;
    }
  }

  /**
   * Get specific application by ID
   */
  static async getJobApplication(id: string): Promise<JobApplication> {
    try {
      console.log('🔍 JobApplicationService.getJobApplication - Fetching application:', id);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.getJobApplication - Application fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.getJobApplication - Error:', error);
      throw error;
    }
  }

  /**
   * Update application status (Companies only)
   */
  static async updateApplicationStatus(id: string, data: UpdateJobApplicationRequest): Promise<JobApplication> {
    try {
      console.log('🏢 JobApplicationService.updateApplicationStatus - Updating application:', id, data);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('✅ JobApplicationService.updateApplicationStatus - Application updated:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.updateApplicationStatus - Error:', error);
      throw error;
    }
  }

  /**
   * Update user's application (Youth/Students only)
   */
  static async updateUserApplication(id: string, data: UpdateJobApplicationRequest): Promise<JobApplication> {
    try {
      console.log('👥 JobApplicationService.updateUserApplication - Updating user application:', id, data);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('✅ JobApplicationService.updateUserApplication - Application updated:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.updateUserApplication - Error:', error);
      throw error;
    }
  }

  /**
   * Hire a candidate (Companies only)
   */
  static async hireCandidate(id: string, notes?: string, rating?: number): Promise<JobApplication> {
    try {
      console.log('🏢 JobApplicationService.hireCandidate - Hiring candidate:', id);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'HIRED',
          notes,
          rating
        })
      });

      console.log('✅ JobApplicationService.hireCandidate - Candidate hired:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.hireCandidate - Error:', error);
      throw error;
    }
  }

  /**
   * Reject a candidate (Companies only)
   */
  static async rejectCandidate(id: string, notes?: string, rating?: number): Promise<JobApplication> {
    try {
      console.log('🏢 JobApplicationService.rejectCandidate - Rejecting candidate:', id);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'REJECTED',
          notes,
          rating
        })
      });

      console.log('✅ JobApplicationService.rejectCandidate - Candidate rejected:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.rejectCandidate - Error:', error);
      throw error;
    }
  }

  /**
   * Preselect a candidate (Companies only)
   */
  static async preselectCandidate(id: string, notes?: string, rating?: number): Promise<JobApplication> {
    try {
      console.log('🏢 JobApplicationService.preselectCandidate - Preselecting candidate:', id);
      
      const response = await apiCall(`/jobapplication/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'PRE_SELECTED',
          notes,
          rating
        })
      });

      console.log('✅ JobApplicationService.preselectCandidate - Candidate preselected:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.preselectCandidate - Error:', error);
      throw error;
    }
  }

  /**
   * Get applications for a specific job offer (Companies only)
   */
  static async getApplicationsByJobOffer(jobOfferId: string, statusFilter?: ApplicationStatus): Promise<JobApplication[]> {
    try {
      console.log('🏢 JobApplicationService.getApplicationsByJobOffer - Fetching applications for job offer:', jobOfferId);
      
      let endpoint = `/jobapplication?jobOfferId=${jobOfferId}`;
      if (statusFilter && statusFilter !== 'all') {
        endpoint += `&status=${statusFilter}`;
      }
      
      const response = await apiCall(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.getApplicationsByJobOffer - Applications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ JobApplicationService.getApplicationsByJobOffer - Error:', error);
      throw error;
    }
  }

  /**
   * Check if user has already applied to a specific job offer
   */
  static async checkIfApplied(jobOfferId: string): Promise<{ hasApplied: boolean; application?: any }> {
    try {
      console.log('🔍 JobApplicationService.checkIfApplied - Checking application for job offer:', jobOfferId);
      
      // Use direct fetch to Next.js API route with cookies for authentication
      const response = await fetch(`/api/jobapplication/check-application/${jobOfferId}`, {
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
      console.log('✅ JobApplicationService.checkIfApplied - Response:', data);
      return data;
    } catch (error) {
      console.error('❌ JobApplicationService.checkIfApplied - Error:', error);
      throw error;
    }
  }

  /**
   * Delete/Cancel a job application (only for the applicant or super admin)
   */
  static async deleteApplication(applicationId: string): Promise<void> {
    try {
      console.log('🗑️ JobApplicationService.deleteApplication - Deleting application:', applicationId);
      
      await apiCall(`/jobapplication/${applicationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('✅ JobApplicationService.deleteApplication - Application deleted successfully');
    } catch (error) {
      console.error('❌ JobApplicationService.deleteApplication - Error:', error);
      throw error;
    }
  }
}
