"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  UserPlus,
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
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const response = await fetch(`${backendUrl}/profile/me`, {
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
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Cargar perfil del usuario al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      await fetchCurrentUserProfile();
      await searchUsers();
      await getContacts();
      await getStats();
      setLoading(false);
    };

    initializeData();
  }, []);

  // Cargar datos cuando se cambie de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "requests") {
      getReceivedRequests();
    } else if (tab === "contacts") {
      getContacts();
    }
  };

  // Buscar usuarios jóvenes
  const searchUsers = async (query?: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const params = new URLSearchParams();
      if (query) params.append("query", query);

      const url = `${backendUrl}/api/contacts/search${params.toString() ? `?${params.toString()}` : ""}`;
      console.log("🔍 searchUsers - Calling backend URL:", url);

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

  // Enviar solicitud de contacto
  const sendRequest = async (contactId: string, message?: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts/request`;
      console.log("🔍 sendRequest - Calling backend URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ contactId, message }),
      });

      if (!response.ok) throw new Error("Error sending request");

      const data = await response.json();
      // Actualizar la lista de usuarios para mostrar el estado
      await searchUsers(searchQuery);
      return data;
    } catch (err) {
      console.error("Error sending request:", err);
      throw err;
    }
  };

  // Obtener solicitudes recibidas
  const getReceivedRequests = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts/requests/received`;
      console.log("🔍 getReceivedRequests - Calling backend URL:", url);

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
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts/requests/${requestId}/accept`;
      console.log("🔍 acceptRequest - Calling backend URL:", url);

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
      await Promise.all([getReceivedRequests(), getContacts(), getStats()]);
      return data;
    } catch (err) {
      console.error("Error accepting request:", err);
      throw err;
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (requestId: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts/requests/${requestId}/reject`;
      console.log("🔍 rejectRequest - Calling backend URL:", url);

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
      await Promise.all([getReceivedRequests(), getContacts(), getStats()]);
      return data;
    } catch (err) {
      console.error("Error rejecting request:", err);
      throw err;
    }
  };

  // Obtener contactos
  const getContacts = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts`;
      console.log("🔍 getContacts - Calling backend URL:", url);

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

  // Obtener estadísticas
  const getStats = async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://cemse-back-production.up.railway.app";
      const url = `${backendUrl}/api/contacts/stats`;
      console.log("🔍 getStats - Calling backend URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error getting stats");

      const data = await response.json();
      console.log("Stats response:", data); // Debug
      setStats(data.stats);
      return data;
    } catch (err) {
      console.error("Error getting stats:", err);
    }
  };

  // Cargar datos iniciales
  const fetchNetworkingData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        searchUsers(),
        getReceivedRequests(),
        getContacts(),
        getStats(),
      ]);
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
    searchUsers(searchQuery);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Red de Emprendedores</h1>
        <p className="text-muted-foreground">
          Conecta, colabora y crece junto a otros emprendedores bolivianos
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalContacts}
              </div>
              <div className="text-sm text-muted-foreground">Contactos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingReceived}
              </div>
              <div className="text-sm text-muted-foreground">
                Solicitudes Pendientes
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.pendingSent}
              </div>
              <div className="text-sm text-muted-foreground">Enviadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalRequests}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Solicitudes
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entrepreneurs">Emprendedores</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Solicitudes
            {(requests || []).length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {(requests || []).length > 9 ? "9+" : (requests || []).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contacts">Mis Contactos</TabsTrigger>
        </TabsList>

        {/* Emprendedores Tab */}
        <TabsContent value="entrepreneurs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar emprendedores por nombre, email o habilidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(users || [])
              .filter((user) => user && user.userId)
              .map((user) => (
                <Card
                  key={user?.userId || Math.random().toString()}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user?.avatarUrl}
                          alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                        />
                        <AvatarFallback>
                          {user?.firstName?.[0] || ""}
                          {user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {user?.firstName || "Sin nombre"}{" "}
                          {user?.lastName || ""}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.email || "Sin email"}
                        </p>
                        {user?.currentInstitution && (
                          <p className="text-sm text-muted-foreground">
                            {user.currentInstitution}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {user?.municipality || "Sin ubicación"},{" "}
                          {user?.department || ""}
                        </div>
                      </div>
                    </div>

                    {user?.skills && user.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Habilidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {user?.contactStatus === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Solicitud enviada</Badge>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user?.userId || "")}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Conectar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {(users || []).filter((user) => user && user.userId).length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No se encontraron emprendedores
              </h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o completa tu perfil para
                aparecer en la red.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Solicitudes Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Solicitudes de Conexión</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona las solicitudes que otros jóvenes te han enviado
              </p>
            </div>
            <Button variant="outline" onClick={getReceivedRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Contador de solicitudes */}
          {requests.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Tienes {(requests || []).length} solicitud
                  {(requests || []).length !== 1 ? "es" : ""} pendiente
                  {(requests || []).length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(requests || [])
              .filter((request) => request && request.id)
              .map((request) => (
                <Card
                  key={request?.id || Math.random().toString()}
                  className="border-l-4 border-l-orange-500"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={request.user?.avatarUrl}
                          alt={`${request.user?.firstName || ""} ${request.user?.lastName || ""}`}
                        />
                        <AvatarFallback className="text-lg">
                          {request.user?.firstName?.[0] || ""}
                          {request.user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        {/* Información del usuario */}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.user?.firstName || "Sin nombre"}{" "}
                            {request.user?.lastName || ""}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.user?.email || "Sin email"}
                          </p>
                          {request.user?.currentInstitution && (
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {request.user.currentInstitution} •{" "}
                              {request.user?.municipality || ""},{" "}
                              {request.user?.department || ""}
                            </p>
                          )}
                        </div>

                        {/* Habilidades */}
                        {request.user?.skills &&
                          request.user.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Habilidades:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {request.user.skills
                                  .slice(0, 4)
                                  .map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {request.user.skills.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{request.user.skills.length - 4} más
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Mensaje personalizado */}
                        {request.message && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm italic text-gray-700">
                              "{request.message}"
                            </p>
                          </div>
                        )}

                        {/* Fecha */}
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Solicitud enviada el{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(request.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {(requests || []).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No tienes solicitudes pendientes
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cuando otros jóvenes te envíen solicitudes de conexión,
                  aparecerán aquí para que puedas revisarlas y decidir si las
                  aceptas.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("entrepreneurs")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Emprendedores
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contactos Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mis Contactos</h2>
            <Button variant="outline" onClick={getContacts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(contacts || [])
              .filter((contact) => contact && contact.userId)
              .map((contact) => (
                <Card
                  key={contact?.userId || Math.random().toString()}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={contact?.avatarUrl}
                          alt={`${contact?.firstName || ""} ${contact?.lastName || ""}`}
                        />
                        <AvatarFallback>
                          {contact?.firstName?.[0] || ""}
                          {contact?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {contact?.firstName || "Sin nombre"}{" "}
                          {contact?.lastName || ""}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {contact?.email || "Sin email"}
                        </p>
                        {contact?.currentInstitution && (
                          <p className="text-sm text-muted-foreground">
                            {contact.currentInstitution}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {contact?.municipality || "Sin ubicación"},{" "}
                          {contact?.department || ""}
                        </div>
                      </div>
                    </div>

                    {contact?.skills && contact.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Habilidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {contact.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {contact.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{contact.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!isCurrentUserOver18()}
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsMessagingModalOpen(true);
                        }}
                        title={
                          !isCurrentUserOver18()
                            ? "Debes ser mayor de 18 años para enviar mensajes"
                            : "Enviar mensaje"
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mensaje
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!isCurrentUserOver18() && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Debes ser mayor de 18 años para enviar mensajes
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {(contacts || []).length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No tienes contactos aún
              </h3>
              <p className="text-muted-foreground">
                Busca emprendedores y envíales solicitudes para empezar a
                construir tu red.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Mensajería */}
      <Dialog
        open={isMessagingModalOpen}
        onOpenChange={setIsMessagingModalOpen}
      >
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>
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
