"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { useAuthContext } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: "",
    location: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    interests: "",
    skills: "",
    education: "",
    experience: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede exceder 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload
    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Avatar uploaded successfully");
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Profile updated:", formData);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Actualiza tu información personal y foto de perfil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Avatar Upload */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Camera className="h-4 sm:h-5 w-4 sm:w-5" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Current Avatar Display */}
                {avatarUrl && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <Avatar className="h-20 sm:h-24 w-20 sm:w-24">
                      <AvatarImage
                        src={avatarUrl}
                        alt="Avatar"
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                        className="w-full sm:w-fit text-sm"
                      >
                        <Trash2 className="h-3 sm:h-4 w-3 sm:w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg text-center transition-colors p-4 sm:p-6",
                    "border-gray-300 hover:border-gray-400",
                    isUploading && "opacity-50 pointer-events-none"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleInputChangeFile}
                    className="hidden"
                  />

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-blue-100 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12">
                        {isUploading ? (
                          <Loader2 className="text-blue-600 animate-spin w-5 sm:w-6 h-5 sm:h-6" />
                        ) : (
                          <Camera className="text-blue-600 w-5 sm:w-6 h-5 sm:h-6" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {avatarUrl
                          ? "Cambiar foto de perfil"
                          : "Subir foto de perfil"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Haz clic para seleccionar una imagen
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2 text-sm"
                        size="sm"
                      >
                        <Upload className="h-3 sm:h-4 w-3 sm:w-4" />
                        {isUploading ? "Subiendo..." : "Seleccionar Imagen"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Upload Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Formatos permitidos: JPEG, PNG, GIF, WebP</p>
                  <p>Tamaño máximo: 5MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 sm:h-5 w-4 sm:w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Message */}
                  {saveSuccess && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Perfil actualizado exitosamente
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="firstName" className="text-sm">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        placeholder="Tu nombre"
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="lastName" className="text-sm">Apellido</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Tu apellido"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 sm:top-3 h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Tu número de teléfono"
                          className="pl-8 sm:pl-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="location" className="text-sm">Ubicación</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 sm:top-3 h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="Ciudad, Departamento"
                          className="pl-8 sm:pl-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm">Fecha de Nacimiento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 sm:top-3 h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          className="pl-8 sm:pl-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="gender" className="text-sm">Género</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="">Seleccionar género</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                        <option value="prefiero-no-decir">
                          Prefiero no decir
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="bio" className="text-sm">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                      className="text-sm"
                    />
                  </div>

                  {/* Skills and Interests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="skills" className="text-sm">Habilidades</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) =>
                          handleInputChange("skills", e.target.value)
                        }
                        placeholder="Habilidad 1, Habilidad 2, Habilidad 3"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separa las habilidades con comas
                      </p>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="interests" className="text-sm">Intereses</Label>
                      <Input
                        id="interests"
                        value={formData.interests}
                        className="text-sm"
                        onChange={(e) =>
                          handleInputChange("interests", e.target.value)
                        }
                        placeholder="Interés 1, Interés 2, Interés 3"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separa los intereses con comas
                      </p>
                    </div>
                  </div>

                  {/* Education and Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Educación</Label>
                      <Textarea
                        id="education"
                        value={formData.education}
                        onChange={(e) =>
                          handleInputChange("education", e.target.value)
                        }
                        placeholder="Tu formación académica..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experiencia</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) =>
                          handleInputChange("experience", e.target.value)
                        }
                        placeholder="Tu experiencia laboral..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rol
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {user?.role?.toLowerCase().replace("_", " ")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Usuario
                  </label>
                  <p className="text-sm text-gray-900">{user?.username}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="text-sm text-gray-900">
                    {user?.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
