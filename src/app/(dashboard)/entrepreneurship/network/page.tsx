"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Check,
  X,
  Users,
  Clock,
  MapPin,
  RefreshCw,
  Share2,
  Plus,
  TrendingUp,
  Star,
  Heart,
} from "lucide-react";
import { MessagingInterface } from "@/components/messaging/MessagingInterface";

interface ContactUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  currentInstitution?: string;
  skills: string[];
  department?: string;
  municipality?: string;
  birthDate?: string;
  contactStatus?: string | null;
  contactId?: string | null;
}

interface EntrepreneurshipOwner {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: string;
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  founded?: string;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
  isActive: boolean;
  viewsCount: number;
  rating?: number;
  reviewsCount: number;
  owner: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    municipality: string;
    phone?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContactRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: ContactUser;
}

interface ContactStats {
  totalContacts: number;
  pendingSent: number;
  pendingReceived: number;
  totalSent: number;
  totalReceived: number;
  totalRequests: number;
}

export default function NetworkingPage() {
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [entrepreneurshipOwners, setEntrepreneurshipOwners] = useState<
    EntrepreneurshipOwner[]
  >([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("entrepreneurs");
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactUser | null>(
    null
  );
  const [isEntrepreneurshipsModalOpen, setIsEntrepreneurshipsModalOpen] =
    useState(false);
  const [selectedUserEntrepreneurships, setSelectedUserEntrepreneurships] =
    useState<{
      ownerName: string;
      entrepreneurships: any[];
    } | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    businessStage: "",
    department: "",
    municipality: "",
  });

  // Función para calcular la edad
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    console.log("🔍 calculateAge:", {
      birthDate,
      birth: birth.toISOString(),
      today: today.toISOString(),
      calculatedAge: age,
    });

    return age;
  };

  // Función para verificar si el usuario actual es mayor de 18 años
  const isCurrentUserOver18 = (): boolean => {
    // Obtener el perfil del usuario actual desde localStorage o hacer una llamada al API
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        if (profile.birthDate) {
          const age = calculateAge(profile.birthDate);
          console.log("🔍 isCurrentUserOver18:", {
            birthDate: profile.birthDate,
            age,
            isOver18: age >= 18,
          });
          return age >= 18;
        }
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }

    // Si no hay perfil en localStorage, hacer llamada al API
    fetchCurrentUserProfile();
    return false; // Por defecto, no permitir hasta confirmar
  };

  // Función para obtener el perfil del usuario actual
  const fetchCurrentUserProfile = async () => {
    try {
      const url = `/api/profile`;
      console.log("🔍 fetchCurrentUserProfile - Calling local API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profile = await response.json();
        localStorage.setItem("userProfile", JSON.stringify(profile));

        if (profile.birthDate) {
          const age = calculateAge(profile.birthDate);
          console.log("🔍 Current user age fetched:", age);
        }
      } else {
        console.error(
          "Error fetching user profile:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Cargar perfil del usuario al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchCurrentUserProfile();
        await searchEntrepreneurshipOwners();
        // Initialize with empty data for contacts and requests to avoid 404 errors
        setContacts([]);
        setRequests([]);
        setStats({
          totalContacts: 0,
          pendingSent: 0,
          pendingReceived: 0,
          totalSent: 0,
          totalReceived: 0,
          totalRequests: 0,
        });
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Cargar datos cuando se cambie de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Por ahora, no cargar datos adicionales para evitar errores 404
    // Los datos se cargan solo una vez al inicializar
  };

  // Buscar usuarios jóvenes
  const searchUsers = async (query?: string) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);

      const url = `/api/contacts/search${params.toString() ? `?${params.toString()}` : ""}`;
      console.log("🔍 searchUsers - Calling local API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error searching users");

      const data = await response.json();
      console.log("Search response:", data); // Debug

      // Filtrar usuarios que ya son contactos aceptados
      const filteredUsers = (data.users || []).filter(
        (user: ContactUser) => user.contactStatus !== "ACCEPTED"
      );

      console.log("Filtered users:", filteredUsers); // Debug
      setUsers(filteredUsers);
      return data;
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  // Buscar propietarios de emprendimientos
  const searchEntrepreneurshipOwners = async (
    query?: string,
    appliedFilters?: typeof filters
  ) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("category", query);
      params.append("isPublic", "true"); // Solo emprendimientos públicos

      // Add filter parameters
      const currentFilters = appliedFilters || filters;
      if (currentFilters.category)
        params.append("category", currentFilters.category);
      if (currentFilters.businessStage)
        params.append("businessStage", currentFilters.businessStage);
      if (currentFilters.department)
        params.append("department", currentFilters.department);
      if (currentFilters.municipality)
        params.append("municipality", currentFilters.municipality);

      const url = `/api/entrepreneurship${params.toString() ? `?${params.toString()}` : ""}`;
      console.log(
        "🔍 searchEntrepreneurshipOwners - Calling local API URL:",
        url
      );

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error("Error searching entrepreneurship owners");

      const data = await response.json();
      console.log("Entrepreneurship owners response:", data); // Debug

      // Ensure we get unique users by deduplicating based on ownerId
      const uniqueOwners = new Map();

      (data || []).forEach((entrepreneurship: EntrepreneurshipOwner) => {
        if (
          entrepreneurship.ownerId &&
          !uniqueOwners.has(entrepreneurship.ownerId)
        ) {
          uniqueOwners.set(entrepreneurship.ownerId, entrepreneurship);
        }
      });

      const uniqueEntrepreneurshipOwners = Array.from(uniqueOwners.values());
      console.log(
        "Unique entrepreneurship owners:",
        uniqueEntrepreneurshipOwners.length
      ); // Debug

      setEntrepreneurshipOwners(uniqueEntrepreneurshipOwners);
      return uniqueEntrepreneurshipOwners;
    } catch (err) {
      console.error("Error searching entrepreneurship owners:", err);
    }
  };

  // Enviar solicitud de contacto
  const sendRequest = async (contactId: string, message?: string) => {
    try {
      const url = `/api/contacts/request`;
      console.log("🔍 sendRequest - Calling local API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ contactId, requestMessage: message }),
      });

      if (!response.ok) throw new Error("Error sending request");

      const data = await response.json();
      // Actualizar la lista de emprendedores para mostrar el estado
      await searchEntrepreneurshipOwners(searchQuery);
      return data;
    } catch (err) {
      console.error("Error sending request:", err);
      throw err;
    }
  };

  // Obtener solicitudes recibidas
  const getReceivedRequests = async () => {
    try {
      const url = `/api/contacts/requests/received`;
      console.log("🔍 getReceivedRequests - Calling local API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error getting requests");

      const data = await response.json();
      setRequests(data.requests || []);
      return data;
    } catch (err) {
      console.error("Error getting requests:", err);
    }
  };

  // Aceptar solicitud
  const acceptRequest = async (requestId: string) => {
    try {
      const url = `/api/contacts/requests/${requestId}/accept`;
      console.log("🔍 acceptRequest - Calling local API URL:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error accepting request");

      const data = await response.json();
      // Actualizar listas
      await Promise.all([getReceivedRequests(), getContacts()]);
      await getStats(); // Llamar después para usar los datos actualizados
      return data;
    } catch (err) {
      console.error("Error accepting request:", err);
      throw err;
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (requestId: string) => {
    try {
      const url = `/api/contacts/requests/${requestId}/reject`;
      console.log("🔍 rejectRequest - Calling local API URL:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error rejecting request");

      const data = await response.json();
      // Actualizar listas
      await Promise.all([getReceivedRequests(), getContacts()]);
      await getStats(); // Llamar después para usar los datos actualizados
      return data;
    } catch (err) {
      console.error("Error rejecting request:", err);
      throw err;
    }
  };

  // Obtener contactos
  const getContacts = async () => {
    try {
      const url = `/api/contacts`;
      console.log("🔍 getContacts - Calling local API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error getting contacts");

      const data = await response.json();
      console.log("Contacts response:", data); // Debug
      console.log("Contacts array:", data.contacts); // Debug

      // Manejar diferentes estructuras de respuesta
      let contactsArray = [];
      if (data.contacts && Array.isArray(data.contacts)) {
        contactsArray = data.contacts;
      } else if (Array.isArray(data)) {
        contactsArray = data;
      } else {
        console.error("Unexpected contacts data structure:", data);
        setContacts([]);
        return data;
      }

      // Extraer los datos del contacto de la respuesta
      const contactsList = contactsArray
        .map((contactData: unknown) => {
          // Manejar diferentes estructuras de contacto
          let contactInfo;
          if (
            contactData &&
            typeof contactData === "object" &&
            "contact" in contactData &&
            contactData.contact
          ) {
            contactInfo = contactData.contact;
          } else if (
            contactData &&
            typeof contactData === "object" &&
            "userId" in contactData &&
            contactData.userId
          ) {
            contactInfo = contactData;
          } else {
            console.error("Unexpected contact data structure:", contactData);
            return null;
          }

          const contact = {
            userId: (contactInfo as any).userId,
            firstName: (contactInfo as any).firstName || "",
            lastName: (contactInfo as any).lastName || "",
            email: (contactInfo as any).email || "",
            avatarUrl: (contactInfo as any).avatarUrl,
            currentInstitution: (contactInfo as any).currentInstitution,
            skills: (contactInfo as any).skills || [],
            department: (contactInfo as any).department,
            municipality: (contactInfo as any).municipality,
            birthDate: (contactInfo as any).birthDate,
            contactStatus: "ACCEPTED",
            contactId:
              (contactData as any).id || (contactData as any).contactId,
          };
          console.log("Processed contact:", contact); // Debug
          return contact;
        })
        .filter(Boolean); // Filtrar contactos nulos

      console.log("Final contacts list:", contactsList); // Debug
      setContacts(contactsList);

      return data;
    } catch (err) {
      console.error("Error getting contacts:", err);
    }
  };

  // Obtener estadísticas (simplificado para emprendedores)
  const getStats = async () => {
    try {
      // Para la red de emprendedores, creamos estadísticas básicas
      const mockStats: ContactStats = {
        totalContacts: contacts.length,
        pendingSent: 0,
        pendingReceived: requests.length,
        totalSent: 0,
        totalReceived: requests.length,
        totalRequests: requests.length,
      };

      console.log("Stats (mock for entrepreneurs):", mockStats);
      setStats(mockStats);
      return mockStats;
    } catch (err) {
      console.error("Error getting stats:", err);
      // Set default stats if error
      const defaultStats: ContactStats = {
        totalContacts: 0,
        pendingSent: 0,
        pendingReceived: 0,
        totalSent: 0,
        totalReceived: 0,
        totalRequests: 0,
      };
      setStats(defaultStats);
    }
  };

  // Cargar datos iniciales
  const fetchNetworkingData = async () => {
    try {
      setLoading(true);
      // Solo cargar datos de emprendedores para evitar errores 404
      await searchEntrepreneurshipOwners();
      // Inicializar con datos vacíos para evitar errores
      setContacts([]);
      setRequests([]);
      setStats({
        totalContacts: 0,
        pendingSent: 0,
        pendingReceived: 0,
        totalSent: 0,
        totalReceived: 0,
        totalRequests: 0,
      });
    } catch (error) {
      console.error("Error fetching networking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkingData();
  }, []);

  // Manejar búsqueda
  const handleSearch = () => {
    searchEntrepreneurshipOwners(searchQuery);
  };

  // Manejar envío de solicitud
  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(
        userId,
        "¡Hola! Me gustaría conectar contigo para colaborar en proyectos."
      );
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  // Manejar visualización de emprendimientos de un usuario
  const handleViewEntrepreneurships = async (userId: string) => {
    try {
      setLoading(true);

      // Buscar emprendimientos del usuario específico
      const response = await fetch(`/api/entrepreneurship?ownerId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error("Error fetching user entrepreneurships");

      const entrepreneurships = await response.json();

      // Obtener el nombre del usuario
      const ownerName =
        entrepreneurships[0]?.owner?.firstName &&
        entrepreneurships[0]?.owner?.lastName
          ? `${entrepreneurships[0].owner.firstName} ${entrepreneurships[0].owner.lastName}`
          : "Usuario";

      setSelectedUserEntrepreneurships({
        ownerName,
        entrepreneurships,
      });

      setIsEntrepreneurshipsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user entrepreneurships:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar apertura de mensajería
  const handleOpenMessaging = (contact: ContactUser | null) => {
    setSelectedContact(contact);
    setIsMessagingModalOpen(true);
  };

  // Manejar aceptar solicitud
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Manejar rechazar solicitud
  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Clear individual filter
  const handleClearFilter = (filterType: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: "",
    }));
  };

  // Apply filters
  const handleApplyFilters = async () => {
    await searchEntrepreneurshipOwners(searchQuery, filters);
  };

  // Clear filters
  const handleClearFilters = async () => {
    const clearedFilters = {
      category: "",
      businessStage: "",
      department: "",
      municipality: "",
    };
    setFilters(clearedFilters);
    await searchEntrepreneurshipOwners(searchQuery, clearedFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-12 flex-1 max-w-md" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Red de Emprendedores
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Conecta, colabora y crece junto a otros emprendedores bolivianos
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalContacts}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Contactos
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.pendingReceived}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Solicitudes Pendientes
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.pendingSent}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Enviadas
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.totalRequests}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Solicitudes
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emprendedores Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar emprendedores por categoría de negocio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              <Button onClick={handleSearch} className="h-10">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Inline Filters */}
          {showFilters && (
            <Card className="bg-white shadow-sm border-0 mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Filtros de Búsqueda
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar Todo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Categoría */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Categoría
                        </label>
                        {filters.category && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearFilter("category")}
                            className="h-5 px-1 text-xs text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={filters.category}
                        onValueChange={(value) =>
                          handleFilterChange("category", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                          <SelectItem value="Comercio">Comercio</SelectItem>
                          <SelectItem value="Servicios">Servicios</SelectItem>
                          <SelectItem value="Manufactura">
                            Manufactura
                          </SelectItem>
                          <SelectItem value="Agricultura">
                            Agricultura
                          </SelectItem>
                          <SelectItem value="Turismo">Turismo</SelectItem>
                          <SelectItem value="Educación">Educación</SelectItem>
                          <SelectItem value="Salud">Salud</SelectItem>
                          <SelectItem value="Finanzas">Finanzas</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Etapa del Negocio */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Etapa
                        </label>
                        {filters.businessStage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearFilter("businessStage")}
                            className="h-5 px-1 text-xs text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={filters.businessStage}
                        onValueChange={(value) =>
                          handleFilterChange("businessStage", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar etapa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Idea">Idea</SelectItem>
                          <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                          <SelectItem value="Lanzamiento">
                            Lanzamiento
                          </SelectItem>
                          <SelectItem value="Crecimiento">
                            Crecimiento
                          </SelectItem>
                          <SelectItem value="Expansión">Expansión</SelectItem>
                          <SelectItem value="Establecido">
                            Establecido
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Departamento */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Departamento
                        </label>
                        {filters.department && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearFilter("department")}
                            className="h-5 px-1 text-xs text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={filters.department}
                        onValueChange={(value) =>
                          handleFilterChange("department", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="La Paz">La Paz</SelectItem>
                          <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                          <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                          <SelectItem value="Potosí">Potosí</SelectItem>
                          <SelectItem value="Oruro">Oruro</SelectItem>
                          <SelectItem value="Chuquisaca">Chuquisaca</SelectItem>
                          <SelectItem value="Tarija">Tarija</SelectItem>
                          <SelectItem value="Beni">Beni</SelectItem>
                          <SelectItem value="Pando">Pando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Municipio */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Municipio
                        </label>
                        {filters.municipality && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearFilter("municipality")}
                            className="h-5 px-1 text-xs text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Ingresar municipio"
                        value={filters.municipality}
                        onChange={(e) =>
                          handleFilterChange("municipality", e.target.value)
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleApplyFilters} className="px-6">
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(entrepreneurshipOwners || [])
              .filter(
                (entrepreneurship) =>
                  entrepreneurship && entrepreneurship.ownerId
              )
              .map((entrepreneurship) => (
                <Card
                  key={entrepreneurship?.id || Math.random().toString()}
                  className="bg-white shadow-sm border-0 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={entrepreneurship?.owner?.avatarUrl}
                          alt={`${entrepreneurship?.owner?.firstName || ""} ${entrepreneurship?.owner?.lastName || ""}`}
                        />
                        <AvatarFallback>
                          {entrepreneurship?.owner?.firstName?.[0] || ""}
                          {entrepreneurship?.owner?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {entrepreneurship?.owner?.firstName || "Sin nombre"}{" "}
                          {entrepreneurship?.owner?.lastName || ""}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {entrepreneurship?.owner?.email || "Sin email"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {entrepreneurship?.municipality ||
                            "Sin ubicación"},{" "}
                          {entrepreneurship?.department || ""}
                        </div>
                      </div>
                    </div>

                    {/* Entrepreneurship Information */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 text-gray-900">
                        {entrepreneurship?.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {entrepreneurship?.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {entrepreneurship?.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-green-200 text-green-800"
                        >
                          {entrepreneurship?.businessStage}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        handleViewEntrepreneurships(
                          entrepreneurship?.ownerId || ""
                        )
                      }
                      className="w-full h-10"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Emprendimientos
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>

          {(entrepreneurshipOwners || []).filter(
            (entrepreneurship) => entrepreneurship && entrepreneurship.ownerId
          ).length === 0 && (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No se encontraron emprendedores
                    </h3>
                    <p className="text-gray-600">
                      Intenta con otros términos de búsqueda o publica tu
                      emprendimiento para aparecer en la red.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para ver emprendimientos de un usuario */}
      <Dialog
        open={isEntrepreneurshipsModalOpen}
        onOpenChange={setIsEntrepreneurshipsModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Emprendimientos de{" "}
              {selectedUserEntrepreneurships?.ownerName || "Usuario"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedUserEntrepreneurships?.entrepreneurships || []).map(
              (entrepreneurship: any) => (
                <Card
                  key={entrepreneurship.id}
                  className="bg-white shadow-sm border-0 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {entrepreneurship.name?.[0]?.toUpperCase() || "E"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 text-gray-900">
                            {entrepreneurship.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {entrepreneurship.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {entrepreneurship.municipality}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            {entrepreneurship.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs border-green-200 text-green-800"
                          >
                            {entrepreneurship.businessStage}
                          </Badge>
                        </div>

                        {entrepreneurship.website && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <a
                              href={entrepreneurship.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Sitio web
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {(!selectedUserEntrepreneurships?.entrepreneurships ||
            selectedUserEntrepreneurships?.entrepreneurships.length === 0) && (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay emprendimientos
                    </h3>
                    <p className="text-gray-600">
                      Este usuario no tiene emprendimientos registrados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Mensajería */}
      <Dialog
        open={isMessagingModalOpen}
        onOpenChange={setIsMessagingModalOpen}
      >
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Chat con {selectedContact?.firstName || "Un Contacto"}
            </DialogTitle>
          </DialogHeader>
          <MessagingInterface
            senderId={localStorage.getItem("userId") || ""}
            receiverId={selectedContact?.userId || ""}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
