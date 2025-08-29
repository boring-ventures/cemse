"use client";

import { useState, use } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Download,
  Mail,
  Globe,
  GraduationCap,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useYouthApplication,
  useCompanyInterests,
  useExpressCompanyInterest,
} from "@/hooks/use-youth-applications";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ExpressInterestRequest } from "@/services/youth-application.service";
import YouthApplicationChat from "@/components/youth-applications/YouthApplicationChat";
import { BACKEND_URL } from "@/lib/api";

export default function YouthApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState("profile");
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);

  const {
    data: application,
    isLoading,
    error,
  } = useYouthApplication(applicationId);
  const { data: companyInterests } = useCompanyInterests(applicationId);
  const expressInterest = useExpressCompanyInterest();

  const hasExpressedInterest = companyInterests?.some(
    (interest) => interest.companyId === user?.id
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Activa", color: "bg-green-100 text-green-800" },
      PAUSED: { label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
      CLOSED: { label: "Cerrada", color: "bg-red-100 text-red-800" },
      HIRED: { label: "Contratado", color: "bg-blue-100 text-blue-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExpressInterest = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar tu empresa",
        variant: "destructive",
      });
      return;
    }

    setIsExpressingInterest(true);

    try {
      const interestData: ExpressInterestRequest = {
        companyId: user.id,
        status: "INTERESTED",
        message: interestMessage.trim() || undefined,
      };

      await expressInterest.mutateAsync({
        applicationId,
        data: interestData,
      });

      toast({
        title: "¡Interés expresado!",
        description: "El joven será notificado de tu interés",
      });

      setInterestMessage("");
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "No se pudo expresar el interés. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExpressingInterest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando postulación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error al cargar la postulación
            </p>
            <Button onClick={() => router.back()}>Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  const youthProfile = application.youthProfile;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {application.title}
          </h1>
          <p className="text-muted-foreground">
            Postulación de{" "}
            {youthProfile
              ? `${youthProfile.firstName} ${youthProfile.lastName}`
              : "Joven Desarrollador"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(application.status)}
          {!application.isPublic && <Badge variant="outline">Privada</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Youth Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={youthProfile?.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {youthProfile
                      ? getInitials(
                          youthProfile.firstName,
                          youthProfile.lastName
                        )
                      : "JD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {youthProfile
                      ? `${youthProfile.firstName} ${youthProfile.lastName}`
                      : "Joven Desarrollador"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {youthProfile?.email}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {application.viewsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Vistas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {application.applicationsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Intereses
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  {/* Education */}
                  {youthProfile?.educationLevel && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Educación</h4>
                        <p className="text-sm text-muted-foreground">
                          {youthProfile.educationLevel === "UNIVERSITY"
                            ? "Universitario"
                            : youthProfile.educationLevel === "HIGH_SCHOOL"
                              ? "Bachiller"
                              : youthProfile.educationLevel === "GRADUATE"
                                ? "Graduado"
                                : youthProfile.educationLevel}
                          {youthProfile.currentDegree &&
                            ` - ${youthProfile.currentDegree}`}
                          {youthProfile.universityName &&
                            ` en ${youthProfile.universityName}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {youthProfile?.skills && youthProfile.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Habilidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {youthProfile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {youthProfile?.workExperience &&
                    youthProfile.workExperience.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Experiencia Laboral
                        </h4>
                        <div className="space-y-2">
                          {youthProfile.workExperience.map((exp, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">
                                  {exp.position}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Languages */}
                  {youthProfile?.languages &&
                    youthProfile.languages.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Idiomas</h4>
                        <div className="flex flex-wrap gap-2">
                          {youthProfile.languages.map((lang, index) => (
                            <Badge key={index} variant="outline">
                              {lang.language} - {lang.level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Projects */}
                  {youthProfile?.projects &&
                    youthProfile.projects.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Proyectos</h4>
                        <div className="space-y-2">
                          {youthProfile.projects.map((project, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <h5 className="font-medium text-sm">
                                {project.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {project.description}
                              </p>
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <Globe className="h-3 w-3" />
                                  Ver proyecto
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="description" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      Descripción de la Postulación
                    </h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {application.description}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Publicada el {formatDate(application.createdAt)}</p>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.cvFile && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Curriculum Vitae
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              window.open(
                                `${BACKEND_URL}${application.cvFile}`,
                                "_blank"
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar CV
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {application.coverLetterFile && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Carta de Presentación
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              window.open(
                                `${BACKEND_URL}${application.coverLetterFile}`,
                                "_blank"
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Carta
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {!application.cvFile && !application.coverLetterFile && (
                      <div className="col-span-2 text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No hay documentos disponibles
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Express Interest Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Expresar Interés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasExpressedInterest ? (
                <div className="text-center py-4">
                  <div className="text-green-600 mb-2">
                    ✓ Ya has expresado interés
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El joven ha sido notificado de tu interés
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Escribe un mensaje personalizado (opcional)..."
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                  />
                  <Button
                    onClick={handleExpressInterest}
                    disabled={isExpressingInterest}
                    className="w-full"
                  >
                    {isExpressingInterest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Expresando interés...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Expresar Interés
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowChatModal(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar mensaje
              </Button>

              {youthProfile?.email && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open(`mailto:${youthProfile.email}`, "_blank")
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Interests */}
          {companyInterests && companyInterests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Empresas Interesadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {interest.company?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interest.status}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {interest.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Chat con{" "}
              {youthProfile
                ? `${youthProfile.firstName} ${youthProfile.lastName}`
                : "Joven Desarrollador"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <YouthApplicationChat
              applicationId={applicationId}
              youthProfile={youthProfile}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
