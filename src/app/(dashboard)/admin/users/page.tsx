"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  MapPin,
  Download,
  X,
  GraduationCap,
  Building,
  Copy,
  Check,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserManagement, UserData, User } from "@/hooks/useUserManagement";
import { useToast } from "@/components/ui/use-toast";

// Bolivian departments and municipalities data
const BOLIVIA_LOCATIONS = {
  Cochabamba: [
    "Cochabamba",
    "Aiquile",
    "Anzaldo",
    "Arani",
    "Arque",
    "Bolívar",
    "Campero",
    "Capinota",
    "Carrasco",
    "Chapare",
    "Chimoré",
    "Cliza",
    "Colcapirhua",
    "Colomi",
    "Cuchumuela",
    "Entre Ríos",
    "Esteban Arze",
    "Independencia",
    "Jordán",
    "Mizque",
    "Morochata",
    "Omereque",
    "Pasorapa",
    "Pocona",
    "Punata",
    "Quillacollo",
    "Sacaba",
    "San Benito",
    "Shinahota",
    "Sipe Sipe",
    "Tacopaya",
    "Tapacarí",
    "Tiquipaya",
    "Tiraque",
    "Tolata",
    "Totora",
    "Valle Hermoso",
    "Vila Vila",
    "Vinto",
  ],
  "La Paz": [
    "La Paz",
    "Achacachi",
    "Ancoraimes",
    "Batallas",
    "Calamarca",
    "Caranavi",
    "Colquencha",
    "Copacabana",
    "Desaguadero",
    "El Alto",
    "Guaqui",
    "Huatajata",
    "Irupana",
    "La Asunta",
    "Laja",
    "Luribay",
    "Malla",
    "Mecapaca",
    "Mocomoco",
    "Palca",
    "Palos Blancos",
    "Pedro Domingo Murillo",
    "Puerto Acosta",
    "Puerto Carabuco",
    "Pucarani",
    "Sapahaqui",
    "Sorata",
    "Teoponte",
    "Tiahuanacu",
    "Umala",
    "Viacha",
    "Yanacachi",
  ],
  "Santa Cruz": [
    "Santa Cruz de la Sierra",
    "Ascensión de Guarayos",
    "Boyuibe",
    "Cabezas",
    "Camiri",
    "Charagua",
    "Colpa Bélgica",
    "Comarapa",
    "Concepción",
    "Cotoca",
    "Cuevo",
    "El Puente",
    "El Torno",
    "Fernández Alonso",
    "General Saavedra",
    "Gutiérrez",
    "Hardeman",
    "Lagunillas",
    "La Guardia",
    "Las Mercedes",
    "Mairana",
    "Mineros",
    "Montero",
    "Moro Moro",
    "Okinawa Uno",
    "Pailón",
    "Pampa Grande",
    "Portachuelo",
    "Postrer Valle",
    "Puerto Quijarro",
    "Puerto Suárez",
    "Quirusillas",
    "Roboré",
    "Saipina",
    "San Antonio del Lomerío",
    "San Carlos",
    "San Ignacio",
    "San Javier",
    "San José de Chiquitos",
    "San Juan",
    "San Lorenzo",
    "San Matías",
    "San Miguel",
    "San Pedro",
    "San Rafael",
    "San Ramón",
    "Santa Rosa del Sara",
    "Samaipata",
    "Urubichá",
    "Vallegrande",
    "Warnes",
    "Yapacaní",
  ],
  Potosí: [
    "Potosí",
    "Acasio",
    "Arampampa",
    "Belén de Urmiri",
    "Betanzos",
    "Caiza",
    "Caripuyo",
    "Colcha",
    "Colquechaca",
    "Cotagaita",
    "Llallagua",
    "Llica",
    "Mojinete",
    "Ocurí",
    "Pocoata",
    "Puna",
    "Sacaca",
    "San Agustín",
    "San Antonio de Esmoruco",
    "San Pablo de Lípez",
    "Tinguipaya",
    "Tomave",
    "Tupiza",
    "Uyuni",
    "Villazón",
    "Vitichi",
  ],
  Chuquisaca: [
    "Sucre",
    "Azurduy",
    "Boeto",
    "Camargo",
    "Culpina",
    "El Villar",
    "Huacaya",
    "Huacareta",
    "Icla",
    "Incahuasi",
    "Macharetí",
    "Monteagudo",
    "Padilla",
    "Poroma",
    "Presto",
    "San Lucas",
    "Sopachuy",
    "Tarabuco",
    "Tarvita",
    "Tomina",
    "Villa Abecia",
    "Villa Charcas",
    "Villa Serrano",
    "Villa Vaca Guzmán",
    "Yamparáez",
    "Zudáñez",
  ],
  Oruro: [
    "Oruro",
    "Antequera",
    "Belén de Andamarca",
    "Caracollo",
    "Challapata",
    "Chipaya",
    "Choque Cota",
    "Corque",
    "Cruz de Machacamarca",
    "Escara",
    "Esmeralda",
    "Eucaliptus",
    "Huayllamarca",
    "Huanuni",
    "La Rivera",
    "Machacamarca",
    "Nor Carangas",
    "Pampa Aullagas",
    "Pazña",
    "Poopó",
    "Sabaya",
    "Salinas de Garci Mendoza",
    "Santiago de Andamarca",
    "Santiago de Huari",
    "Sur Carangas",
    "Toledo",
    "Turco",
    "Villa Huanuni",
  ],
  Tarija: [
    "Tarija",
    "Bermejo",
    "Caraparí",
    "Entre Ríos",
    "Padcaya",
    "San Lorenzo",
    "Uriondo",
    "Villa Montes",
    "Villamontes",
    "Yacuiba",
  ],
  Beni: [
    "Trinidad",
    "Baures",
    "Exaltación",
    "Guayaramerín",
    "Huacaraje",
    "Iténez",
    "Loreto",
    "Magdalena",
    "Reyes",
    "Riberalta",
    "Rurrenabaque",
    "San Andrés",
    "San Borja",
    "San Ignacio",
    "San Javier",
    "San Joaquín",
    "San Ramón",
    "Santa Ana",
    "Santa Rosa",
  ],
  Pando: [
    "Cobija",
    "Bella Flor",
    "Bolpebra",
    "Filadelfia",
    "Nueva Esperanza",
    "Porvenir",
    "Puerto Gonzalo Moreno",
    "Puerto Rico",
    "San Lorenzo",
    "Santos Mercado",
    "Sena",
    "Villa Nueva",
  ],
};

export default function UsersManagementPage() {
  const { createUser, updateUser, deleteUser, getUsers, loading, error } =
    useUserManagement();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("YOUTH");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({ isValid: true, message: "", isChecking: false });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsPassword, setShowCredentialsPassword] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const filters = {
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchTerm || undefined,
      };
      const fetchedUsers = await getUsers(filters);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive",
      });
    }
  };

  // Calculate real stats from data
  const stats = React.useMemo(() => {
    if (!users)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        youth: 0,
        companies: 0,
        municipalities: 0,
      };

    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const youth = users.filter((u) => u.role === "YOUTH").length;
    const companies = users.filter((u) => u.role === "COMPANIES").length;
    const municipalities = users.filter(
      (u) => u.role === "MUNICIPAL_GOVERNMENTS"
    ).length;

    return {
      total,
      active,
      inactive,
      youth,
      companies,
      municipalities,
    };
  }, [users]);

  // Form state for create/edit
  const [formData, setFormData] = useState<UserData>({
    username: "",
    password: "",
    role: "YOUTH",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    municipality: "",
    department: "Cochabamba",
    country: "Bolivia",
    birthDate: "",
    gender: "",
    educationLevel: "",
    currentInstitution: "",
    graduationYear: undefined,
    isStudying: false,
    skills: [],
    interests: [],
    status: "ACTIVE",
  });

  const [availableMunicipalities, setAvailableMunicipalities] = useState<
    string[]
  >([]);

  // Update available municipalities when department changes
  useEffect(() => {
    if (
      formData.department &&
      BOLIVIA_LOCATIONS[formData.department as keyof typeof BOLIVIA_LOCATIONS]
    ) {
      setAvailableMunicipalities(
        BOLIVIA_LOCATIONS[formData.department as keyof typeof BOLIVIA_LOCATIONS]
      );
      // Reset municipality if it's not in the new department's municipalities
      if (
        formData.municipality &&
        !BOLIVIA_LOCATIONS[
          formData.department as keyof typeof BOLIVIA_LOCATIONS
        ].includes(formData.municipality)
      ) {
        setFormData((prev) => ({ ...prev, municipality: "" }));
      }
    } else {
      setAvailableMunicipalities([]);
    }
  }, [formData.department]);

  // Email validation with debounce
  useEffect(() => {
    if (!formData.email) {
      setEmailValidation({ isValid: true, message: "", isChecking: false });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailValidation({
        isValid: false,
        message: "Formato de email inválido",
        isChecking: false,
      });
      return;
    }

    setEmailValidation({ isValid: true, message: "", isChecking: true });

    // Debounce email availability check
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/users?search=${formData.email}`
        );
        if (response.ok) {
          const users = await response.json();
          const emailExists = users.some(
            (user: any) =>
              user.profile?.email?.toLowerCase() ===
              formData.email?.toLowerCase()
          );

          if (emailExists) {
            setEmailValidation({
              isValid: false,
              message: "Este email ya está registrado",
              isChecking: false,
            });
          } else {
            setEmailValidation({
              isValid: true,
              message: "Email disponible",
              isChecking: false,
            });
          }
        }
      } catch (error) {
        console.error("Error validating email:", error);
        setEmailValidation({
          isValid: true,
          message: "",
          isChecking: false,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Validation functions
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case "username":
        if (!value || value.trim().length === 0) {
          return "El nombre de usuario es requerido";
        }
        if (value.length < 3) {
          return "El nombre de usuario debe tener al menos 3 caracteres";
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "El nombre de usuario solo puede contener letras, números y guiones bajos";
        }
        return "";

      case "password":
        if (!value || value.length === 0) {
          return "La contraseña es requerida";
        }
        if (value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres";
        }
        if (value.length > 50) {
          return "La contraseña no puede tener más de 50 caracteres";
        }
        return "";

      case "firstName":
        if (!value || value.trim().length === 0) {
          return "El nombre es requerido";
        }
        if (value.length < 2) {
          return "El nombre debe tener al menos 2 caracteres";
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return "El nombre solo puede contener letras y espacios";
        }
        return "";

      case "lastName":
        if (!value || value.trim().length === 0) {
          return "El apellido es requerido";
        }
        if (value.length < 2) {
          return "El apellido debe tener al menos 2 caracteres";
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return "El apellido solo puede contener letras y espacios";
        }
        return "";

      case "email":
        if (value && value.trim().length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return "Formato de email inválido";
          }
        }
        return "";

      case "phone":
        if (value && value.trim().length > 0) {
          // Bolivian phone number validation (supports +591, 591, or local format)
          const phoneRegex = /^(\+591|591)?[0-9\s-]{7,10}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ""))) {
            return "Formato de teléfono inválido. Use: +591 700 123 456";
          }
        }
        return "";

      case "graduationYear":
        if (value && value !== "") {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < 1950 || year > currentYear + 10) {
            return `El año debe estar entre 1950 y ${currentYear + 10}`;
          }
        }
        return "";

      case "birthDate":
        if (value && value.trim().length > 0) {
          const date = new Date(value);
          const currentDate = new Date();
          const minDate = new Date(currentDate.getFullYear() - 100, 0, 1);
          const maxDate = new Date(currentDate.getFullYear() - 13, 11, 31);

          if (isNaN(date.getTime())) {
            return "Fecha de nacimiento inválida";
          }
          if (date < minDate || date > maxDate) {
            return "La edad debe estar entre 13 y 100 años";
          }
        }
        return "";

      case "address":
        if (value && value.length > 200) {
          return "La dirección no puede tener más de 200 caracteres";
        }
        return "";

      case "currentInstitution":
        if (value && value.length > 100) {
          return "El nombre de la institución no puede tener más de 100 caracteres";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    // Required fields
    const requiredFields = ["username", "password", "firstName", "lastName"];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof UserData]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    // Optional fields
    const optionalFields = [
      "email",
      "phone",
      "graduationYear",
      "birthDate",
      "address",
      "currentInstitution",
    ];

    optionalFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof UserData]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleFieldChange = (field: string, value: any) => {
    let processedValue = value;

    // Special handling for different field types
    if (field === "phone") {
      // Only allow numbers, +, -, and spaces
      processedValue = String(value || "").replace(/[^0-9+\-\s]/g, "");

      // Format phone number as user types
      if (processedValue.length > 0) {
        // Remove all non-digits except + at the beginning
        const digits = processedValue.replace(/[^\d]/g, "");
        const hasPlus = processedValue.startsWith("+");

        if (hasPlus && digits.length > 0) {
          // Format: +591 700 123 456
          if (digits.length <= 3) {
            processedValue = `+${digits}`;
          } else if (digits.length <= 6) {
            processedValue = `+${digits.slice(0, 3)} ${digits.slice(3)}`;
          } else if (digits.length <= 9) {
            processedValue = `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
          } else {
            processedValue = `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
          }
        } else if (!hasPlus && digits.length > 0) {
          // Format: 591 700 123 456 or 700 123 456
          if (digits.length <= 3) {
            processedValue = digits;
          } else if (digits.length <= 6) {
            processedValue = `${digits.slice(0, 3)} ${digits.slice(3)}`;
          } else if (digits.length <= 9) {
            processedValue = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
          } else {
            processedValue = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
          }
        }
      }
    } else if (field === "username") {
      // Only allow alphanumeric characters and underscores
      processedValue = String(value || "").replace(/[^a-zA-Z0-9_]/g, "");
    } else if (field === "graduationYear") {
      // Only allow numbers - convert to string first if it's a number
      const stringValue = String(value || "");
      const cleanedValue = stringValue.replace(/[^0-9]/g, "");
      // Convert back to number if it's not empty, otherwise keep as empty string
      processedValue = cleanedValue ? parseInt(cleanedValue, 10) : undefined;
    } else if (field === "firstName" || field === "lastName") {
      // Only allow letters, spaces, and Spanish characters
      processedValue = String(value || "").replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ""
      );
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      // Check if clipboard API is available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or when clipboard API is not available
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopiedField(field);
      toast({
        title: "Copiado",
        description: `${field} copiado al portapapeles`,
      });
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const generateRandomString = (length: number): string => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generatePassword = (): string => {
    const length = 8;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%&*";

    let password = "";
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const checkUsernameAvailability = async (
    username: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/users?search=${username}`);
      if (response.ok) {
        const users = await response.json();
        return !users.some((user: any) => user.username === username);
      }
      return false;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  };

  const generateCredentials = async () => {
    let username = "";
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique username
    do {
      const randomPart = generateRandomString(5);
      username = `joven_${randomPart}`;
      attempts++;
    } while (
      !(await checkUsernameAvailability(username)) &&
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      toast({
        title: "Error",
        description:
          "No se pudo generar un nombre de usuario único. Intenta manualmente.",
        variant: "destructive",
      });
      return;
    }

    const password = generatePassword();

    setFormData((prev) => ({
      ...prev,
      username,
      password,
    }));

    toast({
      title: "Credenciales generadas",
      description: "Se han generado credenciales automáticamente",
    });
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills?.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }));
  };

  const addInterest = () => {
    const interest = interestInput.trim();
    if (interest && !formData.interests?.includes(interest)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), interest],
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      interests:
        prev.interests?.filter((interest) => interest !== interestToRemove) ||
        [],
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    // Prevent invalid characters from being typed
    if (field === "phone") {
      // Allow: numbers, +, -, space, backspace, delete, arrow keys, etc.
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
      // Allow: alphanumeric, underscore, backspace, delete, arrow keys, etc.
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
    } else if (field === "graduationYear") {
      // Allow: numbers only, backspace, delete, arrow keys, etc.
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
    } else if (field === "firstName" || field === "lastName") {
      // Allow: letters, spaces, Spanish characters, backspace, delete, arrow keys, etc.
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

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "YOUTH",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      municipality: "",
      department: "Cochabamba",
      country: "Bolivia",
      birthDate: "",
      gender: "",
      educationLevel: "",
      currentInstitution: "",
      graduationYear: undefined,
      isStudying: false,
      skills: [],
      interests: [],
      status: "ACTIVE",
    });
    setSkillInput("");
    setInterestInput("");
    setEmailValidation({ isValid: true, message: "", isChecking: false });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleCreate = async () => {
    try {
      // Validate form using comprehensive validation
      if (!validateForm()) {
        toast({
          title: "Error de validación",
          description: "Por favor corrige los errores en el formulario",
          variant: "destructive",
        });
        return;
      }

      // Additional email validation check
      if (formData.email && !emailValidation.isValid) {
        toast({
          title: "Error",
          description: "Por favor corrige el email antes de continuar",
          variant: "destructive",
        });
        return;
      }

      // Create user
      await createUser(formData);

      // Store credentials for the modal
      setCreatedUserCredentials({
        username: formData.username,
        password: formData.password || "",
      });

      setShowCreateDialog(false);
      resetForm();
      setCredentialsModalOpen(true);

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      password: "", // Don't show password in edit
      role: user.role || "YOUTH",
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      email: user.profile?.email || "",
      phone: user.profile?.phone || "",
      address: user.profile?.address || "",
      municipality: user.profile?.municipality || "",
      department: user.profile?.department || "Cochabamba",
      country: user.profile?.country || "Bolivia",
      birthDate: user.profile?.birthDate || "",
      gender: user.profile?.gender || "",
      educationLevel: user.profile?.educationLevel || "",
      currentInstitution: user.profile?.currentInstitution || "",
      graduationYear: user.profile?.graduationYear || undefined,
      isStudying: user.profile?.isStudying || false,
      skills: user.profile?.skills || [],
      interests: user.profile?.interests || [],
      status: user.profile?.status || "ACTIVE",
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedUser?.id) return;

      // Validate form using comprehensive validation
      if (!validateForm()) {
        toast({
          title: "Error de validación",
          description: "Por favor corrige los errores en el formulario",
          variant: "destructive",
        });
        return;
      }

      // Additional email validation check
      if (formData.email && !emailValidation.isValid) {
        toast({
          title: "Error",
          description: "Por favor corrige el email antes de continuar",
          variant: "destructive",
        });
        return;
      }

      const updateData = { ...formData };
      // Only include password if it was changed and not empty
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      console.log("Updating user with data:", updateData);
      await updateUser(selectedUser.id, updateData);

      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: "Éxito",
        description: "Usuario actualizado exitosamente",
      });

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Error al actualizar el usuario: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedUser?.id) return;

      await deleteUser(selectedUser.id);

      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente",
      });

      // Reload users
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "INACTIVE":
        return "Inactivo";
      case "PENDING_VERIFICATION":
        return "Pendiente";
      case "SUSPENDED":
        return "Suspendido";
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Joven";
      case "ADOLESCENTS":
        return "Adolescente";
      case "COMPANIES":
        return "Empresa";
      case "MUNICIPAL_GOVERNMENTS":
        return "Gobierno Municipal";
      case "TRAINING_CENTERS":
        return "Centro de Entrenamiento";
      case "NGOS_AND_FOUNDATIONS":
        return "ONG/Fundación";
      case "INSTRUCTOR":
        return "Instructor";
      case "SUPERADMIN":
        return "Super Admin";
      default:
        return role;
    }
  };

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Skip users without profiles
      if (!user.profile) return false;

      const searchLower = (searchTerm || "").toLowerCase();
      const userName =
        `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.toLowerCase();
      const userEmail = (user.profile.email || "").toLowerCase();
      const userUsername = user.username.toLowerCase();

      const matchesSearch =
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        userUsername.includes(searchLower);

      const matchesRole = user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Show error if data loading fails
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra todos los usuarios registrados en la plataforma
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error al cargar los datos: {error}</p>
              <Button onClick={() => loadUsers()} className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios registrados en la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Registra un nuevo usuario en la plataforma con credenciales de
                  acceso
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="credentials">Credenciales</TabsTrigger>
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                  <TabsTrigger value="skills">Habilidades</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Credenciales de Acceso
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateCredentials}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generar Automáticamente
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Nombre de Usuario *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleFieldChange("username", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "username")}
                        placeholder="joven_abc12"
                        className={formErrors.username ? "border-red-500" : ""}
                      />
                      {formErrors.username && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.username}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Formato sugerido: joven_XXXXX (5 caracteres aleatorios)
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleFieldChange("password", e.target.value)
                          }
                          placeholder="••••••••"
                          className={`pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.password}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Mínimo 6 caracteres, se recomienda usar la generación
                        automática
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleFieldChange("firstName", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "firstName")}
                        placeholder="Juan Carlos"
                        className={formErrors.firstName ? "border-red-500" : ""}
                      />
                      {formErrors.firstName && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleFieldChange("lastName", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "lastName")}
                        placeholder="Pérez"
                        className={formErrors.lastName ? "border-red-500" : ""}
                      />
                      {formErrors.lastName && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        placeholder="juan.perez@email.com"
                        className={
                          emailValidation.isValid
                            ? ""
                            : "border-red-500 focus:border-red-500"
                        }
                      />
                      {emailValidation.isChecking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {emailValidation.message && (
                      <p
                        className={`text-xs ${
                          emailValidation.isValid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {emailValidation.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "phone")}
                        placeholder="+591 700 123 456"
                        className={formErrors.phone ? "border-red-500" : ""}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Masculino</SelectItem>
                          <SelectItem value="FEMALE">Femenino</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="PENDING_VERIFICATION">
                          Pendiente
                        </SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="educationLevel">Nivel Educativo</Label>
                      <Select
                        value={formData.educationLevel || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            educationLevel: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Primaria</SelectItem>
                          <SelectItem value="SECONDARY">Secundaria</SelectItem>
                          <SelectItem value="UNIVERSITY">
                            Universidad
                          </SelectItem>
                          <SelectItem value="TECHNICAL">Técnico</SelectItem>
                          <SelectItem value="POSTGRADUATE">
                            Postgrado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="graduationYear">Año de Graduación</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={formData.graduationYear || ""}
                        onChange={(e) =>
                          handleFieldChange("graduationYear", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "graduationYear")}
                        placeholder="2024"
                        className={
                          formErrors.graduationYear ? "border-red-500" : ""
                        }
                      />
                      {formErrors.graduationYear && (
                        <p className="text-sm text-red-500 mt-1">
                          {formErrors.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="currentInstitution">
                      Institución Actual
                    </Label>
                    <Input
                      id="currentInstitution"
                      value={formData.currentInstitution}
                      onChange={(e) =>
                        handleFieldChange("currentInstitution", e.target.value)
                      }
                      placeholder="Universidad Mayor de San Simón"
                      className={
                        formErrors.currentInstitution ? "border-red-500" : ""
                      }
                    />
                    {formErrors.currentInstitution && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.currentInstitution}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleFieldChange("address", e.target.value)
                      }
                      placeholder="Av. Principal 123"
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    {formErrors.address && (
                      <p className="text-sm text-red-500 mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Select
                        value={formData.department || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            department: value,
                            municipality: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(BOLIVIA_LOCATIONS).map((department) => (
                            <SelectItem key={department} value={department}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {department}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="municipality">Municipio</Label>
                      <Select
                        value={formData.municipality || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, municipality: value })
                        }
                        disabled={!formData.department}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              formData.department
                                ? "Seleccionar municipio"
                                : "Primero selecciona un departamento"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMunicipalities.map((municipality) => (
                            <SelectItem key={municipality} value={municipality}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {municipality}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Habilidades</Label>
                      <div className="flex gap-2">
                        <Input
                          id="skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleSkillKeyPress}
                          placeholder="Escribe una habilidad y presiona Enter"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSkill}
                          disabled={!skillInput.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Escribe una habilidad y presiona Enter o haz clic en el
                        botón +
                      </p>
                    </div>

                    {/* Skills Tags */}
                    {formData.skills && formData.skills.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Habilidades agregadas:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1 hover:bg-transparent"
                                onClick={() => removeSkill(skill)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interests Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interests">Intereses</Label>
                      <div className="flex gap-2">
                        <Input
                          id="interests"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyPress={handleInterestKeyPress}
                          placeholder="Escribe un interés y presiona Enter"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addInterest}
                          disabled={!interestInput.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Escribe un interés y presiona Enter o haz clic en el
                        botón +
                      </p>
                    </div>

                    {/* Interests Tags */}
                    {formData.interests && formData.interests.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Intereses agregados:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {interest}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1 hover:bg-transparent"
                                onClick={() => removeInterest(interest)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Study Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="isStudying">
                      ¿Está estudiando actualmente?
                    </Label>
                    <Select
                      value={formData.isStudying ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          isStudying: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    !formData.username ||
                    !formData.password ||
                    !formData.firstName ||
                    !formData.lastName ||
                    loading
                  }
                >
                  {loading ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jóvenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.youth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.companies}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municipios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.municipalities}
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
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YOUTH">Jóvenes</SelectItem>
                <SelectItem value="ADOLESCENTS">Adolescentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona todos los usuarios registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Completitud</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      Cargando usuarios...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm
                      ? "No se encontraron usuarios con los filtros aplicados"
                      : "No hay usuarios jóvenes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.profile?.avatarUrl || "/placeholder.svg"}
                            alt={`${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`}
                          />
                          <AvatarFallback>
                            <Users className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.profile?.firstName || ""}{" "}
                            {user.profile?.lastName || ""}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.profile?.email || "Sin email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">
                          {user.profile?.municipality || "No especificado"},{" "}
                          {user.profile?.department || "No especificado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(
                          user.profile?.status || "ACTIVE"
                        )}
                      >
                        {getStatusText(user.profile?.status || "ACTIVE")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${user.profile?.profileCompletion || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {user.profile?.profileCompletion || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información de{" "}
              {selectedUser?.profile?.firstName || ""}{" "}
              {selectedUser?.profile?.lastName || ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Nombre de Usuario</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">
                  Nueva Contraseña (opcional)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Nombre *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Apellido *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={loading || !formData.firstName || !formData.lastName}
            >
              {loading ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario &quot;{selectedUser?.profile?.firstName || ""}{" "}
              {selectedUser?.profile?.lastName || ""}&quot; y todos sus datos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Usuario creado!</DialogTitle>
            <DialogDescription>
              El usuario fue registrado exitosamente en el sistema con
              credenciales de acceso.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessDialogOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog
        open={credentialsModalOpen}
        onOpenChange={setCredentialsModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Usuario Creado Exitosamente
            </DialogTitle>
            <DialogDescription>
              Guarda estas credenciales de acceso de forma segura. No podrás ver
              la contraseña nuevamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="created-username">Nombre de Usuario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="created-username"
                  value={createdUserCredentials?.username || ""}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      createdUserCredentials?.username || "",
                      "Usuario"
                    )
                  }
                >
                  {copiedField === "Usuario" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="created-password">Contraseña</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="created-password"
                    value={createdUserCredentials?.password || ""}
                    readOnly
                    type={showCredentialsPassword ? "text" : "password"}
                    className="bg-gray-50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowCredentialsPassword(!showCredentialsPassword)
                    }
                  >
                    {showCredentialsPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      createdUserCredentials?.password || "",
                      "Contraseña"
                    )
                  }
                >
                  {copiedField === "Contraseña" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Copy Both Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (createdUserCredentials) {
                    const credentials = `Usuario: ${createdUserCredentials.username}\nContraseña: ${createdUserCredentials.password}`;
                    copyToClipboard(credentials, "Credenciales");
                  }
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Ambas Credenciales
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCredentialsModalOpen(false);
                setCreatedUserCredentials(null);
                setCopiedField(null);
                setShowCredentialsPassword(false);
              }}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
