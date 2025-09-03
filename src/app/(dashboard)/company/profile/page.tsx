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
  municipality: {
    id: string;
    name: string;
    department: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyProfilePage() {
  const { profile, loading, error } = useCompanyProfile();
  const { user } = useAuthContext();

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      console.log("Profile updated successfully:", result);

      // Update the local profile state
      if (profile) {
        setEditedProfile({ ...profile, ...editedProfile });
      }

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
    console.log("🔍 CompanyProfilePage - Rendering loading state:", {
      loading,
      profile: !!profile,
      editedProfile: !!editedProfile,
    });
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Perfil de la Empresa</h1>
            <p className="text-muted-foreground">
              Gestiona la información y configuración de tu empresa
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>Loading: {loading ? "true" : "false"}</p>
          <p>Profile: {profile ? "loaded" : "null"}</p>
          <p>EditedProfile: {editedProfile ? "loaded" : "null"}</p>
          {error && <p className="text-red-500">Error: {error.message}</p>}
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Perfil de la Empresa</h1>
            <p className="text-muted-foreground">
              Gestiona la información y configuración de tu empresa
            </p>
          </div>
        </div>

        {isNotFoundError ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontró el perfil de la empresa
              </h3>
              <p className="text-muted-foreground mb-4">
                Parece que tu empresa aún no tiene un perfil configurado o el
                perfil no existe en la base de datos.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Reintentar
                </Button>
                <Button
                  onClick={() => {
                    // For now, redirect to the company creation page
                    // In the future, this could open a modal to create the profile
                    window.location.href = "/admin/companies";
                  }}
                  className="w-full"
                >
                  Ir a Administración de Empresas
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  ID de usuario: {user?.id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600">
                Error al cargar el perfil: {error.message}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Perfil de la Empresa</h1>
          <p className="text-muted-foreground">
            Gestiona la información y configuración de tu empresa
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saveLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt={profile.name || "Empresa"}
                      />
                      <AvatarFallback>
                        <Building2 className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Label
                        htmlFor="logo-upload"
                        className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
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
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <Input
                        value={editedProfile.name || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                        className="text-2xl font-bold"
                        placeholder="Nombre de la empresa"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">
                        {profile.name || "Sin nombre"}
                      </h2>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {profile.businessSector || "Sector no definido"}
                      </Badge>
                      <Badge variant="outline">
                        {profile.companySize || "Tamaño no definido"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Descripción</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile.description || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Describe tu empresa..."
                      />
                    ) : (
                      <p className="text-muted-foreground mt-1">
                        {profile.description || "Sin descripción"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sector de Negocio</Label>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar sector" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tecnología">
                              Tecnología
                            </SelectItem>
                            <SelectItem value="Finanzas">Finanzas</SelectItem>
                            <SelectItem value="Salud">Salud</SelectItem>
                            <SelectItem value="Educación">Educación</SelectItem>
                            <SelectItem value="Manufactura">
                              Manufactura
                            </SelectItem>
                            <SelectItem value="Servicios">Servicios</SelectItem>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.businessSector || "No definido"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Tamaño de la Empresa</Label>
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
                          <SelectTrigger>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.companySize || "No definido"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Año de Fundación</Label>
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
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.foundedYear || "No definido"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>RUC/Tax ID</Label>
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
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.taxId || "No definido"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Representante Legal</Label>
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
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.legalRepresentative || "No definido"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Debug: Show raw values */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground bg-gray-100 p-2 rounded mb-4">
                    <strong>Debug - Raw values:</strong>
                    <br />
                    Website: {JSON.stringify(profile?.website)}
                    <br />
                    Email: {JSON.stringify(profile?.email)}
                    <br />
                    Phone: {JSON.stringify(profile?.phone)}
                    <br />
                    Address: {JSON.stringify(profile?.address)}
                    <br />
                    Municipality: {JSON.stringify(profile?.municipality)}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
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
                      />
                    ) : (
                      <span className="text-sm">
                        {profile.website ? (
                          <a
                            href={profile.website}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          "No definido"
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
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
                      />
                    ) : (
                      <span className="text-sm">
                        {profile.email || "No definido"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
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
                      />
                    ) : (
                      <span className="text-sm">
                        {profile.phone || "No definido"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {!isEditing ? (
                      <div className="text-sm">
                        <p>{profile.address || "Dirección no definida"}</p>
                        <p className="text-muted-foreground">
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Municipio:{" "}
                          {profile.municipality?.name || "No definido"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
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
                      passwordForm.newPassword !== passwordForm.confirmPassword
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
  );
}
