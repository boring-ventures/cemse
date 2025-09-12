export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";

export type ContractType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "VOLUNTEER"
  | "FREELANCE";

export type WorkModality = "ON_SITE" | "REMOTE" | "HYBRID";

export type ExperienceLevel =
  | "NO_EXPERIENCE"
  | "ENTRY_LEVEL"
  | "MID_LEVEL"
  | "SENIOR_LEVEL";

export type ApplicationStatus =
  | "SENT"
  | "UNDER_REVIEW"
  | "PRE_SELECTED"
  | "REJECTED"
  | "HIRED";

export interface JobSearchFilters {
  query?: string;
  location?: string[];
  contractType?: string[];
  workModality?: string[];
  experienceLevel?: string[];
  salaryMin?: number;
  salaryMax?: number;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  businessSector?: string;
  companySize?: string;
  email?: string;
  phone?: string;
  address?: string;
  foundedYear?: number;
  isActive?: boolean;
  municipalityId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractType: ContractType;
  workSchedule: string;
  workModality: WorkModality;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[]; // Array de URLs de imágenes
  logo?: string; // Logo de la empresa para la oferta
  municipality: string;
  department: string;
  experienceLevel: ExperienceLevel;
  educationRequired?: string;
  skillsRequired: string[];
  desiredSkills: string[];
  requiredSkills: string[]; // Added for compatibility
  responsibilities: string[]; // Added for compatibility
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  isActive: boolean;
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  applicationCount: number; // Added for compatibility
  viewCount: number; // Added for compatibility
  featured: boolean;
  expiresAt?: string;
  publishedAt: string;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  coverLetter?: string;
  rating?: number;
  notes?: string;
  cvFile?: string;
  coverLetterFile?: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    municipality?: string;
    department?: string;
    birthDate?: string | null;
    avatarUrl?: string;
    location?: string;
  };
  jobOffer: {
    id: string;
    title: string;
    company?: {
      name: string;
      email: string;
    };
  };
  cvData?: {
    education?: string;
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };
  questionAnswers?: JobQuestionAnswer[];
}

export interface JobQuestionAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface JobQuestion {
  id: string;
  jobOfferId: string;
  question: string;
  type: "text" | "multiple_choice" | "boolean";
  required: boolean;
  options: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for backward compatibility
export interface JobOfferLegacy {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  contractType: "PAID" | "INTERNSHIP" | "VOLUNTEER";
  workSchedule: "FULL_TIME" | "PART_TIME" | "FLEXIBLE";
  workModality: "ON_SITE" | "REMOTE" | "HYBRID";
  location: string;
  municipality: string;
  department: string;
  experienceLevel: string;
  educationRequired?: string;
  skillsRequired: string[];
  applicationDeadline?: string;
  isActive: boolean;
  viewsCount: number;
  applicationsCount: number;
  companyId: string;
  company?: CompanyProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logo: string;
  description: string;
  sector: string;
  size: string;
  location: string;
  rating: number;
  reviewCount: number;
  website: string;
  images: string[];
}
