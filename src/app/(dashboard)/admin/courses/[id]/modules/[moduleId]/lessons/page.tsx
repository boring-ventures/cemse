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
  FileText,
  Video,
  Download,
  Play,
  CheckCircle,
  Target,
  Clock,
  Users,
  ArrowLeft,
  GripVertical,
  BookOpen,
  Search,
  ExternalLink,
  FileVideo,
  FileImage,
  Link as LinkIcon,
  Settings,
  Eye as Preview,
  Upload,
  HelpCircle,
} from "lucide-react";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  type Lesson,
} from "@/hooks/useLessonApi";
import { useQueryClient } from "@tanstack/react-query";
import { useLessonResources } from "@/hooks/useLessonResourceApi";
import { toast } from "sonner";
import { getAuthHeaders, API_BASE } from "@/lib/api";

export default function ModuleLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Form state for regular lesson creation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    contentType: "VIDEO" as "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE",
    videoUrl: "",
    videoType: "youtube" as "youtube" | "upload",
    videoFile: null as File | null,
    duration: 15,
    orderIndex: 1,
    isRequired: true,
    isPreview: false,
  });

  // Hooks
  const queryClient = useQueryClient();
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons(moduleId);
  const lessons = (lessonsData as any)?.lessons || [];
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  // Filter lessons
  const filteredLessons = lessons.filter((lesson: Lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLesson = async () => {
    try {
      await createLesson.mutateAsync({
        moduleId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        contentType: formData.contentType,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        orderIndex: formData.orderIndex,
        isRequired: formData.isRequired,
        isPreview: formData.isPreview,
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        content: "",
        contentType: "VIDEO",
        videoUrl: "",
        videoType: "youtube",
        videoFile: null,
        duration: 15,
        orderIndex: 1,
        isRequired: true,
        isPreview: false,
      });
      toast.success("Lección creada exitosamente");
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Error al crear la lección");
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;

    try {
      await updateLesson.mutateAsync({
        id: editingLesson.id,
        moduleId: moduleId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        contentType: formData.contentType,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        orderIndex: formData.orderIndex,
        isRequired: formData.isRequired,
        isPreview: formData.isPreview,
      });

      setIsEditDialogOpen(false);
      setEditingLesson(null);
      setFormData({
        title: "",
        description: "",
        content: "",
        contentType: "VIDEO",
        videoUrl: "",
        videoType: "youtube",
        videoFile: null,
        duration: 15,
        orderIndex: 1,
        isRequired: true,
        isPreview: false,
      });
      toast.success("Lección actualizada exitosamente");
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error(
        `Error al actualizar la lección: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta lección?")) {
      try {
        await deleteLesson.mutateAsync(lessonId);
        toast.success("Lección eliminada exitosamente");
      } catch (error) {
        toast.error("Error al eliminar la lección");
      }
    }
  };

  const openEditDialog = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content,
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl || "",
      videoType: lesson.videoUrl ? "youtube" : "upload",
      videoFile: null,
      duration: lesson.duration || 15,
      orderIndex: lesson.orderIndex,
      isRequired: lesson.isRequired,
      isPreview: lesson.isPreview,
    });
    setIsEditDialogOpen(true);
  };

  // Modern Video Upload Functions
  const validateVideoFile = (
    file: File
  ): { valid: boolean; error?: string } => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/avi",
      "video/mov",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Formato de video no soportado. Use MP4, WebM, MOV, or AVI.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "El archivo es demasiado grande. Máximo 500MB.",
      };
    }

    return { valid: true };
  };

  const needsConversion = (file: File): boolean => {
    const optimalFormats = ["video/mp4"];
    return !optimalFormats.includes(file.type);
  };

  const handleVideoFileSelect = (file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedVideoFile(file);

    // Create preview URL
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);

    console.log("📹 Video file selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      needsConversion: needsConversion(file),
    });
  };

  const convertVideoToMP4 = async (file: File): Promise<File> => {
    setUploadStage("Convirtiendo video a MP4...");

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("format", "mp4");

      const response = await fetch(`${API_BASE}/video-convert`, {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const convertedFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, ".mp4"),
        { type: "video/mp4" }
      );

      console.log("✅ Video converted successfully:", {
        originalSize: file.size,
        convertedSize: convertedFile.size,
        originalType: file.type,
        convertedType: convertedFile.type,
      });

      return convertedFile;
    } catch (error) {
      console.error("❌ Video conversion failed:", error);
      throw error;
    }
  };

  const uploadVideoWithProgress = async (
    file: File,
    lessonData: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploadStage("Preparando subida...");

        const formData = new FormData();
        formData.append("title", lessonData.title);
        formData.append("description", lessonData.description || "");
        formData.append("content", lessonData.content);
        formData.append("moduleId", moduleId);
        formData.append("contentType", "VIDEO");
        formData.append("duration", lessonData.duration.toString());
        formData.append("orderIndex", lessonData.orderIndex.toString());
        formData.append("isRequired", lessonData.isRequired.toString());
        formData.append("isPreview", lessonData.isPreview.toString());
        formData.append("video", file);

        setUploadStage("Subiendo video...");

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentComplete);
            console.log(`📤 Upload progress: ${percentComplete}%`);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log("✅ Video upload successful:", result);
              resolve(result);
            } catch (parseError) {
              reject(new Error("Error parsing server response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", `${API_BASE}/lesson/with-video`);

        // Set auth headers
        const headers = await getAuthHeaders(true);
        Object.entries(headers).forEach(([key, value]) => {
          if (key !== "Content-Type") {
            // Don't set Content-Type for FormData
            xhr.setRequestHeader(key, value as string);
          }
        });

        xhr.send(formData);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleCreateVideoLesson = async () => {
    if (!selectedVideoFile) {
      toast.error("Por favor selecciona un archivo de video");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("El título de la lección es obligatorio");
      return;
    }

    try {
      setIsUploadingVideo(true);
      setUploadProgress(0);
      setUploadStage("Iniciando...");

      let fileToUpload = selectedVideoFile;

      // Convert to MP4 if needed
      if (needsConversion(selectedVideoFile)) {
        console.log("🔄 Converting video to MP4...");
        fileToUpload = await convertVideoToMP4(selectedVideoFile);
        setUploadProgress(50); // Conversion takes about 50% of the process
      }

      // Upload the video
      const result = await uploadVideoWithProgress(fileToUpload, formData);

      setUploadStage("Completando...");
      setUploadProgress(100);

      // Success!
      toast.success("¡Lección de video creada exitosamente!");

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        content: "",
        contentType: "VIDEO",
        videoUrl: "",
        videoType: "youtube",
        videoFile: null,
        duration: 15,
        orderIndex: 1,
        isRequired: true,
        isPreview: false,
      });
      setSelectedVideoFile(null);
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }
      setShowVideoUpload(false);

      // Refresh lessons list
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["moduleLessons", moduleId] });
    } catch (error) {
      console.error("❌ Video lesson creation failed:", error);
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
      setUploadStage("");
    }
  };

  const handleVideoUploadCancel = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setSelectedVideoFile(null);
    setShowVideoUpload(false);
    setUploadProgress(0);
    setUploadStage("");
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "TEXT":
        return <FileText className="h-4 w-4" />;
      case "QUIZ":
        return <Target className="h-4 w-4" />;
      case "ASSIGNMENT":
        return <CheckCircle className="h-4 w-4" />;
      case "LIVE":
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "Video";
      case "TEXT":
        return "Texto";
      case "QUIZ":
        return "Quiz";
      case "ASSIGNMENT":
        return "Asignación";
      case "LIVE":
        return "En Vivo";
      default:
        return "Texto";
    }
  };

  const getLessonStats = (lessonId: string) => {
    // Mock stats - in real implementation, fetch from API
    return {
      resources: 3,
      students: 25,
      completionRate: 85,
      averageTime: 12,
    };
  };

  if (lessonsLoading) {
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
            <Link href={`/admin/courses/${courseId}/modules`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Módulos
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📝 Gestión de Lecciones</h1>
            <p className="text-muted-foreground">
              Administra el contenido de lecciones del módulo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowVideoUpload(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0"
          >
            <FileVideo className="h-4 w-4 mr-2" />
            Crear Lección con Video
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Lección
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Lección</DialogTitle>
                <DialogDescription>
                  Agrega una nueva lección al módulo con su contenido y
                  configuración.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title">Título de la Lección</label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ej: Introducción a HTML"
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
                    placeholder="Describe el contenido de la lección..."
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contentType">Tipo de Contenido</label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, contentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="TEXT">Texto</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ASSIGNMENT">Asignación</SelectItem>
                      <SelectItem value="LIVE">En Vivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.contentType === "VIDEO" && (
                  <div className="grid gap-2">
                    <label htmlFor="videoUrl">URL de YouTube (opcional)</label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Para subir archivos de video, usa el botón "Crear Lección
                      con Video"
                    </p>
                  </div>
                )}
                <div className="grid gap-2">
                  <label htmlFor="content">Contenido</label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Contenido de la lección..."
                    rows={4}
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
                    <label htmlFor="duration">Duración (minutos)</label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={formData.isRequired}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isRequired: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="isRequired">Obligatoria</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPreview"
                      checked={formData.isPreview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPreview: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="isPreview">Vista previa</label>
                  </div>
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
                  onClick={handleCreateLesson}
                  disabled={createLesson.isPending || isUploadingVideo}
                >
                  {createLesson.isPending || isUploadingVideo
                    ? formData.videoFile && needsConversion(formData.videoFile)
                      ? "Convirtiendo a MP4 y creando..."
                      : "Creando..."
                    : "Crear Lección"}
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
                  placeholder="Buscar lecciones..."
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
                  <TableHead>Lección</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map((lesson: Lesson) => {
                  const stats = getLessonStats(lesson.id);
                  return (
                    <TableRow key={lesson.id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            {getContentTypeIcon(lesson.contentType)}
                          </div>
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Lección {lesson.orderIndex}
                            </div>
                            {lesson.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {lesson.description}
                              </div>
                            )}
                            <div className="flex gap-1 mt-1">
                              {lesson.isRequired && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Obligatoria
                                </Badge>
                              )}
                              {lesson.isPreview && (
                                <Badge variant="secondary" className="text-xs">
                                  <Preview className="h-3 w-3 mr-1" />
                                  Vista previa
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getContentTypeIcon(lesson.contentType)}
                          <span className="ml-1">
                            {getContentTypeLabel(lesson.contentType)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{lesson.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Download className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.resources} recursos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.students} estudiantes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.completionRate}% completan</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Activa</Badge>
                      </TableCell>
                      <TableCell>
                        {lesson.updatedAt
                          ? new Date(lesson.updatedAt).toLocaleDateString()
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
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/resources`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Gestionar recursos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/quizzes`}
                              >
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Gestionar quizzes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/preview`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Vista previa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/progress`}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Progreso
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(lesson)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteLesson(lesson.id)}
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

          {filteredLessons.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron lecciones
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera lección para el módulo"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Lección
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Lección</DialogTitle>
            <DialogDescription>
              Modifica la información de la lección seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Título de la Lección</label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Introducción a HTML"
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
                placeholder="Describe el contenido de la lección..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-contentType">Tipo de Contenido</label>
              <Select
                value={formData.contentType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="TEXT">Texto</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="ASSIGNMENT">Asignación</SelectItem>
                  <SelectItem value="LIVE">En Vivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.contentType === "VIDEO" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label>Tipo de Video</label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="edit-youtube"
                        name="edit-videoType"
                        value="youtube"
                        checked={formData.videoType === "youtube"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            videoType: e.target.value as "youtube" | "upload",
                          })
                        }
                      />
                      <label
                        htmlFor="edit-youtube"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        YouTube
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="edit-upload"
                        name="edit-videoType"
                        value="upload"
                        checked={formData.videoType === "upload"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            videoType: e.target.value as "youtube" | "upload",
                          })
                        }
                      />
                      <label
                        htmlFor="edit-upload"
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Subir Archivo
                      </label>
                    </div>
                  </div>
                </div>

                {formData.videoType === "youtube" && (
                  <div className="grid gap-2">
                    <label htmlFor="edit-videoUrl">URL de YouTube</label>
                    <Input
                      id="edit-videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Pega la URL completa del video de YouTube
                    </p>
                  </div>
                )}

                {formData.videoType === "upload" && (
                  <div className="grid gap-2">
                    <label>Subir Video</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        {formData.videoFile
                          ? formData.videoFile.name
                          : "Arrastra un video aquí o haz clic para seleccionar"}
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, videoFile: file });
                          }
                        }}
                        className="hidden"
                        id="edit-videoFile"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() =>
                          document.getElementById("edit-videoFile")?.click()
                        }
                      >
                        Seleccionar Video
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Formatos: MP4, AVI, MOV. Máximo 500MB
                        <br />
                        <span className="text-blue-600 font-medium">
                          ⚡ Videos se convertirán automáticamente a MP4 H.264
                          para máxima compatibilidad
                        </span>
                      </p>
                    </div>
                    {formData.videoFile && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          {formData.videoFile.name} (
                          {(formData.videoFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="edit-content">Contenido</label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Contenido de la lección..."
                rows={4}
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
                <label htmlFor="edit-duration">Duración (minutos)</label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isRequired"
                  checked={formData.isRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, isRequired: e.target.checked })
                  }
                />
                <label htmlFor="edit-isRequired">Obligatoria</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPreview"
                  checked={formData.isPreview}
                  onChange={(e) =>
                    setFormData({ ...formData, isPreview: e.target.checked })
                  }
                />
                <label htmlFor="edit-isPreview">Vista previa</label>
              </div>
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
              onClick={handleEditLesson}
              disabled={updateLesson.isPending || isUploadingVideo}
            >
              {updateLesson.isPending || isUploadingVideo
                ? formData.videoFile && needsConversion(formData.videoFile)
                  ? "Convirtiendo a MP4 y actualizando..."
                  : "Actualizando..."
                : "Actualizar Lección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Video Upload Modal */}
      {showVideoUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileVideo className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Crear Lección con Video
                    </h2>
                    <p className="text-gray-600">
                      Sube archivos de video que se guardarán en MinIO y podrás
                      reproducir después
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVideoUploadCancel}
                  disabled={isUploadingVideo}
                >
                  ✕
                </Button>
              </div>

              {/* Video Upload Section */}
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                  {!selectedVideoFile ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Selecciona tu video
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Arrastra y suelta tu archivo aquí o haz clic para
                        seleccionar
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoFileSelect(file);
                        }}
                        className="hidden"
                        id="video-file-input"
                        disabled={isUploadingVideo}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("video-file-input")?.click()
                        }
                        disabled={isUploadingVideo}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Seleccionar Video
                      </Button>
                      <p className="text-xs text-gray-500 mt-4">
                        Formatos soportados: MP4, WebM, MOV, AVI • Máximo 500MB
                        <br />
                        <span className="text-blue-600 font-medium">
                          ⚡ Se subirá a MinIO y se convertirá automáticamente a
                          MP4 para máxima compatibilidad
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Video Preview */}
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Video className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {selectedVideoFile.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {(selectedVideoFile.size / (1024 * 1024)).toFixed(
                              2
                            )}{" "}
                            MB • {selectedVideoFile.type}
                          </p>
                          <div className="mt-2">
                            {needsConversion(selectedVideoFile) ? (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Requiere conversión a MP4
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Formato MP4 óptimo
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVideoFile(null);
                            if (videoPreviewUrl) {
                              URL.revokeObjectURL(videoPreviewUrl);
                              setVideoPreviewUrl(null);
                            }
                          }}
                          disabled={isUploadingVideo}
                        >
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Details Form */}
                {selectedVideoFile && (
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detalles de la Lección
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Ej: Introducción a React Hooks"
                          disabled={isUploadingVideo}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe el contenido de la lección..."
                          disabled={isUploadingVideo}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración (minutos)
                        </label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value) || 15,
                            })
                          }
                          min="1"
                          max="300"
                          disabled={isUploadingVideo}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orden
                        </label>
                        <Input
                          type="number"
                          value={formData.orderIndex}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              orderIndex: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                          disabled={isUploadingVideo}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenido adicional
                        </label>
                        <Textarea
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          placeholder="Contenido adicional, notas o instrucciones..."
                          disabled={isUploadingVideo}
                          rows={3}
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="video-required"
                            checked={formData.isRequired}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isRequired: e.target.checked,
                              })
                            }
                            disabled={isUploadingVideo}
                          />
                          <label
                            htmlFor="video-required"
                            className="text-sm font-medium text-gray-700"
                          >
                            Lección obligatoria
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="video-preview"
                            checked={formData.isPreview}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isPreview: e.target.checked,
                              })
                            }
                            disabled={isUploadingVideo}
                          />
                          <label
                            htmlFor="video-preview"
                            className="text-sm font-medium text-gray-700"
                          >
                            Vista previa disponible
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploadingVideo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white animate-spin" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          Procesando Video
                        </h3>
                        <p className="text-sm text-blue-700">{uploadStage}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>Progreso</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleVideoUploadCancel}
                    disabled={isUploadingVideo}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateVideoLesson}
                    disabled={
                      !selectedVideoFile ||
                      !formData.title.trim() ||
                      isUploadingVideo
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white min-w-[140px]"
                  >
                    {isUploadingVideo ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Crear Lección
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
