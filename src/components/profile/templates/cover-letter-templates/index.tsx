"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Printer, 
  Palette, 
  Edit3,
  Save,
  FileText,
  User,
  Building,
  Calendar,
  MapPin,
  Mail,
  Phone,
  X
} from "lucide-react";
import { useCV } from "@/hooks/useCV";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

// Estilos para el PDF de la carta de presentación - Template Professional
const professionalCoverLetterStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    borderBottom: "2px solid #d1d5db",
    paddingBottom: 20,
    marginBottom: 25,
  },
  senderInfo: {
    marginBottom: 15,
  },
  senderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
  },
  senderDetails: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
    marginBottom: 20,
  },
  recipientInfo: {
    marginBottom: 20,
  },
  recipientTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
  },
  recipientDetails: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  subject: {
    marginBottom: 20,
  },
  subjectLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  content: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 20,
    textAlign: "justify",
  },
  signature: {
    marginTop: 30,
  },
  signatureText: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 15,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },
  signatureDetails: {
    fontSize: 10,
    color: "#6b7280",
  },
});

// Estilos para el PDF de la carta de presentación - Template Creative
const creativeCoverLetterStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#f0f9ff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 25,
    marginBottom: 25,
    textAlign: "center",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  senderName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  senderTitle: {
    fontSize: 14,
    color: "#3b82f6",
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  contactItem: {
    fontSize: 9,
    color: "#64748b",
  },
  date: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "right",
    marginBottom: 25,
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 25,
    marginBottom: 25,
    shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  contentText: {
    fontSize: 11,
    color: "#334155",
    textAlign: "justify",
  },
  signature: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    textAlign: "center",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  signatureText: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 15,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 3,
  },
  signatureDetails: {
    fontSize: 10,
    color: "#3b82f6",
  },
});

// Estilos para el PDF de la carta de presentación - Template Minimalist
const minimalistCoverLetterStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  senderName: {
    fontSize: 28,
    fontWeight: "300",
    color: "#111827",
    marginBottom: 5,
  },
  senderTitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 15,
  },
  senderDetails: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 30,
  },
  content: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 30,
    textAlign: "justify",
  },
  signature: {
    marginTop: 40,
  },
  signatureText: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 20,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginBottom: 3,
  },
  signatureDetails: {
    fontSize: 11,
    color: "#6b7280",
  },
});

// Componente PDF de la carta de presentación - Template Professional
const ProfessionalCoverLetterPDF = ({ coverLetterData, cvData }: { coverLetterData: any; cvData: any }) => (
  <Document>
    <Page size="A4" style={professionalCoverLetterStyles.page}>
      {/* Header */}
      <View style={professionalCoverLetterStyles.header}>
        <View style={professionalCoverLetterStyles.senderInfo}>
          <Text style={professionalCoverLetterStyles.senderName}>
            {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
          </Text>
          <Text style={professionalCoverLetterStyles.senderDetails}>
            {cvData?.personalInfo?.address}
          </Text>
          <Text style={professionalCoverLetterStyles.senderDetails}>
            {cvData?.personalInfo?.municipality}, {cvData?.personalInfo?.department}
          </Text>
          <Text style={professionalCoverLetterStyles.senderDetails}>
            {cvData?.personalInfo?.country}
          </Text>
          <Text style={professionalCoverLetterStyles.senderDetails}>
            {cvData?.personalInfo?.email}
          </Text>
          <Text style={professionalCoverLetterStyles.senderDetails}>
            {cvData?.personalInfo?.phone}
          </Text>
        </View>
        <Text style={professionalCoverLetterStyles.date}>
          {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Recipient */}
      <View style={professionalCoverLetterStyles.recipientInfo}>
        <Text style={professionalCoverLetterStyles.recipientTitle}>
          {coverLetterData?.recipient?.department || "Departamento de Recursos Humanos"}
        </Text>
        <Text style={professionalCoverLetterStyles.recipientDetails}>
          {coverLetterData?.recipient?.companyName || "Nombre de la Empresa"}
        </Text>
        <Text style={professionalCoverLetterStyles.recipientDetails}>
          {coverLetterData?.recipient?.address || "Dirección de la Empresa"}
        </Text>
        <Text style={professionalCoverLetterStyles.recipientDetails}>
          {coverLetterData?.recipient?.city || "Ciudad, País"}
        </Text>
      </View>

      {/* Subject */}
      <View style={professionalCoverLetterStyles.subject}>
        <Text style={professionalCoverLetterStyles.subjectLabel}>Asunto:</Text>
        <Text style={professionalCoverLetterStyles.subjectText}>
          {coverLetterData?.subject || `Postulación para el puesto de ${cvData?.targetPosition || "Desarrollador Frontend"}`}
        </Text>
      </View>

      {/* Content */}
      <Text style={professionalCoverLetterStyles.content}>
        {coverLetterData?.content || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
      </Text>
    </Page>
  </Document>
);

// Componente PDF de la carta de presentación - Template Creative
const CreativeCoverLetterPDF = ({ coverLetterData, cvData }: { coverLetterData: any; cvData: any }) => (
  <Document>
    <Page size="A4" style={creativeCoverLetterStyles.page}>
      {/* Header */}
      <View style={creativeCoverLetterStyles.header}>
        <Text style={creativeCoverLetterStyles.senderName}>
          {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
        </Text>
        <Text style={creativeCoverLetterStyles.senderTitle}>
          {cvData?.targetPosition || "Desarrollador Frontend"}
        </Text>
        <View style={creativeCoverLetterStyles.contactInfo}>
          <Text style={creativeCoverLetterStyles.contactItem}>{cvData?.personalInfo?.email}</Text>
          <Text style={creativeCoverLetterStyles.contactItem}>{cvData?.personalInfo?.phone}</Text>
          <Text style={creativeCoverLetterStyles.contactItem}>{cvData?.personalInfo?.municipality}</Text>
        </View>
      </View>

      {/* Date */}
      <Text style={creativeCoverLetterStyles.date}>
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>

      {/* Content */}
      <View style={creativeCoverLetterStyles.content}>
        <Text style={creativeCoverLetterStyles.contentText}>
          {coverLetterData?.content || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
        </Text>
      </View>

      {/* Signature */}
      <View style={creativeCoverLetterStyles.signature}>
        <Text style={creativeCoverLetterStyles.signatureText}>Atentamente,</Text>
        <Text style={creativeCoverLetterStyles.signatureName}>
          {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
        </Text>
        <Text style={creativeCoverLetterStyles.signatureDetails}>
          {cvData?.targetPosition || "Desarrollador Frontend"}
        </Text>
      </View>
    </Page>
  </Document>
);

// Componente PDF de la carta de presentación - Template Minimalist
const MinimalistCoverLetterPDF = ({ coverLetterData, cvData }: { coverLetterData: any; cvData: any }) => (
  <Document>
    <Page size="A4" style={minimalistCoverLetterStyles.page}>
      {/* Header */}
      <View style={minimalistCoverLetterStyles.header}>
        <Text style={minimalistCoverLetterStyles.senderName}>
          {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
        </Text>
        <Text style={minimalistCoverLetterStyles.senderTitle}>
          {cvData?.targetPosition || "Desarrollador Frontend"}
        </Text>
        <Text style={minimalistCoverLetterStyles.senderDetails}>
          {cvData?.personalInfo?.email}
        </Text>
        <Text style={minimalistCoverLetterStyles.senderDetails}>
          {cvData?.personalInfo?.phone}
        </Text>
        <Text style={minimalistCoverLetterStyles.senderDetails}>
          {cvData?.personalInfo?.municipality}, {cvData?.personalInfo?.department}
        </Text>
      </View>

      {/* Date */}
      <Text style={minimalistCoverLetterStyles.date}>
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>

      {/* Content */}
      <Text style={minimalistCoverLetterStyles.content}>
        {coverLetterData?.content || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
      </Text>

      {/* Signature */}
      <View style={minimalistCoverLetterStyles.signature}>
        <Text style={minimalistCoverLetterStyles.signatureText}>Atentamente,</Text>
        <Text style={minimalistCoverLetterStyles.signatureName}>
          {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
        </Text>
        <Text style={minimalistCoverLetterStyles.signatureDetails}>
          {cvData?.targetPosition || "Desarrollador Frontend"}
        </Text>
      </View>
    </Page>
  </Document>
);

// Template 1: Professional Business
function ProfessionalBusinessTemplate({ 
  currentContent, 
  currentRecipient,
  currentSubject,
  cvData, 
  isEditing = false,
  onContentChange,
  onRecipientChange,
  onSubjectChange
}: { 
  currentContent: string; 
  currentRecipient: {
    department: string;
    companyName: string; // Changed from company to companyName
    address: string;
    city: string;
    country: string; // Added country field
  };
  currentSubject: string;
  cvData: any; 
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  onRecipientChange?: (field: string, value: string) => void;
  onSubjectChange?: (subject: string) => void;
}) {
  const handleContentChange = (newContent: string) => {
    onContentChange?.(newContent);
  };

  const handleRecipientChange = (field: string, value: string) => {
    onRecipientChange?.(field, value);
  };

  const handleSubjectChange = (newSubject: string) => {
    onSubjectChange?.(newSubject);
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-8 shadow-lg">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{cvData?.personalInfo?.address}</div>
              <div>{cvData?.personalInfo?.municipality}, {cvData?.personalInfo?.department}</div>
              <div>{cvData?.personalInfo?.country}</div>
              <div>{cvData?.personalInfo?.email}</div>
              <div>{cvData?.personalInfo?.phone}</div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Para:</div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={currentRecipient.department}
              onChange={(e) => handleRecipientChange('department', e.target.value)}
              placeholder="Departamento"
              className="text-sm"
            />
            <Input
              value={currentRecipient.companyName}
              onChange={(e) => handleRecipientChange('companyName', e.target.value)}
              placeholder="Nombre de la Empresa"
              className="text-sm"
            />
            <Input
              value={currentRecipient.address}
              onChange={(e) => handleRecipientChange('address', e.target.value)}
              placeholder="Dirección de la Empresa"
              className="text-sm"
            />
            <Input
              value={currentRecipient.city}
              onChange={(e) => handleRecipientChange('city', e.target.value)}
              placeholder="Ciudad, País"
              className="text-sm"
            />
            <Input
              value={currentRecipient.country}
              onChange={(e) => handleRecipientChange('country', e.target.value)}
              placeholder="País"
              className="text-sm"
            />
          </div>
        ) : (
          <div className="font-medium">
            <div>{currentRecipient.department}</div>
            <div>{currentRecipient.companyName}</div>
            <div>{currentRecipient.address}</div>
            <div>{currentRecipient.city}</div>
            <div>{currentRecipient.country}</div>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Asunto:</div>
        {isEditing ? (
          <Input
            value={currentSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Asunto de la carta"
            className="text-sm font-medium"
          />
        ) : (
          <div className="font-medium">
            {currentSubject}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        {isEditing ? (
          <Textarea
            value={currentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Escriba su carta de presentación aquí..."
            className="min-h-[400px] text-sm leading-relaxed"
          />
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {currentContent || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
          </div>
        )}
      </div>
    </div>
  );
}

// Template 2: Modern Creative
function ModernCreativeTemplate({ 
  currentContent, 
  currentRecipient,
  currentSubject,
  cvData, 
  isEditing = false,
  onContentChange,
  onRecipientChange,
  onSubjectChange
}: { 
  currentContent: string; 
  currentRecipient: {
    department: string;
    companyName: string; // Changed from company to companyName
    address: string;
    city: string;
    country: string; // Added country field
  };
  currentSubject: string;
  cvData: any; 
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  onRecipientChange?: (field: string, value: string) => void;
  onSubjectChange?: (subject: string) => void;
}) {
  const handleContentChange = (newContent: string) => {
    onContentChange?.(newContent);
  };

  const handleRecipientChange = (field: string, value: string) => {
    onRecipientChange?.(field, value);
  };

  const handleSubjectChange = (newSubject: string) => {
    onSubjectChange?.(newSubject);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
            </h1>
            <p className="text-lg text-blue-600 mb-4">
              {cvData?.targetPosition || "Desarrollador Frontend"}
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {cvData?.personalInfo?.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {cvData?.personalInfo?.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {cvData?.personalInfo?.municipality}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-right text-sm text-gray-500 mb-6">
            {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Para:</div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={currentRecipient.department}
                  onChange={(e) => handleRecipientChange('department', e.target.value)}
                  placeholder="Departamento"
                  className="text-sm"
                />
                <Input
                  value={currentRecipient.companyName}
                  onChange={(e) => handleRecipientChange('companyName', e.target.value)}
                  placeholder="Nombre de la Empresa"
                  className="text-sm"
                />
                <Input
                  value={currentRecipient.address}
                  onChange={(e) => handleRecipientChange('address', e.target.value)}
                  placeholder="Dirección de la Empresa"
                  className="text-sm"
                />
                <Input
                  value={currentRecipient.city}
                  onChange={(e) => handleRecipientChange('city', e.target.value)}
                  placeholder="Ciudad, País"
                  className="text-sm"
                />
                <Input
                  value={currentRecipient.country}
                  onChange={(e) => handleRecipientChange('country', e.target.value)}
                  placeholder="País"
                  className="text-sm"
                />
              </div>
            ) : (
              <div className="font-medium">
                <div>{currentRecipient.department}</div>
                <div>{currentRecipient.companyName}</div>
                <div>{currentRecipient.address}</div>
                <div>{currentRecipient.city}</div>
                <div>{currentRecipient.country}</div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Asunto:</div>
            {isEditing ? (
              <Input
                value={currentSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Asunto de la carta"
                className="text-sm font-medium"
              />
            ) : (
              <div className="font-medium">
                {currentSubject}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mb-8">
            {isEditing ? (
              <Textarea
                value={currentContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Escriba su carta de presentación aquí..."
                className="min-h-[400px] text-sm leading-relaxed border-0 focus:ring-0 resize-none"
              />
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {currentContent || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="border-t-2 border-blue-200 pt-6">
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {cvData?.targetPosition || "Desarrollador Frontend"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 3: Minimalist Clean
function MinimalistCleanTemplate({ 
  currentContent, 
  currentRecipient,
  currentSubject,
  cvData, 
  isEditing = false,
  onContentChange,
  onRecipientChange,
  onSubjectChange
}: { 
  currentContent: string; 
  currentRecipient: {
    department: string;
    companyName: string; // Changed from company to companyName
    address: string;
    city: string;
    country: string; // Added country field
  };
  currentSubject: string;
  cvData: any; 
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  onRecipientChange?: (field: string, value: string) => void;
  onSubjectChange?: (subject: string) => void;
}) {
  const handleContentChange = (newContent: string) => {
    onContentChange?.(newContent);
  };

  const handleRecipientChange = (field: string, value: string) => {
    onRecipientChange?.(field, value);
  };

  const handleSubjectChange = (newSubject: string) => {
    onSubjectChange?.(newSubject);
  };

  return (
    <div className="bg-white max-w-3xl mx-auto p-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          {cvData?.personalInfo?.firstName} {cvData?.personalInfo?.lastName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {cvData?.targetPosition || "Desarrollador Frontend"}
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <div>{cvData?.personalInfo?.email}</div>
          <div>{cvData?.personalInfo?.phone}</div>
          <div>{cvData?.personalInfo?.municipality}, {cvData?.personalInfo?.department}</div>
        </div>
      </div>

      {/* Date */}
      <div className="text-sm text-gray-500 mb-8">
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>

      {/* Recipient */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Para:</div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={currentRecipient.department}
              onChange={(e) => handleRecipientChange('department', e.target.value)}
              placeholder="Departamento"
              className="text-sm"
            />
            <Input
              value={currentRecipient.companyName}
              onChange={(e) => handleRecipientChange('companyName', e.target.value)}
              placeholder="Nombre de la Empresa"
              className="text-sm"
            />
            <Input
              value={currentRecipient.address}
              onChange={(e) => handleRecipientChange('address', e.target.value)}
              placeholder="Dirección de la Empresa"
              className="text-sm"
            />
            <Input
              value={currentRecipient.city}
              onChange={(e) => handleRecipientChange('city', e.target.value)}
              placeholder="Ciudad, País"
              className="text-sm"
            />
            <Input
              value={currentRecipient.country}
              onChange={(e) => handleRecipientChange('country', e.target.value)}
              placeholder="País"
              className="text-sm"
            />
          </div>
        ) : (
          <div className="font-medium">
            <div>{currentRecipient.department}</div>
            <div>{currentRecipient.companyName}</div>
            <div>{currentRecipient.address}</div>
            <div>{currentRecipient.city}</div>
            <div>{currentRecipient.country}</div>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Asunto:</div>
        {isEditing ? (
          <Input
            value={currentSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Asunto de la carta"
            className="text-sm font-medium"
          />
        ) : (
          <div className="font-medium">
            {currentSubject}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-8">
        {isEditing ? (
          <Textarea
            value={currentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Escriba su carta de presentación aquí..."
            className="min-h-[400px] text-sm leading-relaxed border-0 focus:ring-0 resize-none"
          />
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
            {currentContent || `Estimado/a ${cvData?.personalInfo?.firstName || "Reclutador"},

Me dirijo a usted con gran interés para postularme a la posición de ${cvData?.targetPosition || "Desarrollador Frontend"} en su empresa. Soy ${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${cvData?.skills?.map((skill: any) => skill.name).join(", ") || "diversas áreas"}.

Mi formación académica en ${cvData?.education?.institution || "mi institución educativa"} me ha proporcionado una base sólida en ${cvData?.education?.level || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${cvData?.skills?.map((skill: any) => `• ${skill.name}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${cvData?.personalInfo?.firstName || ""} ${cvData?.personalInfo?.lastName || ""}`}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Cover Letter Template Selector
export function CoverLetterTemplateSelector() {
  const { cvData, coverLetterData, loading, error, saveCoverLetterData } = useCV();
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [currentRecipient, setCurrentRecipient] = useState({
    department: "Departamento de Recursos Humanos",
    companyName: "Nombre de la Empresa",
    address: "Dirección de la Empresa",
    city: "Ciudad, País",
    country: "Bolivia", // Added missing country field
  });
  const [currentSubject, setCurrentSubject] = useState("Postulación para el puesto de Desarrollador Frontend");

  // Sincronizar currentContent con coverLetterData cuando cambie
  useEffect(() => {
    if (coverLetterData?.content) {
      setCurrentContent(coverLetterData.content);
    }
    if (coverLetterData?.recipient) {
      setCurrentRecipient(coverLetterData.recipient);
    }
    if (coverLetterData?.subject) {
      setCurrentSubject(coverLetterData.subject);
    }
  }, [coverLetterData]);

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
  };

  const handleRecipientChange = (field: string, value: string) => {
    setCurrentRecipient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setCurrentSubject(subject);
  };

  const handleSave = async () => {
    try {
      await saveCoverLetterData({
        content: currentContent,
        template: selectedTemplate,
        recipient: currentRecipient,
        subject: currentSubject
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving cover letter:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!coverLetterData || !cvData) return;
    
    try {
      let pdfComponent;
      const coverLetterDataWithEdits = {
        content: currentContent,
        recipient: currentRecipient,
        subject: currentSubject
      };
      
      switch (selectedTemplate) {
        case "professional":
          pdfComponent = <ProfessionalCoverLetterPDF coverLetterData={coverLetterDataWithEdits} cvData={cvData} />;
          break;
        case "creative":
          pdfComponent = <CreativeCoverLetterPDF coverLetterData={coverLetterDataWithEdits} cvData={cvData} />;
          break;
        case "minimalist":
          pdfComponent = <MinimalistCoverLetterPDF coverLetterData={coverLetterDataWithEdits} cvData={cvData} />;
          break;
        default:
          pdfComponent = <ProfessionalCoverLetterPDF coverLetterData={coverLetterDataWithEdits} cvData={cvData} />;
      }
      
      const blob = await pdf(pdfComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Carta_Presentacion_${cvData.personalInfo?.firstName}_${cvData.personalInfo?.lastName}_${selectedTemplate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carta de presentación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar la carta de presentación</p>
      </div>
    );
  }

  const renderTemplate = () => {
    const templateProps = {
      currentContent,
      currentRecipient,
      currentSubject,
      cvData,
      isEditing,
      onContentChange: handleContentChange,
      onRecipientChange: handleRecipientChange,
      onSubjectChange: handleSubjectChange
    };

    switch (selectedTemplate) {
      case "professional":
        return <ProfessionalBusinessTemplate {...templateProps} />;
      case "creative":
        return <ModernCreativeTemplate {...templateProps} />;
      case "minimalist":
        return <MinimalistCleanTemplate {...templateProps} />;
      default:
        return <ProfessionalBusinessTemplate {...templateProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Seleccionar Plantilla de Carta de Presentación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="professional">Profesional</TabsTrigger>
              <TabsTrigger value="creative">Creativa</TabsTrigger>
              <TabsTrigger value="minimalist">Minimalista</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cover Letter Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Carta de Presentación
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button onClick={handleDownloadPDF} data-cover-letter-download>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {renderTemplate()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
