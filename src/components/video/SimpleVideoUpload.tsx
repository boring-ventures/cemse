"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Video,
  CheckCircle,
  AlertCircle,
  Youtube,
  FileVideo,
  Loader2,
  X,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders, API_BASE } from "@/lib/api";

interface SimpleVideoUploadProps {
  moduleId: string;
  onSuccess?: (lesson: any) => void;
  onCancel?: () => void;
}

interface VideoFile {
  file: File;
  preview: string;
}

export const SimpleVideoUpload: React.FC<SimpleVideoUploadProps> = ({
  moduleId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoType: "upload" as "upload" | "youtube",
    youtubeUrl: "",
    duration: 15,
    orderIndex: 1,
    isRequired: true,
    isPreview: false,
  });
  
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 200 * 1024 * 1024; // 200MB limit
    const allowedTypes = ['mp4', 'mov', 'avi', 'webm'];
    const fileExtension = file.name.toLowerCase().split('.').pop();

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be under 200MB" };
    }

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return { 
        valid: false, 
        error: "Only MP4, MOV, AVI, and WebM files are supported" 
      };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const preview = URL.createObjectURL(file);
    setVideoFile({ file, preview });
    
    // Auto-fill title if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
  };

  // Drag and drop handlers
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
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // Remove selected file
  const removeFile = () => {
    if (videoFile?.preview) {
      URL.revokeObjectURL(videoFile.preview);
    }
    setVideoFile(null);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (formData.videoType === "upload" && !videoFile) {
      toast.error("Please select a video file");
      return;
    }

    if (formData.videoType === "youtube" && !formData.youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (formData.videoType === "upload") {
        await uploadVideoFile();
      } else {
        await createYouTubeLesson();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to create lesson. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload video file
  const uploadVideoFile = async () => {
    if (!videoFile) return;

    const uploadFormData = new FormData();
    uploadFormData.append("title", formData.title);
    uploadFormData.append("description", formData.description);
    uploadFormData.append("content", formData.content);
    uploadFormData.append("moduleId", moduleId);
    uploadFormData.append("contentType", "VIDEO");
    uploadFormData.append("duration", formData.duration.toString());
    uploadFormData.append("orderIndex", formData.orderIndex.toString());
    uploadFormData.append("isRequired", formData.isRequired.toString());
    uploadFormData.append("isPreview", formData.isPreview.toString());
    uploadFormData.append("video", videoFile.file);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    const response = await fetch(`${API_BASE}/lesson/with-video`, {
      method: "POST",
      headers: await getAuthHeaders(true), // exclude content-type for FormData
      body: uploadFormData,
    });

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    const result = await response.json();
    toast.success("Video lesson created successfully!");
    onSuccess?.(result.lesson);
  };

  // Create YouTube lesson
  const createYouTubeLesson = async () => {
    setUploadProgress(50);
    
    const response = await fetch(`${API_BASE}/lesson`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        moduleId,
        contentType: "VIDEO",
        videoUrl: formData.youtubeUrl,
        duration: formData.duration,
        orderIndex: formData.orderIndex,
        isRequired: formData.isRequired,
        isPreview: formData.isPreview,
      }),
    });

    setUploadProgress(100);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create lesson");
    }

    const result = await response.json();
    toast.success("YouTube lesson created successfully!");
    onSuccess?.(result.lesson);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileVideo className="h-6 w-6" />
            Create Video Lesson
          </h1>
          <p className="text-muted-foreground">
            Add a new video lesson to your module
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lesson Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Lesson Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter lesson title..."
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the lesson..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Additional Content
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Additional notes, instructions, or content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes)
                </label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 15 
                  }))}
                  min="1"
                  max="300"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="orderIndex" className="text-sm font-medium">
                  Order Index
                </label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    orderIndex: parseInt(e.target.value) || 1 
                  }))}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isRequired: e.target.checked 
                  }))}
                />
                <span className="text-sm">Required lesson</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isPreview: e.target.checked 
                  }))}
                />
                <span className="text-sm">Preview available</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Video Source */}
        <Card>
          <CardHeader>
            <CardTitle>Video Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Type Selector */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoType"
                  value="upload"
                  checked={formData.videoType === "upload"}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    videoType: e.target.value as "upload" | "youtube" 
                  }))}
                />
                <Upload className="h-4 w-4" />
                <span>Upload Video File</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoType"
                  value="youtube"
                  checked={formData.videoType === "youtube"}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    videoType: e.target.value as "upload" | "youtube" 
                  }))}
                />
                <Youtube className="h-4 w-4" />
                <span>YouTube URL</span>
              </label>
            </div>

            <Separator />

            {formData.videoType === "upload" ? (
              <div className="space-y-4">
                {!videoFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Drop your video file here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Or click to browse and select a file
                    </p>
                    <Button type="button" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Select Video File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Supports MP4, MOV, AVI, WebM • Max 200MB
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium truncate">{videoFile.file.name}</h4>
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{formatFileSize(videoFile.file.size)}</span>
                          <span>{videoFile.file.type}</span>
                        </div>
                        <Badge variant="default" className="text-xs">
                          Ready for upload
                        </Badge>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="youtubeUrl" className="text-sm font-medium">
                    YouTube URL *
                  </label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      youtubeUrl: e.target.value 
                    }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the full YouTube video URL
                  </p>
                </div>

                {formData.youtubeUrl && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        YouTube video ready
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">
                    {formData.videoType === "upload" ? "Uploading video..." : "Creating lesson..."}
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isUploading} className="min-w-[120px]">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {formData.videoType === "upload" ? "Uploading..." : "Creating..."}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Create Lesson
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};