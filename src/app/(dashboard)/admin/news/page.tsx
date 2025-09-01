"use client";

import { useState } from "react";
import {
  useNewsArticles,
  useCreateNewsArticleWithImage,
  useUpdateNewsArticleWithImage,
  useDeleteNewsArticle,
} from "@/hooks/useNewsArticleApi";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NewsForm } from "@/components/news/news-form";
import { NewsTable } from "@/components/news/news-table";
import { NewsDetail } from "@/components/news/news-detail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText, Eye, TrendingUp, Calendar, Users } from "lucide-react";
import type { NewsArticle } from "@/types/news";

export default function AdminNewsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Obtener el usuario actual
  const { profile: currentUser } = useCurrentUser();

  // Hooks para noticias - Filtrar por usuario actual
  const { data: news = [], isLoading } = useNewsArticles();
  const createNewsMutation = useCreateNewsArticleWithImage();
  const updateNewsMutation = useUpdateNewsArticleWithImage();
  const deleteNewsMutation = useDeleteNewsArticle();

  // Filtrar noticias para mostrar solo las del usuario actual
  const userNews = news.filter(article => 
    article.authorId === currentUser?.id
  );

  // Estadísticas calculadas basadas en las noticias del usuario
  const stats = {
    totalNews: userNews.length,
    publishedNews: userNews.filter((n) => n.status === "PUBLISHED").length,
    draftNews: userNews.filter((n) => n.status === "DRAFT").length,
    featuredNews: userNews.filter((n) => n.featured).length,
  };

  // Debug logging
  console.log('🔍 News filtering:', {
    totalNews: news.length,
    currentUserId: currentUser?.id,
    userNewsCount: userNews.length,
    userNews: userNews.map(n => ({ id: n.id, title: n.title, authorId: n.authorId }))
  });

  // Handlers
  const handleCreateNews = async (newsData: any, imageFile?: File) => {
    const formData = new FormData();

    // Agregar campos de texto
    Object.keys(newsData).forEach((key) => {
      if (
        key !== "image" &&
        newsData[key] !== undefined &&
        newsData[key] !== null
      ) {
        formData.append(key, newsData[key].toString());
      }
    });

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

    // Agregar campos específicos para Super Admin
    formData.append("authorType", "SUPERADMIN");
    formData.append("authorId", currentUser?.id || "");

    // Verificar contenido del FormData antes de enviar
    console.log("📰 FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(
        `  ${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`
      );
    }

    createNewsMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdateNews = async (newsData: any, imageFile?: File) => {
    if (!editingNews) return;

    const formData = new FormData();

    // Agregar campos de texto
    Object.keys(newsData).forEach((key) => {
      if (
        key !== "image" &&
        newsData[key] !== undefined &&
        newsData[key] !== null
      ) {
        formData.append(key, newsData[key].toString());
      }
    });

    // Agregar imagen si existe
    if (imageFile) {
      console.log(
        "📰 Adding image to FormData for update:",
        imageFile.name,
        imageFile.size,
        imageFile.type
      );
      formData.append("image", imageFile);
    }

    // Agregar campos específicos para Super Admin
    formData.append("authorType", "SUPERADMIN");
    formData.append("authorId", currentUser?.id || "");

    // Verificar contenido del FormData antes de enviar
    console.log("📰 FormData contents for update:");
    for (const [key, value] of formData.entries()) {
      console.log(
        `  ${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`
      );
    }

    updateNewsMutation.mutate(
      {
        id: editingNews.id,
        formData,
      },
      {
        onSuccess: () => {
          setEditingNews(null);
        },
      }
    );
  };

  const handleDeleteNews = async (newsId: string) => {
    deleteNewsMutation.mutate(newsId);
  };

  const handleEditNews = (news: NewsArticle) => {
    setEditingNews(news);
  };

  const handleViewNews = (news: NewsArticle) => {
    setSelectedNews(news);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando noticias...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, show a message
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Acceso requerido
          </h3>
          <p className="text-muted-foreground">
            Debes iniciar sesión para ver tus noticias
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mis Noticias
          </h1>
          <p className="text-muted-foreground">
            Administra las noticias que has creado
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Solo se muestran las noticias que has publicado
          </p>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Noticia
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Noticias
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalNews}
            </div>
            <p className="text-xs text-muted-foreground">
              Noticias que has creado
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.publishedNews}
            </div>
            <p className="text-xs text-muted-foreground">Tus noticias publicadas</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.draftNews}
            </div>
            <p className="text-xs text-muted-foreground">
              Tus noticias en borrador
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.featuredNews}
            </div>
            <p className="text-xs text-muted-foreground">Tus noticias destacadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Noticias */}
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Mis Noticias ({userNews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userNews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes noticias creadas
              </h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera noticia para compartir información importante
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Noticia
              </Button>
            </div>
          ) : (
            <NewsTable
              news={userNews}
              onEdit={handleEditNews}
              onDelete={handleDeleteNews}
              onView={handleViewNews}
              isLoading={deleteNewsMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de Creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Noticia</DialogTitle>
          </DialogHeader>
          <NewsForm
            mode="create"
            onSubmit={handleCreateNews}
            isLoading={createNewsMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={!!editingNews} onOpenChange={() => setEditingNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Noticia</DialogTitle>
          </DialogHeader>
          <NewsForm
            mode="edit"
            initialData={editingNews || undefined}
            onSubmit={handleUpdateNews}
            isLoading={updateNewsMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalle */}
      <NewsDetail
        news={selectedNews}
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
