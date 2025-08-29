"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCreateYouthApplication } from "@/hooks/use-youth-applications";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function NewYouthApplicationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile } = useCurrentUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createApplication = useCreateYouthApplication();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: "cv" | "coverLetter", file: File | null) => {
    if (field === "cv") {
      setCvFile(file);
    } else {
      setCoverLetterFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo obtener tu perfil de usuario",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createApplication.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        cvFile: cvFile || undefined,
        coverLetterFile: coverLetterFile || undefined,
      });

      toast({
        title: "¡Éxito!",
        description: "Tu postulación ha sido creada correctamente",
      });

      router.push("/my-youth-applications");
    } catch (error) {
      console.error("Error creating application:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la postulación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nueva Postulación
          </h1>
          <p className="text-muted-foreground">
            Crea una nueva postulación para conectar con empresas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Describe tu postulación y lo que buscas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Postulación *</Label>
              <Input
                id="title"
                placeholder="Ej: Desarrollador Frontend Junior"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu experiencia, habilidades y lo que buscas en una empresa..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={6}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
              />
              <Label htmlFor="isPublic" className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                Hacer pública esta postulación
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Las postulaciones públicas son visibles para todas las empresas.
              Las privadas solo son visibles para empresas que ya han expresado
              interés.
            </p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos (Opcional)
            </CardTitle>
            <CardDescription>
              Sube tu CV y carta de presentación para complementar tu
              postulación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileChange("cv", e.target.files?.[0] || null)
                  }
                  className="flex-1"
                />
                {cvFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange("cv", null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {cvFile && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {cvFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Carta de Presentación (PDF)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="coverLetter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileChange("coverLetter", e.target.files?.[0] || null)
                  }
                  className="flex-1"
                />
                {coverLetterFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange("coverLetter", null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {coverLetterFile && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {coverLetterFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Consejos para tus documentos:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Asegúrate de que tu CV esté actualizado y sea relevante
                </li>
                <li>
                  • La carta de presentación debe ser personalizada y específica
                </li>
                <li>• Los archivos deben estar en formato PDF</li>
                <li>• Tamaño máximo: 5MB por archivo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.title.trim() ||
              !formData.description.trim()
            }
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Crear Postulación
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
