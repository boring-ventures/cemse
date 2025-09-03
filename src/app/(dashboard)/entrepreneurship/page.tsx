"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  BookOpen,
  Calculator,
  Network,
  ArrowRight,
  Star,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { usePublicResources } from "@/hooks/useResourceApi";
import { Resource } from "@/types/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { isMunicipalityRole } from "@/lib/utils";

export default function EntrepreneurshipPage() {
  // Get current user and municipality info for filtering
  const { profile } = useCurrentUser();
  const { data: currentMunicipality } = useCurrentMunicipality();

  // Determine if user is municipality and get municipality ID
  const isMunicipality = isMunicipalityRole(profile?.role);
  const municipalityId = isMunicipality ? currentMunicipality?.id : undefined;

  // Get real resources from API
  const { data: resources = [], isLoading: loadingResources } =
    usePublicResources(municipalityId);

  const getResourceIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "DOCUMENT":
        return <FileText className="h-5 w-5" />;
      case "VIDEO":
        return <Video className="h-5 w-5" />;
      case "AUDIO":
        return <Music className="h-5 w-5" />;
      case "IMAGE":
        return <ImageIcon className="h-5 w-5" />;
      case "TEXT":
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get top 10 resources by downloads, safely handling undefined values
  const topResources = ((resources as Resource[]) || [])
    .filter(
      (resource): resource is Resource =>
        resource && typeof resource === "object"
    )
    .sort((a: Resource, b: Resource) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10);

  if (loadingResources) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              Convierte tu Idea en Realidad
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Accede a herramientas, recursos y mentorías para lanzar tu
              emprendimiento exitoso en Bolivia
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href="/business-plan-simulator">
                  <Calculator className="h-5 w-5 mr-2" />
                  Crear Plan de Negocios
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-20">
          <Rocket className="h-64 w-64 transform rotate-12" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/business-plan-simulator">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Simulador de Plan</h3>
              <p className="text-muted-foreground">
                Crea tu plan de negocios paso a paso
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Centro de Recursos</h3>
              <p className="text-muted-foreground">
                Plantillas, guías y herramientas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/entrepreneurship/network">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Network className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Red de Contactos</h3>
              <p className="text-muted-foreground">
                Conecta con otros emprendedores
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Resources */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recursos Más Populares</h2>
          <Button asChild variant="outline">
            <Link href="/resources">
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {topResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay recursos disponibles
            </h3>
            <p className="text-gray-600">
              Pronto tendremos recursos educativos para ti
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topResources.map((resource) => (
              <Card
                key={resource.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="bg-white rounded-full p-2">
                      {getResourceIcon(resource.type)}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {resource.category || "Sin categoría"}
                  </Badge>
                  <h3 className="font-semibold mb-2">
                    {resource.title || "Sin título"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {resource.description || "Sin descripción"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {resource.rating || 0}
                    </div>
                    <span>
                      {(resource.downloads || 0).toLocaleString()} descargas
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Listo para Emprender?</h2>
          <p className="text-lg mb-6 opacity-90">
            Accede a recursos exclusivos y conecta con la comunidad emprendedora
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            <Link href="/entrepreneurship/resources">
              <BookOpen className="h-5 w-5 mr-2" />
              Explorar Recursos
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
