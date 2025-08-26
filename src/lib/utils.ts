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
 * Descarga un archivo con autenticación
 */
export async function downloadFileWithAuth(filePath: string, filename?: string): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autorización');
    }

    const fullUrl = buildFileUrl(filePath);
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
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
  } catch (error) {
    console.error('Error downloading file:', error);
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
    'YOUTH': 'YOUTH',
    'COMPANIES': 'COMPANIES',
    'MUNICIPAL_GOVERNMENTS': 'MUNICIPAL_GOVERNMENTS',
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'SUPERADMIN': 'SUPER_ADMIN' // Legacy compatibility
  };
  return roleMap[backendRole] || backendRole;
}
