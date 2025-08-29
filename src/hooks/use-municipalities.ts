"use client";

import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';

export interface Municipality {
  id: string;
  name: string;
  department: string;
  region?: string;
  population?: number;
  isActive: boolean;
}

/**
 * Hook to fetch all municipalities
 */
export const useMunicipalities = () => {
  return useQuery({
    queryKey: ['municipalities'],
    queryFn: async (): Promise<Municipality[]> => {
      console.log("🏛️ useMunicipalities - Fetching municipalities");
      try {
        const response = await apiCall('/municipalities') as { municipalities: Municipality[] } | Municipality[];
        
        // Handle different response formats
        const municipalities = Array.isArray(response) ? response : response.municipalities;
        
        console.log(`✅ useMunicipalities - Success: ${municipalities?.length || 0} municipalities`);
        return municipalities || [];
      } catch (error) {
        console.error("❌ useMunicipalities - Error:", error);
        // Return empty array on error to prevent UI crashes
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
