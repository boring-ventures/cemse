"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CheckCircle,
  FileVideo,
  Trash2,
  Play,
  Image as ImageIcon,
} from "lucide-react";

interface CourseFileUploadProps {
  onFilesChange: (files: { thumbnail?: File; videoPreview?: File }) => void;
  className?: string;
}

export const CourseFileUpload: React.FC<CourseFileUploadProps> = ({
  onFilesChange,
  className = "",
}) => {
  const [selectedFiles, setSelectedFiles] = useState<{
    thumbnail?: File;
    videoPreview?: File;
  }>({});
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{
    thumbnail?: string;
    videoPreview?: string;
  }>({});

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: "thumbnail" | "videoPreview") => {
    // Validate file type
    if (type === "thumbnail" && !file.type.startsWith("image/")) {
      alert(
        "Por favor selecciona un archivo de imagen válido para el thumbnail"
      );
      return;
    }
    if (type === "videoPreview" && !file.type.startsWith("video/")) {
      alert(
        "Por favor selecciona un archivo de video válido para el video preview"
      );
      return;
    }

    // Validate file size
    if (type === "thumbnail" && file.size > 5 * 1024 * 1024) {
      alert("El archivo de imagen es demasiado grande. Máximo 5MB");
      return;
    }
    if (type === "videoPreview" && file.size > 1024 * 1024 * 1024) {
      alert("El archivo de video es demasiado grande. Máximo 1GB");
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [type]: url }));

    // Update selected files
    const newFiles = { ...selectedFiles, [type]: file };
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (type: "thumbnail" | "videoPreview") => {
    // Revoke preview URL to free memory
    if (previewUrls[type]) {
      URL.revokeObjectURL(previewUrls[type]!);
    }

    // Remove file
    const newFiles = { ...selectedFiles };
    delete newFiles[type];
    setSelectedFiles(newFiles);

    // Remove preview
    const newPreviews = { ...previewUrls };
    delete newPreviews[type];
    setPreviewUrls(newPreviews);

    onFilesChange(newFiles);
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

  const handleDrop = (
    e: React.DragEvent,
    type: "thumbnail" | "videoPreview"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (type: "thumbnail" | "videoPreview") => {
    return type === "thumbnail" ? (
      <ImageIcon className="h-6 w-6" />
    ) : (
      <FileVideo className="h-6 w-6" />
    );
  };

  const getFileTypeLabel = (type: "thumbnail" | "videoPreview") => {
    return type === "thumbnail" ? "Imagen de Portada" : "Video de Presentación";
  };

  const getAcceptedTypes = (type: "thumbnail" | "videoPreview") => {
    return type === "thumbnail"
      ? ".jpg,.jpeg,.png,.gif,.webp"
      : ".mp4,.webm,.ogg,.avi,.mov";
  };

  const getMaxSize = (type: "thumbnail" | "videoPreview") => {
    return type === "thumbnail" ? "5MB" : "1GB";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Imagen de Portada (Thumbnail)
        </label>
        {!selectedFiles.thumbnail ? (
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={(e) => handleDrop(e, "thumbnail")}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onClick={() => thumbnailInputRef.current?.click()}
          >
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Arrastra y suelta tu imagen aquí
              </h3>
              <p className="text-gray-600 mb-4">
                o haz clic para seleccionar una imagen
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Tipos permitidos: JPG, PNG, GIF, WebP
                </p>
                <p className="text-sm text-gray-500">
                  Tamaño máximo: {getMaxSize("thumbnail")}
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={previewUrls.thumbnail}
                      alt="Thumbnail preview"
                      className="h-16 w-16 object-cover rounded"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {selectedFiles.thumbnail?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFiles.thumbnail?.size || 0)}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Imagen seleccionada
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile("thumbnail")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "thumbnail");
          }}
          className="hidden"
        />
      </div>

      {/* Video Preview Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Video de Presentación</label>
        {!selectedFiles.videoPreview ? (
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={(e) => handleDrop(e, "videoPreview")}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onClick={() => videoInputRef.current?.click()}
          >
            <CardContent className="p-6 text-center">
              <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Arrastra y suelta tu video aquí
              </h3>
              <p className="text-gray-600 mb-4">
                o haz clic para seleccionar un video
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Tipos permitidos: MP4, WebM, OGG, AVI, MOV
                </p>
                <p className="text-sm text-gray-500">
                  Tamaño máximo: {getMaxSize("videoPreview")}
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 relative">
                    <video
                      src={previewUrls.videoPreview}
                      className="h-16 w-16 object-cover rounded"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {selectedFiles.videoPreview?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFiles.videoPreview?.size || 0)}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Video seleccionado
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile("videoPreview")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "videoPreview");
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};
