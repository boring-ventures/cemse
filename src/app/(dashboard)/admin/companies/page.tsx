"use client";

import { useState } from "react";
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/use-companies";
import { useMunicipalities } from "@/hooks/use-municipalities";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
} from "lucide-react";
import type { Company, CreateCompanyRequest } from "@/services/companies.service";

export default function CompaniesPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: "",
    description: "",
    businessSector: "",
    companySize: undefined,
    foundedYear: new Date().getFullYear(),
    website: "",
    email: "",
    phone: "",
    address: "",
    municipalityId: "",
    username: "",
    password: "",
    isActive: true,
  });

  // Hooks
  const { profile } = useCurrentUser();
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useCompanies();
  const { data: municipalities = [], isLoading: municipalitiesLoading } = useMunicipalities();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  // Check permissions
  const canManageCompanies = profile && profile.role && [
    'SUPERADMIN', 
    'GOBIERNOS_MUNICIPALES',
    'INSTRUCTOR'
  ].includes(profile.role);
  
  const isSuperAdmin = profile && profile.role === 'SUPERADMIN';

  // Extract companies and metadata
  const companies = companiesData?.companies || [];
  const metadata = companiesData?.metadata || {
    totalActive: 0,
    totalInactive: 0,
    totalJobOffers: 0,
    totalEmployees: 0,
  };

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (company.businessSector?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.isActive) ||
      (statusFilter === "inactive" && !company.isActive);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      businessSector: "",
      companySize: undefined,
      foundedYear: new Date().getFullYear(),
      website: "",
      email: "",
      phone: "",
      address: "",
      municipalityId: "",
      username: "",
      password: "",
      isActive: true,
    });
  };

  const handleCreateCompany = async () => {
    try {
      await createCompanyMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create company:", error);
      // Error handling is done in the mutation
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description || "",
      businessSector: company.businessSector || "",
      companySize: company.companySize || undefined,
      foundedYear: company.foundedYear || new Date().getFullYear(),
      website: company.website || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      municipalityId: company.municipality.id,
      username: company.username,
      password: "", // Don't pre-fill password
      isActive: company.isActive,
    });
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    try {
      const { password, ...updateData } = formData;
      // Only include password if it's not empty
      const finalData = password ? { ...updateData, password } : updateData;
      
      await updateCompanyMutation.mutateAsync({
        id: editingCompany.id,
        data: finalData
      });
      setEditingCompany(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return;

    try {
      await deleteCompanyMutation.mutateAsync(deletingCompany.id);
      setDeletingCompany(null);
    } catch (error) {
      console.error("Failed to delete company:", error);
    }
  };

  // Loading state
  if (companiesLoading || municipalitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (companiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar empresas</h3>
          <p className="text-muted-foreground mb-4">
            {companiesError instanceof Error ? companiesError.message : "Error desconocido"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
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
            Gestión de Empresas
          </h1>
          <p className="text-muted-foreground">
            Administra las empresas registradas en el sistema
          </p>
        </div>

        {canManageCompanies && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Empresa</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ingrese el nombre de la empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipalityId">Municipio *</Label>
                  <Select
                    value={formData.municipalityId}
                    onValueChange={(value) => setFormData({ ...formData, municipalityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name} - {municipality.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessSector">Sector de Negocio</Label>
                  <Input
                    id="businessSector"
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    placeholder="Ej: Tecnología, Salud, Educación"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Tamaño de la Empresa</Label>
                  <Select
                    value={formData.companySize || ""}
                    onValueChange={(value) => setFormData({ ...formData, companySize: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MICRO">Micro (1-10 empleados)</SelectItem>
                      <SelectItem value="SMALL">Pequeña (11-50 empleados)</SelectItem>
                      <SelectItem value="MEDIUM">Mediana (51-250 empleados)</SelectItem>
                      <SelectItem value="LARGE">Grande (250+ empleados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Año de Fundación</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+591 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.empresa.com"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa de la empresa"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la empresa y sus actividades"
                    rows={3}
                  />
                </div>

                {/* Login Credentials */}
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario de Login *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="usuario_empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña segura"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={createCompanyMutation.isPending || !formData.name || !formData.email || !formData.municipalityId || !formData.username || !formData.password}
                >
                  {createCompanyMutation.isPending ? "Creando..." : "Crear Empresa"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metadata.totalActive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas de Trabajo</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metadata.totalJobOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metadata.totalEmployees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Empresas</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, descripción o sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filtrar por Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead>Contacto</TableHead>
                {canManageCompanies && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {company.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Fundada en {company.foundedYear || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {company.businessSector || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{company.municipality.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {company.companySize || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.isActive ? "default" : "destructive"}>
                      {company.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{company.jobOffersCount} ofertas</div>
                      <div>{company.employeesCount} empleados</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {canManageCompanies && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <DropdownMenuItem 
                              onClick={() => setDeletingCompany(company)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empresa: {editingCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese el nombre de la empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-municipalityId">Municipio *</Label>
              <Select
                value={formData.municipalityId}
                onValueChange={(value) => setFormData({ ...formData, municipalityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un municipio" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={municipality.id}>
                      {municipality.name} - {municipality.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-businessSector">Sector de Negocio</Label>
              <Input
                id="edit-businessSector"
                value={formData.businessSector}
                onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                placeholder="Ej: Tecnología, Salud, Educación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-companySize">Tamaño de la Empresa</Label>
              <Select
                value={formData.companySize || ""}
                onValueChange={(value) => setFormData({ ...formData, companySize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICRO">Micro (1-10 empleados)</SelectItem>
                  <SelectItem value="SMALL">Pequeña (11-50 empleados)</SelectItem>
                  <SelectItem value="MEDIUM">Mediana (51-250 empleados)</SelectItem>
                  <SelectItem value="LARGE">Grande (250+ empleados)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-foundedYear">Año de Fundación</Label>
              <Input
                id="edit-foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+591 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Sitio Web</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.empresa.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa de la empresa"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la empresa y sus actividades"
                rows={3}
              />
            </div>

            {/* Login Credentials */}
            <div className="space-y-2">
              <Label htmlFor="edit-username">Usuario de Login *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario_empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>

            {/* Status Toggle */}
            <div className="space-y-2 col-span-2">
              <Label>Estado de la Empresa</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive ?? editingCompany?.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">
                  {formData.isActive ?? editingCompany?.isActive ? "Empresa Activa" : "Empresa Inactiva"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingCompany(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCompany} 
              disabled={updateCompanyMutation.isPending || !formData.name || !formData.email || !formData.municipalityId || !formData.username}
            >
              {updateCompanyMutation.isPending ? "Actualizando..." : "Actualizar Empresa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Eliminar Empresa</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                <strong>Esta acción no se puede deshacer.</strong> Se eliminará permanentemente la empresa
                <strong> "{deletingCompany?.name}"</strong> y todos sus datos relacionados:
              </p>
              
              {deletingCompany && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Se eliminarán:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• {deletingCompany.jobOffersCount} ofertas de trabajo</li>
                    <li>• Todas las postulaciones a estas ofertas</li>
                    <li>• Mensajes y comunicaciones relacionadas</li>
                    <li>• {deletingCompany.employeesCount} perfiles de empleados (se desvinculan)</li>
                    <li>• Intereses de jóvenes en la empresa</li>
                    <li>• Preguntas y respuestas de entrevistas</li>
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-gray-600">
                Solo los usuarios con rol SUPERADMIN pueden eliminar empresas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={deleteCompanyMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCompanyMutation.isPending ? "Eliminando..." : "Eliminar Definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}