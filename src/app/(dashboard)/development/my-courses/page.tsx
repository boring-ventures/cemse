"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Play,
  Search,
  Filter,
  CheckCircle,
  Award,
  Calendar,
  Target,
  GraduationCap,
} from "lucide-react";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollments";
import Link from "next/link";

export default function MyCoursesPage() {
  console.log("🔍 MyCoursesPage - Component rendered");
  const { enrollments, loading, error } = useCourseEnrollments();

  console.log("🔍 MyCoursesPage - enrollments:", enrollments);
  console.log("🔍 MyCoursesPage - loading:", loading);
  console.log("🔍 MyCoursesPage - error:", error);
  console.log(
    "🔍 MyCoursesPage - enrollments length:",
    enrollments?.length || 0
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "ENROLLED":
        return "bg-yellow-100 text-yellow-800";
      case "DROPPED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completado";
      case "IN_PROGRESS":
        return "En Progreso";
      case "ENROLLED":
        return "Inscrito";
      case "DROPPED":
        return "Abandonado";
      default:
        return status;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeSpent = (seconds: number | undefined | null) => {
    if (!seconds || seconds === 0) return "0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Filtrar y ordenar cursos
  const filteredEnrollments = enrollments
    .filter((enrollment) => {
      const courseTitle = enrollment.course?.title || "";
      const courseDescription = enrollment.course?.description || "";
      const matchesSearch =
        courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || enrollment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.enrolledAt || 0).getTime() -
            new Date(a.enrolledAt || 0).getTime()
          );
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        case "name":
          return (a.course?.title || "").localeCompare(b.course?.title || "");
        default:
          return 0;
      }
    });

  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "IN_PROGRESS"
  ).length;
  const totalTimeSpent = enrollments.reduce(
    (total, e) => total + (e.timeSpent || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona tu progreso y continúa aprendiendo
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total Cursos
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {enrollments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Completados
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {completedCourses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    En Progreso
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {inProgressCourses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tiempo Total
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {formatTimeSpent(totalTimeSpent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en mis cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ENROLLED">Inscrito</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="DROPPED">Abandonado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="progress">Por progreso</SelectItem>
                  <SelectItem value="name">Por nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">
              {filteredEnrollments.length} curso
              {filteredEnrollments.length !== 1 ? "s" : ""} encontrado
              {filteredEnrollments.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {filteredEnrollments.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No tienes cursos inscritos
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No se encontraron cursos con los filtros aplicados."
                    : "Explora nuestro catálogo de cursos y comienza tu aprendizaje."}
                </p>
                <Button asChild>
                  <Link href="/development/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredEnrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                          {enrollment.course?.title || "Sin título"}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {enrollment.course?.description || "Sin descripción"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatDuration(enrollment.course?.duration || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            {enrollment.enrolledAt
                              ? new Date(
                                  enrollment.enrolledAt
                                ).toLocaleDateString()
                              : "Fecha no disponible"}
                          </span>
                        </div>
                      </div>

                      <Badge className={getStatusColor(enrollment.status)}>
                        {getStatusLabel(enrollment.status)}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          Tiempo invertido
                        </p>
                        <p className="font-medium">
                          {formatTimeSpent(enrollment.timeSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Módulos completados
                        </p>
                        <p className="font-medium">
                          {enrollment.moduleProgress
                            ? Object.values(enrollment.moduleProgress).filter(
                                (p: any) => p.completed
                              ).length
                            : 0}{" "}
                          / {enrollment.course?.modules?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/development/courses/${enrollment.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">
                            {enrollment.status === "COMPLETED"
                              ? "Ver Certificado"
                              : "Continuar"}
                          </span>
                          <span className="sm:hidden">
                            {enrollment.status === "COMPLETED"
                              ? "Certificado"
                              : "Continuar"}
                          </span>
                        </Link>
                      </Button>

                      {enrollment.certificateIssued && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Certificado</span>
                          <span className="sm:hidden">Cert.</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
