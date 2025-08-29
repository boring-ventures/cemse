"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompanyApiService, CreateCompanyRequest, UpdateCompanyRequest } from '@/services/company-api.service';

// Query keys
const COMPANY_KEYS = {
  all: ['companies'] as const,
  lists: () => [...COMPANY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...COMPANY_KEYS.lists(), { filters }] as const,
  details: () => [...COMPANY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COMPANY_KEYS.details(), id] as const,
  stats: () => [...COMPANY_KEYS.all, 'stats'] as const,
  byMunicipality: (municipalityId: string) => [...COMPANY_KEYS.all, 'municipality', municipalityId] as const,
};

// Get all companies (filtered by user's municipality automatically)
export const useCompanies = (enabled: boolean = true) => {
  return useQuery({
    queryKey: COMPANY_KEYS.lists(),
    queryFn: async () => {
      console.log("🔍 useCompanies - Calling CompanyApiService.getAll()");
      try {
        const result = await CompanyApiService.getAll();
        console.log("✅ useCompanies - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCompanies - Error:", error);
        throw error;
      }
    },
    enabled,
  });
};

// Get companies by specific municipality
export const useCompaniesByMunicipality = (municipalityId: string) => {
  return useQuery({
    queryKey: COMPANY_KEYS.byMunicipality(municipalityId),
    queryFn: async () => {
      console.log("🔍 useCompaniesByMunicipality - Calling CompanyApiService.searchByMunicipality() with id:", municipalityId);
      try {
        // If municipalityId is "no-municipality", return empty array
        if (municipalityId === "no-municipality") {
          console.log("🔍 useCompaniesByMunicipality - No municipality, returning empty array");
          return [];
        }
        const result = await CompanyApiService.searchByMunicipality(municipalityId);
        console.log("✅ useCompaniesByMunicipality - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCompaniesByMunicipality - Error:", error);
        throw error;
      }
    },
    enabled: municipalityId !== "no-municipality",
  });
};

// Get company by ID
export const useCompany = (id: string) => {
  return useQuery({
    queryKey: COMPANY_KEYS.detail(id),
    queryFn: async () => {
      console.log("🔍 useCompany - Calling CompanyApiService.getById() with id:", id);
      try {
        const result = await CompanyApiService.getById(id);
        console.log("✅ useCompany - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCompany - Error:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create company
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyRequest) => {
      console.log("🔍 useCreateCompany - Calling CompanyApiService.create() with data:", data);
      try {
        const result = await CompanyApiService.create(data);
        console.log("✅ useCreateCompany - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCreateCompany - Error:", error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message === 'Authentication failed') {
            throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          } else if (error.message.includes('Insufficient permissions')) {
            throw new Error('No tienes permisos suficientes para crear empresas. Contacta al administrador.');
          } else if (error.message.includes('Required roles')) {
            throw new Error('Tu rol actual no permite crear empresas. Se requiere rol de administrador.');
          }
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all company-related queries
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.stats() });
      // Also invalidate all municipality-specific company queries
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
      console.log("✅ useCreateCompany - Cache invalidated after successful creation");
    },
  });
};

// Get company statistics
export const useCompanyStats = (municipalityId?: string) => {
  return useQuery({
    queryKey: [...COMPANY_KEYS.stats(), municipalityId],
    queryFn: async () => {
      console.log("📊 useCompanyStats - Calling CompanyApiService.getStats() with municipalityId:", municipalityId);
      try {
        // If municipalityId is "no-municipality", return empty stats
        if (municipalityId === "no-municipality") {
          console.log("📊 useCompanyStats - No municipality, returning empty stats");
          return {
            totalCompanies: 0,
            activeCompanies: 0,
            pendingCompanies: 0,
            inactiveCompanies: 0,
            totalEmployees: 0,
            totalRevenue: 0,
          };
        }
        const result = await CompanyApiService.getStats(municipalityId);
        console.log("✅ useCompanyStats - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCompanyStats - Error:", error);
        throw error;
      }
    },
    enabled: municipalityId !== "no-municipality",
  });
};

// Update company
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCompanyRequest }) => {
      console.log("🔍 useUpdateCompany - Calling CompanyApiService.update() with id:", id, "data:", data);
      try {
        const result = await CompanyApiService.update(id, data);
        console.log("✅ useUpdateCompany - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useUpdateCompany - Error:", error);
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.stats() });
    },
  });
};

// Delete company
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("🔍 useDeleteCompany - Calling CompanyApiService.delete() with id:", id);
      try {
        const result = await CompanyApiService.delete(id);
        console.log("✅ useDeleteCompany - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useDeleteCompany - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.stats() });
    },
  });
}; 