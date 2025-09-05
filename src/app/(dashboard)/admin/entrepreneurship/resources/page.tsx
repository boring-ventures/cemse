"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/resources/FileUpload";
import {
  FileText,
  BookOpen,
  Play,
  Headphones,
  Calculator,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  Award,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "template" | "guide" | "video" | "podcast" | "tool";
  thumbnail: string;
  category: string;
  downloads: number;
  rating: number;
  author: string;
  fileUrl: string;
  fileSize: string;
  tags: string[];
  status: "published" | "draft" | "archived";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  byType: {
    template: number;
    guide: number;
    video: number;
    podcast: number;
    tool: number;
  };
  byStatus: {
    published: number;
    draft: number;
    archived: number;
  };
  featured: number;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byType: { template: 0, guide: 0, video: 0, podcast: 0, tool: 0 },
    byStatus: { published: 0, draft: 0, archived: 0 },
    featured: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state for creating/editing resources
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: "template" | "guide" | "video" | "podcast" | "tool";
    category: string;
    thumbnail: string;
    fileUrl: string;
    fileSize: string;
    tags: string;
    featured: boolean;
    status: "published" | "draft" | "archived";
  }>({
    title: "",
    description: "",
    type: "template",
    category: "Business Planning",
    thumbnail: "",
    fileUrl: "",
    fileSize: "",
    tags: "",
    featured: false,
    status: "draft",
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to render file preview
  const renderFilePreview = (resource: {
    type: string;
    fileUrl: string;
    title: string;
  }) => {
    const fileUrl = resource.fileUrl;
    const fileType = resource.type;
    const fileName = resource.title;

    // Check if it's an image
    if (
      fileUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
      fileType === "image"
    ) {
      return (
        <div className="text-center">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden text-center p-4">
            <p className="text-muted-foreground mb-2">
              No se pudo cargar la imagen
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
          </div>
        </div>
      );
    }

    // Check if it's a video
    if (fileUrl.match(/\.(mp4|webm|ogg|avi|mov)$/i) || fileType === "video") {
      return (
        <div className="text-center">
          <video
            controls
            className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          >
            <source src={fileUrl} type="video/mp4" />
            <source src={fileUrl} type="video/webm" />
            <source src={fileUrl} type="video/ogg" />
            Tu navegador no soporta el elemento de video.
          </video>
          <div className="hidden text-center p-4">
            <p className="text-muted-foreground mb-2">
              No se pudo cargar el video
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <Play className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
          </div>
        </div>
      );
    }

    // Check if it's an audio file
    if (fileUrl.match(/\.(mp3|wav|ogg|m4a)$/i) || fileType === "podcast") {
      return (
        <div className="text-center">
          <audio
            controls
            className="w-full max-w-md mx-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          >
            <source src={fileUrl} type="audio/mpeg" />
            <source src={fileUrl} type="audio/wav" />
            <source src={fileUrl} type="audio/ogg" />
            Tu navegador no soporta el elemento de audio.
          </audio>
          <div className="hidden text-center p-4">
            <p className="text-muted-foreground mb-2">
              No se pudo cargar el audio
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <Headphones className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
          </div>
        </div>
      );
    }

    // For other file types (PDFs, documents, etc.)
    return (
      <div className="text-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            {fileType === "template" && (
              <FileText className="w-8 h-8 text-gray-600" />
            )}
            {fileType === "guide" && (
              <BookOpen className="w-8 h-8 text-gray-600" />
            )}
            {fileType === "tool" && (
              <Calculator className="w-8 h-8 text-gray-600" />
            )}
            {!["template", "guide", "tool"].includes(fileType) && (
              <FileText className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">{fileName}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Abrir archivo
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const response = await fetch(
        `/api/admin/entrepreneurship/resources?${params}`
      );
      const data = await response.json();

      setResources(data.resources);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // File upload handlers
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      fileSize: formatFileSize(file.size),
    }));
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFormData((prev) => ({
      ...prev,
      fileUrl: "",
      fileSize: "",
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCreateResource = async () => {
    try {
      setIsUploading(true);

      // If there's a file, use FormData for file upload
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", selectedFile);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("type", formData.type);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("thumbnail", formData.thumbnail);
        formDataToSend.append("tags", formData.tags);
        formDataToSend.append("featured", formData.featured.toString());
        formDataToSend.append("status", formData.status);
        formDataToSend.append("author", "Administrador");

        const response = await fetch("/api/admin/entrepreneurship/resources", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          setShowCreateDialog(false);
          resetForm();
          fetchResources();
        } else {
          const errorData = await response.json();
          console.error("Error creating resource:", errorData);
        }
      } else {
        // If no file, use JSON for external URL
        const response = await fetch("/api/admin/entrepreneurship/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            tags: formData.tags.split(",").map((tag) => tag.trim()),
            author: "Administrador",
          }),
        });

        if (response.ok) {
          setShowCreateDialog(false);
          resetForm();
          fetchResources();
        }
      }
    } catch (error) {
      console.error("Error creating resource:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "template",
      category: "Business Planning",
      thumbnail: "",
      fileUrl: "",
      fileSize: "",
      tags: "",
      featured: false,
      status: "draft",
    });
    setSelectedFile(null);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "template":
        return <FileText className="h-4 w-4" />;
      case "guide":
        return <BookOpen className="h-4 w-4" />;
      case "video":
        return <Play className="h-4 w-4" />;
      case "podcast":
        return <Headphones className="h-4 w-4" />;
      case "tool":
        return <Calculator className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-blue-100 text-blue-800";
      case "guide":
        return "bg-green-100 text-green-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "podcast":
        return "bg-orange-100 text-orange-800";
      case "tool":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handler functions for CRUD operations
  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setShowViewDialog(true);
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      thumbnail: resource.thumbnail,
      fileUrl: resource.fileUrl,
      fileSize: resource.fileSize,
      tags: resource.tags.join(", "),
      featured: resource.featured,
      status: resource.status,
    });
    setSelectedFile(null); // Reset file selection for edit
    setShowEditDialog(true);
  };

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedResource) return;

    try {
      const response = await fetch(
        `/api/admin/entrepreneurship/resources/${selectedResource.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteDialog(false);
        setSelectedResource(null);
        fetchResources();
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;

    try {
      setIsUploading(true);

      // If there's a new file, use FormData for file upload
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", selectedFile);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("type", formData.type);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("thumbnail", formData.thumbnail);
        formDataToSend.append("tags", formData.tags);
        formDataToSend.append("featured", formData.featured.toString());
        formDataToSend.append("status", formData.status);
        formDataToSend.append("author", "Administrador");

        const response = await fetch(
          `/api/admin/entrepreneurship/resources/${selectedResource.id}`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );

        if (response.ok) {
          setShowEditDialog(false);
          setSelectedResource(null);
          resetForm();
          fetchResources();
        } else {
          const errorData = await response.json();
          console.error("Error updating resource:", errorData);
        }
      } else {
        // If no new file, use JSON for external URL
        const response = await fetch(
          `/api/admin/entrepreneurship/resources/${selectedResource.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              tags: formData.tags.split(",").map((tag) => tag.trim()),
            }),
          }
        );

        if (response.ok) {
          setShowEditDialog(false);
          setSelectedResource(null);
          resetForm();
          fetchResources();
        }
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    "Planificación",
    "Validación",
    "Finanzas",
    "Marketing",
    "Legal",
    "Tecnología",
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Recursos</h1>
          <p className="text-muted-foreground">
            Administra recursos educativos para emprendedores
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Recurso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Título del recurso"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(
                      value: "template" | "guide" | "video" | "podcast" | "tool"
                    ) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template">Plantilla</SelectItem>
                      <SelectItem value="guide">Guía</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="tool">Herramienta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descripción detallada del recurso"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "published" | "draft" | "archived"
                    ) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Archivo del Recurso</Label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.webm,.ogg,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt"
                    maxSize={10 * 1024 * 1024} // 10MB
                  />
                </div>

                {!selectedFile && (
                  <div className="space-y-2">
                    <Label htmlFor="fileUrl">O URL Externa (opcional)</Label>
                    <Input
                      id="fileUrl"
                      value={formData.fileUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fileUrl: e.target.value,
                        }))
                      }
                      placeholder="https://... o /downloads/..."
                    />
                  </div>
                )}

                {formData.fileSize && (
                  <div className="space-y-2">
                    <Label htmlFor="fileSize">Tamaño del Archivo</Label>
                    <Input
                      id="fileSize"
                      value={formData.fileSize}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL de Imagen</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnail: e.target.value,
                    }))
                  }
                  placeholder="URL de la imagen de portada"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="etiqueta1, etiqueta2, etiqueta3"
                />
                <p className="text-xs text-muted-foreground">
                  Separar con comas
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: !!checked }))
                  }
                />
                <Label htmlFor="featured">Recurso destacado</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateResource}
                  disabled={
                    isUploading || !formData.title || !formData.description
                  }
                >
                  {isUploading ? "Subiendo..." : "Crear Recurso"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Recursos
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Publicados
                </p>
                <p className="text-2xl font-bold">{stats.byStatus.published}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Destacados
                </p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recursos por título, descripción o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="template">Plantillas</SelectItem>
                  <SelectItem value="guide">Guías</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="podcast">Podcasts</SelectItem>
                  <SelectItem value="tool">Herramientas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.description.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {resource.featured && (
                      <Award className="h-4 w-4 text-orange-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(resource)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(resource)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(resource)}
                        >
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

          {resources.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron recursos
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros o crear nuevos recursos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Recurso</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  {getResourceIcon(selectedResource.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedResource.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedResource.category}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-muted-foreground">
                  {selectedResource.description}
                </p>
              </div>

              {/* File Preview Section */}
              {selectedResource.fileUrl && (
                <div>
                  <h4 className="font-medium mb-2">Vista Previa del Archivo</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {renderFilePreview(selectedResource)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Tipo</h4>
                  <Badge className={getTypeColor(selectedResource.type)}>
                    {selectedResource.type}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estado</h4>
                  <Badge className={getStatusColor(selectedResource.status)}>
                    {selectedResource.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Autor</h4>
                  <p className="text-muted-foreground">
                    {selectedResource.author}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tamaño del Archivo</h4>
                  <p className="text-muted-foreground">
                    {selectedResource.fileSize}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Recurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
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
                    <SelectItem value="template">Plantilla</SelectItem>
                    <SelectItem value="guide">Guía</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="tool">Herramienta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Archivo del Recurso</Label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.webm,.ogg,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </div>

              {!selectedFile && (
                <div className="space-y-2">
                  <Label htmlFor="edit-fileUrl">O URL Externa (opcional)</Label>
                  <Input
                    id="edit-fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fileUrl: e.target.value })
                    }
                    placeholder="https://... o /downloads/..."
                  />
                </div>
              )}

              {formData.fileSize && (
                <div className="space-y-2">
                  <Label htmlFor="edit-fileSize">Tamaño del Archivo</Label>
                  <Input
                    id="edit-fileSize"
                    value={formData.fileSize}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              )}
            </div>

            {/* File Preview Section in Edit Dialog */}
            {formData.fileUrl && (
              <div>
                <h4 className="font-medium mb-2">Vista Previa del Archivo</h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {renderFilePreview({
                    ...formData,
                    type: formData.type,
                    fileUrl: formData.fileUrl,
                  })}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="etiqueta1, etiqueta2, etiqueta3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: !!checked })
                  }
                />
                <Label htmlFor="edit-featured">Destacado</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateResource}
                disabled={
                  isUploading || !formData.title || !formData.description
                }
              >
                {isUploading ? "Actualizando..." : "Actualizar Recurso"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Recurso?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{selectedResource?.title}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
