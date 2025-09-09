"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateMunicipality,
  useMunicipalities,
} from "@/hooks/useMunicipalityApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { generateMunicipalityCredentials } from "@/lib/utils/generate-credentials";
import { CredentialsModal } from "./credentials-modal";

interface Credentials {
  username: string;
  password: string;
  email: string;
  institutionName: string;
}

const createMunicipalitySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]+$/,
      "El nombre solo puede contener letras, números, espacios, guiones y puntos"
    ),
  department: z
    .string()
    .min(2, "El departamento debe tener al menos 2 caracteres"),
  region: z
    .string()
    .max(50, "La región no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
      "La región solo puede contener letras y espacios"
    )
    .optional(),
  address: z
    .string()
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30, "El usuario no puede tener más de 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El usuario solo puede contener letras, números y guiones bajos"
    ),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "El email no puede tener más de 100 caracteres"),
  phone: z
    .string()
    .regex(
      /^(\+591|591)?[0-9\s-]{7,10}$/,
      "Formato de teléfono inválido. Use: +591 4 4222222"
    )
    .optional()
    .or(z.literal("")),
  institutionType: z.enum(["MUNICIPALITY", "NGO", "FOUNDATION", "OTHER"]),
  customType: z
    .string()
    .max(50, "El tipo personalizado no puede tener más de 50 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
      "El tipo personalizado solo puede contener letras y espacios"
    )
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Color inválido")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Color inválido")
    .optional(),
});

type CreateMunicipalityFormData = z.infer<typeof createMunicipalitySchema>;

interface CreateMunicipalityFormProps {
  onSuccess: () => void;
}

export function CreateMunicipalityForm({
  onSuccess,
}: CreateMunicipalityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] =
    useState<Credentials | null>(null);
  const createMunicipality = useCreateMunicipality();
  const { data: existingMunicipalities } = useMunicipalities();
  const { toast } = useToast();
  const [emailError, setEmailError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateMunicipalityFormData>({
    resolver: zodResolver(createMunicipalitySchema),
    defaultValues: {
      department: "Cochabamba",
      institutionType: "MUNICIPALITY",
      primaryColor: "#1E40AF",
      secondaryColor: "#F59E0B",
    },
  });

  const watchedName = watch("name");
  const watchedInstitutionType = watch("institutionType");
  const watchedEmail = watch("email");
  const watchedUsername = watch("username");

  // Helper function to check if email is already in use
  const isEmailInUse = (email: string) => {
    if (!existingMunicipalities || !email) return false;
    return existingMunicipalities.some(
      (m) => m.email?.toLowerCase() === email.toLowerCase()
    );
  };

  // Helper function to check if username is already in use
  const isUsernameInUse = (username: string) => {
    if (!existingMunicipalities || !username) return false;
    return existingMunicipalities.some(
      (m) => m.username?.toLowerCase() === username.toLowerCase()
    );
  };

  // Input formatting and restriction functions
  const formatPhoneNumber = (value: string) => {
    // Only allow numbers, +, -, and spaces
    let cleaned = value.replace(/[^0-9+\-\s]/g, "");

    if (cleaned.length > 0) {
      // Remove all non-digits except + at the beginning
      const digits = cleaned.replace(/[^\d]/g, "");
      const hasPlus = cleaned.startsWith("+");

      if (hasPlus && digits.length > 0) {
        // Format: +591 4 4222222
        if (digits.length <= 3) {
          cleaned = `+${digits}`;
        } else if (digits.length <= 6) {
          cleaned = `+${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else {
          cleaned = `+${digits.slice(0, 3)} ${digits.slice(3, 4)} ${digits.slice(4, 10)}`;
        }
      } else if (!hasPlus && digits.length > 0) {
        // Format: 591 4 4222222 or 4 4222222
        if (digits.length <= 3) {
          cleaned = digits;
        } else if (digits.length <= 6) {
          cleaned = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else {
          cleaned = `${digits.slice(0, 3)} ${digits.slice(3, 4)} ${digits.slice(4, 10)}`;
        }
      }
    }

    return cleaned;
  };

  const restrictToAlphanumericUnderscore = (value: string) => {
    return value.replace(/[^a-zA-Z0-9_]/g, "");
  };

  const restrictToLettersAndSpaces = (value: string) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  };

  const restrictToNameCharacters = (value: string) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]/g, "");
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    // Prevent invalid characters from being typed
    if (field === "phone") {
      if (
        !/[0-9+\-\s]/.test(e.key) &&
        ![
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    } else if (field === "username") {
      if (
        !/[a-zA-Z0-9_]/.test(e.key) &&
        ![
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    } else if (field === "name") {
      if (
        !/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]/.test(e.key) &&
        ![
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    } else if (field === "region" || field === "customType") {
      if (
        !/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(e.key) &&
        ![
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    }
  };

  const handleGenerateCredentials = () => {
    if (watchedName && watchedName.length > 2) {
      const credentials = generateMunicipalityCredentials(watchedName);
      setValue("username", credentials.username);
      setValue("password", credentials.password);
      toast({
        title: "Credenciales generadas",
        description: "Se han generado nuevas credenciales automáticamente.",
      });
    } else {
      toast({
        title: "Error",
        description:
          "Debes ingresar el nombre de la institución primero (mínimo 3 caracteres).",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CreateMunicipalityFormData) => {
    setIsLoading(true);
    setEmailError(null); // Clear any previous email errors

    try {
      await createMunicipality.mutateAsync(data);

      // Store credentials to show in modal
      setCreatedCredentials({
        username: data.username,
        password: data.password,
        email: data.email,
        institutionName: data.name,
      });

      // Show credentials modal
      setShowCredentialsModal(true);

      reset();
    } catch (error: any) {
      console.error("Error creating municipality:", error);

      // Extract meaningful error message
      let errorMessage =
        "No se pudo crear la institución. Verifica los datos ingresados.";

      if (error?.message) {
        // Use the specific error message from the API
        errorMessage = error.message;

        // Check if it's an email-related error and set specific state
        if (errorMessage.includes("email") || errorMessage.includes("Email")) {
          setEmailError(errorMessage);
        }
      } else if (error?.data?.error) {
        // Fallback to data.error if available
        errorMessage = error.data.error;

        // Check if it's an email-related error and set specific state
        if (errorMessage.includes("email") || errorMessage.includes("Email")) {
          setEmailError(errorMessage);
        }
      }

      toast({
        title: "Error al crear institución",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsModalClose = () => {
    setShowCredentialsModal(false);
    setCreatedCredentials(null);
    onSuccess();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      >
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Institución *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ej: Municipio de Cochabamba"
                  onKeyPress={(e) => handleKeyPress(e, "name")}
                  onChange={(e) => {
                    const restrictedValue = restrictToNameCharacters(
                      e.target.value
                    );
                    if (restrictedValue !== e.target.value) {
                      e.target.value = restrictedValue;
                    }
                    register("name").onChange(e);
                  }}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Input
                  id="department"
                  value="Cochabamba"
                  disabled
                  className="bg-gray-50"
                />
                <input
                  type="hidden"
                  {...register("department")}
                  value="Cochabamba"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Input
                id="region"
                {...register("region")}
                placeholder="Ej: Valle Alto"
                onKeyPress={(e) => handleKeyPress(e, "region")}
                onChange={(e) => {
                  const restrictedValue = restrictToLettersAndSpaces(
                    e.target.value
                  );
                  if (restrictedValue !== e.target.value) {
                    e.target.value = restrictedValue;
                  }
                  register("region").onChange(e);
                }}
              />
              {errors.region && (
                <p className="text-sm text-red-600">{errors.region.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionType">Tipo de Institución *</Label>
              <Select
                value={watchedInstitutionType}
                onValueChange={(value) =>
                  setValue(
                    "institutionType",
                    value as "MUNICIPALITY" | "NGO" | "FOUNDATION" | "OTHER"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUNICIPALITY">Municipio</SelectItem>
                  <SelectItem value="NGO">ONG</SelectItem>
                  <SelectItem value="FOUNDATION">Fundación</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.institutionType && (
                <p className="text-sm text-red-600">
                  {errors.institutionType.message}
                </p>
              )}
            </div>

            {watchedInstitutionType === "OTHER" && (
              <div className="space-y-2">
                <Label htmlFor="customType">Tipo Personalizado</Label>
                <Input
                  id="customType"
                  {...register("customType")}
                  placeholder="Especificar tipo de institución"
                  onKeyPress={(e) => handleKeyPress(e, "customType")}
                  onChange={(e) => {
                    const restrictedValue = restrictToLettersAndSpaces(
                      e.target.value
                    );
                    if (restrictedValue !== e.target.value) {
                      e.target.value = restrictedValue;
                    }
                    register("customType").onChange(e);
                  }}
                />
                {errors.customType && (
                  <p className="text-sm text-red-600">
                    {errors.customType.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información de Contacto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Ej: Plaza Principal 14 de Septiembre"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="Ej: https://cochabamba.gob.bo"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Principal *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Ej: info@cochabamba.gob.bo"
                className={
                  emailError || (watchedEmail && isEmailInUse(watchedEmail))
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                onChange={(e) => {
                  // Clear email error when user starts typing
                  if (emailError) {
                    setEmailError(null);
                  }
                  register("email").onChange(e);
                }}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
              {watchedEmail && isEmailInUse(watchedEmail) && !emailError && (
                <p className="text-sm text-amber-600">
                  ⚠️ Este email ya está registrado por otra institución
                </p>
              )}
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono General</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Ej: +591 4 4222222"
                onKeyPress={(e) => handleKeyPress(e, "phone")}
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value);
                  if (formattedValue !== e.target.value) {
                    e.target.value = formattedValue;
                  }
                  register("phone").onChange(e);
                }}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Credenciales de Acceso */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Credenciales de Acceso</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateCredentials}
              disabled={!watchedName || watchedName.length < 3}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar Automáticamente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario *</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Ej: cochabamba_muni"
                className={
                  watchedUsername && isUsernameInUse(watchedUsername)
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                onKeyPress={(e) => handleKeyPress(e, "username")}
                onChange={(e) => {
                  const restrictedValue = restrictToAlphanumericUnderscore(
                    e.target.value
                  );
                  if (restrictedValue !== e.target.value) {
                    e.target.value = restrictedValue;
                  }
                  register("username").onChange(e);
                }}
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
              {watchedUsername && isUsernameInUse(watchedUsername) && (
                <p className="text-sm text-amber-600">
                  ⚠️ Este nombre de usuario ya está en uso
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Contraseña segura"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Colores de la Institución */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Colores de la Institución</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPicker
              label="Color Primario"
              value={watch("primaryColor")}
              onValueChange={(value) => setValue("primaryColor", value)}
            />

            <ColorPicker
              label="Color Secundario"
              value={watch("secondaryColor")}
              onValueChange={(value) => setValue("secondaryColor", value)}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Institución
          </Button>
        </div>
      </form>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={handleCredentialsModalClose}
        credentials={createdCredentials}
      />
    </>
  );
}
