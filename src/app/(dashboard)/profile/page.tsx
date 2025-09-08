"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the profile hook
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updating,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    profileCompletion,
  } = useProfile();

  // Form state - only fields that exist in the database
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    municipality: "",
    department: "",
    country: "",
    dateOfBirth: "",
    gender: "",
    documentType: "",
    documentNumber: "",
    educationLevel: "",
    currentInstitution: "",
    graduationYear: "",
    isStudying: false,
    currentDegree: "",
    universityName: "",
    universityStartDate: "",
    universityEndDate: "",
    universityStatus: "",
    gpa: "",
    interests: "",
    skills: "",
    workExperience: "",
    jobTitle: "",
    addressLine: "",
    cityState: "",
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

  // Populate form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        municipality: profile.municipality || "",
        department: profile.department || "",
        country: profile.country || "",
        dateOfBirth: profile.birthDate ? profile.birthDate.split("T")[0] : "",
        gender: profile.gender || "",
        documentType: profile.documentType || "",
        documentNumber: profile.documentNumber || "",
        educationLevel: profile.educationLevel || "",
        currentInstitution: profile.currentInstitution || "",
        graduationYear: profile.graduationYear?.toString() || "",
        isStudying: profile.isStudying || false,
        currentDegree: profile.currentDegree || "",
        universityName: profile.universityName || "",
        universityStartDate: profile.universityStartDate
          ? profile.universityStartDate.split("T")[0]
          : "",
        universityEndDate: profile.universityEndDate
          ? profile.universityEndDate.split("T")[0]
          : "",
        universityStatus: profile.universityStatus || "",
        gpa: profile.gpa?.toString() || "",
        interests: profile.interests?.join(", ") || "",
        skills: profile.skills?.join(", ") || "",
        workExperience: profile.workExperience
          ? (() => {
              try {
                // If it's already an object, check if it has a description field
                if (
                  typeof profile.workExperience === "object" &&
                  profile.workExperience !== null
                ) {
                  // If it's a simple object with description, return just the description
                  if (
                    profile.workExperience.description &&
                    typeof profile.workExperience.description === "string"
                  ) {
                    return profile.workExperience.description;
                  }
                  // If it's a complex object, stringify it for editing
                  return JSON.stringify(profile.workExperience, null, 2);
                }
                // If it's a string, return as is
                return String(profile.workExperience);
              } catch (error) {
                console.warn("Failed to process work experience:", error);
                return String(profile.workExperience);
              }
            })()
          : "",
        jobTitle: profile.jobTitle || "",
        addressLine: profile.addressLine || "",
        cityState: profile.cityState || "",
      });
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

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

    // Upload to server
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProfileImage(file);
      setAvatarUrl(uploadedUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
      // Reset preview on error
      setAvatarUrl(profile?.avatarUrl || null);
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

  const handleRemoveAvatar = async () => {
    try {
      await deleteProfileImage();
      setAvatarUrl(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la imagen"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Prepare data for API - clean empty strings and convert to appropriate types
      const updateData: any = {};

      // Basic information
      if (formData.firstName.trim())
        updateData.firstName = formData.firstName.trim();
      if (formData.lastName.trim())
        updateData.lastName = formData.lastName.trim();
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.address.trim()) updateData.address = formData.address.trim();
      if (formData.municipality.trim())
        updateData.municipality = formData.municipality.trim();
      if (formData.department.trim())
        updateData.department = formData.department.trim();
      if (formData.country.trim()) updateData.country = formData.country.trim();
      if (formData.dateOfBirth)
        updateData.birthDate = new Date(formData.dateOfBirth);
      if (formData.gender.trim()) updateData.gender = formData.gender.trim();

      // Document information
      if (formData.documentType.trim())
        updateData.documentType = formData.documentType.trim();
      if (formData.documentNumber.trim())
        updateData.documentNumber = formData.documentNumber.trim();

      // Education information
      if (formData.educationLevel.trim())
        updateData.educationLevel = formData.educationLevel.trim();
      if (formData.currentInstitution.trim())
        updateData.currentInstitution = formData.currentInstitution.trim();
      if (formData.graduationYear.trim())
        updateData.graduationYear = parseInt(formData.graduationYear);
      updateData.isStudying = formData.isStudying;
      if (formData.currentDegree.trim())
        updateData.currentDegree = formData.currentDegree.trim();
      if (formData.universityName.trim())
        updateData.universityName = formData.universityName.trim();
      if (formData.universityStartDate)
        updateData.universityStartDate = new Date(formData.universityStartDate);
      if (formData.universityEndDate)
        updateData.universityEndDate = new Date(formData.universityEndDate);
      if (formData.universityStatus.trim())
        updateData.universityStatus = formData.universityStatus.trim();
      if (formData.gpa.trim()) updateData.gpa = parseFloat(formData.gpa);

      // Job information
      if (formData.jobTitle.trim())
        updateData.jobTitle = formData.jobTitle.trim();
      if (formData.addressLine.trim())
        updateData.addressLine = formData.addressLine.trim();
      if (formData.cityState.trim())
        updateData.cityState = formData.cityState.trim();

      // Handle arrays - only include if they have values
      const interests = formData.interests
        ? formData.interests
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
      if (interests.length > 0) updateData.interests = interests;

      const skills = formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
      if (skills.length > 0) updateData.skills = skills;

      // Handle work experience
      if (formData.workExperience.trim()) {
        try {
          // If it's already valid JSON, parse it
          if (
            formData.workExperience.trim().startsWith("{") ||
            formData.workExperience.trim().startsWith("[")
          ) {
            updateData.workExperience = JSON.parse(formData.workExperience);
          } else {
            // If it's plain text, wrap it in an object
            updateData.workExperience = {
              description: formData.workExperience.trim(),
            };
          }
        } catch (error) {
          console.warn(
            "Failed to parse work experience as JSON, treating as plain text:",
            error
          );
          // If JSON parsing fails, treat it as plain text
          updateData.workExperience = {
            description: formData.workExperience.trim(),
          };
        }
      }

      await updateProfile(updateData);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar perfil"
      );
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Avatar Upload Skeleton */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardContent>
              </Card>

              {/* Profile Form Skeleton */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600 text-lg">
            Actualiza tu información personal y foto de perfil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Avatar Upload */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
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
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-green-600" />
                  Información Personal
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Error Message */}
                  {(error || profileError) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {error || profileError}
                      </AlertDescription>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Nombre
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        placeholder="Tu nombre"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Apellido
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Tu apellido"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Teléfono
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            // Only allow numbers, +, -, spaces, and parentheses
                            const value = e.target.value.replace(
                              /[^0-9+\-\s()]/g,
                              ""
                            );
                            handleInputChange("phone", value);
                          }}
                          placeholder="+591 70012345"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Solo números, +, -, espacios y paréntesis
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Dirección
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder="Dirección completa"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Fecha de Nacimiento
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="gender"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Género
                      </Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full h-12 px-3 border border-gray-200 rounded-md bg-background text-sm focus:border-blue-500 focus:outline-none"
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

                  {/* Municipality and Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="municipality"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Municipio
                      </Label>
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) =>
                          handleInputChange("municipality", e.target.value)
                        }
                        placeholder="Tu municipio"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="department"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Departamento
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                        placeholder="Tu departamento"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Skills and Interests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="skills"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Habilidades
                      </Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) =>
                          handleInputChange("skills", e.target.value)
                        }
                        placeholder="Habilidad 1, Habilidad 2, Habilidad 3"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separa las habilidades con comas
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="interests"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Intereses
                      </Label>
                      <Input
                        id="interests"
                        value={formData.interests}
                        onChange={(e) =>
                          handleInputChange("interests", e.target.value)
                        }
                        placeholder="Interés 1, Interés 2, Interés 3"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separa los intereses con comas
                      </p>
                    </div>
                  </div>

                  {/* Education and Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="currentDegree"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Educación
                      </Label>
                      <Textarea
                        id="currentDegree"
                        value={formData.currentDegree}
                        onChange={(e) =>
                          handleInputChange("currentDegree", e.target.value)
                        }
                        placeholder="Tu formación académica..."
                        rows={3}
                        className="border-gray-200 focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="workExperience"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Experiencia Laboral
                      </Label>
                      <Textarea
                        id="workExperience"
                        value={formData.workExperience}
                        onChange={(e) =>
                          handleInputChange("workExperience", e.target.value)
                        }
                        placeholder="Describe tu experiencia laboral, trabajos anteriores, responsabilidades..."
                        rows={4}
                        className="border-gray-200 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving || updating}
                      className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving || updating ? (
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
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Rol
                  </label>
                  <p className="text-sm text-gray-900 capitalize font-medium">
                    {user?.role?.toLowerCase().replace("_", " ")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Usuario
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {user?.username}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Estado
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
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
