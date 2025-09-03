"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  MapPin,
  Download,
  X,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useProfilesByRole,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
} from "@/hooks/useProfileApi";
import { Profile } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";

export default function StudentsManagementPage() {
  const { data: students, loading, error } = useProfilesByRole("YOUTH");
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [educationFilter, setEducationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Calculate real stats from data
  const stats = React.useMemo(() => {
    if (!students)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        totalStudents: 0,
        averageCompletion: 0,
      };

    const total = students.length;
    const active = students.filter((s) => s.status === "ACTIVE").length;
    const inactive = students.filter((s) => s.status === "INACTIVE").length;
    const pending = students.filter((s) => s.status === "PENDING").length;
    const totalStudents = total;
    const averageCompletion =
      total > 0
        ? Math.round(
            students.reduce((sum, s) => sum + (s.profileCompletion || 0), 0) /
              total
          )
        : 0;

    return {
      total,
      active,
      inactive,
      pending,
      totalStudents,
      averageCompletion,
    };
  }, [students]);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<Profile>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    municipality: "",
    department: "",
    country: "Bolivia",
    birthDate: undefined,
    gender: undefined,
    educationLevel: undefined,
    currentInstitution: "",
    graduationYear: undefined,
    isStudying: false,
    skills: [],
    interests: [],
    status: "ACTIVE",
    profileCompletion: 0,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData({ ...formData, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData({ ...formData, avatarUrl: "" });
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      municipality: "",
      department: "",
      country: "Bolivia",
      birthDate: undefined,
      gender: undefined,
      educationLevel: undefined,
      currentInstitution: "",
      graduationYear: undefined,
      isStudying: false,
      skills: [],
      interests: [],
      status: "ACTIVE",
      profileCompletion: 0,
    });
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleCreate = async () => {
    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.municipality ||
        !formData.department ||
        !formData.country ||
        !formData.status
      ) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }

      const newStudentData = {
        ...formData,
        role: "YOUTH" as const,
        active: true,
      };

      await createProfile.create(newStudentData);

      setShowCreateDialog(false);
      resetForm();
      setSuccessDialogOpen(true);
      toast({
        title: "Éxito",
        description: "Estudiante creado exitosamente",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: "Error al crear el estudiante",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Profile) => {
    setSelectedStudent(student);
    setFormData(student);
    setAvatarPreview(student.avatarUrl || "");
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedStudent?.id) return;

      const updatedStudentData = {
        ...formData,
        updatedAt: new Date(),
      };

      await updateProfile.update(selectedStudent.id, updatedStudentData);

      setShowEditDialog(false);
      setSelectedStudent(null);
      resetForm();
      toast({
        title: "Éxito",
        description: "Estudiante actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el estudiante",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedStudent?.id) return;

      await deleteProfile.remove(selectedStudent.id);

      setShowDeleteDialog(false);
      setSelectedStudent(null);
      toast({
        title: "Éxito",
        description: "Estudiante eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el estudiante",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activa";
      case "INACTIVE":
        return "Inactiva";
      case "PENDING":
        return "Pendiente";
      default:
        return status;
    }
  };

  // Enhanced filtering with real data
  const filteredStudents = React.useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      if (!student) return false;

      const searchLower = (searchTerm || "").toLowerCase();
      const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
      const studentEmail = (student.email || "").toLowerCase();
      const studentMunicipality = (student.municipality || "").toLowerCase();

      const matchesSearch =
        studentName.includes(searchLower) ||
        studentEmail.includes(searchLower) ||
        studentMunicipality.includes(searchLower);

      const matchesEducation =
        educationFilter === "all" || student.educationLevel === educationFilter;

      const matchesStatus =
        statusFilter === "all" ||
        student.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesEducation && matchesStatus;
    });
  }, [students, searchTerm, educationFilter, statusFilter]);

  // Show error if data loading fails
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground">
              Administra todos los estudiantes registrados en la plataforma
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">
                Error al cargar los datos: {error.message}
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
          <p className="text-muted-foreground">
            Administra todos los estudiantes registrados en la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Estudiante</DialogTitle>
                <DialogDescription>
                  Registra un nuevo estudiante en la plataforma
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                  <TabsTrigger value="skills">Habilidades</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="grid gap-2">
                    <Label>Foto de Perfil</Label>
                    {avatarPreview ? (
                      <div className="relative w-24 h-24">
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={avatarPreview || "/placeholder.svg"}
                            alt="Avatar preview"
                          />
                          <AvatarFallback>
                            <Users className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeAvatar}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-32">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                        >
                          Subir Foto
                        </Label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Juan Carlos"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="juan.perez@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+591 700 123 456"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Masculino</SelectItem>
                          <SelectItem value="FEMALE">Femenino</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as Profile["status"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="educationLevel">Nivel Educativo</Label>
                      <Select
                        value={formData.educationLevel}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            educationLevel: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Primaria</SelectItem>
                          <SelectItem value="SECONDARY">Secundaria</SelectItem>
                          <SelectItem value="UNIVERSITY">
                            Universidad
                          </SelectItem>
                          <SelectItem value="TECHNICAL">Técnico</SelectItem>
                          <SelectItem value="POSTGRADUATE">
                            Postgrado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="graduationYear">Año de Graduación</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={formData.graduationYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            graduationYear:
                              Number.parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="currentInstitution">
                      Institución Actual
                    </Label>
                    <Input
                      id="currentInstitution"
                      value={formData.currentInstitution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentInstitution: e.target.value,
                        })
                      }
                      placeholder="Universidad Mayor de San Simón"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Av. Principal 123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="municipality">Municipio</Label>
                      <Select
                        value={formData.municipality}
                        onValueChange={(value) =>
                          setFormData({ ...formData, municipality: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar municipio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="La Paz">La Paz</SelectItem>
                          <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                          <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                          <SelectItem value="Sucre">Sucre</SelectItem>
                          <SelectItem value="Potosí">Potosí</SelectItem>
                          <SelectItem value="Oruro">Oruro</SelectItem>
                          <SelectItem value="Tarija">Tarija</SelectItem>
                          <SelectItem value="Beni">Beni</SelectItem>
                          <SelectItem value="Pando">Pando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          setFormData({ ...formData, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="La Paz">La Paz</SelectItem>
                          <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                          <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                          <SelectItem value="Chuquisaca">Chuquisaca</SelectItem>
                          <SelectItem value="Potosí">Potosí</SelectItem>
                          <SelectItem value="Oruro">Oruro</SelectItem>
                          <SelectItem value="Tarija">Tarija</SelectItem>
                          <SelectItem value="Beni">Beni</SelectItem>
                          <SelectItem value="Pando">Pando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skills">
                      Habilidades (separadas por comas)
                    </Label>
                    <Input
                      id="skills"
                      value={formData.skills?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      placeholder="JavaScript, React, HTML, CSS, Excel"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="interests">
                      Intereses (separados por comas)
                    </Label>
                    <Input
                      id="interests"
                      value={formData.interests?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          interests: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      placeholder="Programación, Tecnología, Música, Deportes"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="isStudying">
                      ¿Está estudiando actualmente?
                    </Label>
                    <Select
                      value={formData.isStudying ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          isStudying: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    !formData.firstName ||
                    !formData.lastName ||
                    createProfile.loading
                  }
                >
                  {createProfile.loading ? "Creando..." : "Crear Estudiante"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStudents.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completitud Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletion}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nivel Educativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="PRIMARY">Primaria</SelectItem>
                <SelectItem value="SECONDARY">Secundaria</SelectItem>
                <SelectItem value="UNIVERSITY">Universidad</SelectItem>
                <SelectItem value="TECHNICAL">Técnico</SelectItem>
                <SelectItem value="POSTGRADUATE">Postgrado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="INACTIVE">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Gestiona todos los estudiantes registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Educación</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Completitud</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      Cargando estudiantes...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ||
                    educationFilter !== "all" ||
                    statusFilter !== "all"
                      ? "No se encontraron estudiantes con los filtros aplicados"
                      : "No hay estudiantes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={student.avatarUrl || "/placeholder.svg"}
                            alt={`${student.firstName} ${student.lastName}`}
                          />
                          <AvatarFallback>
                            <Users className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.currentInstitution || "Sin institución"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {student.educationLevel || "No especificado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">
                          {student.municipality}, {student.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusText(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${student.profileCompletion || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {student.profileCompletion || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(student)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Estudiante</DialogTitle>
            <DialogDescription>
              Modifica la información de {selectedStudent?.firstName}{" "}
              {selectedStudent?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Nombre *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Apellido *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.status || "ACTIVE"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as Profile["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedStudent(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateProfile.loading}>
              {updateProfile.loading
                ? "Actualizando..."
                : "Actualizar Estudiante"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              estudiante &quot;{selectedStudent?.firstName}{" "}
              {selectedStudent?.lastName}&quot; y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStudent(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProfile.loading}
            >
              {deleteProfile.loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Estudiante creado!</DialogTitle>
            <DialogDescription>
              El estudiante fue registrado exitosamente en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessDialogOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
