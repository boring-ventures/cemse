// User roles based on the API documentation
export type UserRole =
  | 'JOVENES'
  | 'ADOLESCENTES'
  | 'EMPRESAS'
  | 'COMPANIES' // Alternative role name for companies
  | 'GOBIERNOS_MUNICIPALES'
  | 'CENTROS_DE_FORMACION'
  | 'ONGS_Y_FUNDACIONES'
  | 'CLIENT'
  | 'AGENT'
  | 'SUPER_ADMIN'
  | 'SUPERADMIN'; // Agregado para compatibilidad con el backend

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: UserRole;
  user?: User;
  municipality?: {
    id: string;
    name: string;
    department: string;
    region: string;
    population: number;
    mayorName: string;
    mayorEmail: string;
    mayorPhone: string;
    address: string;
    website: string;
    isActive: boolean;
    username: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  company?: {
    id: string;
    name: string;
    description: string;
    businessSector: string;
    companySize: string;
    foundedYear: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    taxId: string | null;
    createdAt: string;
    updatedAt: string;
    username?: string;
  };
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional fields for different user types
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string | null;
  // Institution colors
  primaryColor?: string;
  secondaryColor?: string;
  // Organization-specific fields
  companyId?: string | null;
  municipalityId?: string | null;
  municipality?: {
    id: string;
    name: string;
    department: string;
    region: string;
    population: number;
    mayorName: string;
    mayorEmail: string;
    mayorPhone: string;
    address: string;
    website: string;
    isActive: boolean;
    username: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
  };
  company?: {
    id: string;
    name: string;
    description: string;
    businessSector: string;
    companySize: string;
    foundedYear: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    taxId: string | null;
    createdAt: string;
    updatedAt: string;
    isActive?: boolean;
  };
}

// Profile types
export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  interests?: string[];
  skills?: string[];
  education?: string;
  experience?: string;
  achievements?: Achievement[];
  socialMedia?: SocialMedia;
  preferences?: UserPreferences;
  completionPercentage?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  verified: boolean;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

// Course types
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  coverImage?: string | null;
  videoPreview: string | null;
  objectives: string[];
  prerequisites: string[];
  duration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  isMandatory: boolean;
  isActive: boolean;
  price: string | number;
  rating: string | number;
  studentsCount: number;
  enrollmentCount?: number;
  completionRate: string | number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
  tags: string[];
  certification: boolean;
  includedMaterials: string[];
  instructorId?: string | null;
  institutionName?: string | null;
  instructor?: {
    id: string;
    name: string;
    title: string;
    avatar?: string;
  } | null;
  organization?: {
    id: string;
    name: string;
    logo?: string;
  } | null;
  modules?: CourseModule[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  isLocked: boolean;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
  content: LessonContent;
  duration: number;
  order: number;
  isPreview: boolean;
  resources?: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  videoUrl?: string;
  textContent?: string;
  slides?: string[];
  attachments?: string[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'FILE';
  url: string;
  description?: string;
}

// Quiz types
export interface Quiz {
  id: string;
  lessonId?: string;
  courseId?: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  passingScore: number;
  questions: QuizQuestion[];
  attempts: number;
  isRandomized: boolean;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

// Job types
export interface JobOffer {
  id: string;
  title: string;
  description: string;
  company: Company;
  location: string;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  workModality: 'REMOTE' | 'ONSITE' | 'HYBRID';
  experienceLevel: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'EXECUTIVE';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  requiredSkills: string[];
  desiredSkills?: string[];
  benefits?: string[];
  requirements: string[];
  responsibilities: string[];
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  publishedAt: string;
  expiresAt?: string;
  applicationCount: number;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  sector: string;
  size: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
}

export interface JobApplication {
  id: string;
  jobOfferId: string;
  userId: string;
  jobOffer?: JobOffer;
  user?: UserProfile;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'SENT' | 'UNDER_REVIEW' | 'PRE_SELECTED' | 'REJECTED' | 'HIRED';
  appliedAt: string;
  updatedAt: string;
}

// News types
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorType: 'COMPANY' | 'GOVERNMENT' | 'INSTITUTION' | 'USER';
  authorLogo?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  targetAudience: UserRole[];
  region?: string;
  relatedLinks?: RelatedLink[];
}

export interface RelatedLink {
  title: string;
  url: string;
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  format: string;
  downloadUrl?: string | null;
  externalUrl?: string | null;
  thumbnail: string;
  author: string;
  publishedDate: Date | string;
  downloads: number;
  rating: number;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Business Plan types
export interface BusinessPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'COMPLETED' | 'PUBLISHED';
  content: BusinessPlanContent;
  financialProjections?: FinancialProjection[];
  attachments?: string[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPlanContent {
  executiveSummary?: string;
  businessDescription?: string;
  marketAnalysis?: string;
  organizationManagement?: string;
  serviceProductLine?: string;
  marketingStrategy?: string;
  fundingRequest?: string;
  financialProjections?: string;
  appendix?: string;
}

export interface FinancialProjection {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
}

// Certificate types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  completedDate: string;
  certificateUrl: string;
  grade?: string;
  credentialId: string;
  isVerified: boolean;
  createdAt: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

// Query parameters for list endpoints
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
} 