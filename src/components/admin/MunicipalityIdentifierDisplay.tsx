"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, User, Copy, Check } from "lucide-react";
import { useCurrentMunicipalityByUsername } from "@/hooks/useMunicipalityByUsername";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import type { Municipality } from "@/types/municipality";
import { copyToClipboard } from "@/lib/utils";

interface MunicipalityIdentifierDisplayProps {
  municipality?: Municipality;
  showAlternativeId?: boolean;
}

export function MunicipalityIdentifierDisplay({
  municipality,
  showAlternativeId = true,
}: MunicipalityIdentifierDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get municipality data using different methods
  const { data: municipalityById } = useCurrentMunicipality();
  const { data: municipalityByUsername } = useCurrentMunicipalityByUsername();

  // Use provided municipality or fallback to hooks
  const currentMunicipality =
    municipality || municipalityById || municipalityByUsername;

  const copyToClipboardHandler = async (text: string, field: string) => {
    const success = await copyToClipboard(
      text,
      () => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      },
      (errorMessage) => {
        console.error("Failed to copy to clipboard:", errorMessage);
      }
    );
  };

  if (!currentMunicipality) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información del Municipio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se encontró información del municipio
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información del Municipio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{currentMunicipality.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{currentMunicipality.department}</span>
            {currentMunicipality.region && (
              <>
                <span>•</span>
                <span>{currentMunicipality.region}</span>
              </>
            )}
          </div>
        </div>

        {/* Identifiers */}
        <div className="space-y-3">
          <h4 className="font-medium">Identificadores</h4>

          {/* Primary ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ID Principal (CUID)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={currentMunicipality.id}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboardHandler(currentMunicipality.id, "id")
                }
              >
                {copiedField === "id" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Alternative ID (Username) */}
          {showAlternativeId && currentMunicipality.username && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                ID Alternativo (Username)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={currentMunicipality.username}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboardHandler(
                      currentMunicipality.username,
                      "username"
                    )
                  }
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Este identificador puede usarse como alternativa al ID principal
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge
            variant={currentMunicipality.isActive ? "default" : "secondary"}
          >
            {currentMunicipality.isActive ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant="outline">Municipio</Badge>
        </div>

        {/* Contact Information */}
        {(currentMunicipality.email || currentMunicipality.phone) && (
          <div className="space-y-2">
            <h4 className="font-medium">Información de Contacto</h4>
            <div className="space-y-1 text-sm">
              {currentMunicipality.email && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMunicipality.email}</span>
                </div>
              )}
              {currentMunicipality.phone && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMunicipality.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
