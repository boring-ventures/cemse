"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  ImageIcon,
  Trash,
  Briefcase,
  MapPin,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  JobOffer,
  ContractType,
  WorkModality,
  ExperienceLevel,
  JobStatus,
} from "@/types/jobs";
import { useUpdateJobOffer } from "@/hooks/use-job-offers";
import { useAuthContext } from "@/hooks/use-auth";
import { API_BASE } from "@/lib/api";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/dashboard/MapPicker"), {
  ssr: false,
});

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
  educationRequired: string;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const jobId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<JobOffer | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);

  const updateJobOfferMutation = useUpdateJobOffer();

  // Form data
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "Cochabamba, Bolivia",
    contractType: "" as ContractType,
    workSchedule: "",
    workModality: "" as WorkModality,
    experienceLevel: "" as ExperienceLevel,
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "BOB",
    requiredSkills: [],
    desiredSkills: [],
    benefits: [],
    requirements: [],
    responsibilities: [],
    closingDate: "",
    coordinates: null,
    department: "Cochabamba",
    educationRequired: "",
  });

  const [skillInput, setSkillInput] = useState("");
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

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/joboffer/${jobId}`, {
        headers,
      });

      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);

        // Load existing images if available
        if (jobData.images && jobData.images.length > 0) {
          // Convert backend URLs to full URLs
          const fullImageUrls = jobData.images.map((img: string) =>
            img.startsWith("http")
              ? img
              : `${API_BASE.replace("/api", "")}${img}`
          );
          setImageUrls(fullImageUrls);
          console.log("🔍 Loaded existing images:", fullImageUrls);
        } else {
          console.log("🔍 No existing images found");
        }

        // Populate form with existing data
        setFormData({
          title: jobData.title || "",
          description: jobData.description || "",
          location: jobData.location || "Cochabamba, Bolivia",
          contractType: jobData.contractType || ("" as ContractType),
          workSchedule: jobData.workSchedule || "",
          workModality: jobData.workModality || ("" as WorkModality),
          experienceLevel: jobData.experienceLevel || ("" as ExperienceLevel),
          salaryMin: jobData.salaryMin?.toString() || "",
          salaryMax: jobData.salaryMax?.toString() || "",
          salaryCurrency: jobData.salaryCurrency || "BOB",
          requiredSkills: jobData.skillsRequired || [],
          desiredSkills: jobData.desiredSkills || [],
          benefits: jobData.benefits ? jobData.benefits.split(", ") : [],
          requirements: jobData.requirements
            ? jobData.requirements.split(", ")
            : [],
          responsibilities: [],
          closingDate: jobData.applicationDeadline || "",
          coordinates:
            jobData.latitude && jobData.longitude
              ? [jobData.latitude, jobData.longitude]
              : null,
          department: jobData.department || "Cochabamba",
          educationRequired: jobData.educationRequired || "",
        });

        console.log("🔍 Job data received from backend:", jobData);
        console.log("🔍 Backend data check:", {
          department: jobData.department || "NOT PROVIDED",
          educationRequired: jobData.educationRequired || "NOT PROVIDED",
          desiredSkills: jobData.desiredSkills || "NOT PROVIDED",
          images: jobData.images || "NOT PROVIDED",
          coordinates:
            jobData.latitude && jobData.longitude
              ? [jobData.latitude, jobData.longitude]
              : "NOT PROVIDED",
        });
      } else {
        const errorText = await response.text();
        console.error("Error fetching job:", response.status, errorText);
        toast({
          title: "Error",
          description: "No se pudo cargar el empleo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        title: "Error",
        description: "Error al cargar el empleo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (
    field: keyof typeof formData,
    value: string,
    setInput: (value: string) => void
  ) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
      setInput("");
    }
  };

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
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

  const validateForm = () => {
    const required = [
      "title",
      "description",
      "contractType",
      "workModality",
      "experienceLevel",
      "location",
    ];

    for (const field of required) {
      const value = formData[field as keyof typeof formData];
      if (!value) {
        toast({
          title: "Campos requeridos",
          description: `Por favor completa el campo: ${field}`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!formData.workSchedule || formData.workSchedule.trim() === "") {
      toast({
        title: "Horario requerido",
        description: "Por favor especifica el horario de trabajo",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (status: JobStatus) => {
    if (!validateForm()) {
      return;
    }

    if (!user || !user.id) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar autenticado como empresa para editar empleos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Check if we have images to upload
      const hasImages = images.length > 0;

      if (hasImages) {
        // Use FormData for image uploads - only send changed fields
        const formDataToSend = new FormData();

        // Only add fields that have changed or are required
        if (formData.title !== job?.title) {
          formDataToSend.append("title", formData.title);
        }
        if (formData.description !== job?.description) {
          formDataToSend.append("description", formData.description);
        }
        if (formData.requirements.join(", ") !== (job?.requirements || "")) {
          formDataToSend.append(
            "requirements",
            formData.requirements.length > 0
              ? formData.requirements.join(", ")
              : "Sin requisitos específicos"
          );
        }
        if (formData.location !== job?.location) {
          formDataToSend.append("location", formData.location);
        }
        if (formData.contractType !== job?.contractType) {
          formDataToSend.append("contractType", formData.contractType);
        }
        if (formData.workSchedule !== job?.workSchedule) {
          formDataToSend.append(
            "workSchedule",
            formData.workSchedule || "Horario a definir"
          );
        }
        if (formData.workModality !== job?.workModality) {
          formDataToSend.append("workModality", formData.workModality);
        }
        if (formData.experienceLevel !== job?.experienceLevel) {
          formDataToSend.append("experienceLevel", formData.experienceLevel);
        }

        // Add optional data only if changed
        if (formData.salaryMin !== (job?.salaryMin?.toString() || "")) {
          formDataToSend.append("salaryMin", formData.salaryMin);
        }
        if (formData.salaryMax !== (job?.salaryMax?.toString() || "")) {
          formDataToSend.append("salaryMax", formData.salaryMax);
        }
        if (formData.benefits.join(", ") !== (job?.benefits || "")) {
          formDataToSend.append("benefits", formData.benefits.join(", "));
        }
        if (formData.closingDate !== (job?.applicationDeadline || "")) {
          formDataToSend.append("applicationDeadline", formData.closingDate);
        }
        if (formData.department !== (job?.department || "")) {
          formDataToSend.append("department", formData.department);
        }
        if (formData.educationRequired !== (job?.educationRequired || "")) {
          formDataToSend.append(
            "educationRequired",
            formData.educationRequired
          );
        }

        // Check if coordinates changed
        const currentCoords =
          job?.latitude && job?.longitude
            ? [job.latitude, job.longitude]
            : null;
        if (
          JSON.stringify(formData.coordinates) !== JSON.stringify(currentCoords)
        ) {
          if (formData.coordinates) {
            formDataToSend.append(
              "latitude",
              formData.coordinates[0].toString()
            );
            formDataToSend.append(
              "longitude",
              formData.coordinates[1].toString()
            );
          }
        }

        // Check if arrays changed
        const currentSkills = job?.skillsRequired || [];
        if (
          JSON.stringify(formData.requiredSkills) !==
          JSON.stringify(currentSkills)
        ) {
          formDataToSend.append(
            "skillsRequired",
            JSON.stringify(
              formData.requiredSkills.length > 0
                ? formData.requiredSkills
                : ["Sin especificar"]
            )
          );
        }

        const currentDesiredSkills = job?.desiredSkills || [];
        if (
          JSON.stringify(formData.desiredSkills) !==
          JSON.stringify(currentDesiredSkills)
        ) {
          formDataToSend.append(
            "desiredSkills",
            JSON.stringify(formData.desiredSkills)
          );
        }

        // Add images directly as files
        for (let index = 0; index < images.length; index++) {
          const file = images[index];
          formDataToSend.append("images", file);
          console.log(
            `🔍 Added image ${index + 1}/${images.length}: ${file.name}`
          );
        }

        console.log("🔍 Using FormData for image upload with partial update");
        console.log("🔍 Making request to /api/joboffer with FormData");
        console.log(
          "🔍 FormData entries count:",
          Array.from(formDataToSend.entries()).length
        );

        const token = localStorage.getItem("token") || "";
        console.log("🔍 Authorization token:", token ? "Present" : "Missing");

        const response = await fetch(`/api/joboffer/${jobId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        console.log(
          "🔍 Response received:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Response error text:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Empleo actualizado correctamente",
          });
          router.push(`/jobs/${jobId}`);
        } else {
          throw new Error("Error updating job");
        }
      } else {
        // Use JSON for requests without images - only send changed fields
        const updateData: any = {};

        // Only add fields that have changed
        if (formData.title !== job?.title) {
          updateData.title = formData.title;
        }
        if (formData.description !== job?.description) {
          updateData.description = formData.description;
        }
        if (formData.requirements.join(", ") !== (job?.requirements || "")) {
          updateData.requirements =
            formData.requirements.length > 0
              ? formData.requirements.join(", ")
              : "Sin requisitos específicos";
        }
        if (formData.location !== job?.location) {
          updateData.location = formData.location;
        }
        if (formData.contractType !== job?.contractType) {
          updateData.contractType = formData.contractType;
        }
        if (formData.workSchedule !== job?.workSchedule) {
          updateData.workSchedule =
            formData.workSchedule || "Horario a definir";
        }
        if (formData.workModality !== job?.workModality) {
          updateData.workModality = formData.workModality;
        }
        if (formData.experienceLevel !== job?.experienceLevel) {
          updateData.experienceLevel = formData.experienceLevel;
        }

        // Optional fields
        if (formData.salaryMin !== (job?.salaryMin?.toString() || "")) {
          updateData.salaryMin = formData.salaryMin
            ? parseInt(formData.salaryMin)
            : undefined;
        }
        if (formData.salaryMax !== (job?.salaryMax?.toString() || "")) {
          updateData.salaryMax = formData.salaryMax
            ? parseInt(formData.salaryMax)
            : undefined;
        }
        if (formData.benefits.join(", ") !== (job?.benefits || "")) {
          updateData.benefits =
            formData.benefits.length > 0
              ? formData.benefits.join(", ")
              : undefined;
        }
        if (formData.closingDate !== (job?.applicationDeadline || "")) {
          updateData.applicationDeadline = formData.closingDate || undefined;
        }
        if (formData.department !== (job?.department || "")) {
          updateData.department = formData.department || undefined;
        }
        if (formData.educationRequired !== (job?.educationRequired || "")) {
          updateData.educationRequired =
            formData.educationRequired || undefined;
        }

        // Check coordinates
        const currentCoords =
          job?.latitude && job?.longitude
            ? [job.latitude, job.longitude]
            : null;
        if (
          JSON.stringify(formData.coordinates) !== JSON.stringify(currentCoords)
        ) {
          if (formData.coordinates) {
            updateData.latitude = formData.coordinates[0];
            updateData.longitude = formData.coordinates[1];
          }
        }

        // Check arrays
        const currentSkills = job?.skillsRequired || [];
        if (
          JSON.stringify(formData.requiredSkills) !==
          JSON.stringify(currentSkills)
        ) {
          updateData.skillsRequired =
            formData.requiredSkills.length > 0
              ? formData.requiredSkills
              : ["Sin especificar"];
        }

        const currentDesiredSkills = job?.desiredSkills || [];
        if (
          JSON.stringify(formData.desiredSkills) !==
          JSON.stringify(currentDesiredSkills)
        ) {
          updateData.desiredSkills = formData.desiredSkills;
        }

        console.log("🔍 Prepared partial update data:", updateData);
        console.log(
          "🔍 Making request to /api/joboffer with JSON (partial update)"
        );

        const token = localStorage.getItem("token") || "";
        console.log("🔍 Authorization token:", token ? "Present" : "Missing");

        const response = await fetch(`/api/joboffer/${jobId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });

        console.log(
          "🔍 Response received:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Response error text:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Empleo actualizado correctamente",
          });
          router.push(`/jobs/${jobId}`);
        } else {
          throw new Error("Error updating job");
        }
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Form Cards Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
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
                  Empleo no encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  El empleo que buscas no existe o no tienes permisos para
                  editarlo.
                </p>
                <Button
                  onClick={() => router.push("/company/jobs")}
                  className="w-full h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a mis empleos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
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
                disabled={saving}
                className="h-11 px-6"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar borrador
              </Button>
              <Button
                onClick={() => handleSubmit("ACTIVE")}
                disabled={saving}
                className="h-11 px-6"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Actualizar empleo
              </Button>
            </div>
          </div>

          {/* Job Preview */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formData.title}
                  </h1>
                  <p className="text-gray-600 font-medium">TechCorp Bolivia</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{formData.location}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {
                      contractTypeOptions.find(
                        (o) => o.value === formData.contractType
                      )?.label
                    }
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-800"
                  >
                    {
                      workModalityOptions.find(
                        (o) => o.value === formData.workModality
                      )?.label
                    }
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-purple-200 text-purple-800"
                  >
                    {
                      experienceLevelOptions.find(
                        (o) => o.value === formData.experienceLevel
                      )?.label
                    }
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                {formData.responsibilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Responsabilidades
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.responsibilities.map((resp, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-indigo-200 text-indigo-800"
                        >
                          {resp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Habilidades requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill, i) => (
                      <Badge
                        key={i}
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Editar Empleo
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Actualiza la información de tu oferta de trabajo
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setPreview(true)}
            className="h-11 px-6"
          >
            <Eye className="w-4 h-4 mr-2" />
            Vista previa
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
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
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px] border-gray-200 focus:border-blue-500"
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
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.contractType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
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
                    value={formData.workModality}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
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
                    value={formData.experienceLevel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salaryMax: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="department"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Departamento
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
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
                    value={formData.educationRequired}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
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
                  value={formData.workSchedule || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
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
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="w-5 h-5 text-green-600" />
                Habilidades y Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  {formData.requiredSkills.map((skill, i) => (
                    <Badge
                      key={i}
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
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("desiredSkills", skillInput, setSkillInput);
                      }
                    }}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addToArray("desiredSkills", skillInput, setSkillInput)
                    }
                    className="h-12 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.desiredSkills.map((skill, i) => (
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
                  {formData.requirements.map((req, i) => (
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
                  {formData.responsibilities.map((resp, i) => (
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
                  {formData.benefits.map((benefit, i) => (
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

          {/* Geographic Location */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-5 h-5 text-red-600" />
                Ubicación Geográfica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Selecciona en el mapa la ubicación del empleo
              </Label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <MapPicker
                  initialCoordinates={formData.coordinates}
                  onChange={(coords) =>
                    setFormData((prev) => ({ ...prev, coordinates: coords }))
                  }
                />
              </div>
              {formData.coordinates && (
                <p className="text-sm text-gray-600 mt-2">
                  Latitud: {formData.coordinates[0]}, Longitud:{" "}
                  {formData.coordinates[1]}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Job Images */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Imágenes del Empleo
              </CardTitle>
              <p className="text-sm text-gray-600">
                Nota: Las imágenes no estaban disponibles en empleos creados
                anteriormente. Puedes agregar imágenes ahora y se guardarán en
                futuras actualizaciones.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="flex flex-col sm:flex-row justify-end gap-4 pb-8">
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={saving}
              className="h-12 px-8"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar borrador
            </Button>
            <Button
              onClick={() => handleSubmit("ACTIVE")}
              disabled={saving}
              className="h-12 px-8"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {saving ? "Guardando..." : "Actualizar empleo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
