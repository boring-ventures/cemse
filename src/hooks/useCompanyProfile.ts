import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./use-auth";

// Interface matching the actual database schema
export interface CompanyProfile {
  id: string;
  name: string;
  description: string | null;
  businessSector: string | null;
  companySize: "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | null;
  foundedYear: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  legalRepresentative: string | null;
  municipality: {
    id: string;
    name: string;
    department: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
}

export function useCompanyProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanyProfile = useCallback(async () => {
    if (!user) {
      setError(new Error("No user authenticated"));
      setLoading(false);
      return;
    }

    // Debug: Log user data to understand the structure
    console.log("🔍 useCompanyProfile - User data:", {
      id: user.id,
      username: user.username,
      role: user.role,
      company: user.company,
      hasCompanyId: !!user.company?.id,
    });

    // Check if user is a company (handle both backend and frontend role formats)
    const isCompany = user.role === "EMPRESAS" || user.role === "COMPANIES";

    if (!isCompany) {
      setError(new Error(`User is not a company. Role: ${user.role}`));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For company users, determine the company ID
      let companyId = user.id;

      // If user has a nested company object with ID, use that
      if (user.company?.id) {
        companyId = user.company.id;
      }

      console.log("🔍 useCompanyProfile - Company ID to fetch:", companyId);

      if (!companyId) {
        throw new Error("No company ID available");
      }

      // Check if we already have company data from authentication
      if (user.company && user.company.id === companyId) {
        console.log(
          "🔍 useCompanyProfile - Using company data from authentication context"
        );

        // Transform the company data from auth context to match our interface
        const companyProfile: CompanyProfile = {
          id: user.company.id,
          name: user.company.name || "Mi Empresa",
          description: user.company.description || null,
          businessSector: user.company.businessSector || null,
          companySize: user.company.companySize || null,
          foundedYear: user.company.foundedYear || null,
          website: user.company.website || null,
          email: user.company.email || null,
          phone: user.company.phone || null,
          address: user.company.address || null,
          taxId: user.company.taxId || null,
          legalRepresentative: user.company.legalRepresentative || null,
          municipality: user.company.municipality || null,
          isActive: user.company.isActive || true,
          createdAt: user.company.createdAt || new Date().toISOString(),
          updatedAt: user.company.updatedAt || new Date().toISOString(),
          logoUrl: user.company.logoUrl || null,
        };

        setProfile(companyProfile);
        setLoading(false);
        return;
      }

      // If we don't have company data from auth context, fetch it from API
      console.log("🔍 useCompanyProfile - Fetching company data from API");
      const response = await fetch(`/api/company/${companyId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Company profile not found");
        }
        throw new Error(
          `Failed to fetch company profile: ${response.statusText}`
        );
      }

      const result = await response.json();
      const companyData = result.company || result; // Handle both response formats

      console.log("🔍 useCompanyProfile - API response:", companyData);

      // Transform the API response to match our interface
      const companyProfile: CompanyProfile = {
        id: companyData.id,
        name: companyData.name || "Mi Empresa",
        description: companyData.description || null,
        businessSector: companyData.businessSector || null,
        companySize: companyData.companySize || null,
        foundedYear: companyData.foundedYear || null,
        website: companyData.website || null,
        email: companyData.email || null,
        phone: companyData.phone || null,
        address: companyData.address || null,
        taxId: companyData.taxId || null,
        legalRepresentative: companyData.legalRepresentative || null,
        municipality: companyData.municipality || null,
        isActive: companyData.isActive || true,
        createdAt: companyData.createdAt || new Date().toISOString(),
        updatedAt: companyData.updatedAt || new Date().toISOString(),
        logoUrl: companyData.logoUrl || null,
      };

      setProfile(companyProfile);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching company profile:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(new Error(`Error al cargar el perfil: ${errorMessage}`));
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("🔍 useCompanyProfile - Auth loading:", authLoading);
    console.log("🔍 useCompanyProfile - User:", user);
    console.log("🔍 useCompanyProfile - User role:", user?.role);

    if (authLoading) {
      console.log("🔍 useCompanyProfile - Still loading auth, waiting...");
      return;
    }

    if (!user) {
      console.log("🔍 useCompanyProfile - No user found, setting error");
      setError(new Error("No user authenticated"));
      setLoading(false);
      return;
    }

    // Check if user is a company (handle both backend and frontend role formats)
    const isCompany = user.role === "EMPRESAS" || user.role === "COMPANIES";
    console.log("🔍 useCompanyProfile - Is company?", isCompany);

    if (!isCompany) {
      console.log(
        "🔍 useCompanyProfile - User is not a company, setting error"
      );
      setError(new Error(`User is not a company. Role: ${user.role}`));
      setLoading(false);
      return;
    }

    // Call the fetch function
    fetchCompanyProfile();
  }, [user, authLoading, fetchCompanyProfile]);

  const refetch = useCallback(async () => {
    await fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  return { profile, loading, error, refetch };
}
