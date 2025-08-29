import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  contractType: string;
  workModality: string;
  experienceLevel: string;
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

interface JobCreationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseJobCreationReturn {
  isLoading: boolean;
  createJob: (data: JobFormData, user: any, images: File[], status: string) => Promise<void>;
}

export const useJobCreation = (options: JobCreationOptions = {}): UseJobCreationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Transform job data for API
  const transformJobData = (data: JobFormData, user: any) => {
    // Determine the correct company ID to use
    const companyId = user.company?.id || user.id;
    
    console.log('🔍 useJobCreation - transformJobData called with user:', {
      userId: user.id,
      userCompanyId: user.company?.id,
      finalCompanyId: companyId,
      userRole: user.role,
      hasCompanyObject: !!user.company,
      fullUserObject: JSON.stringify(user, null, 2)
    });
    
    return {
      title: data.title,
      description: data.description,
      requirements: data.requirements.length > 0 ? data.requirements.join(', ') : "Sin requisitos específicos",
      location: data.location,
      contractType: data.contractType,
      workSchedule: data.workSchedule || "Horario a definir",
      workModality: data.workModality,
      experienceLevel: data.experienceLevel,
      municipality: "Cochabamba",
      companyId: companyId,
    salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
    salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
    benefits: data.benefits.length > 0 ? data.benefits.join(', ') : undefined,
    skillsRequired: data.requiredSkills.length > 0 ? data.requiredSkills : ["Sin especificar"],
    desiredSkills: data.desiredSkills,
    applicationDeadline: data.closingDate || undefined,
    latitude: data.coordinates ? data.coordinates[0] : undefined,
    longitude: data.coordinates ? data.coordinates[1] : undefined,
    department: data.department || undefined,
    educationRequired: data.educationRequired || undefined,
  };
};

  // Create FormData from job data
  const createFormData = (data: JobFormData, user: any, images: File[]) => {
    const formData = new FormData();
    const jobPayload = transformJobData(data, user);

    // Add all job data to FormData
    Object.entries(jobPayload).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images
    images.forEach(file => formData.append('images', file));

    return formData;
  };

  // Make API request
  const makeJobRequest = async (body: FormData | string, isFormData: boolean = false) => {
    const headers: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
    
    const response = await fetch("/api/joboffer", {
      method: "POST",
      headers,
      credentials: 'include',
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      throw new Error(`HTTP ${response.status}: ${errorData.error || errorText}`);
    }

    return response;
  };

  // Get user-friendly error message
  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return "No se pudo crear el empleo. Inténtalo de nuevo.";
    }

    const message = error.message;
    
    if (message.includes('401')) {
      return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
    }
    
    if (message.includes('400')) {
      const match = message.match(/HTTP 400: (.+)/);
      return match ? `Error: ${match[1]}` : "Hay errores en los datos del formulario. Verifica todos los campos.";
    }
    
    if (message.includes('HTTP')) {
      return `Error del servidor: ${message}`;
    }
    
    return message;
  };

  // Main job creation function
  const createJob = async (
    data: JobFormData,
    user: any,
    images: File[],
    status: string
  ) => {
    console.log('🔍 useJobCreation - createJob called with:', {
      userId: user.id,
      userCompanyId: user.company?.id,
      status,
      hasImages: images.length > 0,
      jobTitle: data.title
    });
    
    setIsLoading(true);

    try {
      const hasImages = images.length > 0;
      let response: Response;

      if (hasImages) {
        // Create FormData for image uploads
        const formData = createFormData(data, user, images);
        response = await makeJobRequest(formData, true);
      } else {
        // Create JSON payload for regular requests
        const jobPayload = transformJobData(data, user);
        response = await makeJobRequest(JSON.stringify(jobPayload), false);
      }

      // Success handling
      toast({
        title: "Empleo creado",
        description: `El empleo ha sido ${status === "ACTIVE" ? "publicado" : "guardado como borrador"}`,
      });
      
      options.onSuccess?.();
      router.push("/company/jobs");

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createJob,
  };
};
