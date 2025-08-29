"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Edit,
  Save,
  X,
  Camera,
  TrendingUp,
  Target,
  Award,
  DollarSign,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { useUpdateMunicipality } from "@/hooks/useMunicipalityApi";
import { useAuthContext } from "@/hooks/use-auth";
import type { Municipality } from "@/types/municipality";

export default function MunicipalProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();
  
  console.log("🏛️ MunicipalProfilePage - Auth debug:", {
    user: !!user,
    isAuthenticated,
    userRole: user?.role,
    userId: user?.id
  });
  
  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Municipality | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mayorPhotoFile, setMayorPhotoFile] = useState<File | null>(null);

  // Hooks de React Query
  const { 
    data: municipality, 
    isLoading, 
    error, 
    refetch 
  } = useCurrentMunicipality();
  
  console.log("🏛️ MunicipalProfilePage - Debug info:", {
    municipality: !!municipality,
    isLoading,
    error: error?.message,
    municipalityData: municipality
  });
  
  const updateMunicipalityMutation = useUpdateMunicipality();

  // Inicializar editedProfile cuando se cargan los datos
  if (municipality && !editedProfile) {
    setEditedProfile(municipality);
  }

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = event.target;

    if (!editedProfile) return;

    // Handle nested properties (e.g., 'mayor.name', 'socialMedia.facebook')
    const parts = name.split(".");
    if (parts.length > 1) {
      setEditedProfile((prev) => {
        if (!prev) return prev;
        const result = { ...prev };
        let current: any = result;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]] = { ...current[parts[i]] };
        }
        current[parts[parts.length - 1]] = value;
        return result as Municipality;
      });
    } else {
      // Handle top-level properties
      setEditedProfile((prev) => prev ? ({
        ...prev,
        [name]: value,
      }) : prev);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!editedProfile) return;

    try {
      // Preparar datos para actualización
      const updateData = {
        name: editedProfile.name,
        department: editedProfile.department,
        region: editedProfile.region,
        address: editedProfile.address,
        website: editedProfile.website,
        phone: editedProfile.phone,
        email: editedProfile.email,
        mayorName: editedProfile.mayorName,
        mayorEmail: editedProfile.mayorEmail,
        mayorPhone: editedProfile.mayorPhone,
        description: editedProfile.description,
        // Agregar otros campos según sea necesario
      };

      await updateMunicipalityMutation.mutateAsync({
        id: editedProfile.id,
        data: updateData
      });

      setIsEditing(false);
      setLogoFile(null);
      setCoverFile(null);
      setMayorPhotoFile(null);
      
      toast({
        title: "Éxito",
        description: "Perfil actualizado exitosamente",
      });
      
      // Refetch para obtener datos actualizados
      refetch();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedProfile(municipality || null);
    setIsEditing(false);
    setLogoFile(null);
    setCoverFile(null);
    setMayorPhotoFile(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editedProfile) {
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setEditedProfile({ ...editedProfile, logo: imageUrl });
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editedProfile) {
      setCoverFile(file);
      const imageUrl = URL.createObjectURL(file);
      setEditedProfile({ ...editedProfile, coverImage: imageUrl });
    }
  };

  const handleMayorPhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && editedProfile) {
      setMayorPhotoFile(file);
      const imageUrl = URL.createObjectURL(file);
                           setEditedProfile({
                       ...editedProfile,
                       mayor: {
                         name: editedProfile.mayor?.name || "",
                         photo: imageUrl,
                         party: editedProfile.mayor?.party || "",
                         startDate: editedProfile.mayor?.startDate || "",
                         endDate: editedProfile.mayor?.endDate || "",
                         email: editedProfile.mayor?.email || "",
                         phone: editedProfile.mayor?.phone || "",
                       },
                     });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando perfil del municipio...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar el perfil del municipio: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show fallback if no municipality data
  if (!municipality) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró información del municipio. Por favor, contacta al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = editedProfile || municipality;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Perfil del Municipio
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona la información pública de tu municipio
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                type="submit"
                form="profile-form"
                disabled={updateMunicipalityMutation.isPending}
              >
                {updateMunicipalityMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="mayor">Alcalde</TabsTrigger>
            <TabsTrigger value="demographics">Demografía</TabsTrigger>
            <TabsTrigger value="economy">Economía</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Información General */}
          <TabsContent value="general" className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen de Portada</CardTitle>
                <CardDescription>
                  Imagen principal que se muestra en el perfil público
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {profile.coverImage ? (
                    <img
                      src={profile.coverImage}
                      alt="Portada del municipio"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Label htmlFor="cover-upload" className="cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                      </Label>
                      <Input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Datos principales del municipio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Municipio</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      name="department"
                      value={profile.department || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      name="region"
                      value={profile.region || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="population">Población</Label>
                    <Input
                      id="population"
                      name="population"
                      type="number"
                      value={profile.population || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={profile.description || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profile.website || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profile.address || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Datos de contacto del municipio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alcalde */}
          <TabsContent value="mayor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Alcalde</CardTitle>
                <CardDescription>
                  Datos del alcalde actual del municipio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={profile.mayor?.photo || profile.logo} 
                        alt="Foto del alcalde" 
                      />
                      <AvatarFallback>
                        <Building2 className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute -bottom-1 -right-1">
                        <Label htmlFor="mayor-photo-upload" className="cursor-pointer">
                          <Camera className="h-4 w-4" />
                        </Label>
                        <Input
                          id="mayor-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleMayorPhotoUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {profile.mayorName || profile.mayor?.name || "Alcalde"}
                    </h3>
                    <p className="text-gray-600">
                      {profile.mayor?.party || "Partido político"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mayorName">Nombre del Alcalde</Label>
                    <Input
                      id="mayorName"
                      name="mayorName"
                      value={profile.mayorName || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mayorEmail">Email del Alcalde</Label>
                    <Input
                      id="mayorEmail"
                      name="mayorEmail"
                      type="email"
                      value={profile.mayorEmail || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mayorPhone">Teléfono del Alcalde</Label>
                    <Input
                      id="mayorPhone"
                      name="mayorPhone"
                      value={profile.mayorPhone || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demografía */}
          <TabsContent value="demographics" className="space-y-6">
            {profile.demographics && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos Demográficos</CardTitle>
                  <CardDescription>
                    Información demográfica del municipio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {profile.demographics.population.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Población Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {profile.demographics.area.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Área (km²)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {profile.demographics.density}
                      </div>
                      <div className="text-sm text-gray-600">Densidad (hab/km²)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {profile.demographics.urbanPopulation}%
                      </div>
                      <div className="text-sm text-gray-600">Población Urbana</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Economía */}
          <TabsContent value="economy" className="space-y-6">
            {profile.economy && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos Económicos</CardTitle>
                  <CardDescription>
                    Información económica del municipio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        Bs. {(profile.economy.budget / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Presupuesto Anual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {profile.economy.unemployment}%
                      </div>
                      <div className="text-sm text-gray-600">Desempleo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {profile.economy.poverty}%
                      </div>
                      <div className="text-sm text-gray-600">Pobreza</div>
                    </div>
                  </div>
                  
                  {profile.economy.mainActivities && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Principales Actividades Económicas</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.economy.mainActivities.map((activity, index) => (
                          <Badge key={index} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Proyectos */}
          <TabsContent value="projects" className="space-y-6">
            {profile.projects && profile.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Proyectos en Desarrollo</CardTitle>
                  <CardDescription>
                    Proyectos actuales del municipio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge 
                            variant={
                              project.status === "COMPLETED" ? "default" :
                              project.status === "IN_PROGRESS" ? "secondary" : "outline"
                            }
                          >
                            {project.status === "COMPLETED" ? "Completado" :
                             project.status === "IN_PROGRESS" ? "En Progreso" : "Planificación"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{project.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Presupuesto: Bs. {(project.budget / 1000000).toFixed(1)}M
                          </span>
                          <span className="text-sm text-gray-500">
                            Progreso: {project.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Perfil</CardTitle>
                <CardDescription>
                  Configuración de visibilidad y notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicProfile">Perfil Público</Label>
                    <p className="text-sm text-gray-600">
                      Permitir que el perfil sea visible públicamente
                    </p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={profile.settings?.publicProfile || false}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showBudget">Mostrar Presupuesto</Label>
                    <p className="text-sm text-gray-600">
                      Mostrar información presupuestaria en el perfil público
                    </p>
                  </div>
                  <Switch
                    id="showBudget"
                    checked={profile.settings?.showBudget || false}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Permitir Mensajes</Label>
                    <p className="text-sm text-gray-600">
                      Permitir que los usuarios envíen mensajes al municipio
                    </p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={profile.settings?.allowMessages || false}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                    <p className="text-sm text-gray-600">
                      Recibir notificaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={profile.settings?.emailNotifications || false}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
