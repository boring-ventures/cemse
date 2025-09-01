import { useState } from 'react';
import { toast } from 'sonner';

interface UploadedFiles {
  thumbnail?: string;
  videoPreview?: string;
}

interface UseCourseFileUploadReturn {
  uploadFiles: (files: { thumbnail?: File; videoPreview?: File }) => Promise<UploadedFiles | null>;
  isUploading: boolean;
  uploadProgress: number;
}

export const useCourseFileUpload = (): UseCourseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (files: { thumbnail?: File; videoPreview?: File }): Promise<UploadedFiles | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check if we have any files to upload
      if (!files.thumbnail && !files.videoPreview) {
        toast.error('No se seleccionaron archivos para subir');
        return null;
      }

      // Create FormData
      const formData = new FormData();
      if (files.thumbnail) {
        formData.append('thumbnail', files.thumbnail);
      }
      if (files.videoPreview) {
        formData.append('videoPreview', files.videoPreview);
      }

      // Simulate progress
      setUploadProgress(25);

      // Upload files
      const response = await fetch('/api/files/upload/course-files', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(75);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir archivos');
      }

      const result = await response.json();
      setUploadProgress(100);

      toast.success('Archivos subidos exitosamente');
      return result;

    } catch (error) {
      console.error('Error uploading course files:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir archivos');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
  };
};
