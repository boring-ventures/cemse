"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Eye,
  FileText,
  MessageSquare,
  Clock,
  XCircle,
  CheckCircle,
  User,
  Calendar,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/use-auth";
import { useJobMessages } from "@/hooks/use-job-messages";

interface JobApplication {
  id: string;
  applicantId: string;
  jobOfferId: string;
  coverLetter?: string;
  cvData?: any;
  cvFile?: string;
  coverLetterFile?: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  rating?: number;
  decisionReason?: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string; // Changed from profileImage to avatarUrl to match existing API
  };
}

interface JobOffer {
  id: string;
  title: string;
  companyId: string;
  status: string;
}

interface ChatMessage {
  id: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  senderId: string;
  senderType: "COMPANY" | "APPLICANT";
  status: "SENT" | "DELIVERED" | "READ";
  createdAt: string;
  readAt?: string;
  application?: {
    applicant: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    jobOffer: {
      company: {
        name: string;
        email: string;
        website?: string;
      };
    };
  };
}

const statusColors = {
  SENT: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  PRE_SELECTED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
  HIRED: "bg-green-100 text-green-800",
};

const statusLabels = {
  SENT: "Enviada",
  UNDER_REVIEW: "En Revisión",
  PRE_SELECTED: "Preseleccionado",
  REJECTED: "Rechazada",
  HIRED: "Contratada",
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Use job messages hook when an application is selected
  const {
    messages,
    loading: messagesLoading,
    sending: messageSending,
    error: messageError,
    sendMessage: sendJobMessage,
    markAsRead,
    refreshMessages,
  } = useJobMessages(selectedApplication?.id || "");

  const jobOfferId = params.id as string;

  useEffect(() => {
    if (user?.id && jobOfferId) {
      fetchJobOffer();
      fetchApplications();
    }
  }, [user?.id, jobOfferId]);

  const fetchJobOffer = async () => {
    try {
      const response = await fetch(`/api/joboffer/${jobOfferId}`);
      if (response.ok) {
        const data = await response.json();
        setJobOffer(data);
      }
    } catch (error) {
      console.error("Error fetching job offer:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/jobapplication?jobOfferId=${jobOfferId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las aplicaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: string,
    reason?: string
  ) => {
    try {
      const response = await fetch(`/api/jobapplication/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, decisionReason: reason }),
      });

      if (response.ok) {
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status,
                  decisionReason: reason,
                  reviewedAt: new Date().toISOString(),
                }
              : app
          )
        );

        toast({
          title: "Éxito",
          description: `Estado actualizado a: ${statusLabels[status as keyof typeof statusLabels]}`,
        });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const handleViewCV = (application: JobApplication) => {
    if (application.cvFile) {
      // Open CV file in new tab
      window.open(application.cvFile, "_blank");
    } else if (application.cvData) {
      // Show CV data in modal or navigate to CV view page
      setSelectedApplication(application);
      setShowDetails(true);
    } else {
      toast({
        title: "Sin CV",
        description: "Este candidato no ha subido un CV",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const handleSendMessage = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowMessageModal(true);
    // Load messages when opening chat
    refreshMessages();
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedApplication) return;

    // Debug: Log user data and application data
    console.log("🔍 sendMessage - User data:", {
      userId: user?.id,
      userRole: user?.role,
      userCompany: user?.company,
      userCompanyId: user?.company?.id,
    });
    console.log("🔍 sendMessage - Application data:", {
      applicationId: selectedApplication.id,
      jobOfferId: selectedApplication.jobOfferId,
    });

    try {
      setSendingMessage(true);

      // Send message through the real messaging system
      await sendJobMessage({
        content: messageText.trim(),
        messageType: "TEXT",
      });

      setMessageText("");

      toast({
        title: "Mensaje enviado",
        description: `Mensaje enviado a ${selectedApplication.applicant.firstName} ${selectedApplication.applicant.lastName}`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Ahora";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Oferta de trabajo no encontrada
        </h3>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Aplicaciones</h1>
            <p className="text-sm text-gray-600 mt-1">{jobOffer.title}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          Actualizar
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Aplicaciones
                </p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === "UNDER_REVIEW")
                      .length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Preseleccionadas
                </p>
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === "PRE_SELECTED")
                      .length
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Contratadas
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      applications.filter((app) => app.status === "HIRED")
                        .length
                    }
                  </p>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold">
                  {
                    applications.filter((app) => app.status === "REJECTED")
                      .length
                  }
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aplicaciones Recibidas</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay aplicaciones
              </h3>
              <p className="text-gray-500">
                Aún no has recibido aplicaciones para este puesto de trabajo
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Aplicación</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {application.applicant.avatarUrl ? (
                            <img
                              src={application.applicant.avatarUrl}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {application.applicant.firstName}{" "}
                            {application.applicant.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.applicant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[
                            application.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {
                          statusLabels[
                            application.status as keyof typeof statusLabels
                          ]
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.appliedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCV(application)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver CV
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(application)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Mensaje
                        </Button>
                        {application.status === "SENT" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "UNDER_REVIEW"
                                )
                              }
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              En Revisión
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "REJECTED",
                                  "No cumple con los requisitos"
                                )
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {application.status === "UNDER_REVIEW" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "PRE_SELECTED"
                                )
                              }
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Preseleccionar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "REJECTED",
                                  "No cumple con los requisitos"
                                )
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {application.status === "PRE_SELECTED" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(application.id, "HIRED")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Contratar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "REJECTED",
                                  "No cumple con los requisitos"
                                )
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">
                Detalles de la Aplicación
              </h2>
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Applicant Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">
                  Información del Candidato
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">
                      {selectedApplication.applicant.firstName}{" "}
                      {selectedApplication.applicant.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">
                      {selectedApplication.applicant.email}
                    </p>
                  </div>
                  {selectedApplication.applicant.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">
                        {selectedApplication.applicant.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Aplicación</p>
                    <p className="font-medium">
                      {formatDate(selectedApplication.appliedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Carta de Presentación</h3>
                  <p className="text-gray-700">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {/* CV Data */}
              {selectedApplication.cvData && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Información del CV</h3>
                  <div className="space-y-2">
                    {selectedApplication.cvData.education && (
                      <div>
                        <p className="text-sm text-gray-600">Educación</p>
                        <p className="font-medium">
                          {selectedApplication.cvData.education}
                        </p>
                      </div>
                    )}
                    {selectedApplication.cvData.experience && (
                      <div>
                        <p className="text-sm text-gray-600">Experiencia</p>
                        <p className="font-medium">
                          {selectedApplication.cvData.experience}
                        </p>
                      </div>
                    )}
                    {selectedApplication.cvData.skills && (
                      <div>
                        <p className="text-sm text-gray-600">Habilidades</p>
                        <p className="font-medium">
                          {selectedApplication.cvData.skills}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Cambiar Estado</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedApplication.status === "SENT" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "UNDER_REVIEW"
                          )
                        }
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        En Revisión
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "REJECTED",
                            "No cumple con los requisitos"
                          )
                        }
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === "UNDER_REVIEW" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "PRE_SELECTED"
                          )
                        }
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Preseleccionar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "REJECTED",
                            "No cumple con los requisitos"
                          )
                        }
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === "PRE_SELECTED" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "HIRED"
                          )
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Contratar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id,
                            "REJECTED",
                            "No cumple con los requisitos"
                          )
                        }
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showMessageModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 h-[80vh] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {selectedApplication.applicant.avatarUrl ? (
                    <img
                      src={selectedApplication.applicant.avatarUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedApplication.applicant.firstName}{" "}
                    {selectedApplication.applicant.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedApplication.applicant.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText("");
                  setSelectedApplication(null);
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messageError ? (
                <div className="text-center text-red-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-red-300" />
                  <p>Error al cargar mensajes</p>
                  <p className="text-sm mb-4">{messageError}</p>
                  <Button
                    variant="outline"
                    onClick={() => refreshMessages()}
                    size="sm"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay mensajes aún</p>
                  <p className="text-sm">
                    Inicia la conversación enviando un mensaje
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage =
                    message.senderType === "COMPANY" &&
                    message.senderId === user?.id;
                  const isApplicantMessage = message.senderType === "APPLICANT";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}
                      >
                        {/* Sender info */}
                        <div
                          className={`text-xs mb-1 ${
                            isOwnMessage
                              ? "text-right text-blue-600"
                              : "text-left text-gray-600"
                          }`}
                        >
                          {isOwnMessage
                            ? "Tú"
                            : isApplicantMessage
                              ? `${selectedApplication?.applicant.firstName} ${selectedApplication?.applicant.lastName}`
                              : "Usuario"}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`p-3 rounded-lg ${
                            isOwnMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {formatChatTime(message.createdAt)}
                            </p>
                            {isOwnMessage && (
                              <div className="text-xs text-blue-100">
                                {message.status === "READ" ? "✓✓" : "✓"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex gap-2">
                <textarea
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Escribe tu mensaje..."
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText("");
                    setSelectedApplication(null);
                  }}
                  disabled={messageSending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || messageSending}
                  className="px-6"
                >
                  {messageSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
