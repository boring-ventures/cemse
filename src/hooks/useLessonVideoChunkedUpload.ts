import { useState } from "react";
import { toast } from "sonner";

interface LessonData {
  title: string;
  description?: string;
  content?: string;
  moduleId: string;
  duration: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
}

interface UseLessonVideoChunkedUploadReturn {
  uploadVideoInChunks: (file: File, lessonData: LessonData) => Promise<any>;
  isUploading: boolean;
  uploadProgress: number;
}

// Chunk size for lesson video uploads (256KB chunks for better compatibility)
const CHUNK_SIZE = 2048 * 1024; // 256KB

export const useLessonVideoChunkedUpload = (): UseLessonVideoChunkedUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to split file into chunks with custom size
  const splitFileIntoChunksWithSize = (
    file: File,
    chunkSize: number
  ): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

  // Function to upload file in chunks with fallback for smaller chunks
  const uploadVideoInChunks = async (
    file: File,
    lessonData: LessonData
  ): Promise<any> => {
    // For very large files (>100MB), start with smaller chunks
    let chunkSize = CHUNK_SIZE;
    if (file.size > 100 * 1024 * 1024) {
      console.log("🎥 Hook: Very large video detected, starting with smaller chunks (128KB)");
      chunkSize = 128 * 1024;
    }

    const chunks = splitFileIntoChunksWithSize(file, chunkSize);
    const totalChunks = chunks.length;

    console.log(
      `🎥 Hook: Uploading ${file.name} in ${totalChunks} chunks of ${(chunkSize / 1024).toFixed(0)}KB each`
    );

    // Create a unique session ID for this upload
    const sessionId = `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload chunks sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkNumber", chunkNumber.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("sessionId", sessionId);
      formData.append("fileName", file.name);
      formData.append("fileSize", file.size.toString());
      formData.append("mimeType", file.type);
      formData.append("moduleId", lessonData.moduleId);

      // Update progress
      const chunkProgress = (i / totalChunks) * 100;
      setUploadProgress(chunkProgress);

      // Retry logic for chunk uploads
      let retryCount = 0;
      const maxRetries = 3;
      let lastError: Error | null = null;

      while (retryCount <= maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout per chunk

          const response = await fetch("/api/lesson/upload/chunk", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `Chunk ${chunkNumber} upload failed: ${response.statusText}`
            );
          }

          const result = await response.json();
          console.log(
            `🎥 Hook: Chunk ${chunkNumber}/${totalChunks} uploaded successfully`
          );
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error as Error;
          retryCount++;

          if (retryCount <= maxRetries) {
            console.log(
              `🎥 Hook: Chunk ${chunkNumber} upload failed, retrying (${retryCount}/${maxRetries}):`,
              error
            );
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          } else {
            console.error(`🎥 Hook: Chunk ${chunkNumber} upload failed after ${maxRetries} retries:`, error);
          }
        }
      }

      if (retryCount > maxRetries && lastError) {
        console.error(`🎥 Hook: Error uploading chunk ${chunkNumber}:`, lastError);

        // If it's a 413 error or network timeout, try with progressively smaller chunks
        if (lastError.message.includes("413") || 
            lastError.message.includes("Request Entity Too Large") ||
            lastError.message.includes("timeout") ||
            lastError.message.includes("aborted")) {
          if (chunkSize === CHUNK_SIZE) {
            console.log(
              "🎥 Hook: 413 error detected, retrying with smaller chunks (128KB)"
            );
            return uploadVideoInChunks(file, lessonData); // Retry with smaller chunks
          } else if (chunkSize === 128 * 1024) {
            console.log(
              "🎥 Hook: 413 error still occurring, retrying with even smaller chunks (64KB)"
            );
            return uploadVideoInChunks(file, lessonData); // Retry with even smaller chunks
          }
        }

        throw new Error(
          `Failed to upload chunk ${chunkNumber}/${totalChunks} (${(chunkSize / 1024).toFixed(0)}KB): ${lastError.message}. Try with a smaller file or check your network connection.`
        );
      }
    }

    // Finalize upload with retry logic
    const finalizeFormData = new FormData();
    finalizeFormData.append("sessionId", sessionId);
    finalizeFormData.append("lessonData", JSON.stringify(lessonData));

    let finalizeRetryCount = 0;
    const maxFinalizeRetries = 3;
    let finalizeLastError: Error | null = null;

    while (finalizeRetryCount <= maxFinalizeRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for finalization

        const finalizeResponse = await fetch("/api/lesson/upload/finalize", {
          method: "POST",
          body: finalizeFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!finalizeResponse.ok) {
          throw new Error(`Failed to finalize upload: ${finalizeResponse.statusText}`);
        }

        const finalizeResult = await finalizeResponse.json();
        console.log("🎥 Hook: Lesson video upload finalized successfully");
        return finalizeResult;
      } catch (error) {
        finalizeLastError = error as Error;
        finalizeRetryCount++;

        if (finalizeRetryCount <= maxFinalizeRetries) {
          console.log(
            `🎥 Hook: Finalize failed, retrying (${finalizeRetryCount}/${maxFinalizeRetries}):`,
            error
          );
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, finalizeRetryCount) * 1000));
        } else {
          console.error(`🎥 Hook: Finalize failed after ${maxFinalizeRetries} retries:`, error);
        }
      }
    }

    throw new Error(`Failed to finalize upload after ${maxFinalizeRetries} retries: ${finalizeLastError?.message}`);
  };

  const uploadVideo = async (file: File, lessonData: LessonData): Promise<any> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file size (2GB limit)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        throw new Error("El archivo de video es demasiado grande. Máximo 2GB");
      }

      // Show warning for large files
      if (file.size > 100 * 1024 * 1024) { // 100MB
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        toast.info(`Archivo grande detectado (${fileSizeMB}MB). Usando carga por fragmentos para mejor confiabilidad.`);
      }

      console.log("🎥 Hook: Starting chunked upload for lesson video...");
      const result = await uploadVideoInChunks(file, lessonData);

      setUploadProgress(100);
      toast.success("Video de lección subido exitosamente");
      return result;
    } catch (error) {
      console.error("Error uploading lesson video:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir video de lección"
      );
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadVideoInChunks: uploadVideo,
    isUploading,
    uploadProgress,
  };
};
