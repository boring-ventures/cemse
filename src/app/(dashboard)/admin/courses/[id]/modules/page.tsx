"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Layers,
  FileText,
  Video,
  Download,
  Play,
  CheckCircle,
  Lock,
  Unlock,
  Settings,
  GraduationCap,
  Target,
  Clock,
  Users,
  ArrowLeft,
  GripVertical,
  BookOpen,
  AlertCircle,
  Search,
} from "lucide-react";
import { useCourseModules, useCreateModule, useUpdateModule, useDeleteModule } from "@/hooks/useCourseModuleApi";
// import { useModuleLessons } from "@/hooks/useLessonApi";
// import { useLessonResources } from "@/hooks/useLessonResourceApi";
// import { useModuleCertificates } from "@/hooks/useModuleCertificateApi";
import { toast } from "sonner";

export default function CourseModulesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderIndex: 1,
    estimatedDuration: 60,
    prerequisites: [] as string[],
    hasCertificate: true,
    certificateTemplate: "default",
  });

  // Hooks
  const { data: modulesData, isLoading: modulesLoading, error } = useCourseModules(courseId);
  const modules = (modulesData as any)?.modules || [];
  
  // Debug logs
  console.log('Course ID:', courseId);
  console.log('Modules Data:', modulesData);
  console.log('Modules:', modules);
  console.log('Loading:', modulesLoading);
  console.log('Error:', error);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  // Filter modules
  const filteredModules = modules.filter((module: any) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateModule = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("El título del módulo es requerido");
      return;
    }
    
    try {
      await createModule.mutateAsync({
        courseId,
        ...formData,
      });
      
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        orderIndex: 1,
        estimatedDuration: 60,
        prerequisites: [],
        hasCertificate: true,
        certificateTemplate: "default",
      });
      toast.success("Módulo creado exitosamente");
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Error al crear el módulo");
    }
  };

  const handleEditModule = async () => {
    if (!editingModule) return;
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("El título del módulo es requerido");
      return;
    }
    
    try {
      await updateModule.mutateAsync({
        id: editingModule.id,
        ...formData,
      });
      
      setIsEditDialogOpen(false);
      setEditingModule(null);
      setFormData({
        title: "",
        description: "",
        orderIndex: 1,
        estimatedDuration: 60,
        prerequisites: [],
        hasCertificate: true,
        certificateTemplate: "default",
      });
      toast.success("Módulo actualizado exitosamente");
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Error al actualizar el módulo");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este módulo?")) {
      try {
        await deleteModule.mutateAsync(moduleId);
        toast.success("Módulo eliminado exitosamente");
      } catch (error) {
        console.error("Error deleting module:", error);
        toast.error("Error al eliminar el módulo");
      }
    }
  };

  const openEditDialog = (module: any) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      orderIndex: module.orderIndex,
      estimatedDuration: module.estimatedDuration,
      prerequisites: module.prerequisites || [],
      hasCertificate: module.hasCertificate,
      certificateTemplate: module.certificateTemplate || "default",
    });
    setIsEditDialogOpen(true);
  };

  const getModuleStats = (moduleId: string) => {
    const module = modules.find((m: any) => m.id === moduleId);
    return {
      lessons: module?.lessons?.length || 0,
      resources: module?.totalResources || 0,
      certificates: module?.hasCertificate ? 1 : 0,
      duration: module?.estimatedDuration || 0,
      students: 0, // Will be implemented when enrollment system is ready
    };
  };

  if (modulesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
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
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            Error al cargar los módulos
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Cursos
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📚 Gestión de Módulos</h1>
            <p className="text-muted-foreground">
              Administra la estructura de módulos del curso
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/courses/${courseId}/preview`}>
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa del Curso
            </Link>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Módulo</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo módulo al curso con su contenido y configuración.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title">Título del Módulo</label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Fundamentos de HTML"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description">Descripción</label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el contenido del módulo..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="orderIndex">Orden</label>
                    <Input
                      id="orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="duration">Duración (minutos)</label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasCertificate"
                    checked={formData.hasCertificate}
                    onChange={(e) => setFormData({ ...formData, hasCertificate: e.target.checked })}
                  />
                  <label htmlFor="hasCertificate">Incluir certificado</label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateModule} disabled={createModule.isPending}>
                  {createModule.isPending ? "Creando..." : "Crear Módulo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar módulos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Certificado</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module: any) => {
                  const stats = getModuleStats(module.id);
                  return (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Módulo {module.orderIndex}
                            </div>
                            {module.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {module.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.lessons} lecciones</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Download className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.resources} recursos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.students} estudiantes</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{module.estimatedDuration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.isLocked ? "secondary" : "default"}>
                          {module.isLocked ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Bloqueado
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Desbloqueado
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {module.hasCertificate ? (
                          <Badge variant="outline">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No disponible</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {module.updatedAt ? new Date(module.updatedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Gestionar lecciones
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/preview`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Vista previa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/resources`}>
                                <Download className="h-4 w-4 mr-2" />
                                Recursos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/certificates`}>
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Certificados
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/progress`}>
                                <Target className="h-4 w-4 mr-2" />
                                Progreso
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(module)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron módulos
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer módulo para estructurar el curso"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Módulo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Modifica la información del módulo seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Título del Módulo</label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Fundamentos de HTML"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Descripción</label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el contenido del módulo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-orderIndex">Orden</label>
                <Input
                  id="edit-orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-duration">Duración (minutos)</label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-hasCertificate"
                checked={formData.hasCertificate}
                onChange={(e) => setFormData({ ...formData, hasCertificate: e.target.checked })}
              />
              <label htmlFor="edit-hasCertificate">Incluir certificado</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditModule} disabled={updateModule.isPending}>
              {updateModule.isPending ? "Actualizando..." : "Actualizar Módulo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
