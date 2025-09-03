"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, Video, Music, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResourceService } from "@/services/resource.service";

interface ResourceUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResourceUploadForm({
  onSuccess,
  onCancel,
}: ResourceUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    format: "",
    author: "",
    tags: "",
    isPublic: true,
  });
  const { toast } = useToast();

  const resourceTypes = [
    { value: "DOCUMENT", label: "Documento", icon: FileText },
    { value: "VIDEO", label: "Video", icon: Video },
    { value: "AUDIO", label: "Audio", icon: Music },
    { value: "IMAGE", label: "Imagen", icon: Image },
    { value: "TEXT", label: "Texto", icon: File },
  ];

  const categories = [
    { value: "PROGRAMMING", label: "Programación" },
    { value: "DESIGN", label: "Diseño" },
    { value: "BUSINESS", label: "Negocios" },
    { value: "EDUCATION", label: "Educación" },
    { value: "HEALTH", label: "Salud" },
    { value: "TECHNOLOGY", label: "Tecnología" },
    { value: "ENTREPRENEURSHIP", label: "Emprendimiento" },
    { value: "FINANCE", label: "Finanzas" },
    { value: "MARKETING", label: "Marketing" },
    { value: "LEADERSHIP", label: "Liderazgo" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (1gb)
      if (file.size > 1024 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 1GB.",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        // Documentos
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/zip",
        "application/x-rar-compressed",
        // Videos
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/x-msvideo",
        "video/quicktime",
        "video/x-ms-wmv",
        "video/x-flv",
        "video/x-matroska",
        // Audio
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/aac",
        "audio/flac",
        // Imágenes
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        // Texto
        "text/plain",
        "text/csv",
        "text/html",
        "text/css",
        "application/javascript",
        "application/json",
        "application/xml",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Auto-detectar formato basado en la extensión
      const extension = file.name.split(".").pop()?.toUpperCase();
      if (extension) {
        setFormData((prev) => ({ ...prev, format: extension }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.type ||
      !formData.category
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("type", formData.type);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("format", formData.format);
      uploadFormData.append("author", formData.author);
      uploadFormData.append("tags", formData.tags);
      uploadFormData.append("isPublic", formData.isPublic.toString());

      await ResourceService.uploadResource(uploadFormData);

      toast({
        title: "Éxito",
        description: "Recurso subido correctamente.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "",
        category: "",
        format: "",
        author: "",
        tags: "",
        isPublic: true,
      });
      setSelectedFile(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast({
        title: "Error",
        description: "Error al subir el recurso. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8" />;

    const type = selectedFile.type;
    if (type.startsWith("video/")) return <Video className="h-8 w-8" />;
    if (type.startsWith("audio/")) return <Music className="h-8 w-8" />;
    if (type.startsWith("image/")) return <Image className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Nuevo Recurso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp4,.webm,.ogg,.avi,.mov,.wmv,.flv,.mkv,.mp3,.wav,.aac,.flac,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.txt,.csv,.html,.css,.js,.json,.xml"
              />
              <label htmlFor="file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon()}
                  <div>
                    <p className="text-sm font-medium">
                      {selectedFile
                        ? selectedFile.name
                        : "Haz clic para seleccionar un archivo"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Máximo 1GB. Formatos: PDF, DOC, XLS, PPT, ZIP, MP4, MP3,
                      JPG, etc.
                    </p>
                  </div>
                </div>
              </label>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Archivo seleccionado:</span>
                <Badge variant="secondary">{selectedFile.name}</Badge>
                <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Información del recurso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Título del recurso"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Nombre del autor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe el contenido del recurso"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Input
                id="format"
                value={formData.format}
                onChange={(e) => handleInputChange("format", e.target.value)}
                placeholder="PDF, MP4, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="programación, backend, nodejs (separadas por comas)"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isUploading} className="flex-1">
              {isUploading ? "Subiendo..." : "Subir Recurso"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
