"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Mail,
  Calendar,
  XCircle,
  Edit3,
  Save,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCompanyInterestStatus } from "@/hooks/use-youth-applications";
import { CompanyInterest } from "@/services/youth-application.service";

interface CompanyInterestStatusManagerProps {
  applicationId: string;
  interests: CompanyInterest[];
  currentCompanyId: string;
}

const statusConfig = {
  INTERESTED: {
    label: "Interesado",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    description: "La empresa ha expresado interés inicial",
  },
  CONTACTED: {
    label: "Contactado",
    color: "bg-yellow-100 text-yellow-800",
    icon: Mail,
    description: "Se ha establecido contacto con el candidato",
  },
  INTERVIEW_SCHEDULED: {
    label: "Entrevista Programada",
    color: "bg-purple-100 text-purple-800",
    icon: Calendar,
    description: "Se ha programado una entrevista",
  },
  HIRED: {
    label: "Contratado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    description: "El candidato ha sido contratado",
  },
  NOT_INTERESTED: {
    label: "No Interesado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    description: "La empresa ya no está interesada",
  },
};

export default function CompanyInterestStatusManager({
  applicationId,
  interests,
  currentCompanyId,
}: CompanyInterestStatusManagerProps) {
  const { toast } = useToast();
  const updateStatus = useUpdateCompanyInterestStatus();

  const [editingInterest, setEditingInterest] =
    useState<CompanyInterest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Find the current company's interest
  const currentCompanyInterest = interests.find(
    (interest) => interest.companyId === currentCompanyId
  );

  const handleEditStatus = (interest: CompanyInterest) => {
    setEditingInterest(interest);
    setNewStatus(interest.status);
    setNewMessage(interest.message || "");
  };

  const handleUpdateStatus = async () => {
    if (!editingInterest || !newStatus) return;

    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({
        applicationId,
        data: {
          companyId: editingInterest.companyId,
          status: newStatus as any,
          message: newMessage.trim() || undefined,
        },
      });

      toast({
        title: "Estado actualizado",
        description: "El estado del interés ha sido actualizado correctamente",
      });

      setEditingInterest(null);
      setNewStatus("");
      setNewMessage("");
    } catch (error) {
      console.error("Error updating interest status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingInterest(null);
    setNewStatus("");
    setNewMessage("");
  };

  if (!currentCompanyInterest) {
    return null;
  }

  const currentStatusConfig =
    statusConfig[currentCompanyInterest.status as keyof typeof statusConfig];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Gestión de Estado
        </CardTitle>
        <CardDescription>
          Actualiza el estado de tu interés en este candidato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <currentStatusConfig.icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Estado actual:</span>
                <Badge className={currentStatusConfig.color}>
                  {currentStatusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentStatusConfig.description}
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStatus(currentCompanyInterest)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Actualizar Estado</DialogTitle>
                <DialogDescription>
                  Cambia el estado de tu interés en este candidato
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Nuevo Estado</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newStatus && (
                    <p className="text-sm text-muted-foreground">
                      {
                        statusConfig[newStatus as keyof typeof statusConfig]
                          ?.description
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje (opcional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Agrega un mensaje adicional..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || !newStatus}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status History */}
        {currentCompanyInterest.message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Mensaje:</span>{" "}
              {currentCompanyInterest.message}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Última actualización:{" "}
          {new Date(currentCompanyInterest.updatedAt).toLocaleDateString(
            "es-ES",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
