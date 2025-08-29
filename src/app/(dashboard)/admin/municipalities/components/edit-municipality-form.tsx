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
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  department: z
    .string()
    .min(2, "El departamento debe tener al menos 2 caracteres"),
  region: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Email inválido"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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
