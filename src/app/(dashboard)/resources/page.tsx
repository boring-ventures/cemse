"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  BookOpen,
  FileText,
  Video,
  Music,
  Image,
  Type,
  Plus,
  Grid,
  List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useResources,
  useSearchResources,
  useDeleteResource,
} from "@/hooks/useResourceApi";
import { Resource } from "@/types/api";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";
import { EditResourceDialog } from "@/components/resources/EditResourceDialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { isMunicipalityRole, isYouthRole } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ResourcesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Get current user and municipality info for filtering
  const { profile, user } = useCurrentUser();
  const { data: currentMunicipality } = useCurrentMunicipality();

  // Determine if user is municipality and get municipality ID
  const isMunicipality = isMunicipalityRole(profile?.role);
  const municipalityId = isMunicipality ? currentMunicipality?.id : undefined;

  // Hooks para obtener recursos
  const {
    data: allResources = [],
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useResources();
  const { mutateAsync: deleteResource } = useDeleteResource();
  const {
    mutateAsync: searchResources,
    data: searchResults = [],
    isPending: loadingSearch,
  } = useSearchResources();

  // Función para manejar búsqueda
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchResources(searchQuery);
    }
  };

  // Función para calificar recurso
  const handleRate = async (resource: Resource, rating: number) => {
    try {
      const response = await fetch(`/api/resource/${resource.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Calificación enviada",
            description: "Tu calificación se ha registrado correctamente",
          });

          // Invalidate queries to refresh the data
          // This will trigger a refetch of the resources
          window.location.reload();
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error rating resource:", error);
      toast({
        title: "Error al calificar",
        description: "No se pudo enviar la calificación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Check if user can edit/delete this resource
  const canEditResource = (resource: Resource, currentUser: any) => {
    // Superadmin can edit all resources
    if (currentUser?.role === "SUPERADMIN") return true;

    // Users can only edit their own resources
    return resource.createdByUserId === currentUser?.id;
  };

  // Función para editar recurso
  const handleEdit = (resource: Resource) => {
    // Check ownership before allowing edit
    if (!canEditResource(resource, user)) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para editar este recurso.",
        variant: "destructive",
      });
      return;
    }
    setEditingResource(resource);
  };

  // Función para eliminar recurso
  const handleDelete = (resource: Resource) => {
    // Check ownership before allowing delete
    if (!canEditResource(resource, user)) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para eliminar este recurso.",
        variant: "destructive",
      });
      return;
    }
    setDeletingResource(resource);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!deletingResource) return;

    try {
      await deleteResource(deletingResource.id);

      toast({
        title: "Recurso eliminado",
        description: "El recurso se ha eliminado exitosamente",
      });

      setDeletingResource(null);
      refetchAll(); // Refresh the resources list
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el recurso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Manejar creación de recurso
  const handleResourceCreated = () => {
    refetchAll(); // Refresh the resources list
  };

  // Manejar actualización de recurso
  const handleResourceUpdated = () => {
    refetchAll(); // Refresh the resources list
    setEditingResource(null);
  };

  // Obtener recursos según los filtros aplicados
  const getCurrentResources = (): Resource[] => {
    let resources: Resource[] = allResources as Resource[];

    // Aplicar filtro de búsqueda si hay resultados de búsqueda
    if (searchQuery.trim() && (searchResults as Resource[]).length > 0) {
      resources = searchResults as Resource[];
    }

    // Aplicar filtro de tipo si no es "all"
    if (selectedType !== "all") {
      resources = resources.filter(
        (resource: Resource) => resource.type === selectedType
      );
    }

    // Aplicar filtro de categoría si no es "all"
    if (selectedCategory !== "all") {
      resources = resources.filter(
        (resource: Resource) => resource.category === selectedCategory
      );
    }

    return resources;
  };

  const currentResources = getCurrentResources();
  const isLoading = loadingAll || loadingSearch;

  // Check if user can manage resources (create, edit, delete)
  const canManageResources =
    profile?.role === "SUPERADMIN" ||
    profile?.role === "EMPRESAS" ||
    profile?.role === "GOBIERNOS_MUNICIPALES" ||
    profile?.role === "CENTROS_DE_FORMACION" ||
    profile?.role === "ONGS_Y_FUNDACIONES";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Recursos Educativos
              </h1>
              <p className="text-gray-600 text-lg">
                Explora y descarga recursos educativos para tu desarrollo
                personal y profesional
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => refetchAll()}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              {canManageResources && (
                <CreateResourceDialog
                  onResourceCreated={handleResourceCreated}
                />
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar recursos por título o descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Tipo de recurso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="DOCUMENT">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Documentos
                        </div>
                      </SelectItem>
                      <SelectItem value="VIDEO">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Videos
                        </div>
                      </SelectItem>
                      <SelectItem value="AUDIO">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Audio
                        </div>
                      </SelectItem>
                      <SelectItem value="IMAGE">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Imágenes
                        </div>
                      </SelectItem>
                      <SelectItem value="TEXT">
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Texto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="PROGRAMMING">Programación</SelectItem>
                      <SelectItem value="DESIGN">Diseño</SelectItem>
                      <SelectItem value="BUSINESS">Negocios</SelectItem>
                      <SelectItem value="EDUCATION">Educación</SelectItem>
                      <SelectItem value="HEALTH">Salud</SelectItem>
                      <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                      <SelectItem value="ENTREPRENEURSHIP">
                        Emprendimiento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full rounded-lg mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-6 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentResources.length === 0 ? (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-6">
                    <Search className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No se encontraron recursos
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                    {searchQuery.trim()
                      ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                      : "No hay recursos disponibles con los filtros seleccionados. Prueba con otros filtros."}
                  </p>
                  {canManageResources && (
                    <div className="mt-6">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Recurso
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onRate={handleRate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions={canManageResources}
                />
              ))}
            </div>
          )}

          {/* Edit Resource Dialog */}
          <EditResourceDialog
            resource={editingResource}
            open={!!editingResource}
            onOpenChange={(open) => !open && setEditingResource(null)}
            onResourceUpdated={handleResourceUpdated}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deletingResource}
            onOpenChange={(open) => !open && setDeletingResource(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  el recurso "{deletingResource?.title}" del sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
