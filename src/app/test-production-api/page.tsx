"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Globe } from "lucide-react";

export default function TestProductionAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    production: { success: boolean; data?: any; error?: string };
    local: { success: boolean; data?: any; error?: string };
  } | null>(null);

  const testAPI = async (endpoint: string, name: string) => {
    try {
      console.log(`Testing ${name} API:`, endpoint);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Error testing ${name} API:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults(null);

    const productionEndpoint =
      "https://cemse-back-production-56da.up.railway.app/api/health";
    const localEndpoint = "/api/health";

    const [productionResult, localResult] = await Promise.all([
      testAPI(productionEndpoint, "Production"),
      testAPI(localEndpoint, "Local"),
    ]);

    setResults({
      production: productionResult,
      local: localResult,
    });

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Test de Comunicación con API de Producción
        </h1>
        <p className="text-muted-foreground">
          Verifica si el proyecto puede comunicarse con la API de producción
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuración Actual
          </CardTitle>
          <CardDescription>
            Endpoints configurados en el proyecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">
              API de Producción
            </Badge>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              https://cemse-back-production-56da.up.railway.app/api
            </p>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">
              API Local
            </Badge>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              /api (Next.js API Routes)
            </p>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">
              API Base Actual
            </Badge>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              {process.env.NEXT_PUBLIC_API_BASE_PROD || "No configurado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Button
          onClick={runTests}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando conexiones...
            </>
          ) : (
            "Ejecutar Test de Conexión"
          )}
        </Button>
      </div>

      {results && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Production API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.production.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                API de Producción
              </CardTitle>
              <CardDescription>
                https://cemse-back-production-56da.up.railway.app/api
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.production.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Conexión exitosa</strong>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(results.production.data, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error de conexión:</strong>{" "}
                    {results.production.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Local API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.local.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                API Local
              </CardTitle>
              <CardDescription>/api (Next.js API Routes)</CardDescription>
            </CardHeader>
            <CardContent>
              {results.local.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Conexión exitosa</strong>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(results.local.data, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error de conexión:</strong> {results.local.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Variables de Entorno</h4>
            <div className="space-y-2">
              <div>
                <Badge variant="secondary" className="mr-2">
                  NEXT_PUBLIC_API_BASE_PROD
                </Badge>
                <span className="font-mono text-sm">
                  {process.env.NEXT_PUBLIC_API_BASE_PROD || "No configurado"}
                </span>
              </div>
              <div>
                <Badge variant="secondary" className="mr-2">
                  NEXT_PUBLIC_API_BASE_DEV
                </Badge>
                <span className="font-mono text-sm">
                  {process.env.NEXT_PUBLIC_API_BASE_DEV || "No configurado"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              Configuración Actual en api.ts
            </h4>
            <p className="text-sm text-muted-foreground">
              El proyecto está configurado para usar <code>API_BASE_LOCAL</code>{" "}
              (Next.js API Routes) en lugar de la API de producción. Para
              cambiar a producción, modifica la línea 6 en
              <code>src/lib/api.ts</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
