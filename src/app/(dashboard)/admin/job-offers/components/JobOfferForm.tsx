"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";
import { getAuthHeaders } from "@/lib/api";
import MapPicker from "@/components/dashboard/MapPicker";

const jobOfferSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  requirements: z.string().min(1, "Los requisitos son requeridos"),
  benefits: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string().default("BOB"),
  contractType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "INTERNSHIP",
    "VOLUNTEER",
    "FREELANCE",
  ]),
  workSchedule: z.string().min(1, "El horario de trabajo es requerido"),
  workModality: z.enum(["ON_SITE", "REMOTE", "HYBRID"]),
  location: z.string().min(1, "La ubicación es requerida"),
  municipality: z.string().min(1, "El municipio es requerido"),
  department: z.string().default("Cochabamba"),
  experienceLevel: z.enum([
    "NO_EXPERIENCE",
    "ENTRY_LEVEL",
    "MID_LEVEL",
    "SENIOR_LEVEL",
  ]),
  educationRequired: z
    .enum([
      "PRIMARY",
      "SECONDARY",
      "TECHNICAL",
      "UNIVERSITY",
      "POSTGRADUATE",
      "OTHER",
    ])
    .optional(),
  skillsRequired: z.array(z.string()).default([]),
  desiredSkills: z.array(z.string()).default([]),
  applicationDeadline: z.string().optional(),
  companyId: z.string().min(1, "La empresa es requerida"),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "DRAFT"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

type JobOfferFormData = z.infer<typeof jobOfferSchema>;

interface Company {
  id: string;
  name: string;
  businessSector?: string;
}

interface JobOfferFormProps {
  jobOffer?: any;
  onSubmit: (data: JobOfferFormData) => void;
  isEditing?: boolean;
}

export function JobOfferForm({
  jobOffer,
  onSubmit,
  isEditing = false,
}: JobOfferFormProps) {
  const [skillsRequired, setSkillsRequired] = useState<string[]>(
    jobOffer?.skillsRequired || []
  );
  const [desiredSkills, setDesiredSkills] = useState<string[]>(
    jobOffer?.desiredSkills || []
  );
  const [newSkillRequired, setNewSkillRequired] = useState("");
  const [newDesiredSkill, setNewDesiredSkill] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    jobOffer?.latitude && jobOffer?.longitude
      ? [jobOffer.latitude, jobOffer.longitude]
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: jobOffer?.title || "",
      description: jobOffer?.description || "",
      requirements: jobOffer?.requirements || "",
      benefits: jobOffer?.benefits || "",
      salaryMin: jobOffer?.salaryMin?.toString() || "",
      salaryMax: jobOffer?.salaryMax?.toString() || "",
      salaryCurrency: jobOffer?.salaryCurrency || "BOB",
      contractType: jobOffer?.contractType || "FULL_TIME",
      workSchedule: jobOffer?.workSchedule || "",
      workModality: jobOffer?.workModality || "ON_SITE",
      location: jobOffer?.location || "",
      municipality: jobOffer?.municipality || "",
      department: jobOffer?.department || "Cochabamba",
      experienceLevel: jobOffer?.experienceLevel || "ENTRY_LEVEL",
      educationRequired: jobOffer?.educationRequired || undefined,
      companyId: jobOffer?.companyId || "",
      status: jobOffer?.status || "ACTIVE",
      featured: jobOffer?.featured || false,
      applicationDeadline: jobOffer?.applicationDeadline
        ? new Date(jobOffer.applicationDeadline).toISOString().split("T")[0]
        : "",
      expiresAt: jobOffer?.expiresAt
        ? new Date(jobOffer.expiresAt).toISOString().split("T")[0]
        : "",
    },
  });

  // Fetch companies for dropdown
  const { data: companiesResponse } = useQuery<{ companies: Company[] }>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/company", {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Error al cargar las empresas");
      }
      return response.json();
    },
  });

  const companies = companiesResponse?.companies || [];

  useEffect(() => {
    setValue("skillsRequired", skillsRequired);
    setValue("desiredSkills", desiredSkills);
  }, [skillsRequired, desiredSkills, setValue]);

  // Initialize form when editing
  useEffect(() => {
    if (isEditing && jobOffer) {
      // Set coordinates if they exist
      if (jobOffer.latitude && jobOffer.longitude) {
        setCoordinates([jobOffer.latitude, jobOffer.longitude]);
      }
    }
  }, [isEditing, jobOffer]);

  const addSkillRequired = () => {
    if (
      newSkillRequired.trim() &&
      !skillsRequired.includes(newSkillRequired.trim())
    ) {
      setSkillsRequired([...skillsRequired, newSkillRequired.trim()]);
      setNewSkillRequired("");
    }
  };

  const removeSkillRequired = (skill: string) => {
    setSkillsRequired(skillsRequired.filter((s) => s !== skill));
  };

  const addDesiredSkill = () => {
    if (
      newDesiredSkill.trim() &&
      !desiredSkills.includes(newDesiredSkill.trim())
    ) {
      setDesiredSkills([...desiredSkills, newDesiredSkill.trim()]);
      setNewDesiredSkill("");
    }
  };

  const removeDesiredSkill = (skill: string) => {
    setDesiredSkills(desiredSkills.filter((s) => s !== skill));
  };

  const handleFormSubmit = (data: JobOfferFormData) => {
    const formData = {
      ...data,
      skillsRequired,
      desiredSkills,
      coordinates: coordinates,
      salaryMin: data.salaryMin || undefined,
      salaryMax: data.salaryMax || undefined,
      applicationDeadline: data.applicationDeadline || undefined,
      expiresAt: data.expiresAt || undefined,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Empleo *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="ej., Desarrollador Frontend"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Empresa *</Label>
              <Select
                value={watch("companyId")}
                onValueChange={(value) => setValue("companyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-sm text-red-600">
                  {errors.companyId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Empleo *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe el rol, responsabilidades y qué hace emocionante esta posición..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos *</Label>
            <Textarea
              id="requirements"
              {...register("requirements")}
              placeholder="Lista los requisitos para esta posición..."
              rows={3}
            />
            {errors.requirements && (
              <p className="text-sm text-red-600">
                {errors.requirements.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Beneficios (Opcional)</Label>
            <Textarea
              id="benefits"
              {...register("benefits")}
              placeholder="Lista los beneficios y ventajas ofrecidas..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Empleo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractType">Tipo de Contrato *</Label>
              <Select
                value={watch("contractType")}
                onValueChange={(value) =>
                  setValue("contractType", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Tiempo Completo</SelectItem>
                  <SelectItem value="PART_TIME">Medio Tiempo</SelectItem>
                  <SelectItem value="INTERNSHIP">Pasantía</SelectItem>
                  <SelectItem value="VOLUNTEER">Voluntario</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
              {errors.contractType && (
                <p className="text-sm text-red-600">
                  {errors.contractType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workModality">Modalidad de Trabajo *</Label>
              <Select
                value={watch("workModality")}
                onValueChange={(value) =>
                  setValue("workModality", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ON_SITE">Presencial</SelectItem>
                  <SelectItem value="REMOTE">Remoto</SelectItem>
                  <SelectItem value="HYBRID">Híbrido</SelectItem>
                </SelectContent>
              </Select>
              {errors.workModality && (
                <p className="text-sm text-red-600">
                  {errors.workModality.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Nivel de Experiencia *</Label>
              <Select
                value={watch("experienceLevel")}
                onValueChange={(value) =>
                  setValue("experienceLevel", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_EXPERIENCE">Sin Experiencia</SelectItem>
                  <SelectItem value="ENTRY_LEVEL">Nivel Inicial</SelectItem>
                  <SelectItem value="MID_LEVEL">Nivel Intermedio</SelectItem>
                  <SelectItem value="SENIOR_LEVEL">Nivel Senior</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceLevel && (
                <p className="text-sm text-red-600">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workSchedule">Horario de Trabajo *</Label>
              <Input
                id="workSchedule"
                {...register("workSchedule")}
                placeholder="ej., Lunes a Viernes, 9 AM - 6 PM"
              />
              {errors.workSchedule && (
                <p className="text-sm text-red-600">
                  {errors.workSchedule.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationRequired">Educación Requerida</Label>
              <Select
                value={watch("educationRequired")}
                onValueChange={(value) =>
                  setValue("educationRequired", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel educativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIMARY">Primaria</SelectItem>
                  <SelectItem value="SECONDARY">Secundaria</SelectItem>
                  <SelectItem value="TECHNICAL">Técnico</SelectItem>
                  <SelectItem value="UNIVERSITY">Universitario</SelectItem>
                  <SelectItem value="POSTGRADUATE">Postgrado</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="ej., Cochabamba, Bolivia"
              />
              {errors.location && (
                <p className="text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio *</Label>
              <Input
                id="municipality"
                {...register("municipality")}
                placeholder="ej., Cochabamba"
              />
              {errors.municipality && (
                <p className="text-sm text-red-600">
                  {errors.municipality.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="ej., Cochabamba"
                defaultValue="Cochabamba"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecciona en el mapa la ubicación del empleo</Label>
              <MapPicker
                initialCoordinates={coordinates}
                onChange={(coords) => setCoordinates(coords)}
              />
              {coordinates && (
                <p className="text-sm text-muted-foreground mt-2">
                  Latitud: {coordinates[0]}, Longitud: {coordinates[1]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle>Información Salarial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salario Mínimo</Label>
              <Input
                id="salaryMin"
                type="number"
                {...register("salaryMin")}
                placeholder="ej., 3000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salario Máximo</Label>
              <Input
                id="salaryMax"
                type="number"
                {...register("salaryMax")}
                placeholder="ej., 5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryCurrency">Moneda</Label>
              <Select
                value={watch("salaryCurrency")}
                onValueChange={(value) => setValue("salaryCurrency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOB">BOB (Boliviano)</SelectItem>
                  <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Habilidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Skills */}
          <div className="space-y-3">
            <Label>Habilidades Requeridas</Label>
            <div className="flex gap-2">
              <Input
                value={newSkillRequired}
                onChange={(e) => setNewSkillRequired(e.target.value)}
                placeholder="Agregar habilidad requerida"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkillRequired())
                }
              />
              <Button type="button" onClick={addSkillRequired} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsRequired.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillRequired(skill)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Desired Skills */}
          <div className="space-y-3">
            <Label>Habilidades Deseadas (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={newDesiredSkill}
                onChange={(e) => setNewDesiredSkill(e.target.value)}
                placeholder="Agregar habilidad deseada"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addDesiredSkill())
                }
              />
              <Button type="button" onClick={addDesiredSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {desiredSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeDesiredSkill(skill)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates and Status */}
      <Card>
        <CardHeader>
          <CardTitle>Fechas y Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Fecha Límite de Aplicación</Label>
              <Input
                id="applicationDeadline"
                type="date"
                {...register("applicationDeadline")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Fecha de Expiración</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PAUSED">Pausado</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="featured"
                checked={watch("featured")}
                onCheckedChange={(checked) =>
                  setValue("featured", checked as boolean)
                }
              />
              <Label htmlFor="featured">Oferta de Empleo Destacada</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Publicando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Actualizar Empleo" : "Publicar Empleo"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
