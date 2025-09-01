"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseCategory, CourseLevel } from "@/types/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  X,
  BookOpen,
  Clock,
  Users,
  Award,
  Target,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useCreateCourse } from "@/hooks/useCourseApi";
import { useCourseFileUpload } from "@/hooks/useCourseFileUpload";
import { CourseFileUpload } from "@/components/courses/CourseFileUpload";

import { toast } from "sonner";

export default function CreateCoursePage() {
  const router = useRouter();
  const createCourseMutation = useCreateCourse();
  const { uploadFiles, isUploading: isFileUploading } = useCourseFileUpload();

  const [selectedFiles, setSelectedFiles] = useState<{
    thumbnail?: File;
    videoPreview?: File;
  }>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    videoPreview: "",
    category: "",
    level: "",
    duration: "",
    isMandatory: false,
    isActive: true,
    price: "0",
    certification: true,
    institutionName: "CEMSE",
  });

  const [objectives, setObjectives] = useState<string[]>([""]);
  const [prerequisites, setPrerequisites] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [includedMaterials, setIncludedMaterials] = useState<string[]>([""]);
  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilesChange = (files: { thumbnail?: File; videoPreview?: File }) => {
    setSelectedFiles(files);
  };

  const addArrayItem = (
    array: string[],
    setArray: (items: string[]) => void
  ) => {
    setArray([...array, ""]);
  };

  const updateArrayItem = (
    array: string[],
    setArray: (items: string[]) => void,
    index: number,
    value: string
  ) => {
    const updated = [...array];
    updated[index] = value;
    setArray(updated);
  };

  const removeArrayItem = (
    array: string[],
    setArray: (items: string[]) => void,
    index: number
  ) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    if (!formData.category) {
      toast.error("La categoría es requerida");
      return;
    }
    if (!formData.level) {
      toast.error("El nivel es requerido");
      return;
    }

    try {
      // Upload files first if any are selected
      let uploadedFileUrls: { thumbnail?: string; videoPreview?: string } = {};
      
      if (selectedFiles.thumbnail || selectedFiles.videoPreview) {
        const uploadResult = await uploadFiles(selectedFiles);
        if (uploadResult) {
          uploadedFileUrls = uploadResult;
        } else {
          toast.error("Error al subir archivos. Intenta de nuevo.");
          return;
        }
      }

      const courseData = {
        ...formData,
        // Use uploaded file URLs if available, otherwise use existing URLs
        thumbnail: uploadedFileUrls.thumbnail || formData.thumbnail,
        videoPreview: uploadedFileUrls.videoPreview || formData.videoPreview,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        duration: parseInt(formData.duration) || 0,
        price: parseFloat(formData.price) || 0,
        level: formData.level as CourseLevel,
        category: formData.category as CourseCategory,
        objectives: objectives.filter(obj => obj.trim()),
        prerequisites: prerequisites.filter(req => req.trim()),
        tags: tags,
        includedMaterials: includedMaterials.filter(material => material.trim()),
      };

      await createCourseMutation.mutateAsync(courseData);
      toast.success("Curso creado exitosamente");
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Error al crear el curso");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      [CourseCategory.SOFT_SKILLS]: "Habilidades Blandas",
      [CourseCategory.BASIC_COMPETENCIES]: "Competencias Básicas",
      [CourseCategory.JOB_PLACEMENT]: "Inserción Laboral",
      [CourseCategory.ENTREPRENEURSHIP]: "Emprendimiento",
      [CourseCategory.TECHNICAL_SKILLS]: "Habilidades Técnicas",
      [CourseCategory.DIGITAL_LITERACY]: "Alfabetización Digital",
      [CourseCategory.COMMUNICATION]: "Comunicación",
      [CourseCategory.LEADERSHIP]: "Liderazgo",
    };
    return labels[category as CourseCategory] || category;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Crear Nuevo Curso
          </h1>
          <p className="text-muted-foreground">
            Completa la información para crear un nuevo curso
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Curso *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Introducción al Emprendimiento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institución</Label>
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange("institutionName", e.target.value)}
                  placeholder="CEMSE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción Corta</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                placeholder="Resumen breve del curso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción Completa *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción detallada del curso, qué aprenderán los estudiantes..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-4">
              <CourseFileUpload
                onFilesChange={handleFilesChange}
                className="w-full"
              />
              
              {/* Alternative: URL inputs */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  O ingresa URLs directamente:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">URL de Imagen</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoPreview">URL de Video Preview</Label>
                    <Input
                      id="videoPreview"
                      value={formData.videoPreview}
                      onChange={(e) => handleInputChange("videoPreview", e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>
            </div>


          </CardContent>
        </Card>

        {/* Course Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración del Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nivel *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleInputChange("level", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseLevel.BEGINNER}>Principiante</SelectItem>
                    <SelectItem value={CourseLevel.INTERMEDIATE}>Intermedio</SelectItem>
                    <SelectItem value={CourseLevel.ADVANCED}>Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="240"
                />
              </div>
            </div>


          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Objetivos de Aprendizaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateArrayItem(objectives, setObjectives, index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(objectives, setObjectives, index)}
                    disabled={objectives.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem(objectives, setObjectives)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Objetivo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos Previos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) => updateArrayItem(prerequisites, setPrerequisites, index, e.target.value)}
                    placeholder={`Requisito ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(prerequisites, setPrerequisites, index)}
                    disabled={prerequisites.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem(prerequisites, setPrerequisites)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Requisito
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Agregar etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Included Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Materiales Incluidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {includedMaterials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={material}
                    onChange={(e) => updateArrayItem(includedMaterials, setIncludedMaterials, index, e.target.value)}
                    placeholder={`Material ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(includedMaterials, setIncludedMaterials, index)}
                    disabled={includedMaterials.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem(includedMaterials, setIncludedMaterials)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Material
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/courses">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={createCourseMutation.isPending || isFileUploading}
            className="min-w-[120px]"
          >
            {createCourseMutation.isPending || isFileUploading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {isFileUploading ? 'Subiendo archivos...' : 'Creando...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Crear Curso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}