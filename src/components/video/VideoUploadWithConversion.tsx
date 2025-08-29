"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Video,
  CheckCircle,
  AlertCircle,
  Settings,
  FileVideo,
  Clock,
  HardDrive,
} from "lucide-react";
import { useVideoUploadWithConversion } from "@/hooks/useVideoUploadWithConversion";
import {
  needsConversion,
  getEstimatedConversionTime,
  validateVideoFile,
} from "@/lib/video-conversion";

interface VideoUploadWithConversionProps {
  moduleId: string;
  onSuccess?: (lessonId: string) => void;
  onCancel?: () => void;
  lessonData: {
    title: string;
    description: string;
    content: string;
    contentType: string;
    duration: number;
    orderIndex: number;
    isRequired: boolean;
    isPreview: boolean;
  };
}

interface UploadedFile {
  file: File;
  preview?: string;
  needsConversion: boolean;
  estimatedTime: number;
  validation: { valid: boolean; error?: string };
}

export const VideoUploadWithConversion: React.FC<
  VideoUploadWithConversionProps
> = ({ moduleId, onSuccess, onCancel, lessonData }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadVideoWithConversion, isUploading, uploadProgress, error } =
    useVideoUploadWithConversion();

  const handleFileSelect = (file: File) => {
    const validation = validateVideoFile(file);
    const fileNeedsConversion = needsConversion(file);
    const estimatedTime = getEstimatedConversionTime(file.size);

    const uploadedFile: UploadedFile = {
      file,
      needsConversion: fileNeedsConversion,
      estimatedTime,
      validation,
    };

    // Generate preview for video
    const url = URL.createObjectURL(file);
    uploadedFile.preview = url;

    setUploadedFile(uploadedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !uploadedFile.validation.valid) return;

    try {
      const result = await uploadVideoWithConversion({
        ...lessonData,
        moduleId,
        video: uploadedFile.file,
      });

      if (onSuccess) {
        onSuccess(result.lesson.id);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Video Upload with MP4 Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Video File</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your video file here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Video className="h-4 w-4 mr-2" />
                Select Video
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: MP4, AVI, MOV, WebM • Max size: 500MB
                <br />
                Videos will be automatically converted to MP4 H.264 format for
                maximum browser compatibility
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{uploadedFile.file.name}</h4>
                    {uploadedFile.validation.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatFileSize(uploadedFile.file.size)}
                    </span>
                    <span>{uploadedFile.file.type}</span>
                  </div>

                  {uploadedFile.validation.valid ? (
                    <div className="flex items-center gap-2">
                      {uploadedFile.needsConversion ? (
                        <>
                          <Badge variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            MP4 Conversion Required
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Est. {formatTime(uploadedFile.estimatedTime)}
                          </span>
                        </>
                      ) : (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          MP4 Ready
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      {uploadedFile.validation.error}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>

              {/* Conversion Info */}
              {uploadedFile.needsConversion &&
                uploadedFile.validation.valid && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">
                      MP4 H.264 Conversion
                    </h5>
                    <p className="text-sm text-blue-700">
                      Your video will be converted to MP4 H.264 format for maximum
                      browser compatibility. This process typically takes{" "}
                      {formatTime(uploadedFile.estimatedTime)} and will:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                      <li>Ensure playback on all devices and browsers</li>
                      <li>Optimize encoding for web streaming</li>
                      <li>Fix compatibility issues with original format</li>
                    </ul>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 animate-spin" />
              {uploadProgress.stage === "validation" && "Validating Video"}
              {uploadProgress.stage === "conversion" && "Converting to MP4"}
              {uploadProgress.stage === "upload" && "Uploading Video"}
              {uploadProgress.stage === "complete" && "Upload Complete"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={uploadProgress.percentage} className="w-full" />
            <div className="flex justify-between text-sm">
              <span>{uploadProgress.message}</span>
              <span>{uploadProgress.percentage}%</span>
            </div>

            {uploadProgress.conversionProgress && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">
                  Conversion Stage: {uploadProgress.conversionProgress.stage}
                </div>
                <div className="text-xs text-muted-foreground">
                  {uploadProgress.conversionProgress.message}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Upload Failed</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!uploadedFile?.validation.valid || isUploading}
          className="min-w-[120px]"
        >
          {isUploading ? (
            <>
              <Settings className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
