// User roles based on Prisma schema
export type UserRole = 
  | 'YOUTH' 
  | 'ADOLESCENTS' 
  | 'COMPANIES' 
  | 'MUNICIPAL_GOVERNMENTS' 
  | 'TRAINING_CENTERS' 
  | 'NGOS_AND_FOUNDATIONS' 
  | 'SUPER_ADMIN';

// User interface for authentication
export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

// Login request and response
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

// Refresh token request and response
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}