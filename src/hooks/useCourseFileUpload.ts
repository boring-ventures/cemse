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

// Chunk size for large file uploads (5MB chunks to work around infrastructure limits)
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

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

  // Function to upload file in chunks
  const uploadFileInChunks = async (
    file: File,
    fileType: "thumbnail" | "videoPreview"
  ): Promise<string> => {
    const chunks = splitFileIntoChunks(file);
    const totalChunks = chunks.length;

    console.log(
      `📁 Hook: Uploading ${file.name} in ${totalChunks} chunks of ${(CHUNK_SIZE / (1024 * 1024)).toFixed(1)}MB each`
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

      try {
        const response = await fetch("/api/files/upload/chunk", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Chunk ${chunkNumber} upload failed: ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log(
          `📁 Hook: Chunk ${chunkNumber}/${totalChunks} uploaded successfully`
        );
      } catch (error) {
        console.error(`📁 Hook: Error uploading chunk ${chunkNumber}:`, error);
        throw new Error(
          `Failed to upload chunk ${chunkNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Finalize upload
    const finalizeFormData = new FormData();
    finalizeFormData.append("sessionId", sessionId);
    finalizeFormData.append("fileType", fileType);

    const finalizeResponse = await fetch("/api/files/upload/finalize", {
      method: "POST",
      body: finalizeFormData,
    });

    if (!finalizeResponse.ok) {
      throw new Error("Failed to finalize upload");
    }

    const finalizeResult = await finalizeResponse.json();
    return finalizeResult.fileUrl;
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
        const formData = new FormData();
        formData.append("thumbnail", files.thumbnail);

        const response = await fetch("/api/files/upload/course-files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Thumbnail upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        uploadedFiles.thumbnail = result.thumbnail;
        console.log("📁 Hook: Thumbnail uploaded successfully");
      }

      // Upload video (large file, use chunked upload)
      if (files.videoPreview) {
        console.log("📁 Hook: Starting chunked video upload...");
        const videoUrl = await uploadFileInChunks(
          files.videoPreview,
          "videoPreview"
        );
        uploadedFiles.videoPreview = videoUrl;
        console.log("📁 Hook: Video uploaded successfully via chunks");
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
