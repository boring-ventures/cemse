"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Newspaper,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Filters Skeleton */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-48" />
                </div>
              </CardContent>
            </Card>

            {/* Table Skeleton */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Error al cargar las noticias
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              No se pudieron cargar las noticias. Por favor, verifica tu
              conexión e intenta de nuevo.
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Gestión de Noticias
              </h1>
              <p className="text-gray-600 text-lg">
                Administra las noticias de tu empresa
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Noticia
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Noticia</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para crear una nueva noticia para
                      tu empresa.
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
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar noticias por título o resumen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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

          {/* News Table */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-600" />
                    Noticias ({filteredNews.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Lista de todas las noticias de tu empresa
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {filteredNews.length} resultados
                  </Badge>
                </div>
              </div>
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

          {/* Edit Dialog */}
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

          {/* Detail Dialog */}
          <NewsDetail
            news={selectedNews}
            isOpen={showDetailDialog}
            onClose={() => {
              setShowDetailDialog(false);
              setSelectedNews(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
