"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useNewsByAuthor,
  useCreateNewsArticleWithImage,
  useUpdateNewsArticleWithImage,
  useDeleteNewsArticle,
} from "@/hooks/useNewsArticleApi";
import { NewsArticle } from "@/types/news";
import { NewsForm } from "@/components/news/news-form";
import { NewsTable } from "@/components/news/news-table";
import { NewsDetail } from "@/components/news/news-detail";

export default function CompanyNewsPage() {
  const { profile } = useCurrentUser();
  const { toast } = useToast();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Hooks de React Query
  const {
    data: newsData,
    isLoading,
    error,
    refetch,
  } = useNewsByAuthor(profile?.id || "");
  const createNewsMutation = useCreateNewsArticleWithImage();
  const updateNewsMutation = useUpdateNewsArticleWithImage();
  const deleteNewsMutation = useDeleteNewsArticle();

  const newsArticles = newsData || [];

  // Filtrar noticias
  const filteredNews = newsArticles.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || news.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateNews = async (data: any, imageFile?: File) => {
    try {
      const formData = new FormData();

      // Agregar campos de texto
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          formData.append(key, data[key].toString());
        }
      });

      // Agregar imagen si existe
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createNewsMutation.mutateAsync(formData);

      setShowCreateDialog(false);
      toast({
        title: "Éxito",
        description: "Noticia creada exitosamente",
      });
    } catch (error) {
      console.error("Error creating news:", error);
      toast({
        title: "Error",
        description: "Error al crear la noticia",
        variant: "destructive",
      });
    }
  };

  const handleEditNews = (news: NewsArticle) => {
    setSelectedNews(news);
    setShowEditDialog(true);
  };

  const handleUpdateNews = async (data: any, imageFile?: File) => {
    if (!selectedNews) return;

    try {
      const formData = new FormData();

      // Agregar campos de texto
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          formData.append(key, data[key].toString());
        }
      });

      // Agregar imagen si existe
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateNewsMutation.mutateAsync({ id: selectedNews.id, formData });

      setShowEditDialog(false);
      setSelectedNews(null);
      toast({
        title: "Éxito",
        description: "Noticia actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error updating news:", error);
      toast({
        title: "Error",
        description: "Error al actualizar la noticia",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNewsMutation.mutateAsync(id);
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
      throw error; // Re-throw para que el componente maneje el estado de loading
    }
  };

  const handleViewNews = (news: NewsArticle) => {
    setSelectedNews(news);
    setShowDetailDialog(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error al cargar las noticias. Por favor, intenta de nuevo.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Noticias
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las noticias de tu empresa
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Noticia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Noticia</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear una nueva noticia para tu
                empresa.
              </DialogDescription>
            </DialogHeader>
            <NewsForm
              mode="create"
              onSubmit={handleCreateNews}
              isLoading={createNewsMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="archived">Archivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de noticias */}
      <Card>
        <CardHeader>
          <CardTitle>Noticias ({filteredNews.length})</CardTitle>
          <CardDescription>
            Lista de todas las noticias de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsTable
            news={filteredNews}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onView={handleViewNews}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Noticia</DialogTitle>
            <DialogDescription>
              Modifica los datos de la noticia seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedNews && (
            <NewsForm
              mode="edit"
              initialData={selectedNews}
              onSubmit={handleUpdateNews}
              isLoading={updateNewsMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle */}
      <NewsDetail
        news={selectedNews}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedNews(null);
        }}
      />
    </div>
  );
}
