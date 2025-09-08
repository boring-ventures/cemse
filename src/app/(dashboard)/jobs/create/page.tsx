"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Briefcase,
  MapPin,
  ImageIcon,
  Trash,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("@/components/dashboard/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  JobOffer,
  ContractType,
  WorkModality,
  ExperienceLevel,
  JobStatus,
} from "@/types/jobs";
import { useAuthContext } from "@/hooks/use-auth";
import { useJobCreation } from "@/hooks/use-job-creation";

import { useRef, useEffect, useState } from "react";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  contractType: ContractType;
  workModality: WorkModality;
  experienceLevel: ExperienceLevel;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  requiredSkills: string[];
  desiredSkills: string[];
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  closingDate: string;
  coordinates: [number, number] | null;
  workSchedule: string;
  department: string;
  municipality: string; // Add missing municipality field
  educationRequired: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { isLoading, createJob } = useJobCreation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePublishClick = () => {
    setShowTermsModal(true);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImages((prev) => [...prev, ...newFiles]);

    // Create preview URLs for display
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Form state
  const [jobData, setJobData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "Cochabamba, Bolivia",
    contractType: "FULL_TIME" as ContractType,
    workModality: "ON_SITE" as WorkModality,
    experienceLevel: "NO_EXPERIENCE" as ExperienceLevel,
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "BOB",
    requiredSkills: ["Sin especificar"],
    desiredSkills: [],
    benefits: [],
    requirements: ["Sin requisitos específicos"],
    responsibilities: [],
    closingDate: "",
    coordinates: null,
    workSchedule: "Lunes a viernes, 8:00 a 17:00",
    department: "Cochabamba",
    municipality: "Cochabamba",
    educationRequired: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [desiredSkillInput, setDesiredSkillInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");

  const contractTypeOptions = [
    { value: "FULL_TIME", label: "Tiempo completo" },
    { value: "PART_TIME", label: "Medio tiempo" },
    { value: "INTERNSHIP", label: "Prácticas" },
    { value: "VOLUNTEER", label: "Voluntariado" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  const workModalityOptions = [
    { value: "ON_SITE", label: "Presencial" },
    { value: "REMOTE", label: "Remoto" },
    { value: "HYBRID", label: "Híbrido" },
  ];

  const experienceLevelOptions = [
    { value: "NO_EXPERIENCE", label: "Sin experiencia" },
    { value: "ENTRY_LEVEL", label: "Principiante" },
    { value: "MID_LEVEL", label: "Intermedio" },
    { value: "SENIOR_LEVEL", label: "Senior" },
  ];

  const addToArray = (
    field: keyof typeof jobData,
    value: string,
    setInput: (value: string) => void
  ) => {
    if (value.trim()) {
      setJobData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
      setInput("");
    }
  };

  const removeFromArray = (field: keyof typeof jobData, index: number) => {
    setJobData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // Improved validation function
  const validateForm = (): boolean => {
    const requiredFields = {
      title: "Título del empleo",
      description: "Descripción del empleo",
      contractType: "Tipo de contrato",
      workModality: "Modalidad de trabajo",
      experienceLevel: "Nivel de experiencia",
      location: "Ubicación",
      workSchedule: "Horario de trabajo",
      municipality: "Municipio",
    };

    const errors: string[] = [];

    // Check required string fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      const value = jobData[field as keyof JobFormData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors.push(label);
      }
    });

    // Check required skills array
    if (!jobData.requiredSkills || jobData.requiredSkills.length === 0) {
      errors.push("Habilidades requeridas");
    }

    if (errors.length > 0) {
      toast({
        title: "Campos requeridos",
        description: `Por favor completa: ${errors.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Simplified submit handler using the custom hook
  const handleSubmit = async (status: JobStatus) => {
    // Early validation
    if (!validateForm()) return;

    if (!user?.id) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado como empresa para crear empleos",
        variant: "destructive",
      });
      return;
    }

    // Debug: Log the form data being sent
    console.log("🔍 Job Create Page - Form data being submitted:", {
      jobData,
      user: { id: user.id, role: user.role, company: user.company },
      status,
      imagesCount: images.length,
    });

    await createJob(jobData, user, images, status);
  };

  // Debug user authentication
  console.log("🔍 Job Create Page - User authentication check:", {
    user: !!user,
    userObject: user,
    role: user?.role,
    isLoading,
    userId: user?.id,
    companyId: user?.company?.id,
    companyInfo: user?.company,
  });

  // Check if user is authenticated and is a company
  if (!user) {
    console.log("❌ No user found - showing authentication error");
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-white shadow-sm border-0 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Acceso Denegado
                </h3>
                <p className="text-gray-600 mb-6">
                  Debes estar autenticado para crear empleos.
                </p>
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full h-11"
                >
                  Iniciar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isCompanyUser = user.role === "COMPANIES" || user.role === "EMPRESAS";
  if (!isCompanyUser) {
    console.log(
      "❌ User role mismatch - Current role:",
      user.role,
      "Expected: COMPANIES or EMPRESAS"
    );
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-white shadow-sm border-0 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Acceso Denegado
                </h3>
                <p className="text-gray-600 mb-6">
                  Solo las empresas pueden crear empleos.
                </p>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (preview) {
    // Show preview of the job posting
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => setPreview(false)}
              className="h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a editar
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar borrador
              </Button>
              <Button
                onClick={() => handleSubmit("ACTIVE")}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Publicar empleo
              </Button>
            </div>
          </div>

          {/* Job Preview */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {jobData.title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {user?.company?.name || "Tu Empresa"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{jobData.location}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {
                      contractTypeOptions.find(
                        (o) => o.value === jobData.contractType
                      )?.label
                    }
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-800"
                  >
                    {
                      workModalityOptions.find(
                        (o) => o.value === jobData.workModality
                      )?.label
                    }
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-purple-200 text-purple-800"
                  >
                    {
                      experienceLevelOptions.find(
                        (o) => o.value === jobData.experienceLevel
                      )?.label
                    }
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Descripción
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {jobData.description}
                  </p>
                </div>

                {jobData.responsibilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Responsabilidades
                    </h3>
                    <ul className="space-y-2">
                      {jobData.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Habilidades requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {jobData.requiredSkills.map((skill, i) => (
                      <Badge key={i} className="bg-gray-100 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
          <DialogContent className="z-[9999] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Confirmación de publicación
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                Al publicar esta oferta confirmas que los datos proporcionados
                son verídicos y que aceptas nuestros Términos y Condiciones.
              </p>
              <p className="text-gray-500 text-xs">
                El contenido ofensivo, falso o que incumpla las reglas de la
                plataforma puede ser eliminado.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTermsModal(false)}
                className="h-11 px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowTermsModal(false);
                  handleSubmit("ACTIVE");
                }}
                className="h-11 px-6"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aceptar y Publicar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Crear Nuevo Empleo
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Completa la información para publicar tu oferta laboral
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPreview(true)}
              className="h-11 px-6"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista previa
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Título del empleo *
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Desarrollador Frontend Junior"
                  value={jobData.title}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 border-gray-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Descripción del empleo *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe el puesto, responsabilidades principales y qué buscan en el candidato ideal..."
                  value={jobData.description}
                  onChange={(e) =>
                    setJobData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Ubicación
                  </Label>
                  <Input
                    id="location"
                    value={jobData.location}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contractType"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Tipo de contrato *
                  </Label>
                  <Select
                    value={jobData.contractType}
                    onValueChange={(value) =>
                      setJobData((prev) => ({
                        ...prev,
                        contractType: value as ContractType,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona tipo" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="workModality"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Modalidad de trabajo *
                  </Label>
                  <Select
                    value={jobData.workModality}
                    onValueChange={(value) =>
                      setJobData((prev) => ({
                        ...prev,
                        workModality: value as WorkModality,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona modalidad" />
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
                <div>
                  <Label
                    htmlFor="experienceLevel"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Nivel de experiencia *
                  </Label>
                  <Select
                    value={jobData.experienceLevel}
                    onValueChange={(value) =>
                      setJobData((prev) => ({
                        ...prev,
                        experienceLevel: value as ExperienceLevel,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona nivel" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label
                    htmlFor="salaryMin"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Salario mínimo (BOB)
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="3000"
                    value={jobData.salaryMin}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        salaryMin: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="salaryMax"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Salario máximo (BOB)
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="5000"
                    value={jobData.salaryMax}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        salaryMax: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="closingDate"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Fecha límite de aplicación
                  </Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={jobData.closingDate}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        closingDate: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="educationRequired"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Educación requerida
                  </Label>
                  <Select
                    value={jobData.educationRequired}
                    onValueChange={(value) =>
                      setJobData((prev) => ({
                        ...prev,
                        educationRequired: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona nivel educativo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIMARY">Primaria</SelectItem>
                      <SelectItem value="SECONDARY">Secundaria</SelectItem>
                      <SelectItem value="TECHNICAL">Técnico</SelectItem>
                      <SelectItem value="UNIVERSITY">Universidad</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgrado</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="department"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Departamento
                  </Label>
                  <Input
                    id="department"
                    value={jobData.department}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="municipality"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Municipio
                  </Label>
                  <Input
                    id="municipality"
                    value={jobData.municipality}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        municipality: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="workSchedule"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Horario de trabajo *
                </Label>
                <Input
                  id="workSchedule"
                  placeholder="Ej: Lunes a viernes, 8:00 a 17:00"
                  value={jobData.workSchedule || ""}
                  onChange={(e) =>
                    setJobData((prev) => ({
                      ...prev,
                      workSchedule: e.target.value,
                    }))
                  }
                  className="h-12 border-gray-200 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills and Requirements */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Habilidades y Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Required Skills */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Habilidades requeridas *
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: React, JavaScript, etc."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("requiredSkills", skillInput, setSkillInput);
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray("requiredSkills", skillInput, setSkillInput)
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.requiredSkills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="default"
                      className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      onClick={() => removeFromArray("requiredSkills", i)}
                    >
                      {skill} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Desired Skills */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Habilidades deseadas
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: TypeScript, Docker, etc."
                    value={desiredSkillInput}
                    onChange={(e) => setDesiredSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray(
                          "desiredSkills",
                          desiredSkillInput,
                          setDesiredSkillInput
                        );
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray(
                        "desiredSkills",
                        desiredSkillInput,
                        setDesiredSkillInput
                      )
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.desiredSkills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer border-green-200 text-green-800 hover:bg-green-50 transition-colors"
                      onClick={() => removeFromArray("desiredSkills", i)}
                    >
                      {skill} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Requisitos
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: Título universitario en ingeniería"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray(
                          "requirements",
                          requirementInput,
                          setRequirementInput
                        );
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray(
                        "requirements",
                        requirementInput,
                        setRequirementInput
                      )
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.requirements.map((req, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer border-orange-200 text-orange-800 hover:bg-orange-50 transition-colors"
                      onClick={() => removeFromArray("requirements", i)}
                    >
                      {req} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Responsabilidades
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: Desarrollar interfaces de usuario"
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray(
                          "responsibilities",
                          responsibilityInput,
                          setResponsibilityInput
                        );
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray(
                        "responsibilities",
                        responsibilityInput,
                        setResponsibilityInput
                      )
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.responsibilities.map((resp, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer border-indigo-200 text-indigo-800 hover:bg-indigo-50 transition-colors"
                      onClick={() => removeFromArray("responsibilities", i)}
                    >
                      {resp} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Beneficios
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: Seguro médico, capacitaciones"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("benefits", benefitInput, setBenefitInput);
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray("benefits", benefitInput, setBenefitInput)
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.benefits.map((benefit, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer border-purple-200 text-purple-800 hover:bg-purple-50 transition-colors"
                      onClick={() => removeFromArray("benefits", i)}
                    >
                      {benefit} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {!showTermsModal && (
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Ubicación Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Selecciona en el mapa la ubicación del empleo
                </Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {isMounted ? (
                    <MapPicker
                      onChange={(coords) =>
                        setJobData((prev) => ({ ...prev, coordinates: coords }))
                      }
                    />
                  ) : (
                    <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500">Cargando mapa...</div>
                    </div>
                  )}
                </div>
                {jobData.coordinates && (
                  <p className="text-sm text-gray-500 mt-2">
                    Latitud: {jobData.coordinates[0]}, Longitud:{" "}
                    {jobData.coordinates[1]}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Imágenes del Empleo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Selecciona una o varias imágenes
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 px-6"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Subir imágenes
                  </Button>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageUrls.map((src, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={src}
                        alt={`imagen-${index}`}
                        className="object-cover w-full h-32"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8">
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isLoading}
              className="h-12 px-8"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar borrador
            </Button>
            <Button
              onClick={handlePublishClick}
              disabled={isLoading}
              className="h-12 px-8"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Publicar empleo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
