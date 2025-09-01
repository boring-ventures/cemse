"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useEntrepreneurship } from "@/hooks/useEntrepreneurshipApi";
import { useAuthContext } from "@/hooks/use-auth";
import { EntrepreneurshipService } from "@/services/entrepreneurship.service";

interface EntrepreneurshipEditProps {
  id: string;
}

function EntrepreneurshipEditContent({ id }: EntrepreneurshipEditProps): React.ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { entrepreneurship, loading, error, fetchEntrepreneurship } = useEntrepreneurship(id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    businessStage: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    municipality: "",
    department: "",
    businessModel: "",
    targetMarket: "",
    employees: "",
    annualRevenue: "",
    founded: "",
    isPublic: true,
  });

  useEffect(() => {
    if (id) {
      fetchEntrepreneurship();
    }
  }, [id, fetchEntrepreneurship]);

  useEffect(() => {
    if (entrepreneurship) {
      setFormData({
        name: entrepreneurship.name || "",
        description: entrepreneurship.description || "",
        category: entrepreneurship.category || "",
        subcategory: entrepreneurship.subcategory || "",
        businessStage: entrepreneurship.businessStage || "",
        website: entrepreneurship.website || "",
        email: entrepreneurship.email || "",
        phone: entrepreneurship.phone || "",
        address: entrepreneurship.address || "",
        municipality: entrepreneurship.municipality || "",
        department: entrepreneurship.department || "",
        businessModel: entrepreneurship.businessModel || "",
        targetMarket: entrepreneurship.targetMarket || "",
        employees: entrepreneurship.employees?.toString() || "",
        annualRevenue: entrepreneurship.annualRevenue?.toString() || "",
        founded: entrepreneurship.founded ? new Date(entrepreneurship.founded).toISOString().split('T')[0] : "",
        isPublic: entrepreneurship.isPublic ?? true,
      });
    }
  }, [entrepreneurship]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrepreneurship) return;

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        employees: formData.employees ? parseInt(formData.employees) : null,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : null,
        founded: formData.founded ? new Date(formData.founded) : null,
      };

      await EntrepreneurshipService.updateEntrepreneurship(id, updateData);
      router.push(`/entrepreneurship/${id}`);
    } catch (error) {
      console.error("Error updating entrepreneurship:", error);
      alert("Error al actualizar el emprendimiento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando emprendimiento...</span>
        </div>
      </div>
    );
  }

  if (error || !entrepreneurship) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error || "Emprendimiento no encontrado"}
          </p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  // Check if user is the owner
  if (user?.id !== entrepreneurship.owner?.userId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">No tienes permisos para editar este emprendimiento</p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Editar Emprendimiento</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="alimentacion">Alimentación</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange("subcategory", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="businessStage">Etapa del Negocio *</Label>
                <Select value={formData.businessStage} onValueChange={(value) => handleInputChange("businessStage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDEA">Idea</SelectItem>
                    <SelectItem value="STARTUP">Startup</SelectItem>
                    <SelectItem value="GROWING">En Crecimiento</SelectItem>
                    <SelectItem value="ESTABLISHED">Establecido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessModel">Modelo de Negocio</Label>
                <Input
                  id="businessModel"
                  value={formData.businessModel}
                  onChange={(e) => handleInputChange("businessModel", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="targetMarket">Mercado Objetivo</Label>
                <Input
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange("targetMarket", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employees">Número de Empleados</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={formData.employees}
                    onChange={(e) => handleInputChange("employees", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="annualRevenue">Ingresos Anuales (Bs.)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={formData.annualRevenue}
                    onChange={(e) => handleInputChange("annualRevenue", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="founded">Fecha de Fundación</Label>
                <Input
                  id="founded"
                  type="date"
                  value={formData.founded}
                  onChange={(e) => handleInputChange("founded", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location and Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación y Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="municipality">Municipio *</Label>
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={(e) => handleInputChange("municipality", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Emprendimiento público</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EntrepreneurshipEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <EntrepreneurshipEditContent id={resolvedParams.id} />;
}
