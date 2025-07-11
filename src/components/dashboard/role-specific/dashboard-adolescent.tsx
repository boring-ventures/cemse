"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  FileText,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  Target,
  ArrowRight,
  Users,
  Shield,
  Info,
  Heart,
  Eye,
  MessageSquare,
  Building2,
  Newspaper,
  Star,
  Calendar,
  ThumbsUp,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Share,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDescription } from "@/components/ui/card";
// News types
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  authorName: string;
  authorType: "COMPANY" | "GOVERNMENT" | "NGO";
  authorLogo?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  tags: string[];
  featured?: boolean;
  readTime?: number;
  url?: string;
}

// Enhanced News Carousel Component
export function LocalNewsCarousel() {
  const [companyNews, setCompanyNews] = useState<NewsArticle[]>([]);
  const [governmentNews, setGovernmentNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyIndex, setCompanyIndex] = useState(0);
  const [governmentIndex, setGovernmentIndex] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);

      // Fetch company news
      const companyResponse = await fetch(
        "/api/news?type=company&featured=true&targetAudience=YOUTH&limit=6"
      );
      const companyData = await companyResponse.json();

      // Fetch government/NGO news
      const govResponse = await fetch(
        "/api/news?type=government&targetAudience=YOUTH&limit=6"
      );
      const govData = await govResponse.json();

      const ngoResponse = await fetch(
        "/api/news?type=ngo&targetAudience=YOUTH&limit=6"
      );
      const ngoData = await ngoResponse.json();

      setCompanyNews(companyData.news || []);
      setGovernmentNews([...(govData.news || []), ...(ngoData.news || [])]);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hace 1 día";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30)
      return `Hace ${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? "s" : ""}`;
    return formatDate(dateString);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-blue-500 text-white";
      case "LOW":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <AlertCircle className="w-3 h-3" />;
      case "HIGH":
        return <Star className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  const nextCompany = () => {
    setCompanyIndex((prev) => (prev + 1) % Math.max(1, companyNews.length - 2));
  };

  const prevCompany = () => {
    setCompanyIndex(
      (prev) =>
        (prev - 1 + Math.max(1, companyNews.length - 2)) %
        Math.max(1, companyNews.length - 2)
    );
  };

  const nextGovernment = () => {
    setGovernmentIndex(
      (prev) => (prev + 1) % Math.max(1, governmentNews.length - 2)
    );
  };

  const prevGovernment = () => {
    setGovernmentIndex(
      (prev) =>
        (prev - 1 + Math.max(1, governmentNews.length - 2)) %
        Math.max(1, governmentNews.length - 2)
    );
  };

  const EnhancedNewsCard = ({
    article,
    compact = false,
    featured = false,
  }: {
    article: NewsArticle;
    compact?: boolean;
    featured?: boolean;
  }) => (
    <Card
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden ${
        compact ? "h-full" : ""
      } ${featured ? "ring-2 ring-blue-500/20 shadow-lg" : ""}`}
    >
      <div className="relative">
        {article.imageUrl ? (
          <div
            className={`relative ${compact ? "h-32" : "h-48"} overflow-hidden`}
          >
            <Image
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Priority Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                className={`${getPriorityColor(article.priority)} border-0 flex items-center gap-1`}
              >
                {getPriorityIcon(article.priority)}
                {article.priority === "URGENT"
                  ? "Urgente"
                  : article.priority === "HIGH"
                    ? "Importante"
                    : article.priority === "MEDIUM"
                      ? "Medio"
                      : "Información"}
              </Badge>
            </div>

            {/* Category Badge */}
            {article.category && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-700"
                >
                  {article.category}
                </Badge>
              </div>
            )}

            {/* Featured Badge */}
            {featured && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              </div>
            )}

            {/* Read Time */}
            {article.readTime && (
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-black/50 text-white border-0"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {article.readTime} min
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${compact ? "h-32" : "h-48"} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
          >
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={article.authorLogo} alt={article.authorName} />
              <AvatarFallback className="text-xs">
                {article.authorType === "COMPANY" ? (
                  <Building2 className="w-3 h-3" />
                ) : (
                  <Shield className="w-3 h-3" />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-gray-600">
              {article.authorName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p
          className={`text-muted-foreground line-clamp-2 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {article.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2 py-0.5 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              {tag}
            </Badge>
          ))}
          {article.tags.length > (compact ? 2 : 3) && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 text-gray-500"
            >
              +{article.tags.length - (compact ? 2 : 3)}
            </Badge>
          )}
        </div>

        {/* Engagement Stats & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
              <Eye className="w-3 h-3" />
              {article.viewCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
              <ThumbsUp className="w-3 h-3" />
              {article.likeCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 hover:text-green-600 cursor-pointer">
              <MessageSquare className="w-3 h-3" />
              {article.commentCount.toLocaleString()}
            </div>
            {article.shareCount && (
              <div className="flex items-center gap-1 hover:text-purple-600 cursor-pointer">
                <Share className="w-3 h-3" />
                {article.shareCount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-blue-50 hover:text-blue-600"
            >
              <Bookmark className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-blue-50 hover:text-blue-600"
            >
              <Link href={article.url || ""} className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-10 py-4">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              Centro de Noticias
            </h2>
            <p className="text-muted-foreground">
              Mantente informado sobre las últimas oportunidades y anuncios
              importantes
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {companyNews.length} Noticias Empresariales
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            {governmentNews.length} Noticias Oficiales
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Actualizado hoy
          </div>
        </div>
      </div>

      {/* Enhanced News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company News Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Noticias Empresariales
                </h3>
                <p className="text-sm text-gray-600">
                  Oportunidades laborales y novedades corporativas
                </p>
              </div>
            </div>
            {companyNews.length > 3 && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={prevCompany}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextCompany}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {companyNews.length > 0 ? (
              <>
                {/* Featured article */}
                <EnhancedNewsCard
                  article={companyNews[companyIndex]}
                  featured={true}
                />

                {/* Compact articles */}
                <div className="grid grid-cols-1 gap-4">
                  {companyNews
                    .slice(companyIndex + 1, companyIndex + 3)
                    .map((article) => (
                      <EnhancedNewsCard
                        key={article.id}
                        article={article}
                        compact
                      />
                    ))}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Sin noticias empresariales
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  No hay noticias empresariales disponibles en este momento
                </p>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar Empleos
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Government/NGO News Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Noticias Oficiales
                </h3>
                <p className="text-sm text-gray-600">
                  Anuncios gubernamentales y programas sociales
                </p>
              </div>
            </div>
            {governmentNews.length > 3 && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={prevGovernment}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextGovernment}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {governmentNews.length > 0 ? (
              <>
                {/* Featured article */}
                <EnhancedNewsCard
                  article={governmentNews[governmentIndex]}
                  featured={true}
                />

                {/* Compact articles */}
                <div className="grid grid-cols-1 gap-4">
                  {governmentNews
                    .slice(governmentIndex + 1, governmentIndex + 3)
                    .map((article) => (
                      <EnhancedNewsCard
                        key={article.id}
                        article={article}
                        compact
                      />
                    ))}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Sin noticias oficiales
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  No hay noticias gubernamentales disponibles en este momento
                </p>
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Ver Programas
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced View More Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="px-6">
            <Newspaper className="w-4 h-4 mr-2" />
            Ver Todas las Noticias
          </Button>
          <Button variant="outline" size="lg">
            <Star className="w-4 h-4 mr-2" />
            Noticias Destacadas
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Actualizado automáticamente cada hora • Últimas{" "}
          {companyNews.length + governmentNews.length} noticias
        </p>
      </div>
    </div>
  );
}

export function DashboardAdolescent() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido Joven!</h1>
            <p className="text-green-100">
              Explora oportunidades, desarrolla tus habilidades y construye tu
              futuro profesional
            </p>
          </div>
          <div className="hidden md:flex">
            <GraduationCap className="w-16 h-16 text-green-200" />
          </div>
        </div>
      </div>

      {/* Parental Consent Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Recordatorio Importante
            </h3>
            <p className="text-sm text-amber-700">
              Recuerda que para ciertas actividades necesitas autorización de
              tus padres o tutores.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced News Carousel */}
        <LocalNewsCarousel />

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Búsqueda de Empleo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Encuentra oportunidades laborales apropiadas para jóvenes
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/jobs">
                Explorar Ofertas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Capacitación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Desarrolla nuevas habilidades y obtén certificaciones
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/courses">
                Ver Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Emprendimiento</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Desarrolla ideas de negocio y habilidades empresariales
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/entrepreneurship">
                Explorar Ideas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  Completaste &quot;Orientación Vocacional - Módulo 1&quot;
                </span>
              </div>
              <Badge variant="secondary">Hace 1 día</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm">
                  Participaste en taller &quot;Educación Financiera Básica&quot;
                </span>
              </div>
              <Badge variant="secondary">Hace 3 días</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  Guardaste oferta de trabajo de medio tiempo
                </span>
              </div>
              <Badge variant="secondary">Hace 5 días</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Personal Metrics */}
      <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Progreso Personal</CardTitle>
                <CardDescription>
                  Un vistazo completo a tu actividad y avances en la plataforma
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mx-auto">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">3</div>
                <p className="text-sm font-medium text-gray-600">
                  Postulaciones Activas
                </p>
                <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  60% tasa de respuesta
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mx-auto">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">2</div>
                <p className="text-sm font-medium text-gray-600">
                  Cursos en Progreso
                </p>
                <div className="w-full bg-green-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% completado</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mx-auto">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">1</div>
                <p className="text-sm font-medium text-gray-600">
                  Proyecto Emprendimiento
                </p>
                <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">En desarrollo</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-xl mx-auto">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4</div>
                <p className="text-sm font-medium text-gray-600">
                  Certificados Obtenidos
                </p>
                <div className="w-full bg-orange-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Meta: 5 certificados
                </p>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">12h</div>
                <p className="text-xs text-gray-600">
                  Tiempo de estudio esta semana
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">8</div>
                <p className="text-xs text-gray-600">
                  Conexiones profesionales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">4.8</div>
                <p className="text-xs text-gray-600">Calificación promedio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">¿Necesitas ayuda?</h3>
          <p className="text-gray-600 mb-4">
            Estamos aquí para apoyarte en tu desarrollo académico y profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/support/academic">Apoyo Académico</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/support/career">Orientación Profesional</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
