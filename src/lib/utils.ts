import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_BASE } from '@/lib/api';

// Define the backend base URL
const BACKEND_BASE_URL = API_BASE;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Construye la URL completa para un archivo según su tipo
 */
export function buildFileUrl(filePath: string, baseUrl: string = API_BASE.replace('/api', '')): string {
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Extraer el nombre del archivo del path
  const filename = filePath.split('/').pop();

  if (!filename) {
    console.warn('buildFileUrl: No se pudo extraer el nombre del archivo de:', filePath);
    return filePath;
  }

  // Determinar el tipo de archivo basado en el path
  if (filePath.includes('/uploads/cover-letters/')) {
    return `${baseUrl}/api/files/cover-letters/${filename}`;
  } else if (filePath.includes('/uploads/documents/')) {
    return `${baseUrl}/api/files/documents/${filename}`;
  }

  // Fallback: usar el path original
  return `${baseUrl}${filePath}`;
}

/**
 * Verifica si una URL de archivo es válida y accesible
 */
export async function checkFileAccess(filePath: string, token?: string): Promise<boolean> {
  try {
    const fullUrl = buildFileUrl(filePath);
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'HEAD',
      headers
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking file access:', error);
    return false;
  }
}

/**
 * Descarga un archivo con autenticación basada en cookies
 */
export async function downloadFileWithAuth(filePath: string, filename?: string): Promise<void> {
  try {
    console.log('🔍 downloadFileWithAuth - Attempting to download:', filePath);
    
    // Use cookies for authentication instead of localStorage token
    const fullUrl = buildFileUrl(filePath);
    console.log('🔍 downloadFileWithAuth - Full URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/pdf'
      }
    });

    console.log('🔍 downloadFileWithAuth - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 downloadFileWithAuth - Error response:', errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || filePath.split('/').pop() || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('✅ downloadFileWithAuth - File downloaded successfully');
  } catch (error) {
    console.error('❌ downloadFileWithAuth - Error:', error);
    throw error;
  }
}

/**
 * Extrae la ruta relativa de un archivo desde una URL completa
 */
export function extractFilePath(fullUrl: string | null | undefined): string | undefined {
  if (!fullUrl) return undefined;

  // Si es una URL completa del backend, extraemos la ruta
  if (fullUrl.startsWith(BACKEND_BASE_URL)) {
    return fullUrl.replace(BACKEND_BASE_URL, '');
  }

  // Si ya es una ruta relativa, la devolvemos tal como está
  if (fullUrl.startsWith('/')) {
    return fullUrl;
  }

  return fullUrl;
}

/**
 * Maps backend roles to frontend roles
 * This ensures compatibility between the backend API and frontend permission system
 */
export function mapBackendRoleToFrontend(backendRole: string): string {
  const roleMap: Record<string, string> = {
    'YOUTH': 'JOVENES',
    'ADOLESCENTS': 'ADOLESCENTES',
    'COMPANIES': 'EMPRESAS',
    'MUNICIPAL_GOVERNMENTS': 'GOBIERNOS_MUNICIPALES',
    'TRAINING_CENTERS': 'CENTROS_DE_FORMACION',
    'NGOS_AND_FOUNDATIONS': 'ONGS_Y_FUNDACIONES',
    'SUPERADMIN': 'SUPERADMIN',
    // Handle already mapped roles
    'JOVENES': 'JOVENES',
    'ADOLESCENTES': 'ADOLESCENTES',
    'EMPRESAS': 'EMPRESAS',
    'GOBIERNOS_MUNICIPALES': 'GOBIERNOS_MUNICIPALES',
    'CENTROS_DE_FORMACION': 'CENTROS_DE_FORMACION',
    'ONGS_Y_FUNDACIONES': 'ONGS_Y_FUNDACIONES',
    'SUPER_ADMIN': 'SUPERADMIN'
  };
  return roleMap[backendRole] || backendRole;
}

/**
 * Normalizes user roles to ensure consistency across the application
 * This function handles both backend and frontend role formats
 */
export function normalizeUserRole(role: string | null | undefined): string | null {
  if (!role) return null;

  // First, try to map from backend to frontend
  const mappedRole = mapBackendRoleToFrontend(role);

  // Validate that the mapped role is a valid frontend role
  const validFrontendRoles = [
    'JOVENES',
    'ADOLESCENTES',
    'EMPRESAS',
    'GOBIERNOS_MUNICIPALES',
    'CENTROS_DE_FORMACION',
    'ONGS_Y_FUNDACIONES',
    'SUPERADMIN',
    'SUPER_ADMIN'
  ];

  if (validFrontendRoles.includes(mappedRole)) {
    return mappedRole;
  }

  // If not a valid role, return the original role
  return role;
}

/**
 * Checks if a user role is a municipality role (handles both formats)
 */
export function isMunicipalityRole(role: string | null | undefined): boolean {
  if (!role) return false;

  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'GOBIERNOS_MUNICIPALES';
}

/**
 * Checks if a user role is a company role (handles both formats)
 */
export function isCompanyRole(role: string | null | undefined): boolean {
  if (!role) return false;

  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'EMPRESAS';
}

/**
 * Checks if a user role is a super admin role (handles both formats)
 */
export function isSuperAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;

  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'SUPERADMIN' || normalizedRole === 'SUPER_ADMIN';
}
