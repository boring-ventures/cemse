import { useState } from "react";
import { toast } from "sonner";

interface UploadedFiles {
  thumbnail?: string;
  videoPreview?: string;
}

interface UseCourseFileUploadReturn {
  uploadFiles: (files: {
    thumbnail?: File;
    videoPreview?: File;
  }) => Promise<UploadedFiles | null>;
  isUploading: boolean;
  uploadProgress: number;
}

export const useCourseFileUpload = (): UseCourseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (files: {
    thumbnail?: File;
    videoPreview?: File;
  }): Promise<UploadedFiles | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check if we have any files to upload
      if (!files.thumbnail && !files.videoPreview) {
        toast.error("No se seleccionaron archivos para subir");
        return null;
      }

      // Create FormData
      const formData = new FormData();
      if (files.thumbnail) {
        formData.append("thumbnail", files.thumbnail);
      }
      if (files.videoPreview) {
        formData.append("videoPreview", files.videoPreview);
      }

      // Simulate progress
      setUploadProgress(25);

      // Upload files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      try {
        const response = await fetch("/api/files/upload/course-files", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setUploadProgress(75);

        if (!response.ok) {
          let errorMessage = "Error al subir archivos";

          if (response.status === 413) {
            errorMessage =
              "El archivo es demasiado grande. Máximo 2GB por archivo.";
          } else if (response.status === 408) {
            errorMessage =
              "Tiempo de espera agotado. El archivo es demasiado grande o la conexión es lenta.";
          } else if (response.status === 401) {
            errorMessage =
              "No autorizado. Por favor, inicia sesión nuevamente.";
          } else if (response.status === 400) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage =
                "Error en el formato del archivo. Verifica el tipo y tamaño.";
            }
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        setUploadProgress(100);

        toast.success("Archivos subidos exitosamente");
        return result;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(
            "Tiempo de espera agotado. El archivo es demasiado grande o la conexión es lenta."
          );
        }

        throw error;
      }
    } catch (error) {
      console.error("Error uploading course files:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir archivos"
      );
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
