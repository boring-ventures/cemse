"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Eye, EyeOff } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { useToast } from "@/hooks/use-toast";

// Schema de validación
const newsFormSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  summary: z
    .string()
    .min(1, "El resumen es requerido")
    .max(500, "El resumen no puede exceder 500 caracteres"),
  content: z.string().min(1, "El contenido es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  tags: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().default(false),
  targetAudience: z.string().optional(),
  region: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  relatedLinks: z.string().optional(),
});

type NewsFormData = z.infer<typeof newsFormSchema>;

interface NewsFormProps {
  initialData?: NewsArticle;
  onSubmit: (data: NewsFormData, imageFile?: File) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
  restrictedRegion?: string;
}

const categories = [
  "Educación y Becas",
  "Ofertas de Empleo",
  "Política Pública",
  "Programas Sociales",
  "Educación Digital",
  "Responsabilidad Social",
  "Tecnología",
  "Emprendimiento",
  "Capacitación",
  "Eventos",
  "General",
];

const regions = [
  "Cochabamba",
  "La Paz",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
  "Nacional",
];

export function NewsForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode,
  restrictedRegion,
}: NewsFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      content: initialData?.content || "",
      category: initialData?.category || "",
      tags: initialData?.tags?.join(", ") || "",
      priority: initialData?.priority || "MEDIUM",
      status: initialData?.status || "DRAFT",
      featured: initialData?.featured || false,
      targetAudience: initialData?.targetAudience?.join(", ") || "YOUTH",
      region:
        initialData?.region ||
        (mode === "create" ? restrictedRegion || "Cochabamba" : ""),
      videoUrl: initialData?.videoUrl || "",
      relatedLinks: initialData?.relatedLinks
        ? JSON.stringify(initialData.relatedLinks)
        : "",
    },
  });

  // Establecer preview de imagen inicial
  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData?.imageUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede exceder 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (data: NewsFormData) => {
    try {
      await onSubmit(data, imageFile || undefined);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Crear Nueva Noticia" : "Editar Noticia"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la noticia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumen *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumen corto de la noticia"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Máximo 500 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenido completo de la noticia"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="etiqueta1, etiqueta2, etiqueta3"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separa las etiquetas con comas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Imagen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imagen</h3>

              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Haz clic para subir
                        </span>{" "}
                        o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Configuración */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Configuración</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showAdvanced ? "Ocultar avanzado" : "Mostrar avanzado"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Borrador</SelectItem>
                          <SelectItem value="PUBLISHED">Publicado</SelectItem>
                          <SelectItem value="ARCHIVED">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Región</FormLabel>
                      {restrictedRegion ? (
                        <div className="space-y-2">
                          <Input
                            value={restrictedRegion}
                            disabled
                            className="bg-gray-50"
                          />
                          <input
                            type="hidden"
                            {...field}
                            value={restrictedRegion}
                          />
                        </div>
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destacada</FormLabel>
                      <FormDescription>
                        Marca esta noticia como destacada para mostrarla en la
                        página principal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {showAdvanced && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audiencia Objetivo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="YOUTH, ADOLESCENTS, COMPANIES, ALL"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Separa las audiencias con comas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del Video</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://ejemplo.com/video.mp4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relatedLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enlaces Relacionados (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='[{"title": "Enlace 1", "url": "https://ejemplo.com"}]'
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Formato JSON con array de objetos con title y url
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Guardando..."
              : mode === "create"
                ? "Crear Noticia"
                : "Actualizar Noticia"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
