'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { JobApplication, JobOffer, ApplicationStatus } from '@/types/jobs';
import { JobApplicationService } from '@/services/job-application.service';
import { buildFileUrl, downloadFileWithAuth } from '@/lib/utils';
import { useJobMessages } from '@/hooks/use-job-messages';
import { 
  Users, 
  User, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone,
  Download,
  Star,
  StarOff,
  FileText,
  ExternalLink,
  X
} from 'lucide-react';

interface JobApplicationsModalProps {
  jobOffer: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  SENT: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  PRE_SELECTED: 'bg-orange-100 text-orange-800',
  REJECTED: 'bg-red-100 text-red-800',
  HIRED: 'bg-green-100 text-green-800'
};

const statusLabels = {
  SENT: 'Enviada',
  UNDER_REVIEW: 'En Revisión',
  PRE_SELECTED: 'Preseleccionado',
  REJECTED: 'Rechazado',
  HIRED: 'Contratado'
};

export default function JobApplicationsModal({ jobOffer, isOpen, onClose }: JobApplicationsModalProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  // Use job messages hook when an application is selected
  const { 
    messages, 
    loading: messagesLoading, 
    sending: messageSending, 
    error: messageError,
    sendMessage: sendJobMessage,
    markAsRead,
    refreshMessages 
  } = useJobMessages(selectedApplication?.id || '');

  useEffect(() => {
    if (isOpen && jobOffer) {
      fetchApplications();
    }
  }, [isOpen, jobOffer, statusFilter]);

  const fetchApplications = async () => {
    if (!jobOffer) return;
    
    try {
      setLoading(true);
      
      // Use the specific endpoint for job offer applications
      const response = await JobApplicationService.getApplicationsByJobOffer(
        jobOffer.id, 
        statusFilter !== 'all' ? statusFilter as ApplicationStatus : undefined
      );
      
      // Extract items array from the response (backend returns {items: Array, total: number})
      const data = (response as any).items || response;
      console.log('📋 Applications data received:', data);
      console.log('📄 CV Files:', data.map((app: any) => ({ id: app.id, cvFile: app.cvFile, coverLetterFile: app.coverLetterFile })));
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las aplicaciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await JobApplicationService.updateApplicationStatus(applicationId, { status: newStatus });
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast({
        title: 'Éxito',
        description: 'Estado de aplicación actualizado'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = useCallback(async () => {
    if (!selectedApplication || !messageText.trim()) return;
    
    try {
      setMessageLoading(true);
      
      await sendJobMessage({
        content: messageText,
        messageType: 'TEXT'
      });
      
      toast({
        title: 'Éxito',
        description: 'Mensaje enviado correctamente'
      });
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive'
      });
    } finally {
      setMessageLoading(false);
    }
  }, [selectedApplication, messageText, sendJobMessage, toast]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, []);

  // Memoized message component for better performance
  const MessageBubble = useMemo(() => {
    return ({ message, selectedApplication }: { message: any; selectedApplication: any }) => {
      const isOwnMessage = message.senderType === 'COMPANY';
      const messageTime = new Date(message.createdAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const messageDate = new Date(message.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
            {/* Sender name */}
            <div className={`text-xs font-medium mb-1 ${
              isOwnMessage ? 'text-right text-blue-600' : 'text-left text-gray-600'
            }`}>
              {isOwnMessage 
                ? 'Tú (Empresa)' 
                : `${message.application?.applicant.firstName || selectedApplication?.applicant.firstName} ${message.application?.applicant.lastName || selectedApplication?.applicant.lastName} (Postulante)`
              }
            </div>
            
            {/* Message bubble */}
            <div className={`rounded-lg px-3 py-2 ${
              isOwnMessage 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Message metadata */}
              <div className={`flex items-center justify-between mt-2 pt-1 border-t ${
                isOwnMessage 
                  ? 'border-blue-500/30 text-xs opacity-75' 
                  : 'border-gray-300/30 text-xs text-gray-500'
              }`}>
                <span>{messageTime}</span>
                <div className="flex items-center gap-1">
                  {isOwnMessage && (
                    <span className="text-xs">
                      {message.readAt ? '✓✓ Leído' : '✓ Enviado'}
                    </span>
                  )}
                  <span className="text-xs">{messageDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (statusFilter === 'all') return true;
      return app.status === statusFilter;
    });
  }, [applications, statusFilter]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Aplicaciones - {jobOffer?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto" style={{ transform: 'translateZ(0)' }}>
            {/* Filtros */}
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="SENT">Enviada</SelectItem>
                  <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                  <SelectItem value="PRE_SELECTED">Preseleccionado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                  <SelectItem value="HIRED">Contratado</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600">
                {filteredApplications.length} aplicación{filteredApplications.length !== 1 ? 'es' : ''}
              </div>
            </div>

            {/* Lista de aplicaciones */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay aplicaciones
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter === 'all' 
                      ? 'Aún no has recibido aplicaciones para este puesto'
                      : `No hay aplicaciones con estado "${statusLabels[statusFilter as keyof typeof statusLabels]}"`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar y información básica */}
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={application.applicant.avatarUrl} />
                          <AvatarFallback>
                            {getInitials(application.applicant.firstName, application.applicant.lastName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {application.applicant.firstName} {application.applicant.lastName}
                              </h3>
                              <p className="text-gray-600">{application.applicant.email}</p>
                            </div>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Aplicó {formatDate(application.appliedAt)}
                            </div>
                            {application.applicant.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {application.applicant.location}
                              </div>
                            )}
                            {application.applicant.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {application.applicant.phone}
                              </div>
                            )}
                          </div>

                          {/* Carta de presentación */}
                          {application.coverLetter && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Notas:</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                {application.coverLetter.length > 200 
                                  ? `${application.coverLetter.substring(0, 200)}...`
                                  : application.coverLetter
                                }
                              </p>
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="flex items-center gap-2">
                            {/* Botones para revisar documentos */}
                            {(application.cvFile || (application as any).cvUrl) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const cvPath = application.cvFile || (application as any).cvUrl;
                                  console.log('📄 CV File path:', cvPath);
                                  downloadFileWithAuth(cvPath!, 'cv.pdf').catch(error => {
                                    console.error('Error downloading CV:', error);
                                    toast({
                                      title: 'Error',
                                      description: 'No se pudo descargar el CV',
                                      variant: 'destructive'
                                    });
                                  });
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Ver CV
                              </Button>
                            )}

                            {(application.coverLetterFile || (application as any).coverLetterUrl) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const coverLetterPath = application.coverLetterFile || (application as any).coverLetterUrl;
                                  console.log('📄 Cover Letter File path:', coverLetterPath);
                                  downloadFileWithAuth(coverLetterPath!, 'cover-letter.pdf').catch(error => {
                                    console.error('Error downloading Cover Letter:', error);
                                    toast({
                                      title: 'Error',
                                      description: 'No se pudo descargar la carta de presentación',
                                      variant: 'destructive'
                                    });
                                  });
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Ver Carta PDF
                              </Button>
                            )}

                            {/* Botón para ver detalles completos */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApplicationDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowMessageDialog(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Mensaje
                            </Button>

                            {application.status === 'SENT' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'UNDER_REVIEW')}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  En Revisión
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rechazar
                                </Button>
                              </>
                            )}

                            {application.status === 'UNDER_REVIEW' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'PRE_SELECTED')}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Preseleccionar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rechazar
                                </Button>
                              </>
                            )}

                            {application.status === 'PRE_SELECTED' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'HIRED')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Contratar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rechazar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para enviar mensaje */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversación con {selectedApplication?.applicant.firstName} {selectedApplication?.applicant.lastName}
            </DialogTitle>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Puesto:</span>
                <span>{selectedApplication?.jobOffer.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Participantes:</span>
                <span className="text-blue-600">Tú (Empresa)</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{selectedApplication?.applicant.firstName} {selectedApplication?.applicant.lastName} (Postulante)</span>
              </div>
            </div>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Chat Messages Area */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-[300px] max-h-[400px]" style={{ transform: 'translateZ(0)', willChange: 'scroll-position' }}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-gray-600">Cargando mensajes...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium text-gray-700 mb-1">No hay mensajes aún</h4>
                      <p className="text-sm text-gray-500">¡Inicia la conversación con {selectedApplication?.applicant.firstName}!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message} 
                        selectedApplication={selectedApplication}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || messageSending}
                  className="self-end"
                >
                  {messageSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageText('¡Hola! Nos gustó mucho tu aplicación. ¿Podrías venir a una entrevista?');
                  }}
                >
                  Invitar a entrevista
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageText('Gracias por tu interés. Te contactaremos pronto con más detalles.');
                  }}
                >
                  Mensaje de seguimiento
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageText('Necesitamos algunos documentos adicionales. ¿Podrías enviarlos?');
                  }}
                >
                  Solicitar documentos
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageDialog(false);
                setMessageText('');
                setSelectedApplication(null);
              }}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de aplicación */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Detalles de Aplicación - {selectedApplication?.applicant.firstName} {selectedApplication?.applicant.lastName}
            </DialogTitle>
            <DialogDescription>
              Información completa del candidato y documentos de la aplicación
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Información del candidato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del Candidato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedApplication.applicant.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(selectedApplication.applicant.firstName, selectedApplication.applicant.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}
                        </h3>
                        <p className="text-gray-600">{selectedApplication.applicant.email}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Aplicó {formatDate(selectedApplication.appliedAt)}</span>
                        </div>
                        {selectedApplication.applicant.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedApplication.applicant.location}</span>
                          </div>
                        )}
                        {selectedApplication.applicant.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedApplication.applicant.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[selectedApplication.status]}>
                            {statusLabels[selectedApplication.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* CV */}
                    {(selectedApplication.cvFile || (selectedApplication as any).cvUrl) && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">CV / Currículum Vitae</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const cvPath = selectedApplication.cvFile || (selectedApplication as any).cvUrl;
                            downloadFileWithAuth(cvPath!, 'cv.pdf').catch(error => {
                              console.error('Error downloading CV:', error);
                              toast({
                                title: 'Error',
                                description: 'No se pudo descargar el CV',
                                variant: 'destructive'
                              });
                            });
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Ver CV
                        </Button>
                      </div>
                    )}

                    {/* Carta de Presentación PDF */}
                    {(selectedApplication.coverLetterFile || (selectedApplication as any).coverLetterUrl) && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Carta de Presentación (PDF)</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const coverLetterPath = selectedApplication.coverLetterFile || (selectedApplication as any).coverLetterUrl;
                            downloadFileWithAuth(coverLetterPath!, 'cover-letter.pdf').catch(error => {
                              console.error('Error downloading Cover Letter:', error);
                              toast({
                                title: 'Error',
                                description: 'No se pudo descargar la carta de presentación',
                                variant: 'destructive'
                              });
                            });
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Ver Carta PDF
                        </Button>
                      </div>
                    )}

                    {/* Mensaje si no hay documentos */}
                    {!(selectedApplication.cvFile || (selectedApplication as any).cvUrl) && 
                     !(selectedApplication.coverLetterFile || (selectedApplication as any).coverLetterUrl) && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay documentos adjuntos en esta aplicación</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Carta de Presentación (Texto) */}
              {selectedApplication.coverLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notas adicionales */}
              {selectedApplication.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedApplication.notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Respuestas a preguntas */}
              {selectedApplication.questionAnswers && selectedApplication.questionAnswers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Respuestas a Preguntas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplication.questionAnswers.map((qa, index) => (
                        <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                          <h4 className="font-medium text-gray-900 mb-2">{qa.question}</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">
                            {qa.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApplication(selectedApplication);
                    setShowMessageDialog(true);
                    setShowApplicationDetails(false);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>

                {selectedApplication.status === 'SENT' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'UNDER_REVIEW')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      En Revisión
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}

                {selectedApplication.status === 'UNDER_REVIEW' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'PRE_SELECTED')}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Preseleccionar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}

                {selectedApplication.status === 'PRE_SELECTED' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'HIRED')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Contratar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
