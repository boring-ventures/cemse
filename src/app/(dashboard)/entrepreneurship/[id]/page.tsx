"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Building2,
  Edit,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useEntrepreneurship } from "@/hooks/useEntrepreneurshipApi";
import { useAuthContext } from "@/hooks/use-auth";

interface EntrepreneurshipDetailProps {
  id: string;
}

interface EntrepreneurshipData {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: string;
  businessModel?: string;
  targetMarket?: string;
  employees?: number;
  annualRevenue?: number;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  municipality?: string;
  department?: string;
  logo?: string;
  images: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  founded?: string | Date;
  viewsCount: number;
  owner?: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

function EntrepreneurshipDetailContent({ id }: EntrepreneurshipDetailProps): React.ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { entrepreneurship, loading, error, fetchEntrepreneurship } =
    useEntrepreneurship(id);

  useEffect(() => {
    if (id) {
      fetchEntrepreneurship();
    }
  }, [id, fetchEntrepreneurship]);

  const getBusinessStageColor = (stage: string): string => {
    switch (stage?.toLowerCase()) {
      case "idea":
        return "bg-blue-100 text-blue-800";
      case "startup":
        return "bg-green-100 text-green-800";
      case "growing":
        return "bg-yellow-100 text-yellow-800";
      case "established":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      tecnologia: "Tecnología",
      ecommerce: "E-commerce",
      alimentacion: "Alimentación",
      educacion: "Educación",
      servicios: "Servicios",
      manufactura: "Manufactura",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando emprendimiento...</span>
        </div>
      </div>
    );
  }

  if (error || !entrepreneurship) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error || "Emprendimiento no encontrado"}
          </p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  // Type assertion with proper interface
  const entrepreneurshipData = entrepreneurship as EntrepreneurshipData;
  const isOwner = user?.id === entrepreneurshipData.owner?.userId;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {entrepreneurshipData.logo && (
              <div className="flex-shrink-0">
                <img
                  src={entrepreneurshipData.logo}
                  alt={`Logo de ${entrepreneurshipData.name}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{entrepreneurshipData.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  className={getBusinessStageColor(
                    entrepreneurshipData.businessStage
                  )}
                >
                  {entrepreneurshipData.businessStage}
                </Badge>
                <Badge variant="outline">
                  {getCategoryLabel(entrepreneurshipData.category)}
                </Badge>
                {entrepreneurshipData.subcategory && (
                  <Badge variant="secondary">
                    {entrepreneurshipData.subcategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/entrepreneurship/${entrepreneurshipData.id}/edit`)
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {entrepreneurshipData.description}
              </p>
            </CardContent>
          </Card>

          {/* Images Gallery */}
          {entrepreneurshipData.images && entrepreneurshipData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galería de Imágenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entrepreneurshipData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1} de ${entrepreneurshipData.name}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white bg-opacity-90 rounded-full p-2">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entrepreneurshipData.businessModel && (
                <div>
                  <h4 className="font-semibold mb-2">Modelo de Negocio</h4>
                  <p className="text-muted-foreground">
                    {entrepreneurshipData.businessModel}
                  </p>
                </div>
              )}
              {entrepreneurshipData.targetMarket && (
                <div>
                  <h4 className="font-semibold mb-2">Mercado Objetivo</h4>
                  <p className="text-muted-foreground">
                    {entrepreneurshipData.targetMarket}
                  </p>
                </div>
              )}
              {entrepreneurshipData.employees && (
                <div>
                  <h4 className="font-semibold mb-2">Empleados</h4>
                  <p className="text-muted-foreground">
                    {entrepreneurshipData.employees} empleados
                  </p>
                </div>
              )}
              {entrepreneurshipData.annualRevenue && (
                <div>
                  <h4 className="font-semibold mb-2">Ingresos Anuales</h4>
                  <p className="text-muted-foreground">
                    Bs. {entrepreneurshipData.annualRevenue.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entrepreneurshipData.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${entrepreneurshipData.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entrepreneurshipData.email}
                  </a>
                </div>
              )}
              {entrepreneurshipData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${entrepreneurshipData.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entrepreneurshipData.phone}
                  </a>
                </div>
              )}
              {entrepreneurshipData.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={entrepreneurshipData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visitar sitio web
                  </a>
                </div>
              )}
              {entrepreneurshipData.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {entrepreneurshipData.address}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          {(entrepreneurshipData.municipality || entrepreneurshipData.department) && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {entrepreneurshipData.municipality && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{entrepreneurshipData.municipality}</span>
                  </div>
                )}
                {entrepreneurshipData.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{entrepreneurshipData.department}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {entrepreneurshipData.socialMedia && (
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {entrepreneurshipData.socialMedia.facebook && (
                  <a
                    href={`https://facebook.com/${entrepreneurshipData.socialMedia.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {entrepreneurshipData.socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${entrepreneurshipData.socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {entrepreneurshipData.socialMedia.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${entrepreneurshipData.socialMedia.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entrepreneurshipData.founded && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Fundado en{" "}
                    {new Date(entrepreneurshipData.founded).getFullYear()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{entrepreneurshipData.viewsCount || 0} visualizaciones</span>
              </div>
            </CardContent>
          </Card>

          {/* Owner Info */}
          {entrepreneurshipData.owner && (
            <Card>
              <CardHeader>
                <CardTitle>Propietario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {entrepreneurshipData.owner.firstName?.[0]}
                    {entrepreneurshipData.owner.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {entrepreneurshipData.owner.firstName}{" "}
                      {entrepreneurshipData.owner.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entrepreneurshipData.owner.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntrepreneurshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { use } = require("react");
  const resolvedParams = use(params);
  return <EntrepreneurshipDetailContent id={resolvedParams.id} />;
}
