"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  Users,
  MessageSquare,
  FileText,
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

import { useQueryClient } from "@tanstack/react-query";
import { NewsArticle } from "@/types/news";
import { NewsForm } from "@/components/news/news-form";
import { NewsTable } from "@/components/news/news-table";
import { NewsDetail } from "@/components/news/news-detail";

export default function MunicipalityNewsPage() {
  const { profile } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Usar el ID del usuario directamente
  const userId = profile?.id || "";

  // Hooks de React Query
  const { data: newsData, isLoading, error } = useNewsByAuthor(userId);

  // Debug logging para verificar que se está usando el ID correcto
  console.log("🔍 MunicipalityNewsPage - User ID being used:", userId);
  console.log(
    "🔍 MunicipalityNewsPage - Expected backend URL:",
    `https://cemse-back-production.up.railway.app/api/newsarticle?authorId=${userId}`
  );

  // Debug logging
  console.log("🔍 MunicipalityNewsPage - Profile:", profile);
  console.log("🔍 MunicipalityNewsPage - Profile Role:", profile?.role);
  console.log(
    "🔍 MunicipalityNewsPage - Municipality ID from profile:",
    profile?.municipality?.id
  );
  console.log("🔍 MunicipalityNewsPage - User ID:", profile?.id);
  console.log("🔍 MunicipalityNewsPage - Final User ID:", userId);
  console.log("🔍 MunicipalityNewsPage - News Data:", newsData);
  console.log("🔍 MunicipalityNewsPage - Is Loading:", isLoading);
  console.log("🔍 MunicipalityNewsPage - Error:", error);
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

  // Calcular estadísticas
  const stats = {
    total: newsArticles.length,
    published: newsArticles.filter((n) => n.status === "PUBLISHED").length,
    draft: newsArticles.filter((n) => n.status === "DRAFT").length,
    archived: newsArticles.filter((n) => n.status === "ARCHIVED").length,
    totalViews: newsArticles.reduce((sum, n) => sum + n.viewCount, 0),
    totalLikes: newsArticles.reduce((sum, n) => sum + n.likeCount, 0),
    totalComments: newsArticles.reduce((sum, n) => sum + n.commentCount, 0),
  };

  // Handlers
  const handleCreateNews = async (
    data: Record<string, unknown>,
    imageFile?: File
  ) => {
    try {
      console.log("📰 Creating news with data:", data);
      console.log("📰 Image file:", imageFile);

      const formData = new FormData();

      // Agregar campos de texto con validación
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          // Convertir arrays a strings si es necesario
          if (Array.isArray(data[key])) {
            formData.append(key, data[key].join(", "));
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      // Agregar campos específicos del municipio
      formData.append("authorId", userId);
      formData.append("authorType", "GOVERNMENT");
      formData.append("authorName", "Diego Rocha"); // Nombre del municipio

      // Agregar imagen si existe
      if (imageFile) {
        console.log(
          "📰 Adding image to FormData:",
          imageFile.name,
          imageFile.size,
          imageFile.type
        );
        formData.append("image", imageFile);
      }

      // Verificar contenido del FormData antes de enviar
      console.log("📰 FormData contents:");
      console.log("📰 User ID being used:", userId);
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`
        );
      }

      await createNewsMutation.mutateAsync(formData);

      setShowCreateDialog(false);
      toast({
        title: "Éxito",
        description: "Noticia creada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error creating news:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear la noticia",
        variant: "destructive",
      });
    }
  };

  const handleEditNews = (news: NewsArticle) => {
    setSelectedNews(news);
    setShowEditDialog(true);
  };

  const handleUpdateNews = async (
    data: Record<string, unknown>,
    imageFile?: File
  ) => {
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
            Gestión de Noticias Municipales
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las noticias de tu municipio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("🔄 Invalidating queries...");
              queryClient.invalidateQueries({ queryKey: ["news"] });
              queryClient.invalidateQueries({
                queryKey: ["news", "author", userId],
              });
              toast({
                title: "Debug",
                description: "Cache invalidated, refreshing data...",
              });
            }}
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              console.log(
                "🔍 Manual API call to:",
                `https://cemse-back-production.up.railway.app/api/newsarticle?authorId=${userId}`
              );
              try {
                const response = await fetch(
                  `https://cemse-back-production.up.railway.app/api/newsarticle?authorId=${userId}`
                );
                const data = await response.json();
                console.log("✅ Manual API response:", data);
                toast({
                  title: "Manual API Call",
                  description: `Found ${data.length} news articles`,
                });
              } catch (error) {
                console.error("❌ Manual API error:", error);
                toast({
                  title: "Error",
                  description: "Failed to fetch news manually",
                  variant: "destructive",
                });
              }
            }}
          >
            🔍 Manual API
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Noticia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Noticia Municipal</DialogTitle>
                <DialogDescription>
                  Completa el formulario para crear una nueva noticia para tu
                  municipio.
                </DialogDescription>
              </DialogHeader>
              <NewsForm
                mode="create"
                onSubmit={handleCreateNews}
                isLoading={createNewsMutation.isPending}
                restrictedRegion="Cochabamba"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Noticias
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published} publicadas, {stats.draft} borradores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio:{" "}
              {stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}{" "}
              por noticia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Me Gusta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round(stats.totalLikes / stats.total) : 0}{" "}
              por noticia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentarios</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalComments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round(stats.totalComments / stats.total)
                : 0}{" "}
              por noticia
            </p>
          </CardContent>
        </Card>
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
            Lista de todas las noticias de tu municipio
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
              restrictedRegion="Cochabamba"
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
