"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Save, ArrowLeft, File } from "lucide-react";
// import { useCreateResource } from '@/hooks/useResourceApi';
import { toast } from "sonner";
import { ResourceService } from "@/services/resource.service";

export default function CreateResourcePage() {
  const router = useRouter();
  // Removemos el hook que no se está usando para evitar confusión
  // const { mutateAsync: createResource, isPending } = useCreateResource();
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: "DOCUMENT" | "VIDEO" | "AUDIO" | "IMAGE" | "TEXT" | "";
    category: string;
    format: string;
    author: string;
    externalUrl: string;
    publishedDate: string;
    tags: string[];
    isPublic: boolean;
  }>({
    title: "",
    description: "",
    type: "",
    category: "",
    format: "",
    author: "",
    externalUrl: "",
    publishedDate: "",
    tags: [] as string[],
    isPublic: true,
  });

  const [newTag, setNewTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Opciones para los selectores - usando tipos del backend
  const resourceTypes = [
    { value: "DOCUMENT", label: "Documento" },
    { value: "VIDEO", label: "Video" },
    { value: "AUDIO", label: "Audio" },
    { value: "IMAGE", label: "Imagen" },
    { value: "TEXT", label: "Texto" },
  ];

  const categories = [
    { value: "PROGRAMMING", label: "Programación" },
    { value: "ENTREPRENEURSHIP", label: "Emprendimiento" },
    { value: "TECHNOLOGY", label: "Tecnología" },
    { value: "EDUCATION", label: "Educación" },
    { value: "BUSINESS", label: "Negocios" },
    { value: "MARKETING", label: "Marketing" },
    { value: "FINANCE", label: "Finanzas" },
    { value: "HEALTH", label: "Salud" },
    { value: "DESIGN", label: "Diseño" },
    { value: "LEADERSHIP", label: "Liderazgo" },
    { value: "PERSONAL_DEVELOPMENT", label: "Desarrollo Personal" },
    { value: "OTHER", label: "Otro" },
  ];

  const formats = [
    // Documentos
    { value: "PDF", label: "PDF" },
    { value: "DOC", label: "Documento Word (.doc)" },
    { value: "DOCX", label: "Documento Word (.docx)" },
    { value: "XLS", label: "Excel (.xls)" },
    { value: "XLSX", label: "Excel (.xlsx)" },
    { value: "PPT", label: "PowerPoint (.ppt)" },
    { value: "PPTX", label: "PowerPoint (.pptx)" },
    { value: "ZIP", label: "Archivo ZIP" },
    { value: "RAR", label: "Archivo RAR" },
    // Videos
    { value: "MP4", label: "Video MP4" },
    { value: "WEBM", label: "Video WebM" },
    { value: "OGG", label: "Video OGG" },
    { value: "AVI", label: "Video AVI" },
    { value: "MOV", label: "Video MOV" },
    { value: "WMV", label: "Video WMV" },
    { value: "FLV", label: "Video FLV" },
    { value: "MKV", label: "Video MKV" },
    // Audio
    { value: "MP3", label: "Audio MP3" },
    { value: "WAV", label: "Audio WAV" },
    { value: "AAC", label: "Audio AAC" },
    { value: "FLAC", label: "Audio FLAC" },
    // Imágenes
    { value: "JPEG", label: "Imagen JPEG" },
    { value: "PNG", label: "Imagen PNG" },
    { value: "GIF", label: "Imagen GIF" },
    { value: "WEBP", label: "Imagen WebP" },
    { value: "SVG", label: "Imagen SVG" },
    { value: "BMP", label: "Imagen BMP" },
    { value: "TIFF", label: "Imagen TIFF" },
    // Texto
    { value: "TXT", label: "Archivo de Texto" },
    { value: "CSV", label: "CSV" },
    { value: "HTML", label: "HTML" },
    { value: "CSS", label: "CSS" },
    { value: "JS", label: "JavaScript" },
    { value: "JSON", label: "JSON" },
    { value: "XML", label: "XML" },
  ];

  // Función para agregar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // Función para remover tag
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Función para manejar cambios en el formulario
  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detectar formato basado en la extensión del archivo
      const extension = file.name.split(".").pop()?.toUpperCase();
      if (extension) {
        setFormData((prev) => ({
          ...prev,
          format: extension,
        }));
      }
    }
  };

  // Función para obtener tipos de archivo aceptados
  const getAcceptedFileTypes = () => {
    const typeMapping = {
      DOCUMENT: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar",
      VIDEO: ".mp4,.webm,.ogg,.avi,.mov,.wmv,.flv,.mkv",
      AUDIO: ".mp3,.wav,.ogg,.aac,.flac",
      IMAGE: ".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff",
      TEXT: ".txt,.csv,.html,.css,.js,.json,.xml",
    };
    return formData.type
      ? typeMapping[formData.type as keyof typeof typeMapping]
      : "*";
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 handleSubmit - Iniciando envío del formulario");
    e.preventDefault();
    setIsPending(true);

    try {
      console.log("🚀 handleSubmit - FormData:", formData);
      console.log("🚀 handleSubmit - SelectedFile:", selectedFile);

      // Validaciones básicas
      if (!formData.title.trim()) {
        toast.error("El título es requerido");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("La descripción es requerida");
        return;
      }

      if (!formData.type) {
        toast.error("El tipo de recurso es requerido");
        return;
      }

      if (!formData.category) {
        toast.error("La categoría es requerida");
        return;
      }

      if (!formData.format) {
        toast.error("El formato es requerido");
        return;
      }

      if (!formData.author.trim()) {
        toast.error("El autor es requerido");
        return;
      }

      let result;

      if (selectedFile) {
        // Si hay archivo, usar el servicio de upload
        console.log("📁 Creando recurso con archivo");
        const formDataToSend = new FormData();

        // Agregar campos del formulario
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("type", formData.type);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("format", formData.format);
        formDataToSend.append("author", formData.author);

        if (formData.externalUrl) {
          formDataToSend.append("externalUrl", formData.externalUrl);
        }

        if (formData.publishedDate) {
          formDataToSend.append("publishedDate", formData.publishedDate);
        }

        // Agregar tags como string separado por comas
        if (formData.tags.length > 0) {
          formDataToSend.append("tags", formData.tags.join(","));
        }

        // Agregar archivo
        formDataToSend.append("file", selectedFile);

        console.log("📁 Usando ResourceService.uploadResource");
        result = await ResourceService.uploadResource(formDataToSend);
      } else {
        // Si no hay archivo, usar el servicio normal
        console.log("📄 Creando recurso sin archivo");
        const resourceData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          format: formData.format,
          author: formData.author,
          externalUrl: formData.externalUrl || undefined,
          publishedDate: formData.publishedDate || undefined,
          tags: formData.tags,
          isPublic: formData.isPublic,
        };

        console.log("📄 Usando ResourceService.createResource");
        result = await ResourceService.createResource(resourceData);
      }

      console.log("📤 Success result:", result);

      toast.success("Recurso creado exitosamente");
      console.log(
        "🚀 handleSubmit - Recurso creado exitosamente, redirigiendo..."
      );
      router.push("/resources");
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear el recurso"
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nuevo Recurso
        </h1>
        <p className="text-gray-600">
          Comparte conocimientos y herramientas valiosas con la comunidad
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Información principal del recurso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Título del recurso"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe el contenido y propósito del recurso"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo de Recurso *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="format">Formato *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => handleChange("format", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="author">Autor *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    placeholder="Nombre del autor"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Archivo y Enlaces</CardTitle>
                <CardDescription>
                  Subir archivo o proporcionar enlace externo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Subir Archivo</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="file"
                        accept={getAcceptedFileTypes()}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile
                          ? "Cambiar archivo"
                          : "Seleccionar archivo"}
                      </Button>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      Tamaño máximo: 1GB.{" "}
                      {formData.type
                        ? `Tipos permitidos: ${getAcceptedFileTypes()}`
                        : "Selecciona un tipo de recurso primero."}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div>
                    <Label htmlFor="externalUrl">URL Externa (Opcional)</Label>
                    <Input
                      id="externalUrl"
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) =>
                        handleChange("externalUrl", e.target.value)
                      }
                      placeholder="https://ejemplo.com/recurso"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si no subes un archivo, puedes proporcionar un enlace
                      externo
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="publishedDate">
                    Fecha de Publicación (Opcional)
                  </Label>
                  <Input
                    id="publishedDate"
                    type="datetime-local"
                    value={formData.publishedDate}
                    onChange={(e) =>
                      handleChange("publishedDate", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Etiquetas</CardTitle>
                <CardDescription>
                  Agrega etiquetas para facilitar la búsqueda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Agregar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Opciones de visibilidad y publicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Recurso Público</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que cualquier usuario vea este recurso
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      handleChange("isPublic", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>Cómo se verá tu recurso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium line-clamp-2">
                      {formData.title || "Título del recurso"}
                    </h4>
                    {formData.type && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {formData.type}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formData.description || "Descripción del recurso"}
                  </p>

                  <div className="flex items-center gap-2">
                    {formData.category && (
                      <Badge variant="outline" className="text-xs">
                        {formData.category}
                      </Badge>
                    )}
                    {formData.format && (
                      <Badge variant="outline" className="text-xs">
                        {formData.format}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
                onClick={() => console.log("🚀 Botón submit clickeado")}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Recurso
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
