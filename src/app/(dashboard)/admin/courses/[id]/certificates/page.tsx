"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Eye,
  Download,
  ExternalLink,
  GraduationCap,
  Award,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share,
  Mail,
} from "lucide-react";
import { useModuleCertificates } from "@/hooks/useModuleCertificateApi";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export default function CourseCertificatesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock certificate data - in real implementation, fetch from API
  const mockCertificates = [
    {
      id: "cert_1",
      moduleId: "1",
      moduleTitle: "Fundamentos de HTML",
      studentId: "student_1",
      studentName: "Ana García",
      studentEmail: "ana.garcia@example.com",
      certificateUrl: "https://example.com/certificates/module1-student1.pdf",
      issuedAt: new Date("2024-01-15T10:30:00Z"),
      grade: 95,
      completedAt: new Date("2024-01-15T10:30:00Z"),
      status: "issued",
      certificateType: "module",
    },
    {
      id: "cert_2",
      moduleId: "2",
      moduleTitle: "CSS y Estilos",
      studentId: "student_1",
      studentName: "Ana García",
      studentEmail: "ana.garcia@example.com",
      certificateUrl: "https://example.com/certificates/module2-student1.pdf",
      issuedAt: new Date("2024-01-20T14:20:00Z"),
      grade: 88,
      completedAt: new Date("2024-01-20T14:20:00Z"),
      status: "issued",
      certificateType: "module",
    },
    {
      id: "cert_3",
      moduleId: "1",
      moduleTitle: "Fundamentos de HTML",
      studentId: "student_2",
      studentName: "Carlos Rodríguez",
      studentEmail: "carlos.rodriguez@example.com",
      certificateUrl: "https://example.com/certificates/module1-student2.pdf",
      issuedAt: new Date("2024-01-18T16:45:00Z"),
      grade: 92,
      completedAt: new Date("2024-01-18T16:45:00Z"),
      status: "issued",
      certificateType: "module",
    },
    {
      id: "cert_4",
      courseId: courseId,
      courseTitle: "Desarrollo Web Completo",
      studentId: "student_3",
      studentName: "María López",
      studentEmail: "maria.lopez@example.com",
      certificateUrl: "https://example.com/certificates/course-student3.pdf",
      issuedAt: new Date("2024-01-25T11:15:00Z"),
      grade: 96,
      completedAt: new Date("2024-01-25T11:15:00Z"),
      status: "issued",
      certificateType: "course",
    },
    {
      id: "cert_5",
      moduleId: "1",
      moduleTitle: "Fundamentos de HTML",
      studentId: "student_4",
      studentName: "Juan Pérez",
      studentEmail: "juan.perez@example.com",
      certificateUrl: null,
      issuedAt: null,
      grade: null,
      completedAt: new Date("2024-01-22T09:30:00Z"),
      status: "pending",
      certificateType: "module",
    },
  ];

  // Mock modules for filter
  const mockModules = [
    { id: "1", title: "Fundamentos de HTML" },
    { id: "2", title: "CSS y Estilos" },
    { id: "3", title: "JavaScript Básico" },
  ];

  // Filter certificates
  const filteredCertificates = mockCertificates.filter((cert) => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.moduleTitle &&
        cert.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cert.courseTitle &&
        cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule =
      moduleFilter === "all" || cert.moduleId === moduleFilter;
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;

    return matchesSearch && matchesModule && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return <Badge variant="default">Emitido</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getGradeBadge = (grade: number | null) => {
    if (!grade) return <Badge variant="outline">Sin calificación</Badge>;

    if (grade >= 90)
      return (
        <Badge variant="default" className="bg-green-600">
          Excelente ({grade}%)
        </Badge>
      );
    if (grade >= 80)
      return (
        <Badge variant="default" className="bg-blue-600">
          Muy Bueno ({grade}%)
        </Badge>
      );
    if (grade >= 70)
      return (
        <Badge variant="default" className="bg-yellow-600">
          Bueno ({grade}%)
        </Badge>
      );
    return (
      <Badge variant="default" className="bg-orange-600">
        Aprobado ({grade}%)
      </Badge>
    );
  };

  const getCertificateStats = () => {
    const totalCertificates = mockCertificates.length;
    const issuedCertificates = mockCertificates.filter(
      (c) => c.status === "issued"
    ).length;
    const pendingCertificates = mockCertificates.filter(
      (c) => c.status === "pending"
    ).length;
    const moduleCertificates = mockCertificates.filter(
      (c) => c.certificateType === "module"
    ).length;
    const courseCertificates = mockCertificates.filter(
      (c) => c.certificateType === "course"
    ).length;
    const averageGrade =
      mockCertificates
        .filter((c) => c.grade !== null)
        .reduce((acc, c) => acc + (c.grade || 0), 0) /
      mockCertificates.filter((c) => c.grade !== null).length;

    return {
      totalCertificates,
      issuedCertificates,
      pendingCertificates,
      moduleCertificates,
      courseCertificates,
      averageGrade: Math.round(averageGrade || 0),
    };
  };

  const stats = getCertificateStats();

  const handleDownloadCertificate = (
    certificateUrl: string,
    studentName: string
  ) => {
    // In real implementation, this would trigger a download
    toast.success(`Descargando certificado de ${studentName}`);
  };

  const handleViewCertificate = (certificateUrl: string) => {
    window.open(certificateUrl, "_blank");
  };

  const handleGenerateCertificate = (certificateId: string) => {
    // In real implementation, this would generate a certificate
    toast.success("Generando certificado...");
  };

  const handleSendCertificate = (studentEmail: string, studentName: string) => {
    // In real implementation, this would send the certificate via email
    toast.success(`Enviando certificado a ${studentName} (${studentEmail})`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={`/admin/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">🏆 Gestión de Certificados</h1>
            <p className="text-muted-foreground">
              Administra y emite certificados de finalización
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generar Certificados
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Certificados
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              {stats.issuedCertificates} emitidos, {stats.pendingCertificates}{" "}
              pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificados de Módulos
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moduleCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Certificados por módulos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificados de Curso
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Certificados de curso completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calificación Promedio
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio de calificaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar certificados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  {mockModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="issued">Emitidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
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
                  <TableHead>Certificado</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Emisión</TableHead>
                  <TableHead>Fecha de Completado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {cert.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{cert.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {cert.studentEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {cert.certificateType === "course"
                            ? cert.courseTitle
                            : cert.moduleTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cert.certificateType === "course"
                            ? "Certificado de Curso"
                            : "Certificado de Módulo"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {cert.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getGradeBadge(cert.grade)}</TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>
                      {cert.issuedAt ? (
                        <div>
                          <div className="text-sm">
                            {cert.issuedAt.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cert.issuedAt.toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No emitido
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {cert.completedAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cert.completedAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {cert.certificateUrl && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewCertificate(cert.certificateUrl!)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver certificado
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownloadCertificate(
                                    cert.certificateUrl!,
                                    cert.studentName
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSendCertificate(
                                    cert.studentEmail,
                                    cert.studentName
                                  )
                                }
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar por email
                              </DropdownMenuItem>
                            </>
                          )}
                          {!cert.certificateUrl &&
                            cert.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleGenerateCertificate(cert.id)
                                }
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Generar certificado
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuItem
                            onClick={async () => {
                              await copyToClipboard(
                                cert.id,
                                () => {
                                  // Success callback - could add toast here if needed
                                },
                                (errorMessage) => {
                                  console.error(
                                    "Failed to copy certificate ID:",
                                    errorMessage
                                  );
                                }
                              );
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/courses/${courseId}/certificates/${cert.id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron certificados
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || moduleFilter !== "all" || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay certificados emitidos para este curso"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Certificado de Módulo</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Certificado estándar para módulos completados
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Vista previa
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">Certificado de Curso</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Certificado premium para curso completo
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Vista previa
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Certificado Personalizado</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Crea tu propia plantilla personalizada
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Crear
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Gestionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
