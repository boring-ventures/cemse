"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateMunicipality } from "@/hooks/useMunicipalityApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Municipality } from "@/types/municipality";

const updateMunicipalitySchema = z.object({
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
  phone: z
    .string()
    .regex(
      /^(\+591|591)?[0-9\s-]{7,10}$/,
      "Formato de teléfono inválido. Use: +591 4 4222222"
    )
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "El email no puede tener más de 100 caracteres"),
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
  isActive: z.boolean(),
});

type UpdateMunicipalityFormData = z.infer<typeof updateMunicipalitySchema>;

interface EditMunicipalityFormProps {
  municipality: Municipality;
  onSuccess: () => void;
}

export function EditMunicipalityForm({
  municipality,
  onSuccess,
}: EditMunicipalityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const updateMunicipality = useUpdateMunicipality();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateMunicipalityFormData>({
    resolver: zodResolver(updateMunicipalitySchema),
    defaultValues: {
      name: municipality.name,
      department: municipality.department || "Cochabamba",
      region: municipality.region || "",
      address: municipality.address || "",
      website: municipality.website || "",
      phone: municipality.phone || "",
      email: municipality.email,
      institutionType: municipality.institutionType || "MUNICIPALITY",
      customType: municipality.customType || "",
      primaryColor: municipality.primaryColor || "#1E40AF",
      secondaryColor: municipality.secondaryColor || "#F59E0B",
      isActive: municipality.isActive,
    },
  });

  const watchedInstitutionType = watch("institutionType");

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

  const onSubmit = async (data: UpdateMunicipalityFormData) => {
    setIsLoading(true);
    try {
      await updateMunicipality.mutateAsync({
        id: municipality.id,
        data: data,
      });

      toast({
        title: "Institución actualizada",
        description: "La institución ha sido actualizada exitosamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar la institución.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
    >
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

      {/* Estado */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Estado</h3>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={watch("isActive")}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <Label htmlFor="isActive">Institución Activa</Label>
        </div>
      </div>

      {/* Información del Sistema (Solo lectura) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información del Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Esta información no se puede modificar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <Input
              value={municipality.username}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de Creación</Label>
            <Input
              value={new Date(municipality.createdAt).toLocaleDateString()}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Actualizar Institución
        </Button>
      </div>
    </form>
  );
}
