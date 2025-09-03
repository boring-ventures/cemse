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
  Download,
  ExternalLink,
  FileText,
  FileVideo,
  FileImage,
  FileAudio,
  FileArchive,
  Link as LinkIcon,
  ArrowLeft,
  GripVertical,
  Search,
  Upload,
  File,
  Settings,
  Copy,
  Share,
} from "lucide-react";
import {
  useLessonResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "@/hooks/useLessonResourceApi";
import { copyToClipboard } from "@/lib/utils";

import { ResourceViewer } from "@/components/resources/ResourceViewer";
import { ResourceStats } from "@/components/resources/ResourceStats";
import { FileUpload } from "@/components/resources/FileUpload";
import { toast } from "sonner";

export default function LessonResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PDF" as
      | "PDF"
      | "DOCUMENT"
      | "VIDEO"
      | "AUDIO"
      | "IMAGE"
      | "LINK"
      | "ZIP"
      | "OTHER",
    url: "",
    filePath: "",
    fileSize: 0,
    orderIndex: 1,
    isDownloadable: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingResource, setViewingResource] = useState<any>(null);

  // Hooks
  const { data: resourcesData, isLoading: resourcesLoading } =
    useLessonResources(lessonId);
  const resources = resourcesData?.resources || [];
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  // Filter resources
  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateResource = async () => {
    try {
      setIsUploading(true);

      await createResource.mutateAsync({
        lessonId,
        ...formData,
        file: selectedFile || undefined,
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "PDF",
        url: "",
        filePath: "",
        fileSize: 0,
        orderIndex: 1,
        isDownloadable: true,
      });
      setSelectedFile(null);
      toast.success("Recurso creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el recurso");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;

    try {
      await updateResource.mutateAsync({
        id: editingResource.id,
        ...formData,
      });

      setIsEditDialogOpen(false);
      setEditingResource(null);
      setFormData({
        title: "",
        description: "",
        type: "PDF",
        url: "",
        filePath: "",
        fileSize: 0,
        orderIndex: 1,
        isDownloadable: true,
      });
      toast.success("Recurso actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el recurso");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      try {
        await deleteResource.mutateAsync(resourceId);
        toast.success("Recurso eliminado exitosamente");
      } catch (error) {
        toast.error("Error al eliminar el recurso");
      }
    }
  };

  const openEditDialog = (resource: any) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      url: resource.url,
      filePath: resource.filePath || "",
      fileSize: resource.fileSize || 0,
      orderIndex: resource.orderIndex,
      isDownloadable: resource.isDownloadable,
    });
    setIsEditDialogOpen(true);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />;
      case "VIDEO":
        return <FileVideo className="h-4 w-4" />;
      case "AUDIO":
        return <FileAudio className="h-4 w-4" />;
      case "IMAGE":
        return <FileImage className="h-4 w-4" />;
      case "LINK":
        return <LinkIcon className="h-4 w-4" />;
      case "ZIP":
        return <FileArchive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case "PDF":
        return "PDF";
      case "DOCUMENT":
        return "Documento";
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "IMAGE":
        return "Imagen";
      case "LINK":
        return "Enlace";
      case "ZIP":
        return "Archivo ZIP";
      default:
        return "Otro";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getResourceStats = (resourceId: string) => {
    // Mock stats - in real implementation, fetch from API
    return {
      downloads: 45,
      views: 120,
      lastDownloaded: new Date("2024-01-15T10:30:00Z"),
    };
  };

  if (resourcesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded" />
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
            <Link
              href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lecciones
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📎 Gestión de Recursos</h1>
            <p className="text-muted-foreground">
              Administra los recursos multimedia de la lección
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Recurso</DialogTitle>
              <DialogDescription>
                Agrega un nuevo recurso multimedia a la lección.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Título del Recurso</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ej: Guía completa de HTML"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Descripción</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe el recurso..."
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="type">Tipo de Recurso</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCUMENT">Documento</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="AUDIO">Audio</SelectItem>
                    <SelectItem value="IMAGE">Imagen</SelectItem>
                    <SelectItem value="LINK">Enlace</SelectItem>
                    <SelectItem value="ZIP">Archivo ZIP</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="url">
                  URL del Recurso (opcional si subes un archivo)
                </label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com/resource.pdf"
                  disabled={!!selectedFile}
                />
              </div>
              <div className="grid gap-2">
                <label>Archivo (opcional)</label>
                <FileUpload
                  selectedFile={selectedFile}
                  onFileSelect={(file) => {
                    setSelectedFile(file);
                    // Auto-detect type based on file extension
                    const extension = file.name.split(".").pop()?.toLowerCase();
                    let detectedType = formData.type;

                    if (extension === "pdf") detectedType = "PDF";
                    else if (["doc", "docx"].includes(extension || ""))
                      detectedType = "DOCUMENT";
                    else if (["mp4", "webm", "ogg"].includes(extension || ""))
                      detectedType = "VIDEO";
                    else if (["mp3", "wav"].includes(extension || ""))
                      detectedType = "AUDIO";
                    else if (
                      ["jpg", "jpeg", "png", "gif"].includes(extension || "")
                    )
                      detectedType = "IMAGE";
                    else if (extension === "zip") detectedType = "ZIP";
                    else detectedType = "OTHER";

                    setFormData({ ...formData, type: detectedType });
                  }}
                  onFileRemove={() => setSelectedFile(null)}
                  maxSize={50 * 1024 * 1024} // 50MB
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="orderIndex">Orden</label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderIndex: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="fileSize">Tamaño (bytes)</label>
                  <Input
                    id="fileSize"
                    type="number"
                    value={formData.fileSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fileSize: parseInt(e.target.value),
                      })
                    }
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDownloadable"
                  checked={formData.isDownloadable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isDownloadable: e.target.checked,
                    })
                  }
                />
                <label htmlFor="isDownloadable">Permitir descarga</label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateResource}
                disabled={createResource.isPending || isUploading}
              >
                {createResource.isPending || isUploading
                  ? "Subiendo..."
                  : "Crear Recurso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resource Statistics */}
      <ResourceStats resources={resources} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar recursos..."
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
                  <TableHead>Recurso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Descarga</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => {
                  const stats = getResourceStats(resource.id);
                  return (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            {getResourceTypeIcon(resource.type)}
                          </div>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Recurso {resource.orderIndex}
                            </div>
                            {resource.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {resource.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getResourceTypeIcon(resource.type)}
                          <span className="ml-1">
                            {getResourceTypeLabel(resource.type)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {resource.fileSize
                          ? formatFileSize(resource.fileSize)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Download className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.downloads} descargas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.views} vistas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-xs text-muted-foreground">
                              Última:{" "}
                              {stats.lastDownloaded.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            resource.isDownloadable ? "default" : "secondary"
                          }
                        >
                          {resource.isDownloadable
                            ? "Disponible"
                            : "No disponible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {resource.updatedAt
                          ? new Date(resource.updatedAt).toLocaleDateString()
                          : "N/A"}
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
                              onClick={() => setViewingResource(resource)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Vista previa
                            </DropdownMenuItem>
                            {resource.isDownloadable && (
                              <DropdownMenuItem asChild>
                                <a href={resource.url} download>
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir enlace
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await copyToClipboard(
                                  resource.url,
                                  () => {
                                    // Success callback - could add toast here if needed
                                  },
                                  (errorMessage) => {
                                    console.error(
                                      "Failed to copy resource URL:",
                                      errorMessage
                                    );
                                  }
                                );
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar URL
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(resource)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteResource(resource.id)}
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

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron recursos
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando recursos multimedia a la lección"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Recurso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Recurso</DialogTitle>
            <DialogDescription>
              Modifica la información del recurso seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Título del Recurso</label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Guía completa de HTML"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Descripción</label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe el recurso..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-type">Tipo de Recurso</label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCUMENT">Documento</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                  <SelectItem value="IMAGE">Imagen</SelectItem>
                  <SelectItem value="LINK">Enlace</SelectItem>
                  <SelectItem value="ZIP">Archivo ZIP</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-url">URL del Recurso</label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/resource.pdf"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-orderIndex">Orden</label>
                <Input
                  id="edit-orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderIndex: parseInt(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-fileSize">Tamaño (bytes)</label>
                <Input
                  id="edit-fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fileSize: parseInt(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isDownloadable"
                checked={formData.isDownloadable}
                onChange={(e) =>
                  setFormData({ ...formData, isDownloadable: e.target.checked })
                }
              />
              <label htmlFor="edit-isDownloadable">Permitir descarga</label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditResource}
              disabled={updateResource.isPending}
            >
              {updateResource.isPending
                ? "Actualizando..."
                : "Actualizar Recurso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Viewer Modal */}
      {viewingResource && (
        <ResourceViewer
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      )}
    </div>
  );
}
