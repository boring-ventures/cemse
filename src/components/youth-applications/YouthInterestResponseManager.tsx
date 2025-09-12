"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Mail,
  Calendar,
  XCircle,
  MessageSquare,
  Reply,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSendMessage } from "@/hooks/use-youth-applications";
import { CompanyInterest } from "@/services/youth-application.service";

interface YouthInterestResponseManagerProps {
  applicationId: string;
  interests: CompanyInterest[];
}

const statusConfig = {
  INTERESTED: {
    label: "Interesado",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    description: "La empresa ha expresado interés inicial",
    canRespond: true,
  },
  CONTACTED: {
    label: "Contactado",
    color: "bg-yellow-100 text-yellow-800",
    icon: Mail,
    description: "Se ha establecido contacto",
    canRespond: true,
  },
  INTERVIEW_SCHEDULED: {
    label: "Entrevista Programada",
    color: "bg-purple-100 text-purple-800",
    icon: Calendar,
    description: "Se ha programado una entrevista",
    canRespond: true,
  },
  HIRED: {
    label: "Contratado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    description: "Has sido contratado",
    canRespond: false,
  },
  NOT_INTERESTED: {
    label: "No Interesado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    description: "La empresa ya no está interesada",
    canRespond: false,
  },
};

export default function YouthInterestResponseManager({
  applicationId,
  interests,
}: YouthInterestResponseManagerProps) {
  const { toast } = useToast();
  const sendMessage = useSendMessage();

  const [selectedInterest, setSelectedInterest] =
    useState<CompanyInterest | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  const handleSendResponse = async () => {
    if (!selectedInterest || !responseMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        applicationId,
        data: {
          content: responseMessage.trim(),
        },
      });

      toast({
        title: "Respuesta enviada",
        description: `Tu respuesta ha sido enviada a ${selectedInterest.company?.name}`,
      });

      setResponseMessage("");
      setSelectedInterest(null);
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenResponseDialog = (interest: CompanyInterest) => {
    setSelectedInterest(interest);
    setResponseMessage("");
  };

  const handleCloseDialog = () => {
    setSelectedInterest(null);
    setResponseMessage("");
  };

  if (!interests || interests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Intereses de Empresas
          </CardTitle>
          <CardDescription>
            Empresas que han expresado interés en tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay intereses aún</h3>
            <p className="text-muted-foreground">
              Cuando las empresas vean tu postulación y expresen interés,
              aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Intereses de Empresas ({interests.length})
          </CardTitle>
          <CardDescription>
            Empresas que han expresado interés en tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interests.map((interest) => {
              const statusConfig =
                statusConfig[interest.status as keyof typeof statusConfig];
              const StatusIcon = statusConfig.icon;
              const company = interest.company;

              return (
                <div
                  key={interest.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={company?.logo} />
                        <AvatarFallback>
                          {company?.name ? getInitials(company.name) : "EM"}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="font-semibold">
                          {company?.name || "Empresa"}
                        </h4>
                        {company?.businessSector && (
                          <p className="text-sm text-muted-foreground">
                            {company.businessSector}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {interest.message && (
                    <div className="mb-3">
                      <p className="text-sm bg-muted p-3 rounded-md">
                        "{interest.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                      {company?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{company.email}</span>
                        </div>
                      )}

                      {company?.website && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Sitio web
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(interest.createdAt)}</span>
                    </div>
                  </div>

                  {statusConfig.canRespond && (
                    <div className="pt-3 border-t">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleOpenResponseDialog(interest)}
                            >
                              <Reply className="mr-2 h-4 w-4" />
                              Responder
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Responder a {company?.name}
                              </DialogTitle>
                              <DialogDescription>
                                Envía un mensaje a la empresa que ha expresado
                                interés en tu perfil
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="response">Tu respuesta</Label>
                                <Textarea
                                  id="response"
                                  placeholder="Escribe tu respuesta aquí..."
                                  value={responseMessage}
                                  onChange={(e) =>
                                    setResponseMessage(e.target.value)
                                  }
                                  rows={4}
                                />
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={handleSendResponse}
                                  disabled={
                                    isSending || !responseMessage.trim()
                                  }
                                  className="flex-1"
                                >
                                  {isSending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <Reply className="mr-2 h-4 w-4" />
                                      Enviar Respuesta
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCloseDialog}
                                  disabled={isSending}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {company?.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(`mailto:${company.email}`, "_blank")
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
