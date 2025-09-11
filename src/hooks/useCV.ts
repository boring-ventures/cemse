import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";

export interface CVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    addressLine?: string;
    city?: string;
    state?: string;
    municipality: string;
    department: string;
    country: string;
    birthDate?: Date;
    gender?: string;
    documentType?: string;
    documentNumber?: string;
    profileImage?: string;
  };
  education: {
    level: string; // Nivel educativo
    institution: string; // Institución actual (mapped from currentInstitution)
    currentInstitution: string; // Institución actual
    graduationYear: number; // Año de graduación
    isStudying: boolean; // Si está estudiando actualmente

    // Educación detallada
    educationHistory: EducationHistoryItem[]; // Historial completo
    currentDegree: string; // Grado actual
    universityName: string; // Nombre de la universidad
    universityStartDate: string; // Fecha de inicio en universidad
    universityEndDate: string | null; // Fecha de fin en universidad
    universityStatus: string; // Estado universitario
    gpa: number; // Promedio académico
    academicAchievements: AcademicAchievement[]; // Logros académicos
  };
  professional: {
    jobTitle: string;
    skills: {
      name: string;
      experienceLevel?: string;
    }[];
    skillsWithLevel: {
      name: string;
      experienceLevel?: string;
    }[];
    interests: string[];
    languages: {
      name: string;
      proficiency: string;
    }[];
    websites: {
      platform: string;
      url: string;
    }[];
    workExperience: {
      jobTitle: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }[];
  };
  additional: {
    achievements: any[];
    extracurricularActivities: {
      title: string;
      organization?: string;
      startDate: string;
      endDate: string;
      description: string;
    }[];
    projects: {
      title: string;
      location?: string;
      startDate: string;
      endDate: string;
      description: string;
    }[];
  };
  coverLetter: {
    recipient: string;
    subject: string;
    content: string;
    template: string;
  };
  metadata: {
    profileCompletion: number;
    lastUpdated: Date;
    createdAt: Date;
  };

  // Convenience properties for backward compatibility
  jobTitle?: string;
  professionalSummary?: string;
  skills?: {
    name: string;
    experienceLevel?: string;
  }[];
  interests?: string[];
  languages?: {
    name: string;
    proficiency: string;
  }[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  workExperience?: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects?: {
    title: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  activities?: {
    title: string;
    organization?: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  achievements?: any[];
  certifications?: any[];
  targetPosition?: string;
  targetCompany?: string;
  relevantSkills?: string[];
}

// Interfaces adicionales para educación
export interface EducationHistoryItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  status: string;
  gpa?: number;
}

export interface AcademicAchievement {
  title: string;
  date: string;
  description: string;
  type: string; // "honor", "award", "certification", etc.
}

export interface CoverLetterData {
  template: string;
  content: string;
  recipient: {
    department: string;
    companyName: string; // Changed from company to companyName
    address: string;
    city: string;
    country: string; // Added country field
  };
  subject: string;
}

export interface CreateCVData {
  personalInfo: CVData["personalInfo"];
  jobTitle?: string;
  professionalSummary?: string;
  education: CVData["education"];
  skills: CVData["skills"];
  interests: string[];
  languages: CVData["languages"];
  socialLinks: CVData["socialLinks"];
  workExperience: CVData["workExperience"];
  projects: CVData["projects"];
  activities: CVData["activities"];
  achievements: any[];
  certifications: any[];
  targetPosition?: string;
  targetCompany?: string;
  relevantSkills?: string[];
}

export interface CreateCoverLetterData {
  content: string;
  template?: string;
  recipient?: {
    department: string;
    companyName: string;
    address: string;
    city: string;
    country: string;
  };
  subject?: string;
}

export interface GenerateCVData {
  jobOfferId: string;
}

// Fetch CV with comprehensive functionality
export const useCV = () => {
  const queryClient = useQueryClient();

  const cvQuery = useQuery({
    queryKey: ["cv"],
    queryFn: async () => {
      console.log("🔍 Fetching CV data from API...");
      const data = await apiCall("/cv");
      console.log("📥 Received CV data from API:", data);

      // Transform API response to match CVData interface
      if (data) {
        const typedData = data as any;
        return {
          ...typedData,
          // Map nested properties to root level for backward compatibility
          jobTitle: typedData.professional?.jobTitle || "",
          professionalSummary: typedData.professionalSummary || "",
          skills:
            typedData.professional?.skills ||
            typedData.professional?.skillsWithLevel ||
            [],
          interests: typedData.professional?.interests || [],
          languages: typedData.professional?.languages || [],
          socialLinks: typedData.professional?.websites || [],
          workExperience: typedData.professional?.workExperience || [],
          projects: typedData.additional?.projects || [],
          activities: typedData.additional?.extracurricularActivities || [],
          achievements: typedData.additional?.achievements || [],
          // Note: certifications field doesn't exist in database yet
          // certifications: typedData.certifications || [],
          targetPosition: typedData.targetPosition || "",
          targetCompany: typedData.targetCompany || "",
          relevantSkills: typedData.relevantSkills || [],
        } as CVData;
      }
      return data;
    },
  });

  const coverLetterQuery = useQuery({
    queryKey: ["coverLetter"],
    queryFn: async () => {
      const data = await apiCall("/cv/cover-letter");
      // Transform to match CoverLetterData interface
      if (data && (data as any).coverLetter) {
        const typedData = data as any;
        return {
          template: typedData.coverLetter.template || "professional",
          content: typedData.coverLetter.content || "",
          recipient: {
            department: "Departamento de Recursos Humanos",
            companyName: "Nombre de la Empresa",
            address: "Dirección de la Empresa",
            city: "Ciudad",
            country: "Bolivia",
          },
          subject: typedData.coverLetter.subject || "",
        } as CoverLetterData;
      }
      return data;
    },
  });

  const updateCVMutation = useMutation({
    mutationFn: async (cvData: Partial<CVData>) => {
      const data = await apiCall("/cv", {
        method: "PUT",
        body: JSON.stringify(cvData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
    },
  });

  const saveCoverLetterMutation = useMutation({
    mutationFn: async (coverLetterData: CreateCoverLetterData) => {
      const data = await apiCall("/cv/cover-letter", {
        method: "POST",
        body: JSON.stringify(coverLetterData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverLetter"] });
    },
  });

  const updateCVData = async (data: Partial<CVData>) => {
    try {
      // Transform the data to match the API expected structure
      const apiData: any = {};

      if (data.personalInfo) {
        apiData.personalInfo = data.personalInfo;
      }

      if (data.education) {
        apiData.education = data.education;
      }

      if (
        data.jobTitle ||
        data.skills ||
        data.interests ||
        data.languages ||
        data.socialLinks ||
        data.workExperience
      ) {
        apiData.professional = {};
        if (data.jobTitle) apiData.professional.jobTitle = data.jobTitle;
        if (data.skills) apiData.professional.skills = data.skills;
        if (data.interests) apiData.professional.interests = data.interests;
        if (data.languages) apiData.professional.languages = data.languages;
        if (data.socialLinks) apiData.professional.websites = data.socialLinks;
        if (data.workExperience)
          apiData.professional.workExperience = data.workExperience;
      }

      if (data.projects || data.activities || data.achievements) {
        apiData.additional = {};
        if (data.projects) apiData.additional.projects = data.projects;
        if (data.activities)
          apiData.additional.extracurricularActivities = data.activities;
        if (data.achievements)
          apiData.additional.achievements = data.achievements;
      }

      if (data.professionalSummary !== undefined) {
        apiData.professionalSummary = data.professionalSummary;
      }

      // Add missing fields
      if (data.targetPosition !== undefined) {
        apiData.targetPosition = data.targetPosition;
      }
      if (data.targetCompany !== undefined) {
        apiData.targetCompany = data.targetCompany;
      }
      if (data.relevantSkills !== undefined) {
        apiData.relevantSkills = data.relevantSkills;
      }
      // Note: certifications field doesn't exist in database yet
      // if (data.certifications !== undefined) {
      //   apiData.certifications = data.certifications;
      // }

      await updateCVMutation.mutateAsync(apiData);
    } catch (error) {
      console.error("Error updating CV data:", error);
      throw error;
    }
  };

  const saveCoverLetterData = async (data: CreateCoverLetterData) => {
    try {
      await saveCoverLetterMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error saving cover letter data:", error);
      throw error;
    }
  };

  return {
    cvData: cvQuery.data as CVData | undefined,
    coverLetterData: coverLetterQuery.data as CoverLetterData | undefined,
    loading: cvQuery.isLoading || coverLetterQuery.isLoading,
    error: cvQuery.error || coverLetterQuery.error,
    updateCVData,
    saveCoverLetterData,
    isUpdating: updateCVMutation.isPending,
    isSavingCoverLetter: saveCoverLetterMutation.isPending,
  };
};

// Create CV mutation
export const useCreateCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvData: CreateCVData) => {
      const data = await apiCall("/cv", {
        method: "POST",
        body: JSON.stringify(cvData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
    },
  });
};

// Update CV mutation
export const useUpdateCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvData: Partial<CVData>) => {
      const data = await apiCall("/cv", {
        method: "PUT",
        body: JSON.stringify(cvData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
    },
  });
};

// Fetch cover letter
export const useCoverLetter = () => {
  return useQuery({
    queryKey: ["coverLetter"],
    queryFn: async () => {
      const data = await apiCall("/cv/cover-letter");
      return data;
    },
  });
};

// Create cover letter mutation
export const useCreateCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coverLetterData: CreateCoverLetterData) => {
      const data = await apiCall("/cv/cover-letter", {
        method: "POST",
        body: JSON.stringify(coverLetterData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverLetter"] });
    },
  });
};

// Generate CV for application mutation
export const useGenerateCVForApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationData: GenerateCVData) => {
      const data = await apiCall("/cv/generate-for-application", {
        method: "POST",
        body: JSON.stringify(applicationData),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv"] });
    },
  });
};
