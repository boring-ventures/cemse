"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Star,
  Image,
} from "lucide-react";
import { NewsArticle } from "@/types/news";
import { useToast } from "@/hooks/use-toast";

interface NewsTableProps {
  news: NewsArticle[];
  onEdit: (news: NewsArticle) => void;
  onDelete: (id: string) => Promise<void>;
  onView: (news: NewsArticle) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-800";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-800";
    case "HIGH":
      return "bg-orange-100 text-orange-800";
    case "MEDIUM":
      return "bg-blue-100 text-blue-800";
    case "LOW":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getAuthorTypeColor = (type: string) => {
  switch (type) {
    case "COMPANY":
      return "bg-blue-100 text-blue-800";
    case "GOVERNMENT":
      return "bg-green-100 text-green-800";
    case "NGO":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function NewsTable({
  news,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}: NewsTableProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsArticle | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      toast({
        title: "Éxito",
        description: "Noticia eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la noticia",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (news: NewsArticle) => {
    setNewsToDelete(news);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (newsToDelete) {
      await handleDelete(newsToDelete.id);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNewsToDelete(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No hay noticias disponibles</div>
        <div className="text-gray-400 text-sm mt-2">
          Crea tu primera noticia para comenzar
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Noticia</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[50px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-[300px]">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={item.imageUrl || "/api/placeholder/60/60"}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      {item.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white shadow-sm"
                          onClick={() =>
                            setImagePreview({
                              url: item.imageUrl!,
                              title: item.title,
                            })
                          }
                        >
                          <Image className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        {item.featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {item.summary}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={item.authorLogo}
                        alt={item.authorName}
                      />
                      <AvatarFallback>
                        {item.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {item.authorName}
                      </div>
                      <Badge className={getAuthorTypeColor(item.authorType)}>
                        {item.authorType === "COMPANY" && "Empresa"}
                        {item.authorType === "GOVERNMENT" && "Gobierno"}
                        {item.authorType === "NGO" && "ONG"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status === "PUBLISHED" && "Publicado"}
                    {item.status === "DRAFT" && "Borrador"}
                    {item.status === "ARCHIVED" && "Archivado"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority === "URGENT" && "Urgente"}
                    {item.priority === "HIGH" && "Alta"}
                    {item.priority === "MEDIUM" && "Media"}
                    {item.priority === "LOW" && "Baja"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-gray-600">{item.category}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(item.publishedAt || item.createdAt)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para mostrar imagen en tamaño completo */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{imagePreview?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center">
            <img
              src={imagePreview?.url}
              alt={imagePreview?.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la noticia "{newsToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingId === newsToDelete?.id}
            >
              {deletingId === newsToDelete?.id ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
