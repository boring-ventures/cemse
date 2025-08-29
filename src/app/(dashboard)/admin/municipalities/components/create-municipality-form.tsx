"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMunicipality } from "@/hooks/useMunicipalityApi";
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
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  department: z
    .string()
    .min(2, "El departamento debe tener al menos 2 caracteres"),
  region: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  institutionType: z.enum(["MUNICIPALITY", "NGO", "FOUNDATION", "OTHER"]),
  customType: z.string().optional(),
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
  const { toast } = useToast();

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
      toast({
        title: "Error al crear institución",
        description: error?.message || "No se pudo crear la institución. Verifica que el nombre, usuario y email no existan.",
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
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono General</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Ej: +591 4 4222222"
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
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
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
