"use client";

import { useState } from "react";
import {
  useMunicipalities,
  useDeleteMunicipality,
} from "@/hooks/useMunicipalityApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import { Municipality } from "@/types/municipality";
import { CreateMunicipalityForm } from "./components/create-municipality-form";
import { EditMunicipalityForm } from "./components/edit-municipality-form";
import { MunicipalityDetails } from "./components/municipality-details";
import { useToast } from "@/hooks/use-toast";

export default function MunicipalitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<Municipality | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: municipalities = [], isLoading, error } = useMunicipalities();
  const deleteMunicipality = useDeleteMunicipality();
  const { toast } = useToast();

  // Filter municipalities based on search term
  const filteredMunicipalities = (municipalities || []).filter(
    (municipality) => {
      if (!municipality) return false;

      const searchLower = (searchTerm || "").toLowerCase();
      const municipalityName = (municipality.name || "").toLowerCase();
      const municipalityDepartment = (
        municipality.department || ""
      ).toLowerCase();
      const municipalityRegion = (municipality.region || "").toLowerCase();

      return (
        municipalityName.includes(searchLower) ||
        municipalityDepartment.includes(searchLower) ||
        municipalityRegion.includes(searchLower)
      );
    }
  );

  // Calculate statistics
  const stats = {
    total: municipalities.length,
    active: municipalities.filter((m) => m.isActive).length,
    inactive: municipalities.filter((m) => !m.isActive).length,
    totalCompanies: municipalities.reduce(
      (sum, m) => sum + (m.companies?.length || 0),
      0
    ),
  };

  const handleDelete = async (municipality: Municipality) => {
    // Show confirmation dialog with cascade deletion warning
    const confirmDelete = window.confirm(
      `⚠️ ADVERTENCIA: Eliminación Completa\n\n` +
      `Esta acción eliminará permanentemente:\n` +
      `• La institución "${municipality.name}"\n` +
      `• Su cuenta de usuario y credenciales\n` +
      `• Todas las empresas asociadas (${municipality.companies?.length || 0})\n` +
      `• Todas las ofertas de trabajo de estas empresas\n` +
      `• Todas las noticias publicadas por la institución\n` +
      `• Todos los datos relacionados\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `¿Estás seguro de que deseas continuar?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      toast({
        title: "Eliminando institución...",
        description: "Por favor espera mientras se eliminan todos los datos relacionados.",
      });

      await deleteMunicipality.mutateAsync(municipality.id);
      
      toast({
        title: "Institución eliminada",
        description: "La institución y todos sus datos relacionados han sido eliminados exitosamente.",
      });
    } catch (error: any) {
      console.error("Error deleting municipality:", error);
      toast({
        title: "Error al eliminar",
        description: error?.message || "No se pudo eliminar la institución. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Gestión de Instituciones</h1>
            <p className="text-muted-foreground">
              Administra todas las instituciones registradas en la plataforma
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Gestión de Instituciones</h1>
            <p className="text-muted-foreground">
              Administra todas las instituciones registradas en la plataforma
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Error al cargar instituciones
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Gestión de Instituciones</h1>
          <p className="text-muted-foreground">
            Administra todas las instituciones registradas en la plataforma
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Institución
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Institución</DialogTitle>
              <DialogDescription>
                Completa la información de la institución y sus credenciales de
                acceso.
              </DialogDescription>
            </DialogHeader>
            <CreateMunicipalityForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Instituciones
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Badge variant="default" className="text-xs">
              Activo
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Inactivo
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar instituciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Municipalities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Instituciones</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMunicipalities.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No se encontraron instituciones
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda."
                  : "Comienza creando una nueva institución."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institución</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Colores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMunicipalities.map((municipality) => (
                  <TableRow key={municipality.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{municipality.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {municipality.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{municipality.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {municipality.institutionType === "MUNICIPALITY"
                          ? "Municipio"
                          : municipality.institutionType === "NGO"
                            ? "ONG"
                            : municipality.institutionType === "FOUNDATION"
                              ? "Fundación"
                              : municipality.customType || "Otro"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {municipality.email}
                        </div>
                        {municipality.phone && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {municipality.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor:
                              municipality.primaryColor || "#1E40AF",
                          }}
                          title={`Primario: ${municipality.primaryColor || "#1E40AF"}`}
                        />
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor:
                              municipality.secondaryColor || "#F59E0B",
                          }}
                          title={`Secundario: ${municipality.secondaryColor || "#F59E0B"}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          municipality.isActive ? "default" : "secondary"
                        }
                      >
                        {municipality.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMunicipality(municipality);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMunicipality(municipality);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(municipality)}
                            className="text-red-600"
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedMunicipality && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Institución</DialogTitle>
              <DialogDescription>
                Modifica la información de la institución.
              </DialogDescription>
            </DialogHeader>
            <EditMunicipalityForm
              municipality={selectedMunicipality}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Details Dialog */}
      {selectedMunicipality && (
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Institución</DialogTitle>
            </DialogHeader>
            <MunicipalityDetails municipality={selectedMunicipality} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
