"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Building2,
  User,
  Lock,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/utils";

interface Credentials {
  username: string;
  password: string;
  email: string;
  institutionName: string;
}

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: Credentials | null;
}

export function CredentialsModal({
  isOpen,
  onClose,
  credentials,
}: CredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  if (!credentials) return null;

  const copyToClipboardHandler = async (text: string, field: string) => {
    const success = await copyToClipboard(
      text,
      () => {
        setCopiedField(field);
        toast({
          title: "Copiado",
          description: `${field} copiado al portapapeles`,
        });
        setTimeout(() => setCopiedField(null), 2000);
      },
      (errorMessage) => {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );
  };

  const downloadCredentials = () => {
    const content = `Credenciales de Acceso - ${credentials.institutionName}

Institución: ${credentials.institutionName}
Usuario: ${credentials.username}
Contraseña: ${credentials.password}
Email: ${credentials.email}

Fecha de creación: ${new Date().toLocaleDateString("es-ES")}
Hora: ${new Date().toLocaleTimeString("es-ES")}

IMPORTANTE: Guarda estas credenciales en un lugar seguro.
La contraseña no se puede recuperar una vez creada la cuenta.`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credenciales_${credentials.institutionName.replace(/\s+/g, "_").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Descargado",
      description: "Credenciales descargadas exitosamente",
    });
  };

  const downloadPDF = () => {
    // Create a simple PDF-like content
    const content = `
      <html>
        <head>
          <title>Credenciales - ${credentials.institutionName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .credential-item { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Credenciales de Acceso</h1>
            <h2>${credentials.institutionName}</h2>
          </div>
          
          <div class="credential-item">
            <div class="label">Institución:</div>
            <div class="value">${credentials.institutionName}</div>
          </div>
          
          <div class="credential-item">
            <div class="label">Usuario:</div>
            <div class="value">${credentials.username}</div>
          </div>
          
          <div class="credential-item">
            <div class="label">Contraseña:</div>
            <div class="value">${credentials.password}</div>
          </div>
          
          <div class="credential-item">
            <div class="label">Email:</div>
            <div class="value">${credentials.email}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ IMPORTANTE:</strong><br>
            • Guarda estas credenciales en un lugar seguro<br>
            • La contraseña no se puede recuperar una vez creada la cuenta<br>
            • Fecha de creación: ${new Date().toLocaleDateString("es-ES")} ${new Date().toLocaleTimeString("es-ES")}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credenciales_${credentials.institutionName.replace(/\s+/g, "_").toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Descargado",
      description: "Credenciales descargadas en formato HTML",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Credenciales de Acceso
          </DialogTitle>
          <DialogDescription>
            Guarda estas credenciales en un lugar seguro. La contraseña no se
            puede recuperar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Institution Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Institución Creada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {credentials.institutionName}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Credentials */}
          <div className="space-y-3">
            {/* Username */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Usuario</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboardHandler(credentials.username, "Usuario")
                    }
                  >
                    {copiedField === "Usuario" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 font-mono text-sm bg-muted p-2 rounded">
                  {credentials.username}
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Contraseña</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboardHandler(
                          credentials.password,
                          "Contraseña"
                        )
                      }
                    >
                      {copiedField === "Contraseña" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 font-mono text-sm bg-muted p-2 rounded">
                  {showPassword ? credentials.password : "••••••••"}
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboardHandler(credentials.email, "Email")
                    }
                  >
                    {copiedField === "Email" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 font-mono text-sm bg-muted p-2 rounded">
                  {credentials.email}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <div className="text-orange-600 text-sm">
                  ⚠️ <strong>Importante:</strong> Guarda estas credenciales en
                  un lugar seguro. La contraseña no se puede recuperar una vez
                  creada la cuenta.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadCredentials}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar TXT
            </Button>
            <Button variant="outline" onClick={downloadPDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar HTML
            </Button>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
