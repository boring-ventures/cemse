"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompaniesService, CreateCompanyRequest, CompaniesResponse } from '@/services/companies.service';

// Query keys
const COMPANIES_KEYS = {
  all: ['companies'] as const,
  list: () => [...COMPANIES_KEYS.all, 'list'] as const,
};

/**
 * Hook to fetch all companies
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: COMPANIES_KEYS.list(),
    queryFn: async (): Promise<CompaniesResponse> => {
      console.log("🔍 useCompanies - Fetching companies");
      try {
        const result = await CompaniesService.getAll();
        console.log("✅ useCompanies - Success:", {
          total: result.total,
          active: result.metadata.totalActive
        });
        return result;
      } catch (error) {
        console.error("❌ useCompanies - Error:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new company
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyRequest) => {
      console.log("🔍 useCreateCompany - Creating company");
      try {
        const result = await CompaniesService.create(data);
        console.log("✅ useCreateCompany - Success");
        return result;
      } catch (error) {
        console.error("❌ useCreateCompany - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEYS.list() });
      console.log("✅ useCreateCompany - Cache invalidated");
    },
  });
};

/**
 * Hook to update a company
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCompanyRequest> }) => {
      console.log("🔍 useUpdateCompany - Updating company:", id);
      try {
        const result = await CompaniesService.update(id, data);
        console.log("✅ useUpdateCompany - Success");
        return result;
      } catch (error) {
        console.error("❌ useUpdateCompany - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEYS.list() });
      console.log("✅ useUpdateCompany - Cache invalidated");
    },
  });
};

/**
 * Hook to delete a company
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("🔍 useDeleteCompany - Deleting company:", id);
      try {
        const result = await CompaniesService.delete(id);
        console.log("✅ useDeleteCompany - Success");
        return result;
      } catch (error) {
        console.error("❌ useDeleteCompany - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEYS.list() });
      console.log("✅ useDeleteCompany - Cache invalidated");
    },
  });
};
