"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Video,
  Music,
  Image,
  File,
  Calendar,
  User,
  Eye,
  Download,
  ExternalLink,
  Star,
  Tag,
} from "lucide-react";
import { Resource } from "@/types/api";

interface ResourceDetailsModalProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRate?: (resource: Resource, rating: number) => void;
}

export function ResourceDetailsModal({
  resource,
  open,
  onOpenChange,
  onRate,
}: ResourceDetailsModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!resource) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="h-6 w-6" />;
      case "VIDEO":
        return <Video className="h-6 w-6" />;
      case "AUDIO":
        return <Music className="h-6 w-6" />;
      case "IMAGE":
        return <Image className="h-6 w-6" />;
      case "TEXT":
        return <File className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewResource = () => {
    if (resource.downloadUrl || resource.externalUrl) {
      window.open(resource.downloadUrl || resource.externalUrl, "_blank");
    }
  };

  const handleRate = (newRating: number) => {
    setRating(newRating);
    if (onRate) {
      onRate(resource, newRating);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className="text-2xl transition-colors duration-200"
        onMouseEnter={() => setHoveredRating(i + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => handleRate(i + 1)}
      >
        <Star
          className={`h-6 w-6 ${
            i < (hoveredRating || rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {getTypeIcon(resource.type)}
            {resource.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Image/Thumbnail */}
          {resource.thumbnail && (
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Descripción
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Resource Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Información General
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {getTypeIcon(resource.type)}
                      {resource.type}
                    </Badge>
                    <Badge variant="secondary">{resource.category}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Autor: {resource.author || "Anónimo"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Publicado:{" "}
                      {formatDate(resource.publishedDate || resource.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Download className="h-4 w-4" />
                    <span>{resource.downloads} descargas</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>Calificación: {resource.rating.toFixed(1)}/5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Calificar Recurso
                </h4>
                <div className="flex items-center gap-2">
                  {renderStars()}
                  <span className="text-sm text-gray-600 ml-2">
                    {rating > 0 ? `${rating}/5` : "Sin calificar"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleViewResource}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!resource.downloadUrl && !resource.externalUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Recurso
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
