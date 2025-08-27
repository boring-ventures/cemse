"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateMunicipalNewsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createMunicipalNews = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const newsData = {
        title: "Noticia Municipal de Prueba",
        summary:
          "Esta es una noticia municipal de prueba creada desde el frontend",
        content:
          "Contenido completo de la noticia municipal de prueba. Esta noticia fue creada para verificar que el sistema puede crear noticias municipales correctamente.",
        category: "General",
        authorId: "cmemo5inx00019ybpwv3fu7bk", // ID del municipio Diego Rocha
        authorName: "Diego Rocha",
        authorType: "GOVERNMENT",
        status: "PUBLISHED",
        priority: "MEDIUM",
        featured: false,
        tags: ["municipal", "prueba"],
        targetAudience: ["YOUTH"],
        region: "Cochabamba",
        videoUrl: "",
        relatedLinks: "",
      };

      console.log("🔍 Creating municipal news with data:", newsData);

      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/newsarticle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newsData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Municipal news created successfully:", data);
        setResult(data);
      } else {
        const errorData = await response.text();
        console.error("❌ Error creating municipal news:", errorData);
        setError(`Error ${response.status}: ${errorData}`);
      }
    } catch (err) {
      console.error("❌ Exception creating municipal news:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Municipal News</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Municipal News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create a test municipal news article in the backend with
              the municipality ID: cmemo5inx00019ybpwv3fu7bk
            </p>

            <Button
              onClick={createMunicipalNews}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Municipal News"}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 rounded">
                <h3 className="font-semibold text-red-800">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-100 border border-green-400 rounded">
                <h3 className="font-semibold text-green-800">Success:</h3>
                <pre className="text-sm text-green-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
