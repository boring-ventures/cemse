import { apiCall } from '@/lib/api';

export interface Company {
  id: string;
  name: string;
  description: string | null;
  businessSector: string | null;
  companySize: string | null;
  foundedYear: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  // Company credentials (matching Prisma schema)
  username?: string;
  password?: string; // This will be the original password in responses for credentials display
  loginEmail?: string;
  municipality: {
    id: string;
    name: string;
    department: string;
  };
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  businessSector?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  email: string; // Make email required
  phone?: string;
  address?: string;
  municipalityId: string;
  username: string; // Make username required
  password: string; // Make password required
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  businessSector?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipalityId?: string;
  isActive?: boolean;
}

export class CompanyApiService {
  /**
   * Get all companies (admin endpoint - requires SUPERADMIN role)
   */
  static async getAll(): Promise<Company[]> {
    console.log("📞 CompanyApiService.getAll() - Calling apiCall('/admin/companies')");

    try {
      const result = await apiCall('/admin/companies') as Record<string, unknown>;
      console.log("✅ CompanyApiService.getAll() - Success:", result);

      // Handle different response formats
      if (result.companies) {
        return result.companies as Company[];
      } else if (Array.isArray(result)) {
        return result as Company[];
      } else {
        console.warn("⚠️ CompanyApiService.getAll() - Unexpected response format:", result);
        return [];
      }
    } catch (error) {
      console.error("❌ CompanyApiService.getAll() - Error:", error);
      throw error;
    }
  }

  /**
   * Get company by ID
   */
  static async getById(id: string): Promise<Company> {
    console.log("📞 CompanyApiService.getById() - Calling apiCall(`/company/${id}`)");
    try {
      const result = await apiCall(`/company/${id}`) as Company;
      console.log("✅ CompanyApiService.getById() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CompanyApiService.getById() - Error:", error);
      throw error;
    }
  }

  /**
   * Create new company
   */
  static async create(data: CreateCompanyRequest): Promise<Company> {
    console.log("📞 CompanyApiService.create() - Calling apiCall('/company') with data:", {
      ...data,
      password: data.password ? '[REDACTED]' : 'undefined' // Don't log passwords
    });

    // Validate required fields on frontend
    if (!data.name || data.name.trim() === '') {
      throw new Error("Company name is required");
    }
    
    if (!data.email || data.email.trim() === '') {
      throw new Error("Company email is required");
    }
    
    if (!data.municipalityId || data.municipalityId.trim() === '') {
      throw new Error("Municipality ID is required");
    }
    
    if (!data.username || data.username.trim() === '') {
      throw new Error("Username is required");
    }
    
    if (!data.password || data.password.trim() === '') {
      throw new Error("Password is required");
    }

    try {
      const result = await apiCall('/company', {
        method: 'POST',
        body: JSON.stringify(data)
      }) as Company;
      console.log("✅ CompanyApiService.create() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CompanyApiService.create() - Error:", error);
      throw error;
    }
  }

  /**
   * Update company
   */
  static async update(id: string, data: UpdateCompanyRequest): Promise<Company> {
    console.log("📞 CompanyApiService.update() - Calling apiCall(`/company/${id}`) with data:", data);
    try {
      const result = await apiCall(`/company/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }) as Company;
      console.log("✅ CompanyApiService.update() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CompanyApiService.update() - Error:", error);
      throw error;
    }
  }

  /**
   * Delete company with cascade deletion
   */
  static async delete(id: string): Promise<{
    message: string;
    deletedData: {
      company: string;
      municipality: string;
      jobOffers: number;
      jobApplications: number;
      jobQuestions: number;
      disconnectedProfiles: number;
      youthApplicationInterests: number;
    };
    requiresSessionRefresh?: boolean;
  }> {
    console.log("📞 CompanyApiService.delete() - Calling apiCall(`/company/${id}`)");
    try {
      const result = await apiCall(`/company/${id}`, {
        method: 'DELETE'
      }) as {
        message: string;
        deletedData: {
          company: string;
          municipality: string;
          jobOffers: number;
          jobApplications: number;
          jobQuestions: number;
          disconnectedProfiles: number;
          youthApplicationInterests: number;
        };
      };
      console.log("✅ CompanyApiService.delete() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ CompanyApiService.delete() - Error:", error);
      throw error;
    }
  }

  /**
   * Get company statistics
   */
  static async getStats(municipalityId?: string): Promise<{
    totalCompanies: number;
    activeCompanies: number;
    pendingCompanies: number;
    inactiveCompanies: number;
    totalEmployees: number;
    totalRevenue: number;
  }> {
    // Build URL with municipality filter if provided
    let url = '/company/stats';
    if (municipalityId) {
      url += `?municipalityId=${municipalityId}`;
    }

    console.log("📊 CompanyApiService.getStats() - Calling apiCall('" + url + "') with municipalityId:", municipalityId);
    try {
      const result = await apiCall(url) as Record<string, unknown>;
      console.log("✅ CompanyApiService.getStats() - Success:", result);

      // Handle response format - return the stats directly or extract from wrapper
      if (result.data) {
        return result.data as {
          totalCompanies: number;
          activeCompanies: number;
          pendingCompanies: number;
          inactiveCompanies: number;
          totalEmployees: number;
          totalRevenue: number;
        };
      } else {
        return result as {
          totalCompanies: number;
          activeCompanies: number;
          pendingCompanies: number;
          inactiveCompanies: number;
          totalEmployees: number;
          totalRevenue: number;
        };
      }
    } catch (error) {
      console.error("❌ CompanyApiService.getStats() - Error:", error);
      throw error;
    }
  }

  /**
   * Search companies by municipality
   * Uses the company search endpoint with municipalityId parameter
   */
  static async searchByMunicipality(municipalityId: string): Promise<Company[]> {
    console.log("🔍 CompanyApiService.searchByMunicipality() - Calling apiCall(`/company/search?municipalityId=${municipalityId}`)");
    try {
      const result = await apiCall(`/company/search?municipalityId=${municipalityId}`) as Record<string, unknown>;
      console.log("✅ CompanyApiService.searchByMunicipality() - Success:", result);

      // The company search endpoint returns companies array
      if (result.companies) {
        return result.companies as Company[];
      } else if (Array.isArray(result)) {
        return result as Company[];
      } else {
        console.warn("⚠️ CompanyApiService.searchByMunicipality() - No companies found in response:", result);
        return [];
      }
    } catch (error) {
      console.error("❌ CompanyApiService.searchByMunicipality() - Error:", error);
      throw error;
    }
  }
} 