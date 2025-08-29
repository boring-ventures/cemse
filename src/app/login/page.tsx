"use client";

import { useState } from "react";
import { useAuthContext } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useHydrationSafe } from "@/hooks/use-hydration-safe";

export default function LoginPage() {
  const { login, loading } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isHydrated } = useHydrationSafe();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos");
      return;
    }

    // Prevent multiple form submissions
    if (loading || isSubmitting) {
      console.log('🔐 Form submission blocked - login already in progress');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔐 Form submitted, starting login...');
      await login({ username: username.trim(), password });
      console.log('🔐 Login completed, redirecting...');
      
      // Check if there's a redirect URL from the login URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      
      if (redirectTo && redirectTo !== '/') {
        console.log('🔐 Redirecting to saved URL:', redirectTo);
        router.replace(redirectTo);
      } else {
        // Redirection will be handled by AuthRedirect component based on user role
        router.replace("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the form until hydration is complete to prevent mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Ingresa tus credenciales para acceder a la plataforma
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              
              <div className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/sign-up"
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate aquí
                </Link>
              </div>
            </div>
          </form>

          {/* Role Information */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Tipos de Usuario:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• <strong>Jóvenes/Adolescentes:</strong> Acceso a cursos y empleos</div>
              <div>• <strong>Empresas:</strong> Publicar empleos y crear cursos</div>
              <div>• <strong>Gobiernos Municipales:</strong> Gestión institucional</div>
              <div>• <strong>Centros de Formación:</strong> Crear contenido educativo</div>
              <div>• <strong>ONGs/Fundaciones:</strong> Programas sociales</div>
              <div>• <strong>Administradores:</strong> Gestión completa del sistema</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
