"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useResources,
  useSearchResources,
  useResourcesByType,
  useResourcesByCategory,
  useDeleteResource,
} from "@/hooks/useResourceApi";
import { Resource } from "@/types/api";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";
import { EditResourceDialog } from "@/components/resources/EditResourceDialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { isMunicipalityRole } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState("all");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Get current user and municipality info for filtering
  const { profile } = useCurrentUser();
  const { data: currentMunicipality } = useCurrentMunicipality();

  // Determine if user is municipality and get municipality ID
  const isMunicipality = isMunicipalityRole(profile?.role);
  const municipalityId = isMunicipality ? currentMunicipality?.id : undefined;

  // Hooks para obtener recursos
  const { data: allResources = [], isLoading: loadingAll, refetch: refetchAll } = useResources();
  const { mutateAsync: deleteResource } = useDeleteResource();
  const {
    mutateAsync: searchResources,
    data: searchResults = [],
    isPending: loadingSearch,
  } = useSearchResources();
  const { data: typeResources = [], isLoading: loadingType } =
    useResourcesByType(selectedType);
  const { data: categoryResources = [], isLoading: loadingCategory } =
    useResourcesByCategory(selectedCategory);

  // Función para manejar búsqueda
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchResources(searchQuery);
    }
  };

  // Función para descargar recurso
  const handleDownload = async (resource: Resource) => {
    try {
      // Use the download API endpoint to get the download URL and increment counter
      const response = await fetch(`/api/resource/${resource.id}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
          // Open the download URL in a new tab
          window.open(data.downloadUrl, '_blank');
          
          // Show success message
          toast({
            title: "Descarga iniciada",
            description: "El recurso se está descargando",
          });
        } else {
          throw new Error('No download URL provided');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el recurso. Inténtalo de nuevo.",
        variant: "destructive",
      });
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

  // Función para editar recurso
  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
  };

  // Función para eliminar recurso
  const handleDelete = (resource: Resource) => {
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

  // Obtener recursos según la pestaña activa
  const getCurrentResources = (): Resource[] => {
    switch (activeTab) {
      case "search":
        return (searchResults as Resource[]) || [];
      case "type":
        return (typeResources as Resource[]) || [];
      case "category":
        return (categoryResources as Resource[]) || [];
      default:
        return (allResources as Resource[]) || [];
    }
  };

  const currentResources = getCurrentResources();
  const isLoading =
    loadingAll || loadingSearch || loadingType || loadingCategory;

  // Check if user can manage resources (create, edit, delete)
  const canManageResources = profile?.role === 'SUPERADMIN' || 
    profile?.role === 'EMPRESAS' || 
    profile?.role === 'GOBIERNOS_MUNICIPALES' || 
    profile?.role === 'CENTROS_DE_FORMACION' || 
    profile?.role === 'ONGS_Y_FUNDACIONES';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recursos Educativos
          </h1>
          <p className="text-gray-600">
            Explora y descarga recursos educativos para tu desarrollo personal y
            profesional
          </p>
        </div>
        {canManageResources && (
          <CreateResourceDialog onResourceCreated={handleResourceCreated} />
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Buscar
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo de recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="DOCUMENT">Documentos</SelectItem>
              <SelectItem value="VIDEO">Videos</SelectItem>
              <SelectItem value="AUDIO">Audio</SelectItem>
              <SelectItem value="IMAGE">Imágenes</SelectItem>
              <SelectItem value="TEXT">Texto</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
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
              <SelectItem value="ENTREPRENEURSHIP">Emprendimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="search">Búsqueda</TabsTrigger>
          <TabsTrigger value="type">Por Tipo</TabsTrigger>
          <TabsTrigger value="category">Por Categoría</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de recursos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : currentResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron recursos
          </h3>
          <p className="text-gray-600">
            {activeTab === "search"
              ? "Intenta con otros términos de búsqueda"
              : "No hay recursos disponibles en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDownload={handleDownload}
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
      <AlertDialog open={!!deletingResource} onOpenChange={(open) => !open && setDeletingResource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el recurso
              "{deletingResource?.title}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
