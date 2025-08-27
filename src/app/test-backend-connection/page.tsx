"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken, getUserFromToken, getAuthHeaders } from "@/lib/api";

export default function TestBackendConnectionPage() {
  const [testResults, setTestResults] = useState<string>("");

  const testServerConnection = async () => {
    try {
      setTestResults("🔄 Probando conexión al servidor...\n");

      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/health"
      );
      const data = await response.text();

      setTestResults(
        (prev) => prev + `✅ Servidor responde: ${response.status}\n`
      );
      setTestResults((prev) => prev + `📄 Respuesta: ${data}\n\n`);
    } catch (error) {
      setTestResults((prev) => prev + `❌ Error de conexión: ${error}\n\n`);
    }
  };

  const testYouthApplicationEndpoint = async () => {
    try {
      setTestResults(
        (prev) => prev + "🔄 Probando endpoint /api/youthapplication...\n"
      );

      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/youthapplication"
      );
      const data = await response.text();

      setTestResults(
        (prev) => prev + `✅ Endpoint responde: ${response.status}\n`
      );
      setTestResults(
        (prev) => prev + `📄 Respuesta: ${data.substring(0, 200)}...\n\n`
      );
    } catch (error) {
      setTestResults((prev) => prev + `❌ Error en endpoint: ${error}\n\n`);
    }
  };

  const testWithAuth = async () => {
    try {
      setTestResults((prev) => prev + "🔄 Probando con autenticación...\n");

      const token = getToken();
      const userFromToken = getUserFromToken();

      setTestResults((prev) => prev + `🔐 Token existe: ${!!token}\n`);
      setTestResults(
        (prev) => prev + `👤 User ID: ${userFromToken?.id || "null"}\n`
      );

      if (!token || !userFromToken?.id) {
        setTestResults((prev) => prev + `❌ No hay token o ID de usuario\n\n`);
        return;
      }

      const url = `https://cemse-back-production-56da.up.railway.app/api/youthapplication?youthProfileId=${userFromToken.id}`;
      setTestResults((prev) => prev + `🌐 URL: ${url}\n`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.text();

      setTestResults(
        (prev) => prev + `✅ Respuesta autenticada: ${response.status}\n`
      );
      setTestResults(
        (prev) => prev + `📄 Datos: ${data.substring(0, 300)}...\n\n`
      );
    } catch (error) {
      setTestResults(
        (prev) => prev + `❌ Error con autenticación: ${error}\n\n`
      );
    }
  };

  const testTokenInfo = () => {
    const token = getToken();
    const userFromToken = getUserFromToken();

    const result = `
🔐 INFORMACIÓN DEL TOKEN:
- Token existe: ${!!token}
- Token valor: ${token ? `${token.substring(0, 20)}...` : "null"}
- User ID: ${userFromToken?.id || "null"}
- User Role: ${userFromToken?.role || "null"}

🔍 HEADERS DE AUTENTICACIÓN:
${JSON.stringify(getAuthHeaders(), null, 2)}
    `;

    setTestResults(result);
  };

  const clearResults = () => {
    setTestResults("");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Backend Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testServerConnection}>
              Test Server Connection
            </Button>
            <Button onClick={testYouthApplicationEndpoint} variant="outline">
              Test Youth Application Endpoint
            </Button>
            <Button onClick={testWithAuth} variant="outline">
              Test With Authentication
            </Button>
            <Button onClick={testTokenInfo} variant="outline">
              Show Token Info
            </Button>
            <Button onClick={clearResults} variant="destructive">
              Clear Results
            </Button>
          </div>

          {testResults && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {testResults}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
