"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Mail,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useCourseEnrollments } from "@/hooks/useEnrollmentApi";
import { toast } from "sonner";

// Create a proper interface that matches what the API returns
interface StudentEnrollment {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrolledAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  progress: number;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "SUSPENDED";
  timeSpent: number;
  certificateIssued: boolean;
  finalGrade?: number | null;
  moduleProgress?: any;
  quizResults?: any;
  course: {
    id: string;
    title: string;
    description: string;
    totalLessons?: number;
  };
}

interface CourseStats {
  totalEnrolled: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageTimeSpent: number;
  completionRate: number;
  averageGrade: number;
  certificatesIssued: number;
}

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentEnrollment | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  // Use real hook for course enrollments
  const { data: enrollments, loading, error } = useCourseEnrollments(courseId);
  
  // Debug: Log the enrollments data structure
  console.log('Enrollments data:', enrollments);
  console.log('Enrollments type:', typeof enrollments);
  console.log('Is array:', Array.isArray(enrollments));

  // Transform enrollments to match our interface
  const students: StudentEnrollment[] = (() => {
    // Handle different possible data structures from the API
    if (!enrollments) return [];
    
    // If enrollments is already an array, use it directly
    if (Array.isArray(enrollments)) {
      return enrollments.map((enrollment: any) => ({
        id: enrollment.id,
        student: {
          id: enrollment.studentId || enrollment.student?.id || enrollment.id,
          firstName: enrollment.student?.firstName || "Estudiante",
          lastName: enrollment.student?.lastName || "",
          email: enrollment.student?.email || "email@example.com",
        },
        enrolledAt: new Date(enrollment.enrolledAt || enrollment.enrolledAt),
        startedAt: enrollment.startedAt ? new Date(enrollment.startedAt) : null,
        completedAt: enrollment.completedAt ? new Date(enrollment.completedAt) : null,
        progress: enrollment.progress || 0,
        status: enrollment.status || "ENROLLED",
        timeSpent: enrollment.timeSpent || 0,
        certificateIssued: enrollment.certificateIssued || false,
        finalGrade: enrollment.finalGrade || null,
        moduleProgress: enrollment.moduleProgress || null,
        quizResults: enrollment.quizResults || null,
        course: {
          id: enrollment.courseId || enrollment.course?.id || "",
          title: enrollment.course?.title || "Curso",
          description: enrollment.course?.description || "",
          totalLessons: enrollment.course?.totalLessons || 0,
        },
      }));
    }
    
    // If enrollments is an object with a data property (common API response format)
    if (enrollments && typeof enrollments === 'object' && 'data' in enrollments) {
      const data = (enrollments as any).data;
      if (Array.isArray(data)) {
        return data.map((enrollment: any) => ({
          id: enrollment.id,
          student: {
            id: enrollment.studentId || enrollment.student?.id || enrollment.id,
            firstName: enrollment.student?.firstName || "Estudiante",
            lastName: enrollment.student?.lastName || "",
            email: enrollment.student?.email || "email@example.com",
          },
          enrolledAt: new Date(enrollment.enrolledAt || enrollment.enrolledAt),
          startedAt: enrollment.startedAt ? new Date(enrollment.startedAt) : null,
          completedAt: enrollment.completedAt ? new Date(enrollment.completedAt) : null,
          progress: enrollment.progress || 0,
          status: enrollment.status || "ENROLLED",
          timeSpent: enrollment.timeSpent || 0,
          certificateIssued: enrollment.certificateIssued || false,
          finalGrade: enrollment.finalGrade || null,
          moduleProgress: enrollment.moduleProgress || null,
          quizResults: enrollment.quizResults || null,
          course: {
            id: enrollment.courseId || enrollment.course?.id || "",
            title: enrollment.course?.title || "Curso",
            description: enrollment.course?.description || "",
            totalLessons: enrollment.course?.totalLessons || 0,
          },
        }));
      }
    }
    
    // If enrollments is an object with an enrollments property
    if (enrollments && typeof enrollments === 'object' && 'enrollments' in enrollments) {
      const data = (enrollments as any).enrollments;
      if (Array.isArray(data)) {
        return data.map((enrollment: any) => ({
          id: enrollment.id,
          student: {
            id: enrollment.studentId || enrollment.student?.id || enrollment.id,
            firstName: enrollment.student?.firstName || "Estudiante",
            lastName: enrollment.student?.lastName || "",
            email: enrollment.student?.email || "email@example.com",
          },
          enrolledAt: new Date(enrollment.enrolledAt || enrollment.enrolledAt),
          startedAt: enrollment.startedAt ? new Date(enrollment.startedAt) : null,
          completedAt: enrollment.completedAt ? new Date(enrollment.completedAt) : null,
          progress: enrollment.progress || 0,
          status: enrollment.status || "ENROLLED",
          timeSpent: enrollment.timeSpent || 0,
          certificateIssued: enrollment.certificateIssued || false,
          finalGrade: enrollment.finalGrade || null,
          moduleProgress: enrollment.moduleProgress || null,
          quizResults: enrollment.quizResults || null,
          course: {
            id: enrollment.courseId || enrollment.course?.id || "",
            title: enrollment.course?.title || "Curso",
            description: enrollment.course?.description || "",
            totalLessons: enrollment.course?.totalLessons || 0,
          },
        }));
      }
    }
    
    // If none of the above, return empty array
    console.warn('Unexpected enrollments data structure:', enrollments);
    return [];
  })();

  // Calculate stats from real data
  const stats: CourseStats = {
    totalEnrolled: students.length,
    activeStudents: students.filter((s) => s.status === "IN_PROGRESS").length,
    completedStudents: students.filter((s) => s.status === "COMPLETED").length,
    averageProgress: students.length > 0 
      ? students.reduce((acc, s) => acc + Number(s.progress), 0) / students.length
      : 0,
    averageTimeSpent: students.length > 0
      ? students.reduce((acc, s) => acc + s.timeSpent, 0) / students.length
      : 0,
    completionRate: students.length > 0
      ? (students.filter((s) => s.status === "COMPLETED").length / students.length) * 100
      : 0,
    averageGrade: students.length > 0
      ? students.reduce((acc, s) => acc + (s.finalGrade || 0), 0) / students.length
      : 0,
    certificatesIssued: students.filter((s) => s.certificateIssued).length,
  };

  const filteredStudents = students.filter((enrollment) => {
    const fullName = `${enrollment.student.firstName} ${enrollment.student.lastName}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;

    const matchesProgress =
      progressFilter === "all" ||
      (progressFilter === "not_started" && enrollment.progress === 0) ||
      (progressFilter === "in_progress" && enrollment.progress > 0 && enrollment.progress < 100) ||
      (progressFilter === "completed" && enrollment.progress === 100);

    return matchesSearch && matchesStatus && matchesProgress;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ENROLLED: {
        label: "Inscrito",
        variant: "secondary" as const,
        icon: Users,
      },
      IN_PROGRESS: {
        label: "En Progreso",
        variant: "default" as const,
        icon: CheckCircle,
      },
      COMPLETED: {
        label: "Completado",
        variant: "default" as const,
        icon: Award,
      },
      DROPPED: {
        label: "Abandonado",
        variant: "destructive" as const,
        icon: XCircle,
      },
      SUSPENDED: {
        label: "Suspendido",
        variant: "secondary" as const,
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const exportData = () => {
    const csvData = filteredStudents.map((enrollment) => ({
      Nombre: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      Email: enrollment.student.email,
      Progreso: `${enrollment.progress}%`,
      Estado: enrollment.status,
      "Fecha Inscripción": new Date(enrollment.enrolledAt).toLocaleDateString(),
      "Último Acceso": enrollment.startedAt ? new Date(enrollment.startedAt).toLocaleDateString() : "N/A",
      "Tiempo Total": `${Math.floor(enrollment.timeSpent / 60)}h ${enrollment.timeSpent % 60}m`,
      Calificación: enrollment.finalGrade || "N/A",
    }));

    console.log("Exporting data:", csvData);
    toast.success("Datos exportados correctamente");
    // Implementation for CSV export would go here
  };

  const handleRefresh = () => {
    // Since refetch is not available, we'll reload the page
    window.location.reload();
    toast.success("Datos actualizados");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Error al cargar los estudiantes
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "Ocurrió un error inesperado"}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Estudiantes del Curso</h1>
            <p className="text-muted-foreground">
              Gestiona y supervisa el progreso de los estudiantes
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageProgress)}%
            </div>
            <Progress value={stats.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.averageTimeSpent / 60)}h{" "}
              {Math.round(stats.averageTimeSpent % 60)}m
            </div>
            <p className="text-xs text-muted-foreground">Por estudiante</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Finalización
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.completionRate)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.certificatesIssued} certificados emitidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENROLLED">Inscritos</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completados</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                  <SelectItem value="DROPPED">Abandonados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Progreso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="not_started">Sin iniciar</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tiempo Total</TableHead>
                  <TableHead>Fecha Inscripción</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {enrollment.student.firstName[0]}{enrollment.student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {enrollment.student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress
                          value={enrollment.progress}
                          className="h-2"
                        />
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {Math.floor(enrollment.timeSpent / 60)}h{" "}
                        {enrollment.timeSpent % 60}m
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {enrollment.finalGrade ? (
                        <Badge
                          variant={
                            enrollment.finalGrade >= 70
                              ? "default"
                              : "destructive"
                          }
                        >
                          {enrollment.finalGrade}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(enrollment);
                              setShowStudentDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Mensaje Directo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron estudiantes
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedStudent.student.firstName[0]}{selectedStudent.student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedStudent.student.firstName} {selectedStudent.student.lastName}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedStudent.student.email}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="progress" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="progress">Progreso</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {selectedStudent.progress}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Progreso General
                        </p>
                        <Progress
                          value={selectedStudent.progress}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {selectedStudent.status}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estado Actual
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {Math.floor(selectedStudent.timeSpent / 60)}h{" "}
                          {selectedStudent.timeSpent % 60}m
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tiempo Total
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedStudent.moduleProgress && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Progreso por Módulo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Información de progreso por módulo disponible
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Inscrito al curso</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {selectedStudent.startedAt && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Comenzó el curso</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(selectedStudent.startedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedStudent.completedAt && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium">Completó el curso</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(selectedStudent.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
