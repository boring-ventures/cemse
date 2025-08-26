"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { JobOfferService } from "@/services/job-offer.service";
import { API_BASE } from "@/lib/api";

export default function TestCompanyJobsPage() {
  const { user, getCurrentUser } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCompanyJobs = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      console.log("🔍 Testing company jobs functionality...");
      console.log("🔍 API_BASE:", API_BASE);
      console.log("🔍 User:", user);

      const results = {
        apiBase: API_BASE,
        user: user
          ? {
              id: user.id,
              role: user.role,
              company: user.company,
              username: user.username,
            }
          : null,
        tests: {},
      };

      // Test 1: Get current user from backend
      try {
        console.log("🔍 Test 1: Getting current user from backend...");
        const currentUser = await getCurrentUser();
        results.tests.currentUser = {
          success: true,
          data: currentUser
            ? {
                id: currentUser.id,
                role: currentUser.role,
                company: currentUser.company,
              }
            : null,
        };
        console.log("✅ Test 1: Current user retrieved:", currentUser);
      } catch (error) {
        results.tests.currentUser = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        console.error("❌ Test 1: Failed to get current user:", error);
      }

      // Test 2: Determine company ID
      let companyId = user?.id;
      if (user?.company?.id) {
        companyId = user.company.id;
      } else if (user?.role === "EMPRESAS") {
        companyId = user.id;
      }

      results.tests.companyId = {
        determined: companyId,
        userRole: user?.role,
        hasCompanyInfo: !!user?.company,
        companyInfo: user?.company,
      };

      // Test 3: Fetch job offers for company
      if (companyId) {
        try {
          console.log("🔍 Test 3: Fetching job offers for company:", companyId);
          const jobOffers =
            await JobOfferService.getJobOffersByCompany(companyId);
          results.tests.jobOffers = {
            success: true,
            count: Array.isArray(jobOffers) ? jobOffers.length : 0,
            data: jobOffers,
          };
          console.log("✅ Test 3: Job offers fetched:", jobOffers);
        } catch (error) {
          results.tests.jobOffers = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
          console.error("❌ Test 3: Failed to fetch job offers:", error);
        }
      } else {
        results.tests.jobOffers = {
          success: false,
          error: "No company ID determined",
        };
      }

      // Test 4: Test backend connection
      try {
        console.log("🔍 Test 4: Testing backend connection...");
        const response = await fetch(`${API_BASE}/health`);
        results.tests.backendConnection = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
        };
        console.log(
          "✅ Test 4: Backend connection test result:",
          response.status
        );
      } catch (error) {
        results.tests.backendConnection = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        console.error("❌ Test 4: Backend connection failed:", error);
      }

      results.timestamp = new Date().toISOString();
      console.log("🔍 Test results:", results);
      setTestResults(results);
    } catch (error) {
      console.error("🔍 Test failed:", error);
      setTestResults({
        error: error instanceof Error ? error.message : "Unknown error",
        apiBase: API_BASE,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prueba de Empleos de Empresa</h1>
        <p className="text-muted-foreground">
          Página para probar la funcionalidad de empleos de empresa
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={testCompanyJobs}
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? "Probando..." : "Probar Empleos de Empresa"}
        </Button>
      </div>

      {testResults && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Prueba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Configuración de API:</h3>
                  <p className="text-sm text-muted-foreground">
                    API_BASE: {testResults.apiBase}
                  </p>
                </div>

                {testResults.user && (
                  <div>
                    <h3 className="font-semibold">Usuario Actual:</h3>
                    <pre className="text-sm bg-gray-100 p-2 rounded">
                      {JSON.stringify(testResults.user, null, 2)}
                    </pre>
                  </div>
                )}

                {testResults.tests && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">
                        Test 1: Usuario Actual del Backend
                      </h3>
                      <div
                        className={`p-2 rounded ${testResults.tests.currentUser?.success ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {testResults.tests.currentUser?.success ? (
                          <pre className="text-sm">
                            {JSON.stringify(
                              testResults.tests.currentUser.data,
                              null,
                              2
                            )}
                          </pre>
                        ) : (
                          <p className="text-sm text-red-600">
                            {testResults.tests.currentUser?.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Test 2: ID de Empresa Determinado
                      </h3>
                      <div className="p-2 rounded bg-blue-100">
                        <pre className="text-sm">
                          {JSON.stringify(testResults.tests.companyId, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Test 3: Empleos de la Empresa
                      </h3>
                      <div
                        className={`p-2 rounded ${testResults.tests.jobOffers?.success ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {testResults.tests.jobOffers?.success ? (
                          <div>
                            <p className="text-sm">
                              Cantidad de empleos:{" "}
                              {testResults.tests.jobOffers.count}
                            </p>
                            <pre className="text-sm mt-2">
                              {JSON.stringify(
                                testResults.tests.jobOffers.data,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-sm text-red-600">
                            {testResults.tests.jobOffers?.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Test 4: Conexión al Backend
                      </h3>
                      <div
                        className={`p-2 rounded ${testResults.tests.backendConnection?.success ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {testResults.tests.backendConnection?.success ? (
                          <p className="text-sm">
                            Conexión exitosa - Status:{" "}
                            {testResults.tests.backendConnection.status}
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">
                            {testResults.tests.backendConnection?.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Prueba ejecutada: {testResults.timestamp}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


