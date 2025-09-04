"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/use-auth";
import { useChangePassword } from "@/hooks/useChangePassword";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password change hook
  const {
    changePassword,
    loading: passwordLoading,
    error: passwordError,
  } = useChangePassword();

  // Password change handlers
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(passwordData);
      toast({
        title: "Éxito",
        description: "Contraseña actualizada exitosamente",
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al cambiar la contraseña",
        variant: "destructive",
      });
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración de Cuenta
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la configuración de tu cuenta
          </p>
        </div>
      </div>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para mayor seguridad, se recomienda cambiar tu contraseña
                periódicamente.
              </p>
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
              >
                Cambiar Contraseña
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("currentPassword", e.target.value)
                  }
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("newPassword", e.target.value)
                  }
                  placeholder="Ingresa tu nueva contraseña"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirma tu nueva contraseña"
                  required
                  minLength={6}
                />
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Contraseña"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelPasswordChange}
                  disabled={passwordLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
