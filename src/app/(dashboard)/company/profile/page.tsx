"use client";

import React from "react";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Save,
  X,
  Camera,
  Target,
  Award,
  FileText,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import MapMarker from "@/components/MapMarker";
import Image from "next/image";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { usePasswordChange } from "@/hooks/usePasswordChange";
import { useAuthContext } from "@/hooks/use-auth";

// Interface matching the actual database schema
interface CompanyProfile {
  id: string;
  name: string;
  description: string | null;
  businessSector: string | null;
  companySize: "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | null;
  foundedYear: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  legalRepresentative: string | null;
  logoUrl: string | null;
  municipality: {
    id: string;
    name: string;
    department: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyProfilePage() {
  const { profile, loading, error, refetch } = useCompanyProfile();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // Debug: Log the current state
  console.log("🔍 CompanyProfilePage - Current state:", {
    profile,
    loading,
    error,
    hasProfile: !!profile,
    errorMessage: error?.message,
  });

  console.log("🔍 CompanyProfilePage - Hook result:", {
    profile,
    loading,
    error,
  });

  // Debug: Log the user object to see what company data is available
  console.log("🔍 CompanyProfilePage - User object:", {
    user,
    userCompany: user?.company,
    userRole: user?.role,
  });

  // Debug: Log the profile data structure
  if (profile) {
    console.log("🔍 CompanyProfilePage - Profile data structure:", {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      businessSector: profile.businessSector,
      companySize: profile.companySize,
      foundedYear: profile.foundedYear,
      website: profile.website,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      taxId: profile.taxId,
      legalRepresentative: profile.legalRepresentative,
      municipality: profile.municipality,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }

  // Debug: Log the user object to see what company data is available
  console.log("🔍 CompanyProfilePage - User object:", {
    user,
    userCompany: user?.company,
    userRole: user?.role,
  });

  // Debug: Log the profile data structure
  if (profile) {
    console.log("🔍 CompanyProfilePage - Profile data structure:", {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      businessSector: profile.businessSector,
      companySize: profile.companySize,
      foundedYear: profile.foundedYear,
      website: profile.website,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      taxId: profile.taxId,
      legalRepresentative: profile.legalRepresentative,
      municipality: profile.municipality,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CompanyProfile | null>(
    null
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    changePassword,
    loading: passwordLoading,
    error: passwordError,
    success: passwordSuccess,
    reset: resetPassword,
  } = usePasswordChange();

  // Update editedProfile when profile data is loaded
  React.useEffect(() => {
    console.log(
      "🔍 CompanyProfilePage - useEffect triggered with profile:",
      profile
    );
    if (profile) {
      console.log("🔍 CompanyProfilePage - Setting editedProfile:", profile);
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!editedProfile) return;

    setSaveLoading(true);
    try {
      let logoUrl = editedProfile.logoUrl;

      // Upload logo file if one was selected
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name);
        const formData = new FormData();
        formData.append("logo", logoFile);

        const uploadResponse = await fetch("/api/files/upload/company-logo", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload logo");
        }

        const uploadResult = await uploadResponse.json();
        logoUrl = uploadResult.logoUrl;
        console.log("Logo uploaded successfully:", logoUrl);
      }

      // Call the API to update the company profile
      const response = await fetch(`/api/company/${editedProfile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedProfile.name,
          description: editedProfile.description,
          businessSector: editedProfile.businessSector,
          companySize: editedProfile.companySize,
          foundedYear: editedProfile.foundedYear,
          website: editedProfile.website,
          email: editedProfile.email,
          phone: editedProfile.phone,
          address: editedProfile.address,
          taxId: editedProfile.taxId,
          legalRepresentative: editedProfile.legalRepresentative,
          logoUrl: logoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      console.log("Profile updated successfully:", result);

      // Refresh the profile data from the server
      await refetch();

      // Clear the file states
      setLogoFile(null);
      setCoverFile(null);

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(
        "Error al guardar el perfil: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile(profile);
    }
    setIsEditing(false);
    setLogoFile(null);
    setCoverFile(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    // Reset form on success
    if (passwordSuccess) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Show loading state
  if (loading || !profile || !editedProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-full max-w-md">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Card Skeleton */}
              <div className="lg:col-span-2">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-20 h-20 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-64" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Card Skeleton */}
              <div>
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader>
                    <Skeleton className="h-6 w-36" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    // Check if it's a "not found" error
    const isNotFoundError =
      error.message.includes("Not Found") ||
      error.message.includes("not found");

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Perfil de la Empresa
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Gestiona la información y configuración de tu empresa
              </p>
            </div>
          </div>

          {isNotFoundError ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="bg-white shadow-sm border-0 max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No se encontró el perfil de la empresa
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Parece que tu empresa aún no tiene un perfil configurado o
                    el perfil no existe en la base de datos.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full h-11"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar
                    </Button>
                    <Button
                      onClick={() => {
                        window.location.href = "/admin/companies";
                      }}
                      className="w-full h-11"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Ir a Administración de Empresas
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">
                      ID de usuario: {user?.id || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="bg-white shadow-sm border-0 max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Error al cargar el perfil
                  </h3>
                  <p className="text-gray-600 mb-6">{error.message}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="w-full h-11"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Perfil de la Empresa
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Gestiona la información y configuración de tu empresa
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-11 px-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="h-11 px-6"
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="h-11 px-6">
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-white shadow-sm border-0">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Información General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage
                          src={profile.logoUrl || "/placeholder.svg"}
                          alt={profile.name || "Empresa"}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                          <Building2 className="w-10 h-10" />
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Label
                          htmlFor="logo-upload"
                          className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setLogoFile(file);
                              }
                            }}
                            className="hidden"
                          />
                        </Label>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      {isEditing ? (
                        <Input
                          value={editedProfile.name || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              name: e.target.value,
                            })
                          }
                          className="text-2xl font-bold h-12 border-gray-200 focus:border-blue-500"
                          placeholder="Nombre de la empresa"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-900">
                          {profile.name || "Sin nombre"}
                        </h2>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {profile.businessSector || "Sector no definido"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-gray-700"
                        >
                          {profile.companySize || "Tamaño no definido"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Descripción
                      </Label>
                      {isEditing ? (
                        <Textarea
                          value={editedProfile.description || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="Describe tu empresa..."
                          className="border-gray-200 focus:border-blue-500 resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {profile.description || "Sin descripción"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Sector de Negocio
                        </Label>
                        {isEditing ? (
                          <Select
                            value={editedProfile.businessSector || ""}
                            onValueChange={(value) =>
                              setEditedProfile({
                                ...editedProfile,
                                businessSector: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Seleccionar sector" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tecnología">
                                Tecnología
                              </SelectItem>
                              <SelectItem value="Finanzas">Finanzas</SelectItem>
                              <SelectItem value="Salud">Salud</SelectItem>
                              <SelectItem value="Educación">
                                Educación
                              </SelectItem>
                              <SelectItem value="Manufactura">
                                Manufactura
                              </SelectItem>
                              <SelectItem value="Servicios">
                                Servicios
                              </SelectItem>
                              <SelectItem value="Comercio">Comercio</SelectItem>
                              <SelectItem value="Construcción">
                                Construcción
                              </SelectItem>
                              <SelectItem value="Agricultura">
                                Agricultura
                              </SelectItem>
                              <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-gray-600 mt-1">
                            {profile.businessSector || "No definido"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Tamaño de la Empresa
                        </Label>
                        {isEditing ? (
                          <Select
                            value={editedProfile.companySize || ""}
                            onValueChange={(
                              value: "MICRO" | "SMALL" | "MEDIUM" | "LARGE"
                            ) =>
                              setEditedProfile({
                                ...editedProfile,
                                companySize: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Seleccionar tamaño" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MICRO">
                                Micro (1-10 empleados)
                              </SelectItem>
                              <SelectItem value="SMALL">
                                Pequeña (11-50 empleados)
                              </SelectItem>
                              <SelectItem value="MEDIUM">
                                Mediana (51-200 empleados)
                              </SelectItem>
                              <SelectItem value="LARGE">
                                Grande (200+ empleados)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-gray-600 mt-1">
                            {profile.companySize || "No definido"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Año de Fundación
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.foundedYear?.toString() || ""}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                foundedYear: e.target.value
                                  ? parseInt(e.target.value)
                                  : null,
                              })
                            }
                            type="number"
                            placeholder="Ej: 2020"
                            className="h-12 border-gray-200 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-600 mt-1">
                            {profile.foundedYear || "No definido"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          RUC/Tax ID
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.taxId || ""}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                taxId: e.target.value,
                              })
                            }
                            placeholder="RUC de la empresa"
                            className="h-12 border-gray-200 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-600 mt-1">
                            {profile.taxId || "No definido"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Representante Legal
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.legalRepresentative || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              legalRepresentative: e.target.value,
                            })
                          }
                          placeholder="Nombre del representante legal"
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-600 mt-1">
                          {profile.legalRepresentative || "No definido"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editedProfile.website || ""}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                website: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="border-gray-200 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-sm">
                            {profile.website ? (
                              <a
                                href={profile.website}
                                className="text-blue-600 hover:underline font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {profile.website}
                              </a>
                            ) : (
                              <span className="text-gray-500">No definido</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editedProfile.email || ""}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                email: e.target.value,
                              })
                            }
                            type="email"
                            placeholder="email@empresa.com"
                            className="border-gray-200 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {profile.email || "No definido"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editedProfile.phone || ""}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+591 2 1234567"
                            className="border-gray-200 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {profile.phone || "No definido"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        {!isEditing ? (
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">
                              {profile.address || "Dirección no definida"}
                            </p>
                            <p className="text-gray-500 mt-1">
                              {profile.municipality?.name ||
                                "Municipio no definido"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={editedProfile.address || ""}
                              onChange={(e) =>
                                setEditedProfile({
                                  ...editedProfile,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Dirección de la empresa"
                              className="border-gray-200 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500">
                              Municipio:{" "}
                              {profile.municipality?.name || "No definido"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert>
                      <AlertDescription>{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Ingresa tu nueva contraseña"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirma tu nueva contraseña"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {passwordForm.newPassword !== passwordForm.confirmPassword &&
                    passwordForm.confirmPassword && (
                      <p className="text-sm text-red-600">
                        Las contraseñas no coinciden
                      </p>
                    )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={
                        passwordLoading ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                      }
                    >
                      {passwordLoading ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetPassword();
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
