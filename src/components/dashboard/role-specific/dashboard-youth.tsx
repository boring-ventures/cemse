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

  // Debug: Log all news and their author types
  console.log("🔍 Dashboard Youth - All news:", allNews);
  console.log(
    "🔍 Dashboard Youth - Author types:",
    allNews?.map((news) => ({
      id: news.id,
      authorType: news.authorType,
      authorName: news.authorName,
    }))
  );

  // Show all news without filtering by type for now
  const allNewsArray = allNews || [];

  // Split news into two columns for display
  const companyNews = allNewsArray.slice(0, Math.ceil(allNewsArray.length / 2));
  const governmentNews = allNewsArray.slice(Math.ceil(allNewsArray.length / 2));

  // Debug: Log filtered results
  console.log("🔍 Dashboard Youth - Company news count:", companyNews.length);
  console.log(
    "🔍 Dashboard Youth - Government news count:",
    governmentNews.length
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
        <div className="relative h-40">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-5 h-5">
                <AvatarImage
                  src={article.authorLogo}
                  alt={article.authorName}
                />
                <AvatarFallback>
                  {article.authorType === "COMPANY" ? (
                    <Building2 className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white/90">
                {article.authorName}
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {article.summary}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatTimeAgo(article.publishedAt || article.createdAt)}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Ver más
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Centro de Noticias</h2>
        <p className="text-muted-foreground">
          Mantente informado sobre las últimas novedades
        </p>
        {/* Debug button */}
        <Button
          onClick={() => {
            console.log("🔄 Debug - Forcing refetch");
            refetch();
          }}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          🔄 Forzar Actualización
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company News Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Noticias Recientes</h3>
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
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {companyNews.length > 0 ? (
            <NewsCard article={companyNews[companyIndex]} />
          ) : (
            <Card className="p-6 text-center border-dashed">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay noticias disponibles
              </p>
            </Card>
          )}
        </div>

        {/* Government/NGO News Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Más Noticias</h3>
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
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {governmentNews.length > 0 ? (
            <NewsCard article={governmentNews[governmentIndex]} />
          ) : (
            <Card className="p-6 text-center border-dashed">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay más noticias disponibles
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/news">
            <Newspaper className="w-4 h-4 mr-2" />
            Ver Todas las Noticias
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function DashboardYouth() {
  const { data: dashboardData, isLoading, error } = useDashboard();

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
      <div className="space-y-8 px-10 py-4">
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
      actions: [
        { label: "Explorar", href: "/jobs/browse" },
        { label: "Mis Postulaciones", href: "/jobs/applications" },
      ],
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
      actions: [
        { label: "Explorar Cursos", href: "/courses" },
        { label: "Mis Cursos", href: "/my-courses" },
      ],
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
      actions: [
        { label: "Empezar", href: "/entrepreneurship/ideas" },
        { label: "Mi Proyecto", href: "/entrepreneurship/my-project" },
      ],
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
      actions: [
        { label: "Ver Directorio", href: "/institutions" },
        { label: "Municipios", href: "/municipalities" },
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-10 py-4">
      {/* Welcome Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1 sm:space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            >
              ¡Hola! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm sm:text-lg lg:text-xl text-gray-200"
            >
              ¿Qué quieres hacer hoy?
            </motion.p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="hidden sm:block"
          >
            <BrainCircuit className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 text-gray-200" />
          </motion.div>
        </div>
      </motion.div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <NewsCarousel />
      </motion.div>

      {/* Quick Stats with Animation - Single Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
        {isLoading
          ? // Loading skeleton for stats
            [...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="bg-gray-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg"
              >
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <Skeleton className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-xl bg-white/20" />
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 bg-white/80" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-white/60" />
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
                className={`${module.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg`}
              >
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3"
                  >
                    <module.metric.icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8" />
                  </motion.div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{module.metric.value}</p>
                  <p className="text-xs sm:text-sm text-white/90">{module.metric.label}</p>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Main Modules with Animation */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className={`w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 ${module.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto sm:mx-0`}
                    >
                      <Icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl">{module.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {module.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={actionIndex === 0 ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-xs sm:text-sm"
                        asChild
                      >
                        <Link href={action.href} className="flex items-center justify-center">
                          <span className="truncate">{action.label}</span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <FileText className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-3 sm:space-y-4">
              {isLoading ? (
                // Loading skeleton for activities
                [...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl gap-2 sm:gap-0"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-5 sm:w-6 h-5 sm:h-6 rounded" />
                      <Skeleton className="h-5 sm:h-6 w-48 sm:w-64" />
                    </div>
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 ml-8 sm:ml-0" />
                  </motion.div>
                ))
              ) : activities.length > 0 ? (
                // Real activities
                activities.slice(0, 3).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    whileHover={{ x: 2 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl gap-2 sm:gap-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600 flex-shrink-0">
                        {activity.icon}
                      </div>
                      <span className="text-sm sm:text-base lg:text-lg">{activity.title}</span>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-center text-xs">
                      {activity.timestamp}
                    </Badge>
                  </motion.div>
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
