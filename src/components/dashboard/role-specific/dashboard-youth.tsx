"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Building2,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Rocket,
  Sparkles,
  GraduationCap,
  Play,
  Zap,
  Target,
  BrainCircuit,
  ArrowRight,
  Briefcase,
  BookOpen,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useDashboard } from "@/hooks/useDashboard";
import { usePublicNews } from "@/hooks/useNewsArticleApi";

// Import the real NewsArticle type
import { NewsArticle } from "@/types/news";

function NewsCarousel() {
  const [companyIndex, setCompanyIndex] = useState(0);
  const [governmentIndex, setGovernmentIndex] = useState(0);

  // Use the real news hook
  const { data: allNews, isLoading: loading, error, refetch } = usePublicNews();

  // Show all news without filtering by type for now
  const allNewsArray = Array.isArray(allNews) ? allNews : [];

  // Split news into two columns for display
  const companyNews = allNewsArray.filter(
    (news) => news.authorType === "COMPANY"
  );
  const governmentNews = allNewsArray.filter(
    (news) => news.authorType === "GOVERNMENT" || news.authorType === "NGO"
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Hace 1 día";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30)
      return `Hace ${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? "s" : ""}`;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const NewsCard = ({ article }: { article: NewsArticle }) => (
    <Link href={`/news/${article.id}`} className="block">
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative h-32 sm:h-40">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
              <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg" />
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                <AvatarImage
                  src={article.authorLogo}
                  alt={article.authorName}
                />
                <AvatarFallback>
                  {article.authorType === "COMPANY" ? (
                    <Building2 className="w-2 h-2 sm:w-3 sm:h-3" />
                  ) : (
                    <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white/90 truncate">
                {article.authorName}
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {article.summary}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">
              {formatTimeAgo(article.publishedAt || article.createdAt)}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Ver más</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return <NewsCarouselSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Centro de Noticias
          </h2>
          <p className="text-muted-foreground">
            Mantente informado sobre las últimas novedades
          </p>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No se pudieron cargar las noticias
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Por favor, intenta de nuevo más tarde
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Centro de Noticias
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Mantente informado sobre las últimas novedades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Company News Column */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">
                Noticias Recientes
              </h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCompanyIndex(
                    (prev) =>
                      (prev - 1 + companyNews.length) % companyNews.length
                  )
                }
                disabled={companyNews.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCompanyIndex((prev) => (prev + 1) % companyNews.length)
                }
                disabled={companyNews.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {companyNews.length > 0 ? (
            <NewsCard article={companyNews[companyIndex]} />
          ) : (
            <Card className="p-4 sm:p-6 text-center border-dashed">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                No hay noticias disponibles
              </p>
            </Card>
          )}
        </div>

        {/* Government/NGO News Column */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">
                Más Noticias
              </h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setGovernmentIndex(
                    (prev) =>
                      (prev - 1 + governmentNews.length) % governmentNews.length
                  )
                }
                disabled={governmentNews.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setGovernmentIndex(
                    (prev) => (prev + 1) % governmentNews.length
                  )
                }
                disabled={governmentNews.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {governmentNews.length > 0 ? (
            <NewsCard article={governmentNews[governmentIndex]} />
          ) : (
            <Card className="p-4 sm:p-6 text-center border-dashed">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                No hay más noticias disponibles
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/news" className="flex items-center justify-center">
            <Newspaper className="w-4 h-4 mr-2" />
            Ver Todas las Noticias
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Skeleton loader for news cards
function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-40 bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Summary skeleton */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />

        {/* Meta info skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for news carousel
function NewsCarouselSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company News Column Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
          <NewsCardSkeleton />
        </div>

        {/* Government News Column Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
          <NewsCardSkeleton />
        </div>
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-10 w-48 rounded" />
      </div>
    </div>
  );
}

export function DashboardYouth() {
  const { data: dashboardData, isLoading, error } = useDashboard();
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
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

  const modules = [
    {
      title: "Empleos",
      description: "¡Encuentra tu trabajo ideal!",
      icon: Rocket,
      href: "/jobs",
      color: "bg-gray-600",
      metric: {
        label: "Ofertas",
        value: stats.totalJobs.toString(),
        icon: Sparkles,
      },
      actions: [{ label: "Ver Empleos", href: "/jobs" }],
    },
    {
      title: "Cursos",
      description: "¡Aprende algo nuevo!",
      icon: GraduationCap,
      href: "/courses",
      color: "bg-gray-600",
      metric: {
        label: "En curso",
        value: stats.userCourses.toString(),
        icon: Play,
      },
      actions: [{ label: "Ver Cursos", href: "/courses" }],
    },
    {
      title: "Emprendimiento",
      description: "¡Crea tu negocio!",
      icon: Zap,
      href: "/entrepreneurship",
      color: "bg-gray-600",
      metric: {
        label: "Proyectos",
        value: stats.userEntrepreneurships.toString(),
        icon: Target,
      },
      actions: [{ label: "Ver Emprendimiento", href: "/entrepreneurship" }],
    },
    {
      title: "Instituciones",
      description: "¡Conoce las instituciones disponibles!",
      icon: Building2,
      href: "/institutions",
      color: "bg-gray-600",
      metric: {
        label: "Disponibles",
        value: stats.totalInstitutions.toString(),
        icon: Shield,
      },
      actions: [{ label: "Ver Instituciones", href: "/institutions" }],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 space-y-5 sm:space-y-6 md:space-y-8 w-full">
        {/* Header with Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg overflow-hidden"
        >
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            {/* Welcome Text */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold break-words leading-tight"
                  >
                    ¡Hola! 👋
                  </motion.h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInfoModal(true)}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-white/80 hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
                  >
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 break-words leading-relaxed"
                >
                  ¿Qué quieres hacer hoy?
                </motion.p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="hidden md:block flex-shrink-0 ml-4"
              >
                <BrainCircuit className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 text-gray-200" />
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              <Button
                variant="secondary"
                size="sm"
                className="h-auto p-4 sm:p-5 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm min-h-[80px] sm:min-h-[90px]"
                asChild
              >
                <Link
                  href="/jobs"
                  className="flex flex-col items-center gap-2 sm:gap-3 h-full justify-center"
                >
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                    Buscar Empleo
                  </span>
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-auto p-4 sm:p-5 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm min-h-[80px] sm:min-h-[90px]"
                asChild
              >
                <Link
                  href="/courses"
                  className="flex flex-col items-center gap-2 sm:gap-3 h-full justify-center"
                >
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                    Ver Cursos
                  </span>
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-auto p-4 sm:p-5 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm min-h-[80px] sm:min-h-[90px]"
                asChild
              >
                <Link
                  href="/entrepreneurship"
                  className="flex flex-col items-center gap-2 sm:gap-3 h-full justify-center"
                >
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                    Emprender
                  </span>
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-auto p-4 sm:p-5 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm min-h-[80px] sm:min-h-[90px]"
                asChild
              >
                <Link
                  href="/profile"
                  className="flex flex-col items-center gap-2 sm:gap-3 h-full justify-center"
                >
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                    Mi Perfil
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* News Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="overflow-hidden"
        >
          <NewsCarousel />
        </motion.div>

        {/* Quick Stats with Animation - Single Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 overflow-hidden">
          {isLoading
            ? // Loading skeleton for stats
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="bg-gray-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg overflow-hidden"
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <Skeleton className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl bg-white/20" />
                    <Skeleton className="h-6 sm:h-7 md:h-8 w-12 sm:w-14 md:w-16 bg-white/80" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-18 md:w-20 bg-white/60" />
                  </div>
                </motion.div>
              ))
            : modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${module.color} rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg overflow-hidden min-h-[100px] sm:min-h-[120px]`}
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 h-full justify-center">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0"
                    >
                      <module.metric.icon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8" />
                    </motion.div>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-words leading-tight">
                      {module.metric.value}
                    </p>
                    <p className="text-xs sm:text-sm text-white/90 break-words leading-tight">
                      {module.metric.label}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Main Modules with Animation */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="min-w-0"
              >
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 h-full overflow-hidden flex flex-col min-h-[320px]">
                  <CardHeader className="pb-3 sm:pb-6 min-w-0 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className={`w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 ${module.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto sm:mx-0 flex-shrink-0`}
                      >
                        <Icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white" />
                      </motion.div>
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl break-words">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base break-words">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 min-w-0 flex-1 flex flex-col justify-end pb-4">
                    {/* Actions */}
                    <div className="mt-auto pt-4">
                      <Button
                        variant="default"
                        size="default"
                        className="w-full text-sm sm:text-base h-10"
                        asChild
                      >
                        <Link
                          href={module.actions[0].href}
                          className="flex items-center justify-center"
                        >
                          <span className="truncate">
                            {module.actions[0].label}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Information Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BrainCircuit className="w-6 h-6 text-gray-600" />
              Bienvenido a CEMSE
            </DialogTitle>
            <DialogDescription className="text-base">
              Tu plataforma integral para el desarrollo personal y profesional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Introduction */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                ¿Qué es CEMSE?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                CEMSE es una plataforma diseñada especialmente para jóvenes como
                tú, donde puedes encontrar oportunidades de empleo, cursos de
                capacitación, recursos para emprender y conectarte con
                instituciones que pueden ayudarte a alcanzar tus metas
                profesionales.
              </p>
            </div>

            {/* What you can do */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ¿Qué puedes hacer aquí?
              </h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Buscar Empleo</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Explora ofertas de trabajo de empresas locales y
                      regionales. Aplica a posiciones que se ajusten a tu perfil
                      y experiencia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tomar Cursos</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Accede a cursos de capacitación y formación profesional.
                      Mejora tus habilidades y obtén certificaciones
                      reconocidas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Emprender</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Desarrolla tu idea de negocio con recursos, mentorías y
                      conexiones con otros emprendedores e inversionistas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Conectar con Instituciones
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Conoce y conecta con gobiernos municipales, ONGs, centros
                      de formación y otras instituciones que pueden apoyar tu
                      desarrollo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                ¿Cómo empezar?
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-gray-600">
                <p className="leading-relaxed">
                  1. <strong>Completa tu perfil:</strong> Añade tu información
                  personal, habilidades e intereses
                </p>
                <p className="leading-relaxed">
                  2. <strong>Explora las secciones:</strong> Navega por empleos,
                  cursos y oportunidades de emprendimiento
                </p>
                <p className="leading-relaxed">
                  3. <strong>Mantente actualizado:</strong> Revisa las noticias
                  y actualizaciones de la plataforma
                </p>
                <p className="leading-relaxed">
                  4. <strong>Conecta:</strong> Interactúa con empresas e
                  instituciones que te interesen
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                💡 Consejos para aprovechar al máximo la plataforma:
              </h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li className="leading-relaxed">
                  • Mantén tu perfil actualizado con tus últimas experiencias
                </li>
                <li className="leading-relaxed">
                  • Revisa regularmente las nuevas oportunidades disponibles
                </li>
                <li className="leading-relaxed">
                  • Participa activamente en cursos y programas de formación
                </li>
                <li className="leading-relaxed">
                  • No dudes en contactar a las instituciones para más
                  información
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowInfoModal(false)}
              className="w-full sm:w-auto"
            >
              Entendido, ¡empecemos!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
