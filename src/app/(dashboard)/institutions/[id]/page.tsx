"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

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
  description: string;
  longDescription?: string;
  location: string;
  department?: string;
  region?: string;
  institutionType?: string;
  logo: string;
  coverImage: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  servicesOffered?: string[];
  focusAreas?: string[];
  posts?: InstitutionPost[];
}

export default function InstitutionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  const fetchInstitutionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/institution/${params.id}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de la institución");
      }

      const data = await response.json();
      setInstitution(data);
    } catch (err) {
      console.error("Error fetching institution data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchInstitutionData();
    }
  }, [fetchInstitutionData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando institución...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !institution) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error al cargar la institución
            </h2>
            <p className="text-red-600 mb-4">
              {error || "No se pudo cargar la información"}
            </p>
            <div className="space-x-4">
              <Button onClick={fetchInstitutionData} variant="outline">
                Intentar nuevamente
              </Button>
              <Button
                onClick={() => router.push("/institutions")}
                variant="outline"
              >
                Volver al directorio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Back Button */}
      <div className="container mx-auto px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/institutions")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al directorio
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="relative h-80">
        {institution.coverImage ? (
          <Image
            src={institution.coverImage}
            alt={institution.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{institution.name}</h1>
              <p className="text-xl opacity-90">{institution.description}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20">
          <div className="container mx-auto px-6 h-full flex items-end pb-8">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-white">
                {institution.logo ? (
                  <Image
                    src={institution.logo}
                    alt={`${institution.name} logo`}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-gray-500 text-2xl font-bold">
                      {institution.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {institution.name}
                </h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  {institution.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              {institution.socialMedia?.facebook && (
                <a
                  href={institution.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {institution.socialMedia?.instagram && (
                <a
                  href={institution.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {institution.socialMedia?.linkedin && (
                <a
                  href={institution.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {institution.socialMedia?.twitter && (
                <a
                  href={institution.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-400 transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
            </div>
            {institution.website && (
              <Button variant="outline" asChild>
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visitar sitio web
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="bg-white">
            <TabsTrigger value="about">Acerca de</TabsTrigger>
            <TabsTrigger value="posts">Publicaciones</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Sobre nosotros</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {institution.longDescription || institution.description}
                </p>

                {institution.servicesOffered &&
                  institution.servicesOffered.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Servicios ofrecidos
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {institution.servicesOffered.map((service, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {institution.focusAreas &&
                  institution.focusAreas.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Áreas de enfoque
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {institution.focusAreas.map((area, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            {institution.posts && institution.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institution.posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="relative h-48">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">📄</div>
                            <div className="text-sm font-medium">
                              {post.title}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString()}
                        <User className="h-4 w-4 ml-2" />
                        {post.author}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>
                      <Button variant="link" className="mt-4 px-0">
                        Leer más
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No hay publicaciones disponibles en este momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Información de contacto
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{institution.location}</span>
                  </div>
                  {institution.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{institution.address}</span>
                    </div>
                  )}
                  {institution.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={`mailto:${institution.email}`}
                        className="hover:text-blue-600"
                      >
                        {institution.email}
                      </a>
                    </div>
                  )}
                  {institution.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={`tel:${institution.phone}`}
                        className="hover:text-blue-600"
                      >
                        {institution.phone}
                      </a>
                    </div>
                  )}
                  {institution.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {institution.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
