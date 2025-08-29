import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders, API_BASE } from "@/lib/api";
import {
  VideoConverter,
  ConversionProgress,
  needsConversion,
  validateVideoFile,
} from "@/lib/video-conversion";

interface VideoUploadData {
  title: string;
  description: string;
  content: string;
  moduleId: string;
  contentType: string;
  duration: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  video: File;
}

interface UploadProgress {
  stage: "validation" | "conversion" | "upload" | "complete";
  percentage: number;
  message: string;
  conversionProgress?: ConversionProgress;
}

interface UploadResponse {
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    [key: string]: any;
  };
}

export const useVideoUploadWithConversion = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const reportProgress = (
    stage: UploadProgress["stage"],
    percentage: number,
    message: string,
    conversionProgress?: ConversionProgress
  ) => {
    setUploadProgress({ stage, percentage, message, conversionProgress });
  };

  const uploadVideoWithConversion = async (
    data: VideoUploadData
  ): Promise<UploadResponse> => {
    try {
      setIsProcessing(true);

      // Stage 1: Validation
      reportProgress("validation", 0, "Validating video file...");

      const validation = validateVideoFile(data.video);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      reportProgress("validation", 10, "Video file validated successfully");

      let videoToUpload = data.video;

      // Stage 2: Conversion (if needed)
      console.log("🎬 Video file details:", {
        name: data.video.name,
        type: data.video.type,
        size: data.video.size,
        needsConversion: needsConversion(data.video),
      });

      if (needsConversion(data.video)) {
        reportProgress("conversion", 10, "Converting video to MP4 format...");

        try {
          console.log("🎬 Starting MP4 conversion for:", {
            fileName: data.video.name,
            fileSize: data.video.size,
            fileType: data.video.type
          });
          
          const converter = new VideoConverter((conversionProgress) => {
            console.log("🎬 Conversion progress:", conversionProgress);
            reportProgress(
              "conversion",
              10 + conversionProgress.percentage * 0.6,
              "Converting video to MP4 format...",
              conversionProgress
            );
          });

          videoToUpload = await converter.convertToMP4(data.video);
          
          console.log("✅ MP4 conversion successful:", {
            originalFile: data.video.name,
            originalSize: data.video.size,
            originalType: data.video.type,
            convertedFile: videoToUpload.name,
            convertedSize: videoToUpload.size,
            convertedType: videoToUpload.type
          });
          
          reportProgress("conversion", 70, "Video conversion completed successfully");
        } catch (conversionError) {
          console.error(
            "❌ Video conversion to MP4 failed:",
            conversionError
          );
          console.error("Conversion error details:", {
            message: conversionError instanceof Error ? conversionError.message : conversionError,
            originalFile: data.video.name,
            originalSize: data.video.size,
            originalType: data.video.type
          });
          
          reportProgress(
            "conversion",
            70,
            "MP4 conversion failed - using original format"
          );
          
          // Log this as a significant issue since WebM was specifically requested
          console.warn(
            "⚠️ WARNING: MP4 conversion failed! This may cause playback issues."
          );
          
          // Continue with original file if conversion fails
        }
      } else {
        console.log("🎬 Video doesn't need conversion:", {
          fileName: data.video.name,
          fileType: data.video.type,
          reason: "Already in optimal format"
        });
        reportProgress(
          "conversion",
          70,
          "Video already in MP4 format, re-encoding for compatibility"
        );
      }

      // Stage 3: Upload
      reportProgress("upload", 70, "Uploading video to server...");

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("content", data.content);
      formData.append("moduleId", data.moduleId);
      formData.append("contentType", data.contentType);
      formData.append("duration", data.duration.toString());
      formData.append("orderIndex", data.orderIndex.toString());
      formData.append("isRequired", data.isRequired.toString());
      formData.append("isPreview", data.isPreview.toString());
      formData.append("video", videoToUpload);

      reportProgress("upload", 85, "Uploading to storage...");

      const response = await fetch(`${API_BASE}/lesson/with-video`, {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const result = await response.json();

      // Stage 4: Complete
      reportProgress("complete", 100, "Video uploaded successfully!");

      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
        setIsProcessing(false);
      }, 1500);

      return result;
    } catch (error) {
      setUploadProgress(null);
      setIsProcessing(false);
      throw error;
    }
  };

  const uploadMutation = useMutation({
    mutationFn: uploadVideoWithConversion,
    onSuccess: (data) => {
      toast.success("Video uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  return {
    uploadVideo: uploadMutation.mutate,
    uploadVideoAsync: uploadMutation.mutateAsync,
    uploadVideoWithConversion,
    isUploading: uploadMutation.isPending || isProcessing,
    uploadProgress,
    error: uploadMutation.error,
  };
};
