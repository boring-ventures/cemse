export interface Municipality {
  id: string;
  name: string;
  department: string;
  region?: string;
  population?: number;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  address?: string;
  website?: string;
  username: string;
  email: string;
  phone?: string;
  isActive: boolean;
  institutionType: "MUNICIPALITY" | "NGO" | "FOUNDATION" | "OTHER";
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  creator?: {
    id: string;
    username: string;
    role: string;
  };
  companies?: Array<{
    id: string;
    name: string;
    businessSector: string;
    companySize?: string;
  }>;
  // Campos adicionales para el perfil completo
  description?: string;
  logo?: string;
  coverImage?: string;
  province?: string;
  founded?: string;
  mayor?: {
    name: string;
    photo: string;
    party: string;
    startDate: string;
    endDate: string;
    email: string;
    phone: string;
  };
  demographics?: {
    population: number;
    area: number;
    density: number;
    urbanPopulation: number;
    ruralPopulation: number;
  };
  economy?: {
    budget: number;
    mainActivities: string[];
    unemployment: number;
    poverty: number;
  };
  services?: {
    education: number;
    health: number;
    water: number;
    electricity: number;
    internet: number;
  };
  projects?: Array<{
    name: string;
    description: string;
    budget: number;
    status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
    progress: number;
  }>;
  socialMedia?: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  settings?: {
    publicProfile: boolean;
    showBudget: boolean;
    allowMessages: boolean;
    emailNotifications: boolean;
  };
  certificateUrl?: string;
}

export interface CreateMunicipalityRequest {
  name: string;
  department: string;
  region?: string;
  address?: string;
  website?: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  institutionType: "MUNICIPALITY" | "NGO" | "FOUNDATION" | "OTHER";
  customType?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface UpdateMunicipalityRequest {
  name?: string;
  department?: string;
  region?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  mayorName?: string;
  mayorEmail?: string;
  mayorPhone?: string;
  description?: string;
  population?: number;
  isActive?: boolean;
}

export interface MunicipalityAuthRequest {
  username: string;
  password: string;
}

export interface MunicipalityAuthResponse {
  token: string;
  municipality: Municipality;
}

export interface MunicipalityChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
} 