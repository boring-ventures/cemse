import { useState, useEffect } from 'react';
import { useAuthContext } from './use-auth';
import { apiCall, API_BASE } from '@/lib/api';
import { buildFileUrl, checkFileAccess } from '@/lib/utils';

interface CVStatus {
  hasCV: boolean;
  hasCoverLetter: boolean;
  cvUrl?: string;
  coverLetterUrl?: string;
  cvData?: any;
  loading: boolean;
  error?: string;
  cvSource?: 'builder' | 'file' | null; // Para saber de dónde viene el CV
}

export function useCVStatus() {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<CVStatus>({
    hasCV: false,
    hasCoverLetter: false,
    loading: true,
    cvSource: null
  });

  useEffect(() => {
    console.log('🎯 useCVStatus - useEffect triggered:', { userId: user?.id });
    if (user?.id) {
      checkCVStatus();
    } else {
      // Verificar si hay token pero no usuario (sesión expirada)
      const token = localStorage.getItem('token');
      if (token) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'No estás autenticado. Por favor, inicia sesión.'
        }));
      }
    }
  }, [user?.id]);

  const checkCVStatus = async () => {
    console.log('🎯 useCVStatus - checkCVStatus called');
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      let hasCVData = false;
      let hasCVFile = false;
      let cvData = null;
      let cvFileData = null;
      let coverLetterData = null;
      let cvSource: 'builder' | 'file' | null = null;

      // Check if user has CV data from builder (mock data for now)
      // TODO: Implement proper CV builder integration
      hasCVData = false;
      cvSource = null;

      // Check if user has uploaded CV file (only if no builder CV)
      if (!hasCVData) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            // Verificar si hay archivos CV guardados en localStorage de sesiones anteriores
            const savedCVUrl = localStorage.getItem('userCVUrl');
            if (savedCVUrl) {
              const exists = await checkFileAccess(savedCVUrl, token);
              if (exists) {
                hasCVFile = true;
                cvFileData = { files: [savedCVUrl.split('/').pop() || 'cv.pdf'] };
                cvSource = 'file';
              } else {
                // Si el archivo ya no existe, limpiar localStorage
                localStorage.removeItem('userCVUrl');
              }
            }

            // Si no hay archivos guardados, asumimos que no hay
            if (!hasCVFile) {
              hasCVFile = false;
              cvFileData = { files: [] };
            }
          }
        } catch (error) {
          hasCVFile = false;
        }
      }

      // Check if user has uploaded cover letter file
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verificar si hay archivos de carta guardados en localStorage de sesiones anteriores
          const savedCoverLetterUrl = localStorage.getItem('userCoverLetterUrl');
          if (savedCoverLetterUrl) {
            const exists = await checkFileAccess(savedCoverLetterUrl, token);
            if (exists) {
              coverLetterData = { files: [savedCoverLetterUrl.split('/').pop() || 'cover-letter.pdf'] };
            } else {
              // Si el archivo ya no existe, limpiar localStorage
              localStorage.removeItem('userCoverLetterUrl');
            }
          }

          // Si no hay archivos guardados, asumimos que no hay
          if (!coverLetterData) {
            coverLetterData = { files: [] };
          }
        }
      } catch (error) {
        coverLetterData = { files: [] };
      }

      const hasCoverLetterFile = coverLetterData && coverLetterData.files && coverLetterData.files.length > 0;

      // Verificar que los archivos realmente existen y son accesibles
      let finalCVUrl = undefined;
      let finalCoverLetterUrl = undefined;
      let finalHasCV = hasCVData || hasCVFile;
      let finalHasCoverLetter = hasCoverLetterFile;

      if (hasCVFile && cvFileData?.files?.[0]) {
        const cvPath = `/uploads/documents/${cvFileData.files[0]}`;
        const token = localStorage.getItem('token');
        const cvExists = await checkFileAccess(cvPath, token || undefined);
        if (cvExists) {
          finalCVUrl = cvPath;
        } else {
          finalHasCV = false;
        }
      }

      if (hasCoverLetterFile && coverLetterData?.files?.[0]) {
        const coverLetterPath = `/uploads/cover-letters/${coverLetterData.files[0]}`;
        const token = localStorage.getItem('token');
        const coverLetterExists = await checkFileAccess(coverLetterPath, token || undefined);
        if (coverLetterExists) {
          finalCoverLetterUrl = coverLetterPath;
        } else {
          finalHasCoverLetter = false;
        }
      }

      const finalStatus = {
        hasCV: finalHasCV,
        hasCoverLetter: finalHasCoverLetter,
        cvUrl: finalCVUrl,
        coverLetterUrl: finalCoverLetterUrl,
        cvData: hasCVData ? cvData : undefined,
        loading: false,
        cvSource
      };

      console.log('🎯 useCVStatus - Final Status:', finalStatus);
      setStatus(finalStatus);
    } catch (error) {
      console.error('Error checking CV status:', error);
      setStatus({
        hasCV: false,
        hasCoverLetter: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al verificar CV',
        cvSource: null
      });
    }
  };

  const uploadCVFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('cvFile', file);

      // Use direct fetch to Next.js API route with cookies for authentication
      const response = await fetch('/api/files/upload/cv', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        body: formData // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Actualizar el estado con la URL devuelta por el backend
      const newStatus = {
        ...status,
        hasCV: true,
        cvUrl: result.cvUrl, // Usar la URL devuelta por el backend
        cvSource: 'file' as const,
        loading: false,
        hasCoverLetter: status.hasCoverLetter ?? false
      };
      console.log('🎯 useCVStatus - After CV upload:', newStatus);
      setStatus(newStatus);

      // Guardar la URL en localStorage para futuras sesiones
      if (result.cvUrl) {
        localStorage.setItem('userCVUrl', result.cvUrl);
      }

      return result;
    } catch (error) {
      console.error('Error uploading CV file:', error);
      throw error;
    }
  };

  const uploadCoverLetterFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('coverLetterFile', file);

      // Use direct fetch to Next.js API route with cookies for authentication
      const response = await fetch('/api/files/upload/cover-letter', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        body: formData // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Actualizar el estado con la URL devuelta por el backend
      const newStatus = {
        ...status,
        hasCoverLetter: true,
        coverLetterUrl: result.coverLetterUrl, // Usar la URL devuelta por el backend
        loading: false
      };
      console.log('🎯 useCVStatus - After Cover Letter upload:', newStatus);
      setStatus(newStatus);

      // Guardar la URL en localStorage para futuras sesiones
      if (result.coverLetterUrl) {
        localStorage.setItem('userCoverLetterUrl', result.coverLetterUrl);
      }

      return result;
    } catch (error) {
      console.error('Error uploading cover letter file:', error);
      throw error;
    }
  };

  const deleteCVFile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      // Actualizar el estado para indicar que no hay CV
      setStatus(prev => ({
        ...prev,
        hasCV: false,
        cvUrl: undefined,
        cvSource: null
      }));

      // Limpiar localStorage
      localStorage.removeItem('userCVUrl');

      return { message: 'CV eliminado del estado local' };
    } catch (error) {
      console.error('Error deleting CV file:', error);
      throw error;
    }
  };

  const deleteCoverLetterFile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      // Actualizar el estado para indicar que no hay carta de presentación
      setStatus(prev => ({
        ...prev,
        hasCoverLetter: false,
        coverLetterUrl: undefined
      }));

      // Limpiar localStorage
      localStorage.removeItem('userCoverLetterUrl');

      return { message: 'Carta de presentación eliminada del estado local' };
    } catch (error) {
      console.error('Error deleting cover letter file:', error);
      throw error;
    }
  };

  const deleteCVBuilder = async () => {
    try {
      // TODO: Implement proper CV builder deletion
      // For now, just return success
      console.log('CV builder deletion not implemented yet');
      await checkCVStatus(); // Refresh status
      return { message: 'CV builder deletion not implemented yet' };
    } catch (error) {
      console.error('Error deleting CV builder:', error);
      throw error;
    }
  };

  return {
    ...status,
    checkCVStatus,
    uploadCVFile,
    uploadCoverLetterFile,
    deleteCVFile,
    deleteCoverLetterFile,
    deleteCVBuilder
  };
}
