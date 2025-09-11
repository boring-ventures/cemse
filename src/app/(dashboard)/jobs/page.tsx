"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Filter,
  Grid,
  List,
  SortDesc,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobSearchFilters } from "@/components/jobs/job-search-filters";
import { JobCard } from "@/components/jobs/job-card";
import { JobOffer, JobSearchFilters as JobFilters } from "@/types/jobs";
import { useJobOfferSearch } from "@/hooks/useJobOfferApi";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const { search, loading, error } = useJobOfferSearch();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({});

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    // Only set filters if there's actually a query
    if (query) {
      setFilters((prev) => ({ ...prev, query }));
    }
  }, [searchParams]);

  // Initial search effect - only run once on mount
  useEffect(() => {
    const performInitialSearch = async () => {
      try {
        console.log("🔍 JobsPage - Performing initial search");
        const results = await search({});
        console.log("🔍 JobsPage - Initial search results:", results);

        if (Array.isArray(results)) {
          setJobs(results);
          setTotalJobs(results.length);

          if (results.length > 0 && results[0].id === "1") {
            console.log("🔧 JobsPage - Using mock data (API not available)");
          }
        }
      } catch (error) {
        console.error("🔍 JobsPage - Initial search error:", error);
        setJobs([]);
        setTotalJobs(0);
      }
    };

    performInitialSearch();
  }, []); // Empty dependency array - only run once

  // Handle filter changes with debouncing
  useEffect(() => {
    // Skip if this is the initial load (no filters applied yet)
    if (Object.keys(filters).length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const performSearch = async () => {
        try {
          console.log("🔍 JobsPage - Performing search with filters:", filters);

          const searchFilters = {
            query: filters.query,
            location: filters.location,
            contractType: filters.contractType,
            workModality: filters.workModality,
            experienceLevel: filters.experienceLevel,
            salaryMin: filters.salaryMin,
            salaryMax: filters.salaryMax,
          };

          // Remove undefined values
          const cleanFilters = Object.fromEntries(
            Object.entries(searchFilters).filter(
              ([_, value]) =>
                value !== undefined &&
                (Array.isArray(value) ? value.length > 0 : true)
            )
          );

          console.log("🔍 JobsPage - Clean filters:", cleanFilters);

          const results = await search(cleanFilters);
          console.log("🔍 JobsPage - Search results:", results);

          if (Array.isArray(results)) {
            setJobs(results);
            setTotalJobs(results.length);

            // Show notification if using mock data (when API is not available)
            if (results.length > 0 && results[0].id === "1") {
              console.log("🔧 JobsPage - Using mock data (API not available)");
            }
          } else {
            setJobs([]);
            setTotalJobs(0);
          }
        } catch (error) {
          console.error("🔍 JobsPage - Search error:", error);
          setJobs([]);
          setTotalJobs(0);
        }
      };

      performSearch();
    }, 500); // Increased delay to reduce frequency

    return () => clearTimeout(timeoutId);
  }, [filters]); // Only depend on filters, not search function

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters((prev) => ({ ...prev, query: searchQuery.trim() }));
    } else {
      // If search query is empty, remove it from filters
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.query;
        return newFilters;
      });
    }
  };

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Empleos
                </h1>
                <p className="text-lg text-gray-600">
                  Encuentra oportunidades laborales que se ajusten a tu perfil
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/my-applications")}
                  className="flex items-center gap-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Mis Postulaciones</span>
                </Button>
                <div className="flex items-center border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    <List className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Lista</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Buscar por título, empresa, habilidades..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Buscar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-gray-200 hover:border-blue-500 hover:text-blue-600 px-6 h-12"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <JobSearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? "Buscando..." : `${totalJobs} empleos encontrados`}
                </h2>
                <div className="flex items-center gap-3">
                  {Object.keys(filters).length > 1 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-sm h-8 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                  {/* Mock data indicator */}
                  {jobs.length > 0 && jobs[0]?.id === "1" && (
                    <Badge
                      variant="outline"
                      className="text-sm text-orange-600 border-orange-300 bg-orange-50"
                    >
                      Datos de ejemplo
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <SortDesc className="w-4 h-4 text-gray-400" />
                <span>Más recientes primero</span>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.contractType?.length ||
              filters.workModality?.length ||
              filters.experienceLevel?.length) && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filtros activos:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.contractType?.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-800 border-blue-200"
                    >
                      {type === "FULL_TIME"
                        ? "Tiempo completo"
                        : type === "PART_TIME"
                          ? "Medio tiempo"
                          : type === "INTERNSHIP"
                            ? "Prácticas-Pasantías"
                            : type === "VOLUNTEER"
                              ? "Voluntariado"
                              : "Freelance"}
                    </Badge>
                  ))}
                  {filters.workModality?.map((modality) => (
                    <Badge
                      key={modality}
                      variant="secondary"
                      className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200"
                    >
                      {modality === "ON_SITE"
                        ? "Presencial"
                        : modality === "REMOTE"
                          ? "Remoto"
                          : "Híbrido"}
                    </Badge>
                  ))}
                  {filters.experienceLevel?.map((level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className="text-sm px-3 py-1 bg-purple-100 text-purple-800 border-purple-200"
                    >
                      {level === "NO_EXPERIENCE"
                        ? "Sin experiencia"
                        : level === "ENTRY_LEVEL"
                          ? "Principiante"
                          : level === "MID_LEVEL"
                            ? "Intermedio"
                            : "Senior"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Job Results */}
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white shadow-sm border-0">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-14" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {jobs?.map((job) => (
                  <JobCard key={job.id} job={job} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  No se encontraron empleos
                </h3>
                <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
                  Intenta ajustar tus filtros de búsqueda o buscar términos
                  diferentes para encontrar más oportunidades.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    Limpiar todos los filtros
                  </Button>
                  <Button
                    onClick={() => setSearchQuery("")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ver todos los empleos
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
