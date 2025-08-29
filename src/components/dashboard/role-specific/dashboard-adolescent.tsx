"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useDashboard } from "@/hooks/useDashboard";

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
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-10 py-4">
      {/* Enhanced Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-4">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto sm:mx-0">
            <Newspaper className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Centro de Noticias
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Mantente informado sobre las últimas oportunidades y anuncios
              importantes
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>{companyNews.length} Noticias Empresariales</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>{governmentNews.length} Noticias Oficiales</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Actualizado hoy</span>
          </div>
        </div>
      </div>

      {/* Enhanced News Grid */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Company News Column */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Noticias Empresariales
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Oportunidades laborales y novedades corporativas
                </p>
              </div>
            </div>
            {companyNews.length > 3 && (
              <div className="flex gap-1 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={prevCompany}>
                  <ChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextCompany}>
                  <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {companyNews.length > 0 ? (
              <>
                {/* Featured article */}
                <EnhancedNewsCard
                  article={companyNews[companyIndex]}
                  featured={true}
                />

                {/* Compact articles */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
              <Card className="p-6 sm:p-8 text-center border-dashed">
                <Building2 className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                  Sin noticias empresariales
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  No hay noticias empresariales disponibles en este momento
                </p>
                <Button variant="outline" size="sm">
                  <Search className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Explorar Empleos</span>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Government/NGO News Column */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Noticias Oficiales
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Anuncios gubernamentales y programas sociales
                </p>
              </div>
            </div>
            {governmentNews.length > 3 && (
              <div className="flex gap-1 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={prevGovernment}>
                  <ChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextGovernment}>
                  <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {governmentNews.length > 0 ? (
              <>
                {/* Featured article */}
                <EnhancedNewsCard
                  article={governmentNews[governmentIndex]}
                  featured={true}
                />

                {/* Compact articles */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
              <Card className="p-6 sm:p-8 text-center border-dashed">
                <Shield className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                  Sin noticias oficiales
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  No hay noticias gubernamentales disponibles en este momento
                </p>
                <Button variant="outline" size="sm">
                  <Target className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Ver Programas</span>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced View More Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button size="sm" className="px-4 sm:px-6 w-full sm:w-auto">
            <Newspaper className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
            <span className="text-sm">Ver Todas las Noticias</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
            <span className="text-sm">Noticias Destacadas</span>
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
  const { data: dashboardData, isLoading, error } = useDashboard();

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar el dashboard
              </h3>
              <p className="text-sm text-red-700">
                No se pudieron cargar los datos. Por favor, intenta de nuevo más
                tarde.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default values for when data is loading or not available
  const stats = dashboardData?.statistics || {
    totalCourses: 0,
    totalJobs: 0,
    totalEntrepreneurships: 0,
    totalInstitutions: 0,
    userCourses: 0,
    userJobApplications: 0,
    userEntrepreneurships: 0,
  };

  const activities = dashboardData?.recentActivities || [];

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">¡Bienvenido Joven!</h1>
            <p className="text-sm sm:text-base text-gray-200">
              Explora oportunidades, desarrolla tus habilidades y construye tu
              futuro profesional
            </p>
          </div>
          <div className="hidden sm:flex">
            <GraduationCap className="w-12 sm:w-16 h-12 sm:h-16 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Parental Consent Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
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
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Búsqueda de Empleo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 text-center sm:text-left">
              Encuentra oportunidades laborales apropiadas para jóvenes
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/jobs" className="flex items-center justify-center">
                Explorar Ofertas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Capacitación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 text-center sm:text-left">
              Desarrolla nuevas habilidades y obtén certificaciones
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/courses" className="flex items-center justify-center">
                Ver Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Emprendimiento</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 text-center sm:text-left">
              Desarrolla ideas de negocio y habilidades empresariales
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/entrepreneurship" className="flex items-center justify-center">
                Explorar Ideas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-5 h-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeleton for activities
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-48 sm:w-64" />
                  </div>
                  <Skeleton className="h-6 w-16 sm:w-20 ml-7 sm:ml-0" />
                </div>
              ))
            ) : activities.length > 0 ? (
              // Real activities
              activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 text-gray-600 flex-shrink-0">{activity.icon}</div>
                    <span className="text-sm">{activity.title}</span>
                  </div>
                  <Badge variant="secondary" className="self-start sm:self-center text-xs">
                    {activity.timestamp}
                  </Badge>
                </div>
              ))
            ) : (
              // No activities
              <div className="text-center py-6 sm:py-8">
                <FileText className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No hay actividades recientes
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Comienza a explorar oportunidades para ver tu actividad aquí
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Personal Metrics */}
      <Card className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl">Progreso Personal</CardTitle>
                <CardDescription className="text-sm">
                  Un vistazo completo a tu actividad y avances en la plataforma
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton for metrics
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2 sm:space-y-3">
                  <Skeleton className="w-12 sm:w-16 h-12 sm:h-16 rounded-xl mx-auto" />
                  <div>
                    <Skeleton className="h-6 sm:h-8 w-8 sm:w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mx-auto mb-2" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-2 sm:h-3 w-16 sm:w-24 mx-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-xl mx-auto">
                  <Search className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats.userJobApplications}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Postulaciones Activas
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{
                        width: stats.userJobApplications > 0 ? "60%" : "0%",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.userJobApplications > 0
                      ? "60% tasa de respuesta"
                      : "Sin postulaciones"}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-xl mx-auto">
                  <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats.userCourses}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Cursos en Progreso
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: stats.userCourses > 0 ? "75%" : "0%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.userCourses > 0
                      ? "75% completado"
                      : "Sin cursos activos"}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 rounded-xl mx-auto">
                  <Target className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats.userEntrepreneurships}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Proyecto Emprendimiento
                  </p>
                  <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: stats.userEntrepreneurships > 0 ? "40%" : "0%",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.userEntrepreneurships > 0
                      ? "En desarrollo"
                      : "Sin proyectos"}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-orange-100 rounded-xl mx-auto">
                  <Award className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">4</div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
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
          )}

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">12h</div>
                <p className="text-xs text-gray-600">
                  Tiempo de estudio esta semana
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">8</div>
                <p className="text-xs text-gray-600">
                  Conexiones profesionales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 sm:w-5 h-4 sm:h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">4.8</div>
                <p className="text-xs text-gray-600">Calificación promedio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="border-dashed">
        <CardContent className="p-4 sm:p-6 text-center">
          <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-pink-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
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
