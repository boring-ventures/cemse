import { apiCall } from '@/lib/api';

// Type definitions based on the actual Prisma schema
export interface Company {
  id: string;
  name: string;
  description: string | null;
  businessSector: string | null;
  companySize: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | null;
  foundedYear: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  // Login credentials
  username: string;
  loginEmail: string;
  // Relations
  municipality: {
    id: string;
    name: string;
    department: string;
  };
  creator: {
    id: string;
    username: string;
    role: string;
  };
  // Computed fields
  jobOffersCount: number;
  employeesCount: number;
  activeJobOffers: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  businessSector?: string;
  companySize?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
  foundedYear?: number;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  municipalityId: string;
  username: string;
  password: string;
  isActive?: boolean;
}

export interface CompaniesResponse {
  companies: Company[];
  total: number;
  metadata: {
    totalActive: number;
    totalInactive: number;
    totalJobOffers: number;
    totalEmployees: number;
  };
}

export class CompaniesService {
  /**
   * Fetch all companies
   */
  static async getAll(): Promise<CompaniesResponse> {
    console.log("📞 CompaniesService.getAll() - Fetching companies");
    
    try {
      const response = await apiCall('/companies') as CompaniesResponse;
      console.log("✅ CompaniesService.getAll() - Success:", {
        total: response.total,
        active: response.metadata.totalActive,
        inactive: response.metadata.totalInactive
      });
      
      return response;
    } catch (error) {
      console.error("❌ CompaniesService.getAll() - Error:", error);
      throw error;
    }
  }

  /**
   * Create a new company
   */
  static async create(data: CreateCompanyRequest): Promise<{ company: Company }> {
    console.log("📞 CompaniesService.create() - Creating company:", {
      name: data.name,
      email: data.email,
      municipalityId: data.municipalityId,
      username: data.username
    });

    try {
      const response = await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(data)
      }) as { company: Company };
      
      console.log("✅ CompaniesService.create() - Success:", response.company.name);
      return response;
    } catch (error) {
      console.error("❌ CompaniesService.create() - Error:", error);
      throw error;
    }
  }

  /**
   * Update a company
   */
  static async update(id: string, data: Partial<CreateCompanyRequest>): Promise<{ company: Company }> {
    console.log("📞 CompaniesService.update() - Updating company:", id);

    try {
      const response = await apiCall(`/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }) as { company: Company };
      
      console.log("✅ CompaniesService.update() - Success");
      return response;
    } catch (error) {
      console.error("❌ CompaniesService.update() - Error:", error);
      throw error;
    }
  }

  /**
   * Delete a company
   */
  static async delete(id: string): Promise<{ message: string; deletedData: any }> {
    console.log("📞 CompaniesService.delete() - Deleting company:", id);

    try {
      const response = await apiCall(`/companies/${id}`, {
        method: 'DELETE'
      }) as { message: string; deletedData: any };
      
      console.log("✅ CompaniesService.delete() - Success");
      return response;
    } catch (error) {
      console.error("❌ CompaniesService.delete() - Error:", error);
      throw error;
    }
  }
}
