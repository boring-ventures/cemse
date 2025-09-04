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
import { useUserManagement, UserData, User } from "@/hooks/useUserManagement";
import { useToast } from "@/components/ui/use-toast";

export default function UsersManagementPage() {
  const { createUser, updateUser, deleteUser, getUsers, loading, error } =
    useUserManagement();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("YOUTH");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const filters = {
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchTerm || undefined,
      };
      const fetchedUsers = await getUsers(filters);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive",
      });
    }
  };

  // Calculate real stats from data
  const stats = React.useMemo(() => {
    if (!users)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        youth: 0,
        companies: 0,
        municipalities: 0,
      };

    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const youth = users.filter((u) => u.role === "YOUTH").length;
    const companies = users.filter((u) => u.role === "COMPANIES").length;
    const municipalities = users.filter(
      (u) => u.role === "MUNICIPAL_GOVERNMENTS"
    ).length;

    return {
      total,
      active,
      inactive,
      youth,
      companies,
      municipalities,
    };
  }, [users]);

  // Form state for create/edit
  const [formData, setFormData] = useState<UserData>({
    username: "",
    password: "",
    role: "YOUTH",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    municipality: "",
    department: "Cochabamba",
    country: "Bolivia",
    birthDate: "",
    gender: "",
    educationLevel: "",
    currentInstitution: "",
    graduationYear: undefined,
    isStudying: false,
    skills: [],
    interests: [],
    status: "ACTIVE",
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
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "YOUTH",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      municipality: "",
      department: "Cochabamba",
      country: "Bolivia",
      birthDate: "",
      gender: "",
      educationLevel: "",
      currentInstitution: "",
      graduationYear: undefined,
      isStudying: false,
      skills: [],
      interests: [],
      status: "ACTIVE",
    });
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleCreate = async () => {
    try {
      if (
        !formData.username ||
        !formData.password ||
        !formData.role ||
        !formData.firstName ||
        !formData.lastName
      ) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }

      // Validate password strength
      if (!formData.password || formData.password.length < 6) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 6 caracteres",
          variant: "destructive",
        });
        return;
      }

      await createUser(formData);

      setShowCreateDialog(false);
      resetForm();
      setSuccessDialogOpen(true);
      toast({
        title: "Éxito",
        description: "Usuario creado exitosamente",
      });

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      password: "", // Don't show password in edit
      role: user.role || "YOUTH",
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      email: user.profile?.email || "",
      phone: user.profile?.phone || "",
      address: user.profile?.address || "",
      municipality: user.profile?.municipality || "",
      department: user.profile?.department || "Cochabamba",
      country: user.profile?.country || "Bolivia",
      birthDate: user.profile?.birthDate || "",
      gender: user.profile?.gender || "",
      educationLevel: user.profile?.educationLevel || "",
      currentInstitution: user.profile?.currentInstitution || "",
      graduationYear: user.profile?.graduationYear || undefined,
      isStudying: user.profile?.isStudying || false,
      skills: user.profile?.skills || [],
      interests: user.profile?.interests || [],
      status: user.profile?.status || "ACTIVE",
    });
    setAvatarPreview(user.profile?.avatarUrl || "");
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedUser?.id) return;

      const updateData = { ...formData };
      // Only include password if it was changed and not empty
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      console.log("Updating user with data:", updateData);
      await updateUser(selectedUser.id, updateData);

      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: "Éxito",
        description: "Usuario actualizado exitosamente",
      });

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Error al actualizar el usuario: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedUser?.id) return;

      await deleteUser(selectedUser.id);

      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente",
      });

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
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
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "INACTIVE":
        return "Inactivo";
      case "PENDING_VERIFICATION":
        return "Pendiente";
      case "SUSPENDED":
        return "Suspendido";
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Joven";
      case "ADOLESCENTS":
        return "Adolescente";
      case "COMPANIES":
        return "Empresa";
      case "MUNICIPAL_GOVERNMENTS":
        return "Gobierno Municipal";
      case "TRAINING_CENTERS":
        return "Centro de Entrenamiento";
      case "NGOS_AND_FOUNDATIONS":
        return "ONG/Fundación";
      case "INSTRUCTOR":
        return "Instructor";
      case "SUPERADMIN":
        return "Super Admin";
      default:
        return role;
    }
  };

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Skip users without profiles
      if (!user.profile) return false;

      const searchLower = (searchTerm || "").toLowerCase();
      const userName =
        `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.toLowerCase();
      const userEmail = (user.profile.email || "").toLowerCase();
      const userUsername = user.username.toLowerCase();

      const matchesSearch =
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        userUsername.includes(searchLower);

      const matchesRole = user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Show error if data loading fails
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra todos los usuarios registrados en la plataforma
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error al cargar los datos: {error}</p>
              <Button onClick={() => loadUsers()} className="mt-4">
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
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios registrados en la plataforma
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
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Registra un nuevo usuario en la plataforma con credenciales de
                  acceso
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="credentials">Credenciales</TabsTrigger>
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                  <TabsTrigger value="skills">Habilidades</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Nombre de Usuario *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          })
                        }
                        placeholder="juan.perez"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YOUTH">Joven</SelectItem>
                        <SelectItem value="ADOLESCENTS">Adolescente</SelectItem>
                        <SelectItem value="COMPANIES">Empresa</SelectItem>
                        <SelectItem value="MUNICIPAL_GOVERNMENTS">
                          Gobierno Municipal
                        </SelectItem>
                        <SelectItem value="TRAINING_CENTERS">
                          Centro de Entrenamiento
                        </SelectItem>
                        <SelectItem value="NGOS_AND_FOUNDATIONS">
                          ONG/Fundación
                        </SelectItem>
                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

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
                    <Label htmlFor="email">Email</Label>
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
                        value={formData.gender || ""}
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
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="PENDING_VERIFICATION">
                          Pendiente
                        </SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="educationLevel">Nivel Educativo</Label>
                      <Select
                        value={formData.educationLevel || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            educationLevel: value,
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
                        value={formData.graduationYear || ""}
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
                        value={formData.municipality || ""}
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
                        value={formData.department || ""}
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
                    !formData.username ||
                    !formData.password ||
                    !formData.firstName ||
                    !formData.lastName ||
                    loading
                  }
                >
                  {loading ? "Creando..." : "Crear Usuario"}
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
              Total Usuarios
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
            <CardTitle className="text-sm font-medium">Jóvenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.youth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.companies}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municipios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.municipalities}
            </div>
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
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YOUTH">Jóvenes</SelectItem>
                <SelectItem value="ADOLESCENTS">Adolescentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona todos los usuarios registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
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
                      Cargando usuarios...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm
                      ? "No se encontraron usuarios con los filtros aplicados"
                      : "No hay usuarios jóvenes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.profile?.avatarUrl || "/placeholder.svg"}
                            alt={`${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`}
                          />
                          <AvatarFallback>
                            <Users className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.profile?.firstName || ""}{" "}
                            {user.profile?.lastName || ""}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.profile?.email || "Sin email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">
                          {user.profile?.municipality || "No especificado"},{" "}
                          {user.profile?.department || "No especificado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(
                          user.profile?.status || "ACTIVE"
                        )}
                      >
                        {getStatusText(user.profile?.status || "ACTIVE")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${user.profile?.profileCompletion || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {user.profile?.profileCompletion || 0}%
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
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
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
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información de{" "}
              {selectedUser?.profile?.firstName || ""}{" "}
              {selectedUser?.profile?.lastName || ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Nombre de Usuario</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">
                  Nueva Contraseña (opcional)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Nombre *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Apellido *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={loading || !formData.firstName || !formData.lastName}
            >
              {loading ? "Actualizando..." : "Actualizar Usuario"}
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
              usuario &quot;{selectedUser?.profile?.firstName || ""}{" "}
              {selectedUser?.profile?.lastName || ""}&quot; y todos sus datos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Usuario creado!</DialogTitle>
            <DialogDescription>
              El usuario fue registrado exitosamente en el sistema con
              credenciales de acceso.
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
