"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/use-auth";
import { useCreateJobOffer } from "@/hooks/use-job-offers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  X,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Building2
} from "lucide-react";
import { ContractType, WorkModality, ExperienceLevel } from "@/types/jobs";
import { CreateJobOfferRequest } from "@/services/job-offer.service";

export default function CreateJobOfferPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const createJobOfferMutation = useCreateJobOffer();
  
  const [formData, setFormData] = useState<Partial<CreateJobOfferRequest>>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    municipality: "",
    contractType: "FULL_TIME" as ContractType,
    workSchedule: "",
    workModality: "ON_SITE" as WorkModality,
    experienceLevel: "ENTRY_LEVEL" as ExperienceLevel,
    companyId: user?.company?.id || (user as any)?.companyId || user?.id || "",
    salaryMin: undefined,
    salaryMax: undefined,
    benefits: "",
    skillsRequired: [],
    desiredSkills: [],
    applicationDeadline: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newDesiredSkill, setNewDesiredSkill] = useState("");

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = (skill: string, type: 'required' | 'desired') => {
    if (skill.trim()) {
      const field = type === 'required' ? 'skillsRequired' : 'desiredSkills';
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), skill.trim()]
      }));
      if (type === 'required') {
        setNewSkill("");
      } else {
        setNewDesiredSkill("");
      }
    }
  };

  const removeSkill = (skill: string, type: 'required' | 'desired') => {
    const field = type === 'required' ? 'skillsRequired' : 'desiredSkills';
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get company ID from either company object or companyId field as fallback
    const companyId = user?.company?.id || (user as any)?.companyId || user?.id;
    
    if (!companyId) {
      console.error("No se pudo identificar la empresa");
      alert("Error: No se pudo identificar la empresa. Por favor, inicie sesión nuevamente.");
      return;
    }

    try {
      const jobOfferData: CreateJobOfferRequest = {
        ...formData,
        companyId: companyId,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        skillsRequired: formData.skillsRequired || [],
        desiredSkills: formData.desiredSkills || [],
      } as CreateJobOfferRequest;

      await createJobOfferMutation.mutateAsync(jobOfferData);
      router.push("/company/jobs");
    } catch (error) {
      console.error("Error creating job offer:", error);
    }
  };

  const contractTypeOptions = [
    { value: "FULL_TIME", label: "Tiempo Completo" },
    { value: "PART_TIME", label: "Tiempo Parcial" },
    { value: "INTERNSHIP", label: "Pasantía" },
    { value: "VOLUNTEER", label: "Voluntariado" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  const workModalityOptions = [
    { value: "ON_SITE", label: "Presencial" },
    { value: "REMOTE", label: "Remoto" },
    { value: "HYBRID", label: "Híbrido" },
  ];

  const experienceLevelOptions = [
    { value: "NO_EXPERIENCE", label: "Sin Experiencia" },
    { value: "ENTRY_LEVEL", label: "Nivel Básico" },
    { value: "MID_LEVEL", label: "Nivel Intermedio" },
    { value: "SENIOR_LEVEL", label: "Nivel Senior" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Publicar Empleo</h1>
            <p className="text-sm text-muted-foreground">
              Crea un nuevo puesto de trabajo para tu empresa
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Información principal del puesto de trabajo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Puesto *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Desarrollador Frontend Senior"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del Puesto *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe las responsabilidades y funciones del puesto..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requisitos *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Especifica los requisitos mínimos para el puesto..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location and Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación y Horario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <Input
                      id="location"
                      placeholder="Ej: Cochabamba, Bolivia"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipality">Municipio *</Label>
                    <Input
                      id="municipality"
                      placeholder="Ej: Cochabamba"
                      value={formData.municipality}
                      onChange={(e) => handleInputChange('municipality', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Tipo de Contrato *</Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value) => handleInputChange('contractType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workModality">Modalidad de Trabajo *</Label>
                    <Select
                      value={formData.workModality}
                      onValueChange={(value) => handleInputChange('workModality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {workModalityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Nivel de Experiencia *</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleInputChange('experienceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workSchedule">Horario de Trabajo *</Label>
                  <Input
                    id="workSchedule"
                    placeholder="Ej: Lunes a Viernes, 9:00 AM - 6:00 PM"
                    value={formData.workSchedule}
                    onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Habilidades y Competencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Required Skills */}
                <div className="space-y-3">
                  <Label>Habilidades Requeridas</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar habilidad requerida"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(newSkill, 'required');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSkill(newSkill, 'required')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill, 'required')}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Desired Skills */}
                <div className="space-y-3">
                  <Label>Habilidades Deseadas (Opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar habilidad deseada"
                      value={newDesiredSkill}
                      onChange={(e) => setNewDesiredSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(newDesiredSkill, 'desired');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSkill(newDesiredSkill, 'desired')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.desiredSkills?.map((skill) => (
                      <Badge key={skill} variant="outline" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill, 'desired')}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Salary and Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Salario y Beneficios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salario Mínimo (Bs.)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="0"
                      value={formData.salaryMin || ''}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salario Máximo (Bs.)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="0"
                      value={formData.salaryMax || ''}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Beneficios (Opcional)</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Seguro médico, bonos, capacitación, etc."
                    value={formData.benefits}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles de Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Fecha Límite de Aplicación</Label>
                  <Input
                    id="applicationDeadline"
                    type="datetime-local"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={createJobOfferMutation.isPending}>
                    {createJobOfferMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Publicando...
                      </>
                    ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Publicar Empleo
                    </>
                    )}
                  </Button>
                  
                  <Button type="button" variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Previa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 