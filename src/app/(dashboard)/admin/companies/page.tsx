"use client";

import { useState } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/use-companies";
import { useMunicipalities } from "@/hooks/use-municipalities";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  Company,
  CreateCompanyRequest,
} from "@/services/companies.service";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/utils";

// Predefined business sectors
const BUSINESS_SECTORS = [
  "Tecnología",
  "Salud",
  "Educación",
  "Construcción",
  "Comercio",
  "Manufactura",
  "Financiero",
  "Turismo",
  "Agricultura",
  "Transporte",
  "Energía",
  "Medios",
  "Consultoría",
  "Inmobiliario",
  "Alimentación",
  "Textil",
  "Farmacéutico",
  "Automotriz",
  "Aerospace",
  "Otro",
];

// Utility function to generate credentials
export const generateCredentials = (companyName: string, email: string) => {
  const UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWERS = "abcdefghijklmnopqrstuvwxyz";
  const NUMBERS = "0123456789";
  const SPECIALS = `!@#$%^&*(),.?":{}|<>`;
  const ALL = UPPERS + LOWERS + NUMBERS + SPECIALS;

  // Helper: random seguro
  function randIndex(max: number): number {
    const g = (globalThis as any).crypto;
    if (g?.getRandomValues && typeof Uint32Array !== "undefined") {
      const arr = new Uint32Array(1);
      g.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function pick(set: string) {
    return set[randIndex(set.length)];
  }

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randIndex(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Username
  let username = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);
  if (!username) {
    const local = email.split("@")[0] || "user";
    username = local
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20);
  }

  // Password
  const PASSWORD_LENGTH = 12;
  const chars = [pick(UPPERS), pick(LOWERS), pick(NUMBERS), pick(SPECIALS)];
  while (chars.length < PASSWORD_LENGTH) chars.push(pick(ALL));
  const password = shuffle(chars).join("");

  return { username, password };
};

// Utility function to validate email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to validate password strength
const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength)
    errors.push(`Mínimo ${minLength} caracteres`);
  if (!hasUpperCase) errors.push("Al menos una mayúscula");
  if (!hasLowerCase) errors.push("Al menos una minúscula");
  if (!hasNumbers) errors.push("Al menos un número");
  if (!hasSpecialChar) errors.push("Al menos un carácter especial");

  return {
    isValid: errors.length === 0,
    errors,
    score: [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      password.length >= minLength,
    ].filter(Boolean).length,
  };
};

export default function CompaniesPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showGeneratedCredentials, setShowGeneratedCredentials] =
    useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [selectedBusinessSector, setSelectedBusinessSector] =
    useState<string>("");
  const [customBusinessSector, setCustomBusinessSector] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: "",
    description: "",
    businessSector: "",
    companySize: undefined,
    foundedYear: new Date().getFullYear(),
    website: "",
    email: "",
    phone: "",
    address: "",
    municipalityId: "",
    username: "",
    password: "",
    isActive: true,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Hooks
  const { profile } = useCurrentUser();
  const {
    data: companiesData,
    isLoading: companiesLoading,
    error: companiesError,
  } = useCompanies();
  const { data: municipalities = [], isLoading: municipalitiesLoading } =
    useMunicipalities();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();
  const { toast } = useToast();

  // Check permissions
  const canManageCompanies =
    profile &&
    profile.role &&
    ["SUPERADMIN", "GOBIERNOS_MUNICIPALES", "INSTRUCTOR"].includes(
      profile.role
    );

  const canDeleteCompanies =
    profile &&
    profile.role &&
    ["SUPERADMIN", "GOBIERNOS_MUNICIPALES"].includes(profile.role);

  // Extract companies and metadata
  const companies = companiesData?.companies || [];
  const metadata = companiesData?.metadata || {
    totalActive: 0,
    totalInactive: 0,
    totalJobOffers: 0,
    totalEmployees: 0,
  };

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (company.businessSector?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.isActive) ||
      (statusFilter === "inactive" && !company.isActive);

    return matchesSearch && matchesStatus;
  });

  // Enhanced validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "El nombre de la empresa es requerido";
    } else if (formData.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.name.length > 100) {
      errors.name = "El nombre no puede tener más de 100 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.&]+$/.test(formData.name)) {
      errors.name =
        "El nombre solo puede contener letras, números, espacios, guiones, puntos y &";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "El formato del email no es válido";
    } else if (formData.email.length > 100) {
      errors.email = "El email no puede tener más de 100 caracteres";
    }

    // Municipality validation
    if (!formData.municipalityId) {
      errors.municipalityId = "Debe seleccionar un municipio";
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    } else if (formData.username.length > 30) {
      errors.username =
        "El nombre de usuario no puede tener más de 30 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "El nombre de usuario solo puede contener letras, números y guiones bajos";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (formData.password.length > 50) {
      errors.password = "La contraseña no puede tener más de 50 caracteres";
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim()) {
      if (
        !/^(\+591|591)?[0-9\s-]{7,10}$/.test(formData.phone.replace(/\s/g, ""))
      ) {
        errors.phone = "Formato de teléfono inválido. Use: +591 4 4222222";
      }
    }

    // Website validation (optional)
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        errors.website = "URL inválida";
      }
    }

    // Founded year validation (optional)
    if (formData.foundedYear) {
      const currentYear = new Date().getFullYear();
      if (formData.foundedYear < 1800 || formData.foundedYear > currentYear) {
        errors.foundedYear = `El año debe estar entre 1800 y ${currentYear}`;
      }
    }

    // Description validation (optional)
    if (formData.description && formData.description.length > 500) {
      errors.description =
        "La descripción no puede tener más de 500 caracteres";
    }

    // Address validation (optional)
    if (formData.address && formData.address.length > 200) {
      errors.address = "La dirección no puede tener más de 200 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle business sector selection
  const handleBusinessSectorChange = (value: string) => {
    setSelectedBusinessSector(value);
    if (value === "Otro") {
      setFormData((prev) => ({ ...prev, businessSector: "" }));
    } else {
      setFormData((prev) => ({ ...prev, businessSector: value }));
      setCustomBusinessSector("");
    }
  };

  // Handle custom business sector input
  const handleCustomBusinessSectorChange = (value: string) => {
    setCustomBusinessSector(value);
    setFormData((prev) => ({ ...prev, businessSector: value }));
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

  const restrictToNameCharacters = (value: string) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.&]/g, "");
  };

  const restrictToNumbers = (value: string) => {
    return value.replace(/[^0-9]/g, "");
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
        !/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.&]/.test(e.key) &&
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
    } else if (field === "foundedYear") {
      if (
        !/[0-9]/.test(e.key) &&
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

  const handleFieldChange = (field: string, value: any) => {
    let processedValue = value;

    // Apply field-specific restrictions
    if (field === "phone") {
      processedValue = formatPhoneNumber(String(value || ""));
    } else if (field === "username") {
      processedValue = restrictToAlphanumericUnderscore(String(value || ""));
    } else if (field === "name") {
      processedValue = restrictToNameCharacters(String(value || ""));
    } else if (field === "foundedYear") {
      const numValue = restrictToNumbers(String(value || ""));
      processedValue = numValue ? parseInt(numValue, 10) : undefined;
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Auto-generate credentials
  const handleAutoGenerateCredentials = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Debe ingresar el nombre de la empresa y email primero",
        variant: "destructive",
      });
      return;
    }

    const credentials = generateCredentials(formData.name, formData.email);
    setFormData((prev) => ({
      ...prev,
      username: credentials.username,
      password: credentials.password,
    }));

    toast({
      title: "Éxito",
      description: "Credenciales generadas automáticamente",
    });
  };

  // Copy credentials to clipboard
  const copyToClipboardHandler = async (text: string, type: string) => {
    try {
      const success = await copyToClipboard(
        text,
        () => {
          toast({
            title: "Copiado",
            description: `${type} copiado al portapapeles`,
          });
        },
        (errorMessage) => {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      );
      return success;
    } catch (error) {
      console.error(`Copy ${type} error:`, error);
      toast({
        title: "Error",
        description: `Error al copiar ${type}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Handlers
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      businessSector: "",
      companySize: undefined,
      foundedYear: new Date().getFullYear(),
      website: "",
      email: "",
      phone: "",
      address: "",
      municipalityId: "",
      username: "",
      password: "",
      isActive: true,
    });
    setValidationErrors({});
    setGeneratedCredentials(null);
    setShowGeneratedCredentials(false);
    setShowPassword(false);
    setSelectedBusinessSector("");
    setCustomBusinessSector("");
  };

  const handleCreateCompany = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createCompanyMutation.mutateAsync(formData);

      // Verify the company was created successfully
      if (!result || !result.company) {
        throw new Error(
          "No se recibió confirmación de la creación de la empresa"
        );
      }

      // Show success message
      toast({
        title: "Éxito",
        description: `Empresa "${result.company.name}" creada exitosamente`,
      });

      // Show credentials modal with the credentials used for creation
      const credentials = {
        username: formData.username,
        password: formData.password,
      };
      console.log("Setting generated credentials:", credentials);
      setGeneratedCredentials(credentials);
      setShowGeneratedCredentials(true);

      // Don't close the create dialog yet, let user see credentials first
      // resetForm(); // Commented out to keep form data visible
    } catch (error: any) {
      console.error("Failed to create company:", error);

      // Extract error message from the API response
      let errorMessage =
        "Error al crear la empresa. Verifique los datos e intente nuevamente.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    const businessSector = company.businessSector || "";
    const isCustomSector =
      businessSector && !BUSINESS_SECTORS.includes(businessSector);

    setFormData({
      name: company.name,
      description: company.description || "",
      businessSector: businessSector,
      companySize: company.companySize || undefined,
      foundedYear: company.foundedYear || new Date().getFullYear(),
      website: company.website || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      municipalityId: company.municipality.id,
      username: company.username,
      password: "", // Don't pre-fill password
      isActive: company.isActive,
    });

    // Set the business sector selection state
    if (isCustomSector) {
      setSelectedBusinessSector("Otro");
      setCustomBusinessSector(businessSector);
    } else {
      setSelectedBusinessSector(businessSector);
      setCustomBusinessSector("");
    }

    setValidationErrors({});
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    // Validate required fields for update
    const errors: Record<string, string> = {};
    if (!formData.name.trim())
      errors.name = "El nombre de la empresa es requerido";
    if (!formData.email.trim()) errors.email = "El email es requerido";
    if (!isValidEmail(formData.email))
      errors.email = "El formato del email no es válido";
    if (!formData.municipalityId)
      errors.municipalityId = "Debe seleccionar un municipio";
    if (!formData.username.trim())
      errors.username = "El nombre de usuario es requerido";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Error",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    try {
      const { password, ...updateData } = formData;
      // Only include password if it's not empty
      const finalData = password ? { ...updateData, password } : updateData;

      await updateCompanyMutation.mutateAsync({
        id: editingCompany.id,
        data: finalData,
      });

      toast({
        title: "Éxito",
        description: `Empresa "${editingCompany.name}" actualizada exitosamente`,
      });
      setEditingCompany(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update company:", error);
      toast({
        title: "Error",
        description: "Error al actualizar la empresa",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return;

    try {
      const result = await deleteCompanyMutation.mutateAsync(
        deletingCompany.id
      );

      // Show detailed success message with deletion summary
      const deletedData = result?.deletedData;
      let description = `Empresa "${deletingCompany.name}" eliminada exitosamente`;

      if (deletedData) {
        description += `\n\nEliminado en cascada:`;
        if (deletedData.jobOffers > 0)
          description += `\n• ${deletedData.jobOffers} ofertas de trabajo`;
        if (deletedData.jobApplications > 0)
          description += `\n• ${deletedData.jobApplications} postulaciones`;
        if (deletedData.newsArticles > 0)
          description += `\n• ${deletedData.newsArticles} artículos de noticias`;
        if (deletedData.newsComments > 0)
          description += `\n• ${deletedData.newsComments} comentarios de noticias`;
        if (deletedData.youthApplicationInterests > 0)
          description += `\n• ${deletedData.youthApplicationInterests} intereses de jóvenes`;
        if (deletedData.disconnectedProfiles > 0)
          description += `\n• ${deletedData.disconnectedProfiles} perfiles desvinculados`;
        if (deletedData.userAccountDeleted)
          description += `\n• Cuenta de usuario eliminada`;
      }

      toast({
        title: "✅ Eliminación Completa",
        description: description,
      });

      setDeletingCompany(null);
    } catch (error: any) {
      console.error("Failed to delete company:", error);

      // Extract error message from the API response
      let errorMessage = "Error al eliminar la empresa";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (companiesLoading || municipalitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (companiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Error al cargar empresas
          </h3>
          <p className="text-muted-foreground mb-4">
            {companiesError instanceof Error
              ? companiesError.message
              : "Error desconocido"}
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Empresas
          </h1>
          <p className="text-muted-foreground">
            Administra las empresas registradas en el sistema
          </p>
        </div>

        {canManageCompanies && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <div className="flex gap-2">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Empresa
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Empresa</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "name")}
                    placeholder="Ingrese el nombre de la empresa"
                    className={validationErrors.name ? "border-red-500" : ""}
                    disabled={createCompanyMutation.isPending}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="contacto@empresa.com"
                    className={validationErrors.email ? "border-red-500" : ""}
                    disabled={createCompanyMutation.isPending}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipalityId">Municipio *</Label>
                  <Select
                    value={formData.municipalityId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, municipalityId: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        validationErrors.municipalityId ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((municipality) => (
                        <SelectItem
                          key={municipality.id}
                          value={municipality.id}
                        >
                          {municipality.name} - {municipality.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.municipalityId && (
                    <p className="text-sm text-red-500">
                      {validationErrors.municipalityId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessSector">Sector de Negocio</Label>
                  <div className="space-y-2">
                    <Select
                      value={selectedBusinessSector}
                      onValueChange={handleBusinessSectorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un sector de negocio" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBusinessSector === "Otro" && (
                      <Input
                        placeholder="Especifica el sector de negocio"
                        value={customBusinessSector}
                        onChange={(e) =>
                          handleCustomBusinessSectorChange(e.target.value)
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Tamaño de la Empresa</Label>
                  <Select
                    value={formData.companySize || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, companySize: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MICRO">
                        Micro (1-10 empleados)
                      </SelectItem>
                      <SelectItem value="SMALL">
                        Pequeña (11-50 empleados)
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        Mediana (51-250 empleados)
                      </SelectItem>
                      <SelectItem value="LARGE">
                        Grande (250+ empleados)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Año de Fundación</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear || ""}
                    onChange={(e) =>
                      handleFieldChange("foundedYear", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, "foundedYear")}
                    min="1900"
                    max={new Date().getFullYear()}
                    className={
                      validationErrors.foundedYear ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.foundedYear && (
                    <p className="text-sm text-red-500">
                      {validationErrors.foundedYear}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "phone")}
                    placeholder="+591 12345678"
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleFieldChange("website", e.target.value)
                    }
                    placeholder="https://www.empresa.com"
                    className={validationErrors.website ? "border-red-500" : ""}
                  />
                  {validationErrors.website && (
                    <p className="text-sm text-red-500">
                      {validationErrors.website}
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                    placeholder="Dirección completa de la empresa"
                    className={validationErrors.address ? "border-red-500" : ""}
                  />
                  {validationErrors.address && (
                    <p className="text-sm text-red-500">
                      {validationErrors.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Descripción de la empresa y sus actividades"
                    rows={3}
                    className={
                      validationErrors.description ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                {/* Login Credentials Section */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Credenciales de Acceso
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoGenerateCredentials}
                      disabled={
                        createCompanyMutation.isPending ||
                        !formData.name.trim() ||
                        !formData.email.trim()
                      }
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Auto-generar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario de Login *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleFieldChange("username", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, "username")}
                    placeholder="usuario_empresa"
                    className={
                      validationErrors.username ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.username && (
                    <p className="text-sm text-red-500">
                      {validationErrors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleFieldChange("password", e.target.value)
                      }
                      placeholder="Contraseña segura"
                      className={
                        validationErrors.password
                          ? "border-red-500 pr-20"
                          : "pr-20"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">
                      {validationErrors.password}
                    </p>
                  )}
                  {formData.password && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Fuerza:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded ${
                                level <=
                                validatePasswordStrength(formData.password)
                                  .score
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={
                    createCompanyMutation.isPending ||
                    !formData.name ||
                    !formData.email ||
                    !formData.municipalityId ||
                    !formData.username ||
                    !formData.password
                  }
                >
                  {createCompanyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    "Crear Empresa"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {companies.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empresas Activas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metadata.totalActive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ofertas de Trabajo
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metadata.totalJobOffers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empleados
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metadata.totalEmployees}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Empresas</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, descripción o sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filtrar por Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead>Contacto</TableHead>
                {canManageCompanies && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {company.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Fundada en {company.foundedYear || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {company.businessSector || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{company.municipality.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {company.companySize || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={company.isActive ? "default" : "destructive"}
                    >
                      {company.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{company.jobOffersCount} ofertas</div>
                      <div>{company.employeesCount} empleados</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {canManageCompanies && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          className="h-8 px-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-1">Editar</span>
                        </Button>
                        {canDeleteCompanies ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCompany(company)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1">Eliminar</span>
                          </Button>
                        ) : (
                          <div className="text-xs text-muted-foreground px-2">
                            No tiene permisos para eliminar
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCompany}
        onOpenChange={() => setEditingCompany(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Empresa: {editingCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ingrese el nombre de la empresa"
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contacto@empresa.com"
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-municipalityId">Municipio *</Label>
              <Select
                value={formData.municipalityId}
                onValueChange={(value) =>
                  setFormData({ ...formData, municipalityId: value })
                }
              >
                <SelectTrigger
                  className={
                    validationErrors.municipalityId ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Selecciona un municipio" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={municipality.id}>
                      {municipality.name} - {municipality.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.municipalityId && (
                <p className="text-sm text-red-500">
                  {validationErrors.municipalityId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-businessSector">Sector de Negocio</Label>
              <div className="space-y-2">
                <Select
                  value={selectedBusinessSector}
                  onValueChange={handleBusinessSectorChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un sector de negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBusinessSector === "Otro" && (
                  <Input
                    placeholder="Especifica el sector de negocio"
                    value={customBusinessSector}
                    onChange={(e) =>
                      handleCustomBusinessSectorChange(e.target.value)
                    }
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-companySize">Tamaño de la Empresa</Label>
              <Select
                value={formData.companySize || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, companySize: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICRO">Micro (1-10 empleados)</SelectItem>
                  <SelectItem value="SMALL">
                    Pequeña (11-50 empleados)
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    Mediana (51-250 empleados)
                  </SelectItem>
                  <SelectItem value="LARGE">Grande (250+ empleados)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-foundedYear">Año de Fundación</Label>
              <Input
                id="edit-foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    foundedYear: parseInt(e.target.value),
                  })
                }
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+591 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Sitio Web</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://www.empresa.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Dirección completa de la empresa"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción de la empresa y sus actividades"
                rows={3}
              />
            </div>

            {/* Login Credentials */}
            <div className="space-y-2">
              <Label htmlFor="edit-username">Usuario de Login *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="usuario_empresa"
                className={validationErrors.username ? "border-red-500" : ""}
              />
              {validationErrors.username && (
                <p className="text-sm text-red-500">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>

            {/* Status Toggle */}
            <div className="space-y-2 col-span-2">
              <Label>Estado de la Empresa</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={
                    formData.isActive ?? editingCompany?.isActive ?? true
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">
                  {(formData.isActive ?? editingCompany?.isActive)
                    ? "Empresa Activa"
                    : "Empresa Inactiva"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditingCompany(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateCompany}
              disabled={
                updateCompanyMutation.isPending ||
                !formData.name ||
                !formData.email ||
                !formData.municipalityId ||
                !formData.username
              }
            >
              {updateCompanyMutation.isPending
                ? "Actualizando..."
                : "Actualizar Empresa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCompany}
        onOpenChange={() => setDeletingCompany(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              ⚠️ Eliminar Empresa
            </AlertDialogTitle>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong>Esta acción no se puede deshacer.</strong> Se eliminará
                permanentemente la empresa
                <strong> "{deletingCompany?.name}"</strong> y todos sus datos
                relacionados:
              </div>

              {deletingCompany && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Se eliminarán permanentemente:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>
                      • <strong>La empresa completa</strong> y todos sus datos
                    </li>
                    <li>
                      • <strong>La cuenta de usuario</strong> asociada a la
                      empresa
                    </li>
                    <li>
                      • {deletingCompany.jobOffersCount} ofertas de trabajo
                    </li>
                    <li>• Todas las postulaciones a estas ofertas</li>
                    <li>• Mensajes y comunicaciones relacionadas</li>
                    <li>
                      • {deletingCompany.employeesCount} perfiles de empleados
                      (se desvinculan, no se eliminan)
                    </li>
                    <li>• Intereses de jóvenes en la empresa</li>
                    <li>• Preguntas y respuestas de entrevistas</li>
                    <li>• Artículos de noticias creados por la empresa</li>
                    <li>• Comentarios de noticias de la empresa</li>
                  </ul>

                  <div className="mt-3 p-2 bg-red-100 rounded border border-red-300">
                    <p className="text-xs text-red-800">
                      <strong>⚠️ ADVERTENCIA:</strong> Esta es una eliminación
                      en cascada completa. Todos los datos relacionados se
                      eliminarán permanentemente y no se pueden recuperar.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Solo los usuarios con rol SUPERADMIN o GOBIERNOS_MUNICIPALES
                pueden eliminar empresas.
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={deleteCompanyMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCompanyMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                "Eliminar Definitivamente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generated Credentials Modal */}
      <Dialog
        open={showGeneratedCredentials}
        onOpenChange={setShowGeneratedCredentials}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              ✅ Credenciales Generadas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm text-green-800">
                <strong>✅ Empresa creada exitosamente!</strong> A continuación
                se muestran las credenciales de acceso. Guárdelas en un lugar
                seguro.
              </p>
            </div>

            {generatedCredentials && (
              <>
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Input
                    value={generatedCredentials.username}
                    readOnly
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input
                    value={generatedCredentials.password}
                    readOnly
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!generatedCredentials) {
                        toast({
                          title: "Error",
                          description: "No hay credenciales para copiar",
                          variant: "destructive",
                        });
                        return;
                      }

                      const credentialsText = `Usuario: ${generatedCredentials.username}\nContraseña: ${generatedCredentials.password}`;

                      const success = await copyToClipboard(
                        credentialsText,
                        () => {
                          toast({
                            title: "Copiado",
                            description:
                              "Credenciales copiadas al portapapeles",
                          });
                        },
                        (errorMessage) => {
                          toast({
                            title: "Error",
                            description: errorMessage,
                            variant: "destructive",
                          });
                        }
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Credenciales
                  </Button>
                </div>
              </>
            )}

            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Estas credenciales solo se
                mostrarán una vez. Asegúrese de copiarlas antes de cerrar esta
                ventana.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => {
                setShowGeneratedCredentials(false);
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
