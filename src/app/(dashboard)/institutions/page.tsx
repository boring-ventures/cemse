"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Building,
  Users,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Filter,
  Grid,
  List,
  AlertCircle,
  Info,
  Briefcase,
  Building2,
} from "lucide-react";
import Image from "next/image";

interface Institution {
  id: string;
  name: string;
  department: string;
  region: string;
  institutionType: string;
  customType?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  businessSector?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  municipality?: {
    id: string;
    name: string;
    department: string;
  };
  jobOffersCount?: number;
  employeesCount?: number;
  activeJobOffers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function InstitutionsDirectoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("institutions");

  // Fetch institutions from the municipalities API
  const fetchInstitutions = async () => {
    try {
      const response = await fetch("/api/municipality/public");
      if (!response.ok) {
        throw new Error("Error al cargar las instituciones");
      }
      const data = await response.json();
      // Transform municipality data to match institution interface
      const transformedData =
        data.municipalities?.map((municipality: any) => ({
          id: municipality.id,
          name: municipality.name,
          department: municipality.department,
          region: municipality.region || municipality.department,
          institutionType: municipality.institutionType || "MUNICIPALITY",
          customType: municipality.customType,
          email: municipality.email,
          phone: municipality.phone,
          address: municipality.address,
          website: municipality.website,
          isActive: municipality.isActive,
          createdAt: municipality.createdAt,
          updatedAt: municipality.updatedAt,
        })) || [];
      setInstitutions(transformedData);
    } catch (err) {
      console.error("Error fetching institutions:", err);
      throw err;
    }
  };

  // Fetch companies from the companies API
  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/company");
      if (!response.ok) {
        throw new Error("Error al cargar las empresas");
      }
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      throw err;
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchInstitutions(), fetchCompanies()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    fetchAllData();
  }, []);

  // Navigate to institution details page
  const handleViewDetails = (institutionId: string) => {
    router.push(`/institutions/${institutionId}`);
  };

  // Navigate to company details page (if it exists) or jobs page
  const handleViewCompanyDetails = (companyId: string) => {
    // For now, navigate to jobs page filtered by company
    router.push(`/jobs?company=${companyId}`);
  };

  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.department
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      institution.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.institutionType
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.businessSector
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      company.municipality?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      company.municipality?.department
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/institutions/directory-banner.jpg"
              alt="Directorio de Organizaciones"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70 flex items-center">
              <div className="px-6 sm:px-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Directorio de Organizaciones
                </h1>
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                  Explora las instituciones y empresas que forman parte de
                  nuestra red de emprendimiento y desarrollo profesional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar organizaciones por nombre, departamento, región, sector o tipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cargando organizaciones
              </h3>
              <p className="text-gray-600">
                Estamos obteniendo la información más actualizada...
              </p>
            </div>

            {/* Loading Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Error al cargar las organizaciones
            </h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              {error}
            </p>
            <Button
              onClick={fetchAllData}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Info className="w-5 h-5 mr-2" />
              Intentar nuevamente
            </Button>
          </div>
        )}

        {/* Organizations Content with Tabs */}
        {!loading && !error && (
          <div className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-white shadow-sm border-0 p-1">
                <TabsTrigger
                  value="institutions"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Building className="w-4 h-4" />
                  Instituciones
                  {filteredInstitutions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {filteredInstitutions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Briefcase className="w-4 h-4" />
                  Empresas
                  {filteredCompanies.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {filteredCompanies.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="institutions" className="space-y-6">
                {/* Institutions Results Header */}
                {filteredInstitutions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Instituciones encontradas
                      </h2>
                      <p className="text-gray-600">
                        {filteredInstitutions.length}{" "}
                        {filteredInstitutions.length === 1
                          ? "institución"
                          : "instituciones"}{" "}
                        disponible{filteredInstitutions.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInstitutions.length === 0 ? (
                    <div className="col-span-full">
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 rounded-full p-6 mb-6">
                          <Building className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                          {searchQuery
                            ? "No se encontraron instituciones"
                            : "No hay instituciones disponibles"}
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda o ajusta los filtros para encontrar más resultados."
                            : "Las instituciones aparecerán aquí cuando estén disponibles en el sistema."}
                        </p>
                        {searchQuery && (
                          <Button
                            onClick={() => setSearchQuery("")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Limpiar búsqueda
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    filteredInstitutions.map((institution) => (
                      <Card
                        key={institution.id}
                        className="bg-white shadow-sm border-0 hover:shadow-lg transition-all duration-200 group"
                      >
                        <CardHeader className="pb-4 p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                              <Building className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {institution.name}
                              </CardTitle>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {institution.department ||
                                      "Sin departamento"}
                                    , {institution.region || "Sin región"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm">
                                {institution.institutionType === "MUNICIPALITY"
                                  ? "Municipio"
                                  : institution.institutionType === "NGO"
                                    ? "ONG"
                                    : institution.institutionType ===
                                        "FOUNDATION"
                                      ? "Fundación"
                                      : institution.customType || "Institución"}
                              </Badge>
                              {institution.customType && (
                                <Badge
                                  variant="outline"
                                  className="px-3 py-1 text-sm border-gray-200 text-gray-700"
                                >
                                  {institution.customType}
                                </Badge>
                              )}
                            </div>

                            <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                                onClick={() =>
                                  handleViewDetails(institution.id)
                                }
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver detalles
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="companies" className="space-y-6">
                {/* Companies Results Header */}
                {filteredCompanies.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Empresas encontradas
                      </h2>
                      <p className="text-gray-600">
                        {filteredCompanies.length}{" "}
                        {filteredCompanies.length === 1
                          ? "empresa"
                          : "empresas"}{" "}
                        disponible{filteredCompanies.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.length === 0 ? (
                    <div className="col-span-full">
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 rounded-full p-6 mb-6">
                          <Briefcase className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                          {searchQuery
                            ? "No se encontraron empresas"
                            : "No hay empresas disponibles"}
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
                          {searchQuery
                            ? "Intenta con otros términos de búsqueda o ajusta los filtros para encontrar más resultados."
                            : "Las empresas aparecerán aquí cuando estén disponibles en el sistema."}
                        </p>
                        {searchQuery && (
                          <Button
                            onClick={() => setSearchQuery("")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Limpiar búsqueda
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <Card
                        key={company.id}
                        className="bg-white shadow-sm border-0 hover:shadow-lg transition-all duration-200 group"
                      >
                        <CardHeader className="pb-4 p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors duration-200">
                              <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {company.name}
                              </CardTitle>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {company.municipality?.name ||
                                      "Sin ubicación"}
                                    ,{" "}
                                    {company.municipality?.department ||
                                      "Sin departamento"}
                                  </span>
                                </div>
                                {company.businessSector && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">
                                      {company.businessSector}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {company.businessSector && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm">
                                  {company.businessSector}
                                </Badge>
                              )}
                              {company.companySize && (
                                <Badge
                                  variant="outline"
                                  className="px-3 py-1 text-sm border-gray-200 text-gray-700"
                                >
                                  {company.companySize}
                                </Badge>
                              )}
                            </div>

                            {company.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {company.description}
                              </p>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {company.jobOffersCount !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    <span>
                                      {company.jobOffersCount} empleos
                                    </span>
                                  </div>
                                )}
                                {company.employeesCount !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>
                                      {company.employeesCount} empleados
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:border-green-500 hover:text-green-600"
                                onClick={() =>
                                  handleViewCompanyDetails(company.id)
                                }
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver empleos
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
