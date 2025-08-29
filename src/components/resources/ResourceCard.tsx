'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Star, 
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
  MoreVertical
} from 'lucide-react';
import { Resource } from '@/types/api';

interface ResourceCardProps {
  resource: Resource;
  onDownload?: (resource: Resource) => void;
  onRate?: (resource: Resource, rating: number) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  showActions?: boolean;
}

export function ResourceCard({ 
  resource, 
  onDownload, 
  onRate, 
  onEdit, 
  onDelete, 
  showActions = false 
}: ResourceCardProps) {
  const [rating, setRating] = useState(resource.rating || 0);
  const [userRating, setUserRating] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return <FileText className="h-5 w-5" />;
      case 'VIDEO': return <Video className="h-5 w-5" />;
      case 'AUDIO': return <Music className="h-5 w-5" />;
      case 'IMAGE': return <Image className="h-5 w-5" />;
      case 'TEXT': return <File className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(resource);
    }
  };

  const handleRate = (newRating: number) => {
    setUserRating(newRating);
    if (onRate) {
      onRate(resource, newRating);
    }
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
            {showActions && (
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
            <span>{resource.author || 'Anónimo'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(resource.publishedDate || resource.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            <span>{resource.downloads || 0} descargas</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              className="text-yellow-400 hover:text-yellow-500 transition-colors"
            >
              <Star 
                className={`h-4 w-4 ${star <= (userRating || rating) ? 'fill-current' : ''}`} 
              />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            ({rating.toFixed(1)})
          </span>
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
            onClick={handleDownload}
            size="sm" 
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(resource.downloadUrl || resource.externalUrl, '_blank')}
            disabled={!resource.downloadUrl && !resource.externalUrl}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
