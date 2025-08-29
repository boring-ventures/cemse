"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Building } from "lucide-react";
import { apiCall } from "@/lib/api";

interface Institution {
  id: string;
  userId: string;
  name: string;
  institutionType: string;
  customType?: string;
  serviceArea: string;
  specialization: string | string[];
  description: string;
  email: string;
  phone: string;
  address: string;
  municipality: string;
  department: string;
  region: string;
  country: string;
  website: string;
  logo?: string;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function EntrepreneurshipDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch institutions from the backend
  const fetchInstitutions = async () => {
    try {
      const data = await apiCall("/institution/public");
      // Ensure data is an array and has the expected structure
      if (Array.isArray(data)) {
        setInstitutions(data as Institution[]);
      } else {
        console.error("Invalid data format received:", data);
        setInstitutions([]);
      }
    } catch (err) {
      console.error("Error fetching institutions:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchInstitutions();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch =
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.institutionType
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesRegion =
      regionFilter === "all" ||
      !regionFilter ||
      institution.region === regionFilter;

    return matchesSearch && matchesRegion;
  });

  const regions = [
    { value: "all", label: "Todas las regiones" },
    { value: "Cochabamba", label: "Cochabamba" },
    { value: "La Paz", label: "La Paz" },
    { value: "Santa Cruz", label: "Santa Cruz" },
    { value: "Oruro", label: "Oruro" },
    { value: "Potosí", label: "Potosí" },
    { value: "Chuquisaca", label: "Chuquisaca" },
    { value: "Tarija", label: "Tarija" },
    { value: "Beni", label: "Beni" },
    { value: "Pando", label: "Pando" },
  ];

  const getInstitutionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      MUNICIPALITY: "Gobierno Municipal",
      NGO: "ONG",
      FOUNDATION: "Fundación",
      OTHER: "Otro",
      CENTRO_CAPACITACION: "Centro de Capacitación",
      TRAINING_CENTER: "Centro de Formación",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando directorio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-2">
              Error al cargar el directorio
            </p>
            <p className="text-red-500 text-sm">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Directorio de Instituciones</h1>
        <p className="text-muted-foreground">
          Explora las instituciones disponibles para apoyo y desarrollo
        </p>
      </div>

      {/* Sección (solo instituciones) */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
        <Button variant="default" size="sm" className="flex-1">
          <Building className="h-4 w-4 mr-2" />
          Instituciones ({institutions.length})
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar instituciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Removed type filter as per edit hint */}

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Región" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultados (solo instituciones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-600 font-medium mb-2">
                {searchTerm || (regionFilter && regionFilter !== "all")
                  ? "No se encontraron instituciones"
                  : "No hay instituciones disponibles"}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm || (regionFilter && regionFilter !== "all")
                  ? "Intenta con otros filtros"
                  : "Las instituciones aparecerán aquí cuando estén disponibles"}
              </p>
            </div>
          </div>
        ) : (
          filteredInstitutions.map((institution) => (
            <Card
              key={institution.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {institution.name || 'Sin nombre'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-2" />
                        <span>
                          {getInstitutionTypeLabel(institution.institutionType)} 
                          {institution.serviceArea && ` - ${institution.serviceArea}`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {institution.municipality && `${institution.municipality}, `}
                          {institution.department || 'Sin ubicación'}
                        </span>
                      </div>
                      {institution.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {institution.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-muted-foreground">
                    {institution.specialization && (
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {Array.isArray(institution.specialization) 
                          ? institution.specialization[0] 
                          : institution.specialization}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {institution.website && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(institution.website, '_blank')}
                      >
                        Sitio web
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
