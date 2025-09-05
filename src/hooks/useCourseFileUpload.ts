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

// Chunk size for large file uploads (256KB chunks for better compatibility with server limits)
const CHUNK_SIZE = 256 * 1024; // 256KB - reduced for better server compatibility

export const useCourseFileUpload = (): UseCourseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to split file into chunks
  const splitFileIntoChunks = (file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

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
  const uploadFileInChunks = async (
    file: File,
    fileType: "thumbnail" | "videoPreview",
    chunkSize: number = CHUNK_SIZE
  ): Promise<string> => {
    // For very large files (>100MB), start with smaller chunks
    if (file.size > 100 * 1024 * 1024 && chunkSize === CHUNK_SIZE) {
      console.log("📁 Hook: Very large file detected, starting with smaller chunks (128KB)");
      chunkSize = 128 * 1024;
    }
    const chunks = splitFileIntoChunksWithSize(file, chunkSize);
    const totalChunks = chunks.length;

    console.log(
      `📁 Hook: Uploading ${file.name} in ${totalChunks} chunks of ${(chunkSize / 1024).toFixed(0)}KB each`
    );

    // Create a unique session ID for this upload
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
      formData.append("fileType", fileType);
      formData.append("fileSize", file.size.toString());
      formData.append("mimeType", file.type);

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

          const response = await fetch("/api/files/upload/chunk", {
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
            `📁 Hook: Chunk ${chunkNumber}/${totalChunks} uploaded successfully`
          );
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error as Error;
          retryCount++;

          if (retryCount <= maxRetries) {
            console.log(
              `📁 Hook: Chunk ${chunkNumber} upload failed, retrying (${retryCount}/${maxRetries}):`,
              error
            );
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          } else {
            console.error(`📁 Hook: Chunk ${chunkNumber} upload failed after ${maxRetries} retries:`, error);
          }
        }
      }

      if (retryCount > maxRetries && lastError) {
        console.error(`📁 Hook: Error uploading chunk ${chunkNumber}:`, lastError);

        // If it's a 413 error or network timeout, try with progressively smaller chunks
        if (lastError.message.includes("413") || 
            lastError.message.includes("Request Entity Too Large") ||
            lastError.message.includes("timeout") ||
            lastError.message.includes("aborted")) {
          if (chunkSize === CHUNK_SIZE) {
            console.log(
              "📁 Hook: 413 error detected, retrying with smaller chunks (128KB)"
            );
            return uploadFileInChunks(file, fileType, 128 * 1024); // 128KB chunks
          } else if (chunkSize === 128 * 1024) {
            console.log(
              "📁 Hook: 413 error still occurring, retrying with even smaller chunks (64KB)"
            );
            return uploadFileInChunks(file, fileType, 64 * 1024); // 64KB chunks
          } else if (chunkSize === 64 * 1024) {
            console.log(
              "📁 Hook: 413 error still occurring, retrying with minimal chunks (32KB)"
            );
            return uploadFileInChunks(file, fileType, 32 * 1024); // 32KB chunks
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
    finalizeFormData.append("fileType", fileType);

    let finalizeRetryCount = 0;
    const maxFinalizeRetries = 3;
    let finalizeLastError: Error | null = null;

    while (finalizeRetryCount <= maxFinalizeRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for finalization

        const finalizeResponse = await fetch("/api/files/upload/finalize", {
          method: "POST",
          body: finalizeFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!finalizeResponse.ok) {
          throw new Error(`Failed to finalize upload: ${finalizeResponse.statusText}`);
        }

        const finalizeResult = await finalizeResponse.json();
        console.log("📁 Hook: Upload finalized successfully");
        return finalizeResult.fileUrl;
      } catch (error) {
        finalizeLastError = error as Error;
        finalizeRetryCount++;

        if (finalizeRetryCount <= maxFinalizeRetries) {
          console.log(
            `📁 Hook: Finalize failed, retrying (${finalizeRetryCount}/${maxFinalizeRetries}):`,
            error
          );
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, finalizeRetryCount) * 1000));
        } else {
          console.error(`📁 Hook: Finalize failed after ${maxFinalizeRetries} retries:`, error);
        }
      }
    }

    throw new Error(`Failed to finalize upload after ${maxFinalizeRetries} retries: ${finalizeLastError?.message}`);
  };

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

      // Validate file sizes before upload
      if (files.thumbnail && files.thumbnail.size > 5 * 1024 * 1024) {
        toast.error("El archivo thumbnail es demasiado grande. Máximo 5MB");
        return null;
      }

      if (
        files.videoPreview &&
        files.videoPreview.size > 2 * 1024 * 1024 * 1024
      ) {
        toast.error("El archivo video es demasiado grande. Máximo 2GB");
        return null;
      }

      const uploadedFiles: { thumbnail?: string; videoPreview?: string } = {};

      // Upload thumbnail (small file, use regular upload)
      if (files.thumbnail) {
        console.log("📁 Hook: Uploading thumbnail...");
        setUploadProgress(10); // Start progress
        
        const formData = new FormData();
        formData.append("thumbnail", files.thumbnail);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

        const response = await fetch("/api/files/upload/course-files", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Thumbnail upload failed: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        uploadedFiles.thumbnail = result.thumbnail;
        setUploadProgress(30); // Update progress
        console.log("📁 Hook: Thumbnail uploaded successfully");
      }

      // Upload video (use chunked upload for files >50MB, regular upload for smaller files)
      if (files.videoPreview) {
        const isLargeFile = files.videoPreview.size > 50 * 1024 * 1024; // 50MB threshold - increased for better performance
        
        if (isLargeFile) {
          console.log("📁 Hook: Large video detected, using chunked upload...");
          setUploadProgress(40); // Update progress for large file
          const videoUrl = await uploadFileInChunks(
            files.videoPreview,
            "videoPreview"
          );
          uploadedFiles.videoPreview = videoUrl;
          setUploadProgress(90); // Update progress after chunked upload
          console.log("📁 Hook: Video uploaded successfully via chunks");
        } else {
          console.log("📁 Hook: Small video detected, trying regular upload first...");
          
          try {
            setUploadProgress(40); // Update progress for small file
            const formData = new FormData();
            formData.append("videoPreview", files.videoPreview);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

            const response = await fetch("/api/files/upload/course-files", {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              
              // Handle "Request Entity Too Large" or 413 errors by switching to chunked upload
              if (response.status === 413 || 
                  errorData.useChunkedUpload || 
                  response.statusText.includes("Entity Too Large") ||
                  errorData.error?.includes("demasiado grande") ||
                  errorData.error?.includes("Request Entity Too Large")) {
                console.log("📁 Hook: File too large for regular upload, switching to chunked upload...");
                setUploadProgress(50); // Update progress for fallback
                const videoUrl = await uploadFileInChunks(
                  files.videoPreview,
                  "videoPreview"
                );
                uploadedFiles.videoPreview = videoUrl;
                setUploadProgress(90); // Update progress after chunked upload
              } else {
                throw new Error(`Video upload failed: ${errorData.error || response.statusText}`);
              }
            } else {
              const result = await response.json();
              uploadedFiles.videoPreview = result.videoPreview;
              setUploadProgress(90); // Update progress after regular upload
              console.log("📁 Hook: Video uploaded successfully via regular upload");
            }
          } catch (error) {
            // If regular upload fails for any reason, fallback to chunked upload
            console.log("📁 Hook: Regular upload failed, falling back to chunked upload...", error);
            setUploadProgress(50); // Update progress for fallback
            const videoUrl = await uploadFileInChunks(
              files.videoPreview,
              "videoPreview"
            );
            uploadedFiles.videoPreview = videoUrl;
            setUploadProgress(90); // Update progress after chunked upload
          }
        }
      }

      setUploadProgress(100);
      toast.success("Archivos subidos exitosamente");
      return uploadedFiles;
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
