"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Building,
  Info,
  Users,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  Briefcase,
  Search,
} from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { useJobOffersByMunicipality } from "@/hooks/useJobOfferApi";

interface InstitutionPost {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

interface Institution {
  id: string;
  name: string;
  department: string;
  region: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  institutionType: string;
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function InstitutionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  // Fetch job offers for this institution
  const {
    data: jobOffers,
    loading: jobsLoading,
    error: jobsError,
  } = useJobOffersByMunicipality(params.id as string);

  // Fetch institution data
  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/municipality/public`);
        if (!response.ok) {
          throw new Error("Error al cargar la institución");
        }
        const data = await response.json();
        const foundInstitution = data.municipalities?.find(
          (municipality: any) => municipality.id === params.id
        );

        if (foundInstitution) {
          setInstitution(foundInstitution);
        } else {
          setError("Institución no encontrada");
        }
      } catch (err) {
        console.error("Error fetching institution:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInstitution();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-8">
            {/* Back Button Skeleton */}
            <Skeleton className="h-8 w-32" />

            {/* Hero Banner Skeleton */}
            <div className="relative h-80 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20">
                <div className="container mx-auto px-6 h-full flex items-end pb-8">
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {error || "Institución no encontrada"}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              La institución que buscas no existe o no está disponible en el
              sistema.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver atrás
              </Button>
              <Button
                onClick={() => router.push("/institutions")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ver todas las instituciones
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a las instituciones
        </Button>

        {/* Hero Banner */}
        <div className="relative h-80 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20">
            <div className="container mx-auto px-6 h-full flex items-end pb-8">
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                  <Building className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {institution.name}
                  </h1>
                  <p className="text-white/90 text-lg max-w-2xl">
                    {institution.department}, {institution.region}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                      {institution.institutionType === "MUNICIPALITY"
                        ? "Municipio"
                        : institution.institutionType === "NGO"
                          ? "ONG"
                          : institution.institutionType === "FOUNDATION"
                            ? "Fundación"
                            : institution.customType || "Institución"}
                    </Badge>
                    {institution.createdAt && (
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Registrado el{" "}
                          {new Date(institution.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Bar */}
        <Card className="bg-white shadow-sm border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {institution.email && (
                  <a
                    href={`mailto:${institution.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {institution.email}
                    </span>
                  </a>
                )}
                {institution.phone && (
                  <a
                    href={`tel:${institution.phone}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-50"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {institution.phone}
                    </span>
                  </a>
                )}
                {institution.address && (
                  <div className="flex items-center gap-2 text-gray-600 p-2 rounded-lg">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {institution.address}
                    </span>
                  </div>
                )}
              </div>
              {institution.website && (
                <Button
                  variant="outline"
                  asChild
                  className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                >
                  <a
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visitar sitio web
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-white shadow-sm border-0 p-1">
                <TabsTrigger
                  value="about"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Info className="w-4 h-4" />
                  Acerca de
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4" />
                  Contacto
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Briefcase className="w-4 h-4" />
                  Empleos
                  {jobOffers && jobOffers.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {jobOffers.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4 p-6">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2">
                          Tipo de Institución
                        </h3>
                        <p className="text-sm text-gray-600">
                          {institution.institutionType === "MUNICIPALITY"
                            ? "Municipio"
                            : institution.institutionType === "NGO"
                              ? "ONG"
                              : institution.institutionType === "FOUNDATION"
                                ? "Fundación"
                                : institution.customType || "Otro"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2">
                          Ubicación
                        </h3>
                        <p className="text-sm text-gray-600">
                          {institution.department}, {institution.region}
                        </p>
                      </div>
                      {institution.address && (
                        <div className="p-4 bg-gray-50 rounded-lg sm:col-span-2">
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">
                            Dirección
                          </h3>
                          <p className="text-sm text-gray-600">
                            {institution.address}
                          </p>
                        </div>
                      )}
                      {institution.createdAt && (
                        <div className="p-4 bg-gray-50 rounded-lg sm:col-span-2">
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">
                            Fecha de Registro
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              institution.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4 p-6">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Información de contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      {institution.address && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Dirección
                            </p>
                            <p className="text-sm text-gray-600">
                              {institution.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {institution.email && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Email
                            </p>
                            <a
                              href={`mailto:${institution.email}`}
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {institution.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {institution.phone && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Teléfono
                            </p>
                            <a
                              href={`tel:${institution.phone}`}
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {institution.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {institution.website && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Sitio web
                            </p>
                            <a
                              href={institution.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                            >
                              {institution.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4 p-6">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Ofertas de Empleo
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Empleos publicados por {institution.name}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {jobsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
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
                    ) : jobsError ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-red-100 rounded-full p-4 mb-4">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Error al cargar empleos
                        </h3>
                        <p className="text-gray-600 mb-4">
                          No se pudieron cargar las ofertas de empleo de esta
                          institución.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.location.reload()}
                          className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                        >
                          Intentar de nuevo
                        </Button>
                      </div>
                    ) : jobOffers && jobOffers.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {jobOffers.length}{" "}
                            {jobOffers.length === 1
                              ? "empleo encontrado"
                              : "empleos encontrados"}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => router.push("/jobs")}
                            className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Ver todos los empleos
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {jobOffers.map((job) => (
                            <JobCard key={job.id} job={job} viewMode="grid" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No hay empleos disponibles
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md">
                          Esta institución no ha publicado ninguna oferta de
                          empleo aún.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => router.push("/jobs")}
                          className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Explorar otros empleos
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Información Rápida
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Institución activa
                    </span>
                  </div>
                  {institution.createdAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Registrado el{" "}
                        {new Date(institution.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {institution.department}, {institution.region}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {institution.website && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visitar sitio web
                      </a>
                    </Button>
                  )}
                  {institution.email && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={`mailto:${institution.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar email
                      </a>
                    </Button>
                  )}
                  {institution.phone && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={`tel:${institution.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
