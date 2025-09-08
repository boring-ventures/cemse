import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobOfferService } from "@/services/job-offer.service";
import { JobOffer } from "@/types/jobs";

// Query keys
const JOB_OFFER_KEYS = {
  all: ["joboffer"] as const,
  lists: () => [...JOB_OFFER_KEYS.all, "list"] as const,
  list: (filters: string) => [...JOB_OFFER_KEYS.lists(), { filters }] as const,
  details: () => [...JOB_OFFER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...JOB_OFFER_KEYS.details(), id] as const,
};

// Get all job offers
export const useJobOffers = () => {
  return useQuery({
    queryKey: JOB_OFFER_KEYS.lists(),
    queryFn: async () => {
      console.log("💼 useJobOffers - Calling JobOfferService.getJobOffers()");
      try {
        const result = await JobOfferService.getJobOffers();
        console.log("✅ useJobOffers - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useJobOffers - Error:", error);
        throw error;
      }
    },
  });
};

// Get job offer by ID
export const useJobOffer = (id: string) => {
  return useQuery({
    queryKey: JOB_OFFER_KEYS.detail(id),
    queryFn: async () => {
      console.log(
        "💼 useJobOffer - Calling JobOfferService.getJobOffer() with id:",
        id
      );
      try {
        const result = await JobOfferService.getJobOffer(id);
        console.log("✅ useJobOffer - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useJobOffer - Error:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create job offer
export const useCreateJobOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log(
        "💼 useCreateJobOffer - Calling JobOfferService.createJobOffer() with data:",
        data
      );
      try {
        const result = await JobOfferService.createJobOffer(data);
        console.log("✅ useCreateJobOffer - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useCreateJobOffer - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("🔄 useCreateJobOffer - Invalidating queries");
      queryClient.invalidateQueries({ queryKey: JOB_OFFER_KEYS.lists() });
    },
  });
};

// Update job offer
export const useUpdateJobOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(
        "💼 useUpdateJobOffer - Calling JobOfferService.updateJobOffer() with id:",
        id,
        "data:",
        data
      );
      try {
        const result = await JobOfferService.updateJobOffer(id, data);
        console.log("✅ useUpdateJobOffer - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useUpdateJobOffer - Error:", error);
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      console.log("🔄 useUpdateJobOffer - Invalidating queries");
      queryClient.invalidateQueries({ queryKey: JOB_OFFER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: JOB_OFFER_KEYS.detail(id) });
    },
  });
};

// Delete job offer
export const useDeleteJobOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log(
        "💼 useDeleteJobOffer - Calling JobOfferService.deleteJobOffer() with id:",
        id
      );
      try {
        await JobOfferService.deleteJobOffer(id);
        console.log("✅ useDeleteJobOffer - Success");
      } catch (error) {
        console.error("❌ useDeleteJobOffer - Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("🔄 useDeleteJobOffer - Invalidating queries");
      queryClient.invalidateQueries({ queryKey: JOB_OFFER_KEYS.lists() });
    },
  });
};

// Get job offers by company using React Query
export const useJobOffersByCompanyQuery = (
  companyId: string,
  status?: string
) => {
  return useQuery({
    queryKey: [...JOB_OFFER_KEYS.lists(), "company", companyId, status],
    queryFn: async () => {
      console.log(
        "💼 useJobOffersByCompanyQuery - Calling JobOfferService.getJobOffersByCompany() with companyId:",
        companyId,
        "status:",
        status
      );
      try {
        const result = await JobOfferService.getJobOffersByCompany(
          companyId,
          status as any
        );
        console.log("✅ useJobOffersByCompanyQuery - Success:", result);
        return result;
      } catch (error) {
        console.error("❌ useJobOffersByCompanyQuery - Error:", error);
        throw error;
      }
    },
    enabled: !!companyId,
  });
};

// Hooks específicos para job offers
export function useJobOffersByCompany(companyId: string, status?: string) {
  const [data, setData] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId) return;
    JobOfferService.getJobOffersByCompany(companyId, status as any)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [companyId, status]);

  return { data, loading, error };
}

export function useJobOffersByStatus(status: string) {
  const [data, setData] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!status) return;
    JobOfferService.getJobOffers()
      .then((jobs) => jobs.filter((job) => job.status === status))
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [status]);

  return { data, loading, error };
}

export function useActiveJobOffers() {
  const [data, setData] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    JobOfferService.getActiveJobOffers()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useFeaturedJobOffers() {
  const [data, setData] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    JobOfferService.getJobOffers()
      .then((jobs) => jobs.filter((job) => job.featured))
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useJobOfferSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cachedResults, setCachedResults] = useState<{
    [key: string]: JobOffer[];
  }>({});

  const search = useCallback(
    async (filters: {
      query?: string;
      location?: string[];
      contractType?: string[];
      workModality?: string[];
      experienceLevel?: string[];
      salaryMin?: number;
      salaryMax?: number;
    }): Promise<JobOffer[]> => {
      // Create a cache key for this search
      const searchKey = JSON.stringify(filters);

      // If we have cached results for this exact search, return them immediately
      if (cachedResults[searchKey]) {
        console.log(
          "🔍 useJobOfferSearch - Returning cached results for:",
          searchKey
        );
        return cachedResults[searchKey];
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          "🔍 useJobOfferSearch - Performing client-side search with filters:",
          filters
        );
        const allJobs = await JobOfferService.getJobOffers();

        console.log("🔍 useJobOfferSearch - allJobs type:", typeof allJobs);
        console.log(
          "🔍 useJobOfferSearch - allJobs is array:",
          Array.isArray(allJobs)
        );
        console.log("🔍 useJobOfferSearch - allJobs value:", allJobs);

        // Ensure allJobs is an array
        if (!Array.isArray(allJobs)) {
          console.error(
            "🔍 useJobOfferSearch - allJobs is not an array:",
            allJobs
          );
          return [];
        }

        // Apply client-side filtering
        const result = allJobs.filter((job) => {
          // Query filter (search in title, company name, description, and skills)
          if (filters.query && filters.query.trim() !== "") {
            const query = filters.query.toLowerCase().trim();
            const searchableText = [
              job.title,
              job.description,
              ...(job.requiredSkills || []),
              ...(job.desiredSkills || []),
            ]
              .join(" ")
              .toLowerCase();

            if (!searchableText.includes(query)) {
              return false;
            }
          }

          // Location filter
          if (filters.location && filters.location.length > 0) {
            const jobLocation = job.location.toLowerCase();
            const hasMatchingLocation = filters.location.some((loc) =>
              jobLocation.includes(loc.toLowerCase().trim())
            );
            if (!hasMatchingLocation) {
              return false;
            }
          }

          // Contract type filter
          if (filters.contractType && filters.contractType.length > 0) {
            if (!filters.contractType.includes(job.contractType)) {
              return false;
            }
          }

          // Work modality filter
          if (filters.workModality && filters.workModality.length > 0) {
            if (!filters.workModality.includes(job.workModality)) {
              return false;
            }
          }

          // Experience level filter
          if (filters.experienceLevel && filters.experienceLevel.length > 0) {
            if (!filters.experienceLevel.includes(job.experienceLevel)) {
              return false;
            }
          }

          // Salary filters
          if (
            filters.salaryMin &&
            job.salaryMin &&
            job.salaryMin < filters.salaryMin
          ) {
            return false;
          }

          if (
            filters.salaryMax &&
            job.salaryMax &&
            job.salaryMax > filters.salaryMax
          ) {
            return false;
          }

          return true;
        });

        console.log(
          "🔍 useJobOfferSearch - Search successful, results:",
          result
        );

        // Cache the results
        setCachedResults((prev) => ({
          ...prev,
          [searchKey]: result,
        }));

        return result;
      } catch (e) {
        console.error("🔍 useJobOfferSearch - Search failed:", e);
        setError(e as Error);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [cachedResults]
  );

  return { search, loading, error };
}

// Hook to fetch job offers by municipality
export function useJobOffersByMunicipality(municipalityId: string) {
  const [data, setData] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!municipalityId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobs =
          await JobOfferService.getJobOffersByMunicipality(municipalityId);
        setData(jobs);
      } catch (err) {
        console.error("Error fetching jobs by municipality:", err);
        setError(err as Error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [municipalityId]);

  return { data, loading, error };
}
