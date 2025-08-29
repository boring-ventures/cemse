import { getAuthHeaders, API_BASE } from "./api";

export interface ConversionProgress {
  stage: "uploading" | "converting" | "downloading" | "complete";
  percentage: number;
  message: string;
}

export class VideoConverter {
  private onProgress?: (progress: ConversionProgress) => void;

  constructor(onProgress?: (progress: ConversionProgress) => void) {
    this.onProgress = onProgress;
  }

  async convertToMP4(videoFile: File): Promise<File> {
    try {
      console.log("🎬 VideoConverter: Starting MP4 conversion", {
        inputFile: videoFile.name,
        inputSize: videoFile.size,
        inputType: videoFile.type
      });
      
      // Stage 1: Uploading for conversion
      this.reportProgress("uploading", 0, "Preparing video for conversion...");

      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("format", "mp4"); // Specify MP4 format for compatibility

      this.reportProgress("uploading", 25, "Uploading video for conversion...");

      console.log("🎬 VideoConverter: Sending request to /video-convert");
      const response = await fetch(`${API_BASE}/video-convert`, {
        method: "POST",
        headers: await getAuthHeaders(true), // excludeContentType = true for FormData
        body: formData,
      });
      
      console.log("🎬 VideoConverter: Received response", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = "Video conversion failed";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
          console.error("🎬 VideoConverter: API error response:", error);
        } catch (parseError) {
          console.error("🎬 VideoConverter: Could not parse error response:", parseError);
          const responseText = await response.text();
          console.error("🎬 VideoConverter: Raw error response:", responseText);
        }
        throw new Error(`${errorMessage} (HTTP ${response.status})`);
      }

      this.reportProgress(
        "converting",
        50,
        "Converting video to MP4 format with H.264 codec..."
      );

      // Simulate conversion progress (in real implementation, you might use WebSocket or polling)
      await this.simulateProgress("converting", 50, 90);

      this.reportProgress("downloading", 90, "Downloading converted video...");

      // Get converted video as blob
      const convertedBlob = await response.blob();
      
      console.log("🎬 VideoConverter: Received blob", {
        blobSize: convertedBlob.size,
        blobType: convertedBlob.type
      });

      // Check if conversion actually happened
      const conversionStatus = response.headers.get("X-Conversion-Status");
      console.log("🎬 VideoConverter: Conversion status:", conversionStatus);

      if (conversionStatus === "ffmpeg-unavailable") {
        console.warn("⚠️ VideoConverter: FFmpeg not available, returning original file");
        this.reportProgress(
          "complete",
          100,
          "Video uploaded successfully (conversion skipped - FFmpeg not available)"
        );

        // Return original file since no conversion happened
        return videoFile;
      }

      const isConvertedToMP4 = conversionStatus === "converted-to-mp4";
      const isFallbackOriginal = conversionStatus === "fallback-original-file";
      
      console.log("🎬 VideoConverter: Determining output format", {
        conversionStatus,
        isConvertedToMP4,
        isFallbackOriginal
      });

      let progressMessage = "Conversion completed successfully!";
      if (isConvertedToMP4) {
        progressMessage = "Video converted to MP4 successfully!";
      } else if (isFallbackOriginal) {
        progressMessage = "Using original video (conversion was skipped)";
        console.warn("⚠️ VideoConverter: Using original file as fallback");
      }
      
      this.reportProgress("complete", 100, progressMessage);

      // Create new File object with appropriate extension
      const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
      let extension = ".mp4";
      let mimeType = "video/mp4";
      
      // If we're using the original file as fallback, keep original extension
      if (isFallbackOriginal) {
        const originalExt = videoFile.name.split('.').pop()?.toLowerCase();
        if (originalExt && ['mp4', 'webm', 'mov', 'avi'].includes(originalExt)) {
          extension = `.${originalExt}`;
          mimeType = videoFile.type || `video/${originalExt}`;
        }
        console.log("🎬 VideoConverter: Keeping original format for fallback:", {
          extension,
          mimeType
        });
      }
      
      const convertedFile = new File(
        [convertedBlob],
        `${originalName}${extension}`,
        {
          type: mimeType,
          lastModified: Date.now(),
        }
      );
      
      console.log("✅ VideoConverter: Conversion complete", {
        outputFile: convertedFile.name,
        outputSize: convertedFile.size,
        outputType: convertedFile.type,
        compressionRatio: (convertedFile.size / videoFile.size * 100).toFixed(1) + '%'
      });

      return convertedFile;
    } catch (error) {
      console.error("❌ VideoConverter: Conversion failed:", error);
      console.error("🎬 VideoConverter: Error details:", {
        inputFile: videoFile.name,
        inputSize: videoFile.size,
        inputType: videoFile.type,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Video conversion failed: ${(error as Error).message}`);
    }
  }

  private reportProgress(
    stage: ConversionProgress["stage"],
    percentage: number,
    message: string
  ) {
    if (this.onProgress) {
      this.onProgress({ stage, percentage, message });
    }
  }

  private async simulateProgress(
    stage: ConversionProgress["stage"],
    start: number,
    end: number
  ) {
    const steps = 10;
    const increment = (end - start) / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const percentage = start + increment * (i + 1);
      this.reportProgress(
        stage,
        Math.round(percentage),
        stage === "converting"
          ? "Converting video to WebM format..."
          : "Processing..."
      );
    }
  }
}

// Utility function to check if a file needs conversion
export function needsConversion(file: File): boolean {
  const fileExtension = file.name.toLowerCase().split(".").pop();

  console.log("🎬 needsConversion check:", {
    fileName: file.name,
    fileType: file.type,
    fileExtension,
    fileSize: file.size,
    typeIncludesMP4: file.type.includes("mp4"),
    typeIncludesWebM: file.type.includes("webm"),
  });

  // For small MP4 files, skip conversion to avoid corruption
  if ((file.type.includes("mp4") || fileExtension === "mp4") && file.size < 50 * 1024 * 1024) {
    console.log("🎬 Small MP4 file detected - skipping conversion to avoid corruption");
    return false; // Skip conversion for small MP4 files
  }

  // For large MP4 files, attempt minimal processing
  if (file.type.includes("mp4") || fileExtension === "mp4") {
    console.log("🎬 MP4 file detected - will attempt minimal processing");
    return true;
  }

  // Convert other formats to MP4
  if (fileExtension && ['webm', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(fileExtension)) {
    console.log(`🎬 ${fileExtension.toUpperCase()} format detected - converting to MP4`);
    return true;
  }

  // For unknown formats, try conversion
  console.log("🎬 Unknown format - attempting conversion to MP4");
  return true;
}

// Utility function to get estimated conversion time
export function getEstimatedConversionTime(fileSizeBytes: number): number {
  // Rough estimation: ~1 second per MB
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.max(5, Math.round(fileSizeMB * 1.5)); // Minimum 5 seconds
}

// Utility function to validate video file
export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 500 * 1024 * 1024; // 500MB
  const allowedTypes = [
    "video/mp4",
    "video/webm",
    "video/avi",
    "video/mov",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/x-matroska"
  ];
  
  const allowedExtensions = ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  const fileExtension = file.name.toLowerCase().split('.').pop();

  console.log("🎬 validateVideoFile:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    fileExtension,
    maxSize
  });

  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty or corrupted",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 500MB limit",
    };
  }

  // Check by MIME type first, then by extension
  const hasValidMimeType = allowedTypes.some((type) => file.type.includes(type.split("/")[1]));
  const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
  
  if (!hasValidMimeType && !hasValidExtension) {
    return {
      valid: false,
      error: "Unsupported video format. Please use MP4, WebM, AVI, MOV, WMV, FLV, or MKV",
    };
  }

  console.log("✅ validateVideoFile: File is valid");
  return { valid: true };
}
