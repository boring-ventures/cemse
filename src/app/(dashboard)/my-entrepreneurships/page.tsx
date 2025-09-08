"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMyEntrepreneurships } from "@/hooks/useEntrepreneurshipApi";
import { useDeleteEntrepreneurship } from "@/hooks/useEntrepreneurshipApi";
import { Entrepreneurship } from "@/types/profile";

export default function MyEntrepreneurshipsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { entrepreneurships, loading, error, fetchMyEntrepreneurships } =
    useMyEntrepreneurships();
  const { deleteEntrepreneurship, loading: deleteLoading } =
    useDeleteEntrepreneurship();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entrepreneurshipToDelete, setEntrepreneurshipToDelete] =
    useState<Entrepreneurship | null>(null);
  const [imageCarousels, setImageCarousels] = useState<Record<string, number>>(
    {}
  );

  const filteredEntrepreneurships = entrepreneurships.filter(
    (entrepreneurship) => {
      const matchesSearch =
        entrepreneurship.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        entrepreneurship.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ||
        entrepreneurship.category === categoryFilter;
      const matchesStage =
        stageFilter === "all" || entrepreneurship.businessStage === stageFilter;

      return matchesSearch && matchesCategory && matchesStage;
    }
  );

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "tecnologia", label: "Tecnología" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "alimentacion", label: "Alimentación" },
    { value: "educacion", label: "Educación" },
    { value: "servicios", label: "Servicios" },
    { value: "manufactura", label: "Manufactura" },
  ];

  const businessStages = [
    { value: "all", label: "Todas las etapas" },
    { value: "IDEA", label: "Idea" },
    { value: "STARTUP", label: "Startup" },
    { value: "GROWING", label: "En Crecimiento" },
    { value: "ESTABLISHED", label: "Establecida" },
  ];

  const getBusinessStageColor = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "bg-blue-100 text-blue-800";
      case "STARTUP":
        return "bg-green-100 text-green-800";
      case "GROWING":
        return "bg-yellow-100 text-yellow-800";
      case "ESTABLISHED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBusinessStageLabel = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "Idea";
      case "STARTUP":
        return "Startup";
      case "GROWING":
        return "En Crecimiento";
      case "ESTABLISHED":
        return "Establecida";
      default:
        return stage;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      tecnologia: "Tecnología",
      ecommerce: "E-commerce",
      alimentacion: "Alimentación",
      educacion: "Educación",
      servicios: "Servicios",
      manufactura: "Manufactura",
    };
    return categories[category] || category;
  };

  const getImageUrl = (imagePath: string) => {
    // If the image path is already a full URL, check if it's from the old backend
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // If it's from the old backend, try to convert it to local path
      if (
        imagePath.includes("cemse-back-production.up.railway.app") ||
        imagePath.includes("localhost:3001") ||
        imagePath.includes("0.0.0.0:3001")
      ) {
        // Extract the path part after /uploads/
        const uploadsIndex = imagePath.indexOf("/uploads/");
        if (uploadsIndex !== -1) {
          const localPath = imagePath.substring(uploadsIndex);
          console.log(
            "Converting backend URL to local:",
            imagePath,
            "->",
            localPath
          );
          return localPath;
        }
      }
      // If it's not from our backend, return as is
      return imagePath;
    }

    // If it's a relative path starting with /uploads/, return as is (local file)
    if (imagePath.startsWith("/uploads/")) {
      return imagePath;
    }

    // If it's just a filename, assume it's in the uploads directory
    if (!imagePath.includes("/")) {
      return `/uploads/entrepreneurships/${imagePath}`;
    }

    // For any other relative path, return as is
    return imagePath;
  };

  const handleNextImage = (entrepreneurshipId: string, totalImages: number) => {
    setImageCarousels((prev) => ({
      ...prev,
      [entrepreneurshipId]: ((prev[entrepreneurshipId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (entrepreneurshipId: string, totalImages: number) => {
    setImageCarousels((prev) => ({
      ...prev,
      [entrepreneurshipId]:
        prev[entrepreneurshipId] === 0
          ? totalImages - 1
          : (prev[entrepreneurshipId] || 0) - 1,
    }));
  };

  const getCurrentImageIndex = (entrepreneurshipId: string) => {
    return imageCarousels[entrepreneurshipId] || 0;
  };

  const handleEdit = (entrepreneurship: Entrepreneurship) => {
    router.push(`/entrepreneurship/${entrepreneurship.id}/edit`);
  };

  const handleView = (entrepreneurship: Entrepreneurship) => {
    router.push(`/entrepreneurship/${entrepreneurship.id}`);
  };

  const handleDeleteClick = (entrepreneurship: Entrepreneurship) => {
    setEntrepreneurshipToDelete(entrepreneurship);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entrepreneurshipToDelete) return;

    try {
      await deleteEntrepreneurship(entrepreneurshipToDelete.id);
      toast({
        title: "Emprendimiento eliminado",
        description: "El emprendimiento ha sido eliminado exitosamente",
      });
      fetchMyEntrepreneurships(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el emprendimiento",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEntrepreneurshipToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-6 bg-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-48" />
              </div>
            </CardContent>
          </Card>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full mb-4 rounded-lg" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error al cargar emprendimientos
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button
                    onClick={fetchMyEntrepreneurships}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Mis Emprendimientos
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Gestiona y administra tus emprendimientos
            </p>
          </div>
          <Button
            onClick={() => router.push("/publish-entrepreneurship")}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Emprendimiento
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar emprendimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  {businessStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredEntrepreneurships.length === 0 ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ||
                    (categoryFilter && categoryFilter !== "all") ||
                    (stageFilter && stageFilter !== "all")
                      ? "No se encontraron emprendimientos"
                      : "No tienes emprendimientos"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ||
                    (categoryFilter && categoryFilter !== "all") ||
                    (stageFilter && stageFilter !== "all")
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Comienza creando tu primer emprendimiento"}
                  </p>
                  {!searchTerm &&
                    categoryFilter === "all" &&
                    stageFilter === "all" && (
                      <Button
                        onClick={() => router.push("/publish-entrepreneurship")}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Emprendimiento
                      </Button>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntrepreneurships.map((entrepreneurship) => (
              <Card
                key={entrepreneurship.id}
                className="bg-white shadow-sm border-0 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-gray-900">
                        {entrepreneurship.name}
                      </CardTitle>
                      <Badge
                        className={`${getBusinessStageColor(entrepreneurship.businessStage)} text-xs`}
                      >
                        {getBusinessStageLabel(entrepreneurship.businessStage)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {entrepreneurship.isPublic ? (
                        <span
                          title="Público"
                          className="p-1 bg-green-100 rounded-full"
                        >
                          <Eye className="h-4 w-4 text-green-600" />
                        </span>
                      ) : (
                        <span
                          title="Privado"
                          className="p-1 bg-gray-100 rounded-full"
                        >
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Image Carousel */}
                  {entrepreneurship.images &&
                  entrepreneurship.images.length > 0 ? (
                    <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <div className="aspect-video relative">
                        <img
                          src={getImageUrl(
                            entrepreneurship.images[
                              getCurrentImageIndex(entrepreneurship.id)
                            ]
                          )}
                          alt={`${entrepreneurship.name} - Imagen ${getCurrentImageIndex(entrepreneurship.id) + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        {entrepreneurship.images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                handlePrevImage(
                                  entrepreneurship.id,
                                  entrepreneurship.images.length
                                )
                              }
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleNextImage(
                                  entrepreneurship.id,
                                  entrepreneurship.images.length
                                )
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {entrepreneurship.images.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index ===
                                    getCurrentImageIndex(entrepreneurship.id)
                                      ? "bg-white"
                                      : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Sin imágenes</p>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {entrepreneurship.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      {getCategoryLabel(entrepreneurship.category)}
                    </div>
                    {entrepreneurship.municipality && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {entrepreneurship.municipality}
                      </div>
                    )}
                    {entrepreneurship.founded && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Fundado en{" "}
                        {new Date(entrepreneurship.founded).getFullYear()}
                      </div>
                    )}
                    {entrepreneurship.employees && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {entrepreneurship.employees} empleados
                      </div>
                    )}
                    {entrepreneurship.viewsCount > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {entrepreneurship.viewsCount} vistas
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleView(entrepreneurship)}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(entrepreneurship)}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(entrepreneurship)}
                      className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmar eliminación
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                ¿Estás seguro de que quieres eliminar el emprendimiento "
                {entrepreneurshipToDelete?.name}"? Esta acción no se puede
                deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
                className="h-10"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="h-10"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
