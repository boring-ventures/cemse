"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Institution {
  id: string;
  name: string;
  department: string;
  region: string;
  institutionType: string;
  customType?: string;
}

export default function InstitutionsDirectoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  // Fetch institutions from the backend
  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/institution/public");
      if (!response.ok) {
        throw new Error("Error al cargar las instituciones");
      }
      const data = await response.json();
      setInstitutions(data);
    } catch (err) {
      console.error("Error fetching institutions:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Load institutions on component mount
  React.useEffect(() => {
    fetchInstitutions();
  }, []);

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

  const handleViewDetails = (institution: Institution) => {
    console.log("🔍 handleViewDetails called with:", institution);
    setSelectedInstitution(institution);
  };

  const handleCloseModal = () => {
    setSelectedInstitution(null);
  };

  const getInstitutionTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      GOBIERNOS_MUNICIPALES: "Gobierno Municipal",
      CENTROS_DE_FORMACION: "Centro de Formación",
      ONGS_Y_FUNDACIONES: "ONG y Fundación",
      EMPRESAS_PRIVADAS: "Empresa Privada",
      INSTITUCIONES_EDUCATIVAS: "Institución Educativa",
      ORGANISMOS_GUBERNAMENTALES: "Organismo Gubernamental",
    };
    return typeLabels[type] || type;
  };

  console.log(
    "🔍 Component render - selectedInstitution:",
    selectedInstitution
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
        <Image
          src="/images/institutions/directory-banner.jpg"
          alt="Directorio de Instituciones"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-900/40 flex items-center">
          <div className="px-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Directorio de Instituciones
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Explora las instituciones que forman parte de nuestra red de
              emprendimiento y desarrollo profesional
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Buscar instituciones por nombre, departamento, región o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 text-lg"
          />
        </div>
        {/* Test Button */}
        <div className="text-center mt-4">
          <Button
            onClick={() => {
              console.log("🔍 Test button clicked");
              setSelectedInstitution({
                id: "test",
                name: "Test Institution",
                department: "Test Dept",
                region: "Test Region",
                institutionType: "TEST",
              });
            }}
            variant="outline"
          >
            Test Modal
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando instituciones...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-2">
              Error al cargar las instituciones
            </p>
            <p className="text-red-500 text-sm">{error}</p>
            <Button
              onClick={fetchInstitutions}
              variant="outline"
              className="mt-4"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      )}

      {/* Institutions Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-gray-600 font-medium mb-2">
                  {searchQuery
                    ? "No se encontraron instituciones"
                    : "No hay instituciones disponibles"}
                </p>
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
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
                        {institution.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {institution.department || "Sin departamento"},{" "}
                            {institution.region || "Sin región"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {getInstitutionTypeLabel(
                              institution.institutionType
                            )}
                          </span>
                          {institution.customType && (
                            <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              {institution.customType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-muted-foreground">
                      ID: {institution.id}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(institution)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Institution Details Modal */}
      <Dialog open={!!selectedInstitution} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Institución</DialogTitle>
          </DialogHeader>

          {selectedInstitution && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedInstitution.name}
                </h2>
                <p className="text-muted-foreground">
                  {selectedInstitution.department}, {selectedInstitution.region}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Tipo de Institución
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getInstitutionTypeLabel(selectedInstitution.institutionType)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    router.push(`/institutions/${selectedInstitution.id}`);
                    handleCloseModal();
                  }}
                >
                  Ver Perfil Completo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
