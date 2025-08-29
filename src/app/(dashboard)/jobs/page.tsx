"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Building, Clock, DollarSign, Filter, Grid, List, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobSearchFilters } from "@/components/jobs/job-search-filters";
import { JobCard } from "@/components/jobs/job-card";
import { JobOffer, JobSearchFilters as JobFilters } from "@/types/jobs";
import { useJobOfferSearch } from "@/hooks/useJobOfferApi";

export default function JobsPage() {
  const { search, loading, error } = useJobOfferSearch();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({});

  const searchParams = useSearchParams();

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
            Object.entries(searchFilters).filter(([_, value]) => 
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Buscar Empleos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Encuentra oportunidades laborales que se ajusten a tu perfil
                </p>
              </div>
              <div className="flex items-center space-x-2 justify-center sm:justify-end">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="ml-1 sm:hidden">Grid</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="ml-1 sm:hidden">Lista</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 sm:w-4 h-3 sm:h-4" />
                <Input
                  placeholder="Buscar por título, empresa, habilidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 pr-4 py-2 text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 sm:flex-none text-sm">
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-none items-center justify-center text-sm"
                >
                  <Filter className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="ml-1 sm:ml-2">Filtros</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {loading ? "Buscando..." : `${totalJobs} empleos encontrados`}
                </h2>
                <div className="flex items-center gap-2">
                  {Object.keys(filters).length > 1 && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-xs sm:text-sm h-8"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                  {/* Mock data indicator */}
                  {jobs.length > 0 && jobs[0]?.id === "1" && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                      Datos de ejemplo
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <SortDesc className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                <span className="text-gray-600">
                  Más recientes primero
                </span>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.contractType?.length ||
              filters.workModality?.length ||
              filters.experienceLevel?.length) && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                {filters.contractType?.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
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
                  <Badge key={modality} variant="secondary" className="text-xs">
                    {modality === "ON_SITE"
                      ? "Presencial"
                      : modality === "REMOTE"
                        ? "Remoto"
                        : "Híbrido"}
                  </Badge>
                ))}
                {filters.experienceLevel?.map((level) => (
                  <Badge key={level} variant="secondary" className="text-xs">
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
            )}

            {/* Job Results */}
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                    : "space-y-3 sm:space-y-4"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2 sm:pb-6">
                      <Skeleton className="h-5 sm:h-6 w-3/4" />
                      <Skeleton className="h-3 sm:h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 sm:h-20 w-full mb-3 sm:mb-4" />
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                        <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                        <Skeleton className="h-5 sm:h-6 w-10 sm:w-14" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                    : "space-y-3 sm:space-y-4"
                }
              >
                {jobs?.map((job) => (
                  <JobCard key={job.id} job={job} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                  <Search className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron empleos
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Intenta ajustar tus filtros de búsqueda o buscar términos
                    diferentes.
                  </p>
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Limpiar todos los filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
