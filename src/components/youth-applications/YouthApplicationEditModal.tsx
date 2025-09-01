"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, User, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUpdateYouthApplication } from "@/hooks/use-youth-applications";
import { YouthApplication } from "@/services/youth-application.service";

interface YouthApplicationEditModalProps {
  application: YouthApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function YouthApplicationEditModal({
  application,
  open,
  onOpenChange,
  onSuccess,
}: YouthApplicationEditModalProps) {
  const { toast } = useToast();
  const updateApplication = useUpdateYouthApplication();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when application changes
  useEffect(() => {
    if (application) {
      setFormData({
        title: application.title || "",
        description: application.description || "",
        isPublic: application.isPublic ?? true,
      });
      setCvFile(null);
      setCoverLetterFile(null);
    }
  }, [application]);

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

    if (!application) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateApplication.mutateAsync({
        id: application.id,
        data: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          isPublic: formData.isPublic,
          cvFile: cvFile || undefined,
          coverLetterFile: coverLetterFile || undefined,
        },
      });

      toast({
        title: "¡Éxito!",
        description: "Tu postulación ha sido actualizada correctamente",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la postulación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Editar Postulación
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Actualiza la información de tu postulación
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
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
          </div>

          {/* Documents */}
          <div className="space-y-4">
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
              {application.cvFile && !cvFile && (
                <p className="text-sm text-muted-foreground">
                  CV actual: {application.cvFile.split('/').pop()}
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
              {application.coverLetterFile && !coverLetterFile && (
                <p className="text-sm text-muted-foreground">
                  Carta actual: {application.coverLetterFile.split('/').pop()}
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
                <li>• Deja vacío para mantener el archivo actual</li>
              </ul>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                  Actualizando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Actualizar Postulación
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
