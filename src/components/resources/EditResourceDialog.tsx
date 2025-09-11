"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Tag, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateResource } from "@/hooks/useResourceApi";
import { Resource } from "@/types/api";
import { useCurrentUser } from "@/hooks/use-current-user";

const resourceSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.string().min(1, "El tipo es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  format: z.string().min(1, "El formato es requerido"),
  author: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface EditResourceDialogProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceUpdated?: () => void;
}

export function EditResourceDialog({
  resource,
  open,
  onOpenChange,
  onResourceUpdated,
}: EditResourceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const { mutateAsync: updateResource, isPending } = useUpdateResource();
  const { user } = useCurrentUser();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      category: "",
      format: "",
      author: "",
    },
  });

  // Update form when resource changes
  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        format: resource.format,
        author: resource.author || "",
      });
      setTags(resource.tags || []);
      setTagInput("");
    }
  }, [resource, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Auto-detect type and format based on file extension
      const fileExtension = selectedFile.name.split(".").pop()?.toUpperCase();

      // Map file extensions to types
      const typeMap: { [key: string]: string } = {
        PDF: "DOCUMENT",
        DOC: "DOCUMENT",
        DOCX: "DOCUMENT",
        TXT: "TEXT",
        MP4: "VIDEO",
        AVI: "VIDEO",
        MOV: "VIDEO",
        MP3: "AUDIO",
        WAV: "AUDIO",
        JPG: "IMAGE",
        JPEG: "IMAGE",
        PNG: "IMAGE",
        GIF: "IMAGE",
        ZIP: "TOOLKIT",
        RAR: "TOOLKIT",
      };

      // Map file extensions to formats
      const formatMap: { [key: string]: string } = {
        PDF: "PDF",
        DOC: "DOC",
        DOCX: "DOCX",
        TXT: "TXT",
        MD: "MD",
        RTF: "RTF",
        MP4: "MP4",
        AVI: "AVI",
        MOV: "MOV",
        WMV: "WMV",
        MP3: "MP3",
        WAV: "WAV",
        AAC: "AAC",
        OGG: "OGG",
        JPG: "JPG",
        JPEG: "JPEG",
        PNG: "PNG",
        GIF: "GIF",
        SVG: "SVG",
        ZIP: "ZIP",
        RAR: "RAR",
        "7Z": "7Z",
        XLSX: "XLSX",
        PPTX: "PPTX",
      };

      // Auto-set type and format
      const detectedType = typeMap[fileExtension || ""] || "DOCUMENT";
      const detectedFormat =
        formatMap[fileExtension || ""] || fileExtension || "PDF";

      form.setValue("type", detectedType);
      form.setValue("format", detectedFormat);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Check if user can edit this resource
  const canEditResource = (resource: Resource, currentUser: any) => {
    // Superadmin can edit all resources
    if (currentUser?.role === "SUPERADMIN") return true;

    // Users can only edit their own resources
    return resource.createdByUserId === currentUser?.id;
  };

  const onSubmit = async (data: ResourceFormData) => {
    if (!resource) return;

    // Check ownership
    if (!canEditResource(resource, user)) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para editar este recurso.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        ...data,
        tags: tags,
      };

      if (file) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);

        // Append all form fields to FormData
        formData.append("title", updateData.title);
        formData.append("description", updateData.description);
        formData.append("type", updateData.type);
        formData.append("category", updateData.category);
        formData.append("format", updateData.format);
        if (updateData.author) formData.append("author", updateData.author);
        if (updateData.tags.length > 0)
          formData.append("tags", updateData.tags.join(","));

        await updateResource({
          id: resource.id,
          data: formData as any,
        });
      } else {
        await updateResource({
          id: resource.id,
          data: updateData,
        });
      }

      toast({
        title: "Recurso actualizado",
        description: "El recurso se ha actualizado exitosamente",
      });

      setFile(null);
      setTags([]);
      setTagInput("");
      onOpenChange(false);
      onResourceUpdated?.();
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el recurso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Don't render if user can't edit the resource
  if (resource && !canEditResource(resource, user)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recurso</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del recurso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del recurso"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-set format based on type
                        const formatMap: { [key: string]: string } = {
                          DOCUMENT: "PDF",
                          VIDEO: "MP4",
                          AUDIO: "MP3",
                          IMAGE: "PNG",
                          TEXT: "TXT",
                          TEMPLATE: "DOCX",
                          TOOLKIT: "ZIP",
                        };
                        const suggestedFormat = formatMap[value] || "PDF";
                        form.setValue("format", suggestedFormat);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="AUDIO">Audio</SelectItem>
                        <SelectItem value="IMAGE">Imagen</SelectItem>
                        <SelectItem value="TEXT">Texto</SelectItem>
                        <SelectItem value="TEMPLATE">Plantilla</SelectItem>
                        <SelectItem value="TOOLKIT">
                          Kit de Herramientas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROGRAMMING">
                          Programación
                        </SelectItem>
                        <SelectItem value="DESIGN">Diseño</SelectItem>
                        <SelectItem value="BUSINESS">Negocios</SelectItem>
                        <SelectItem value="EDUCATION">Educación</SelectItem>
                        <SelectItem value="HEALTH">Salud</SelectItem>
                        <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                        <SelectItem value="ENTREPRENEURSHIP">
                          Emprendimiento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => {
                  const selectedType = form.watch("type");

                  // Define format options based on type
                  const getFormatOptions = (type: string) => {
                    const formatOptions: {
                      [key: string]: { value: string; label: string }[];
                    } = {
                      DOCUMENT: [
                        { value: "PDF", label: "PDF" },
                        { value: "DOC", label: "DOC" },
                        { value: "DOCX", label: "DOCX" },
                        { value: "TXT", label: "TXT" },
                      ],
                      VIDEO: [
                        { value: "MP4", label: "MP4" },
                        { value: "AVI", label: "AVI" },
                        { value: "MOV", label: "MOV" },
                        { value: "WMV", label: "WMV" },
                      ],
                      AUDIO: [
                        { value: "MP3", label: "MP3" },
                        { value: "WAV", label: "WAV" },
                        { value: "AAC", label: "AAC" },
                        { value: "OGG", label: "OGG" },
                      ],
                      IMAGE: [
                        { value: "JPG", label: "JPG" },
                        { value: "JPEG", label: "JPEG" },
                        { value: "PNG", label: "PNG" },
                        { value: "GIF", label: "GIF" },
                        { value: "SVG", label: "SVG" },
                      ],
                      TEXT: [
                        { value: "TXT", label: "TXT" },
                        { value: "MD", label: "Markdown" },
                        { value: "RTF", label: "RTF" },
                      ],
                      TEMPLATE: [
                        { value: "DOCX", label: "DOCX" },
                        { value: "XLSX", label: "XLSX" },
                        { value: "PPTX", label: "PPTX" },
                        { value: "PDF", label: "PDF" },
                      ],
                      TOOLKIT: [
                        { value: "ZIP", label: "ZIP" },
                        { value: "RAR", label: "RAR" },
                        { value: "7Z", label: "7Z" },
                      ],
                    };

                    return formatOptions[type] || formatOptions.DOCUMENT;
                  };

                  const availableFormats = getFormatOptions(selectedType);

                  return (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del autor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nuevo Archivo (Opcional)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Upload className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Si seleccionas un nuevo archivo, reemplazará el archivo actual
                del recurso
              </p>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Etiquetas (Opcional)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe una etiqueta y presiona Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={
                      !tagInput.trim() ||
                      tags.includes(tagInput.trim()) ||
                      tags.length >= 5
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Máximo 5 etiquetas. Presiona Enter o el botón + para agregar.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Actualizando..." : "Actualizar Recurso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
