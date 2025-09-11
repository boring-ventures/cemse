"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Video,
  Music,
  Image,
  File,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Resource } from "@/types/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ResourceDetailsModal } from "./ResourceDetailsModal";

interface ResourceCardProps {
  resource: Resource;
  onRate?: (resource: Resource, rating: number) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  showActions?: boolean;
}

export function ResourceCard({
  resource,
  onRate,
  onEdit,
  onDelete,
  showActions = false,
}: ResourceCardProps) {
  const { user } = useCurrentUser();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Check if user can edit/delete this resource
  const canEditResource = (resource: Resource, currentUser: any) => {
    // Superadmin can edit all resources
    if (currentUser?.role === "SUPERADMIN") return true;

    // Users can only edit their own resources
    return resource.createdByUserId === currentUser?.id;
  };

  const canEdit = canEditResource(resource, user);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="h-5 w-5" />;
      case "VIDEO":
        return <Video className="h-5 w-5" />;
      case "AUDIO":
        return <Music className="h-5 w-5" />;
      case "IMAGE":
        return <Image className="h-5 w-5" />;
      case "TEXT":
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(resource.type)}
            <Badge variant="outline" className="text-xs">
              {resource.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {resource.category}
            </Badge>
            {showActions && canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(resource)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(resource)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {resource.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{resource.author || "Anónimo"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(resource.publishedDate || resource.createdAt)}
            </span>
          </div>
          {/* Ownership indicator */}
          {canEdit && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              <User className="h-3 w-3" />
              <span>Tu recurso</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailsModal(true)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
        </div>
      </CardContent>

      {/* Resource Details Modal */}
      <ResourceDetailsModal
        resource={resource}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onRate={onRate}
      />
    </Card>
  );
}
