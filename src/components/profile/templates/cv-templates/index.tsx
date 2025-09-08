"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Printer,
  Upload,
  Palette,
  Image as ImageIcon,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Trophy,
  Award,
  GraduationCap,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Code,
  Eye,
  Loader2,
} from "lucide-react";
import { useCV } from "@/hooks/useCV";
import { CVData } from "@/hooks/useCV";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  PDFViewer,
} from "@react-pdf/renderer";

// Estilos para el PDF del CV - Template Modern Professional
const modernCVStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    backgroundColor: "#1e40af",
    color: "#ffffff",
    padding: 30,
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ffffff",
  },
  title: {
    fontSize: 18,
    color: "#bfdbfe",
    marginBottom: 20,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  contactItem: {
    fontSize: 10,
    color: "#e0e7ff",
  },
  content: {
    flexDirection: "row",
    gap: 30,
  },
  leftColumn: {
    width: "30%",
  },
  rightColumn: {
    width: "70%",
  },
  singleColumn: {
    padding: 20,
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
    marginTop: 12,
  },
  educationHistoryItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  achievementItem: {
    marginBottom: 8,
  },
  projectItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  modernProjectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  projectLocation: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  interestTag: {
    fontSize: 10,
    color: "#374151",
    backgroundColor: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: 12,
    margin: "2px 4px 2px 0",
  },
  relevantSkillTag: {
    fontSize: 10,
    color: "#065f46",
    backgroundColor: "#d1fae5",
    padding: "4px 8px",
    borderRadius: 12,
    margin: "2px 4px 2px 0",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 12,
    borderBottom: "2px solid #1e40af",
    paddingBottom: 5,
  },
  summary: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 20,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 18,
    borderLeft: "3px solid #1e40af",
    paddingLeft: 15,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  company: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 5,
  },
  description: {
    fontSize: 10,
    color: "#374151",
  },
  educationItem: {
    borderLeft: "3px solid #1e40af",
    paddingLeft: 15,
    marginBottom: 12,
  },
  institution: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  degree: {
    fontSize: 11,
    color: "#6b7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skill: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 9,
  },
  achievementsItem: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 10,
    color: "#6b7280",
  },
  projectsItem: {
    borderLeft: "3px solid #1e40af",
    paddingLeft: 15,
    marginBottom: 18,
  },
  modernProjectsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  languagesItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  languageName: {
    fontSize: 11,
    color: "#1f2937",
  },
  languageLevel: {
    fontSize: 10,
    color: "#6b7280",
  },
  socialLinkItem: {
    marginBottom: 6,
  },
  socialPlatform: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  socialUrl: {
    fontSize: 9,
    color: "#6b7280",
  },
  interestsText: {
    fontSize: 10,
    color: "#374151",
    fontStyle: "italic",
  },
  activityItem: {
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  activityDescription: {
    fontSize: 10,
    color: "#6b7280",
  },
  relevantSkillsText: {
    fontSize: 10,
    color: "#374151",
  },
  targetText: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 4,
  },
  targetLabel: {
    fontWeight: "bold",
    color: "#1f2937",
  },
});

// Estilos para el PDF del CV - Template Creative Portfolio
const creativeCVStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#faf5ff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 30,
    marginBottom: 30,
    textAlign: "center",
    shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: "#7c3aed",
    marginBottom: 20,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  contactItem: {
    fontSize: 10,
    color: "#6b7280",
  },
  content: {
    flexDirection: "row",
    gap: 25,
  },
  leftColumn: {
    width: "45%",
  },
  rightColumn: {
    width: "55%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 15,
  },
  summary: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 15,
    textAlign: "justify",
  },
  experienceItem: {
    borderLeft: "3px solid #7c3aed",
    paddingLeft: 15,
    marginBottom: 18,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  company: {
    fontSize: 11,
    color: "#7c3aed",
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 5,
  },
  description: {
    fontSize: 10,
    color: "#374151",
  },
  educationItem: {
    borderLeft: "3px solid #7c3aed",
    paddingLeft: 15,
    marginBottom: 12,
  },
  institution: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  degree: {
    fontSize: 11,
    color: "#7c3aed",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skill: {
    backgroundColor: "#ede9fe",
    color: "#7c3aed",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 9,
  },
  achievementsItem: {
    backgroundColor: "#faf5ff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 10,
    color: "#6b7280",
  },
  projectsItem: {
    borderLeft: "3px solid #7c3aed",
    paddingLeft: 15,
    marginBottom: 18,
  },
  creativeProjectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  languagesItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  languageName: {
    fontSize: 11,
    color: "#1f2937",
  },
  languageLevel: {
    fontSize: 10,
    color: "#6b7280",
  },
  socialLinkItem: {
    marginBottom: 6,
  },
  socialPlatform: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  socialUrl: {
    fontSize: 9,
    color: "#6b7280",
  },
  interestsText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  activityItem: {
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  activityDescription: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  relevantSkillsText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  targetText: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  projectHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
});

// Estilos para el PDF del CV - Template Minimalist
const minimalistCVStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 25,
    marginBottom: 30,
  },
  name: {
    fontSize: 36,
    fontWeight: "300",
    color: "#111827",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: "#6b7280",
    marginBottom: 20,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  contactItem: {
    fontSize: 11,
    color: "#6b7280",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: "#111827",
    marginBottom: 15,
  },
  summary: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 20,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 25,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  company: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },
  date: {
    fontSize: 11,
    color: "#9ca3af",
  },
  description: {
    fontSize: 11,
    color: "#374151",
  },
  educationItem: {
    marginBottom: 15,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  institution: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  degree: {
    fontSize: 12,
    color: "#6b7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skill: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 10,
  },
  achievementsItem: {
    borderLeft: "3px solid #d1d5db",
    paddingLeft: 15,
    marginBottom: 15,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
  },
  achievementDescription: {
    fontSize: 11,
    color: "#6b7280",
  },
  projectsItem: {
    marginBottom: 20,
  },
  minimalistProjectTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  languagesItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  languageName: {
    fontSize: 12,
    color: "#111827",
  },
  languageLevel: {
    fontSize: 11,
    color: "#6b7280",
  },
  socialLinkItem: {
    marginBottom: 6,
  },
  socialPlatform: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  socialUrl: {
    fontSize: 10,
    color: "#6b7280",
  },
  interestsText: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  activityItem: {
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  activityDescription: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  relevantSkillsText: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  targetText: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  projectHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
});

// Componente PDF del CV - Template Modern Professional
const ModernProfessionalPDF = ({ cvData }: { cvData: CVData }) => (
  <Document>
    <Page size="A4" style={modernCVStyles.page}>
      {/* Header */}
      <View style={modernCVStyles.header}>
        <Text style={modernCVStyles.name}>
          {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
        </Text>
        <Text style={modernCVStyles.title}>
          {cvData.jobTitle || cvData.targetPosition || "Profesional"}
        </Text>
        <View style={modernCVStyles.contactGrid}>
          {cvData.personalInfo?.email && (
            <Text style={modernCVStyles.contactItem}>
              {cvData.personalInfo.email}
            </Text>
          )}
          {cvData.personalInfo?.phone && (
            <Text style={modernCVStyles.contactItem}>
              {cvData.personalInfo.phone}
            </Text>
          )}
          {[
            cvData.personalInfo?.addressLine,
            cvData.personalInfo?.city,
            cvData.personalInfo?.municipality,
            cvData.personalInfo?.department,
          ].filter(Boolean).length > 0 && (
            <Text style={modernCVStyles.contactItem}>
              {[
                cvData.personalInfo?.addressLine,
                cvData.personalInfo?.city,
                cvData.personalInfo?.municipality,
                cvData.personalInfo?.department,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          )}
          {cvData.personalInfo?.country && (
            <Text style={modernCVStyles.contactItem}>
              {cvData.personalInfo.country}
            </Text>
          )}
        </View>
      </View>

      {/* Single Column Content - Matching HTML Preview */}
      <View style={modernCVStyles.singleColumn}>
        {/* Professional Summary */}
        {cvData.professionalSummary && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Resumen Profesional</Text>
            <Text style={modernCVStyles.summary}>
              {cvData.professionalSummary}
            </Text>
          </View>
        )}

        {/* Education */}
        {cvData.education && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Educación</Text>

            {/* Current Education */}
            {(cvData.education.currentDegree ||
              cvData.education.level ||
              cvData.education.universityName ||
              cvData.education.currentInstitution) && (
              <View style={modernCVStyles.educationItem}>
                <Text style={modernCVStyles.institution}>
                  {cvData.education.currentDegree || cvData.education.level}
                </Text>
                <Text style={modernCVStyles.degree}>
                  {cvData.education.universityName ||
                    cvData.education.currentInstitution}
                </Text>
                {cvData.education.graduationYear && (
                  <Text style={modernCVStyles.date}>
                    Año de graduación: {cvData.education.graduationYear}
                  </Text>
                )}
                {cvData.education.universityStatus && (
                  <Text style={modernCVStyles.date}>
                    Estado: {cvData.education.universityStatus}
                  </Text>
                )}
                {cvData.education.gpa && (
                  <Text style={modernCVStyles.date}>
                    GPA: {cvData.education.gpa}
                  </Text>
                )}
              </View>
            )}

            {/* Education History */}
            {cvData.education.educationHistory &&
              cvData.education.educationHistory.length > 0 && (
                <View style={modernCVStyles.section}>
                  <Text style={modernCVStyles.subsectionTitle}>
                    Historial Educativo
                  </Text>
                  {cvData.education.educationHistory.map((edu, index) => (
                    <View
                      key={index}
                      style={modernCVStyles.educationHistoryItem}
                    >
                      <Text style={modernCVStyles.institution}>
                        {edu.degree}
                      </Text>
                      <Text style={modernCVStyles.degree}>
                        {edu.institution}
                      </Text>
                      <Text style={modernCVStyles.date}>
                        {edu.startDate} - {edu.endDate || "En curso"}
                      </Text>
                      {edu.status && (
                        <Text style={modernCVStyles.date}>
                          Estado: {edu.status}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

            {/* Academic Achievements */}
            {cvData.education.academicAchievements &&
              cvData.education.academicAchievements.length > 0 && (
                <View style={modernCVStyles.section}>
                  <Text style={modernCVStyles.subsectionTitle}>
                    Logros Académicos
                  </Text>
                  {cvData.education.academicAchievements.map(
                    (achievement, index) => (
                      <View key={index} style={modernCVStyles.achievementItem}>
                        <Text style={modernCVStyles.achievementTitle}>
                          {achievement.title}
                        </Text>
                        {achievement.date && (
                          <Text style={modernCVStyles.date}>
                            {achievement.date}
                          </Text>
                        )}
                        {achievement.description && (
                          <Text style={modernCVStyles.achievementDescription}>
                            {achievement.description}
                          </Text>
                        )}
                      </View>
                    )
                  )}
                </View>
              )}
          </View>
        )}

        {/* Work Experience */}
        {cvData.workExperience && cvData.workExperience.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Experiencia Laboral</Text>
            {cvData.workExperience.map((exp, index) => (
              <View key={index} style={modernCVStyles.experienceItem}>
                <Text style={modernCVStyles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={modernCVStyles.company}>{exp.company}</Text>
                <Text style={modernCVStyles.date}>
                  {exp.startDate} - {exp.endDate || "Presente"}
                </Text>
                {exp.description && (
                  <Text style={modernCVStyles.description}>
                    {exp.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Habilidades</Text>
            <View style={modernCVStyles.skillsContainer}>
              {cvData.skills.map((skill, index) => (
                <Text key={index} style={modernCVStyles.skill}>
                  {typeof skill === "string" ? skill : (skill as any).name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Idiomas</Text>
            {cvData.languages.map((lang, index) => (
              <View key={index} style={modernCVStyles.languagesItem}>
                <Text style={modernCVStyles.languageName}>{lang.name}</Text>
                <Text style={modernCVStyles.languageLevel}>
                  {lang.proficiency}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {cvData.projects && cvData.projects.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Proyectos</Text>
            {cvData.projects.map((project, index) => (
              <View key={index} style={modernCVStyles.projectItem}>
                <Text style={modernCVStyles.modernProjectTitle}>
                  {project.title}
                </Text>
                {project.location && (
                  <Text style={modernCVStyles.projectLocation}>
                    Ubicación: {project.location}
                  </Text>
                )}
                <Text style={modernCVStyles.date}>
                  {project.startDate} - {project.endDate || "En curso"}
                </Text>
                {project.description && (
                  <Text style={modernCVStyles.description}>
                    {project.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Social Links */}
        {cvData.socialLinks && cvData.socialLinks.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Enlaces Web</Text>
            {cvData.socialLinks.map((link, index) => (
              <View key={index} style={modernCVStyles.socialLinkItem}>
                <Text style={modernCVStyles.socialPlatform}>
                  {link.platform}:
                </Text>
                <Text style={modernCVStyles.socialUrl}>{link.url}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interests */}
        {cvData.interests && cvData.interests.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>Intereses</Text>
            <View style={modernCVStyles.skillsContainer}>
              {cvData.interests.map((interest, index) => (
                <Text key={index} style={modernCVStyles.interestTag}>
                  {interest}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Activities */}
        {cvData.activities && cvData.activities.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>
              Actividades Extracurriculares
            </Text>
            {cvData.activities.map((activity, index) => (
              <View key={index} style={modernCVStyles.activityItem}>
                <Text style={modernCVStyles.activityTitle}>
                  {activity.title}
                </Text>
                {activity.description && (
                  <Text style={modernCVStyles.activityDescription}>
                    {activity.description}
                  </Text>
                )}
                {activity.startDate && (
                  <Text style={modernCVStyles.date}>
                    {activity.startDate} - {activity.endDate}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Relevant Skills */}
        {cvData.relevantSkills && cvData.relevantSkills.length > 0 && (
          <View style={modernCVStyles.section}>
            <Text style={modernCVStyles.sectionTitle}>
              Habilidades Relevantes
            </Text>
            <View style={modernCVStyles.skillsContainer}>
              {cvData.relevantSkills.map((skill, index) => (
                <Text key={index} style={modernCVStyles.relevantSkillTag}>
                  {typeof skill === "string" ? skill : (skill as any).name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </Page>
  </Document>
);

// Componente PDF del CV - Template Creative Portfolio
const CreativePortfolioPDF = ({ cvData }: { cvData: CVData }) => (
  <Document>
    <Page size="A4" style={creativeCVStyles.page}>
      {/* Header */}
      <View style={creativeCVStyles.header}>
        <Text style={creativeCVStyles.name}>
          {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
        </Text>
        <Text style={creativeCVStyles.title}>
          {cvData.targetPosition || "Desarrollador Frontend"}
        </Text>
        <View style={creativeCVStyles.contactInfo}>
          <Text style={creativeCVStyles.contactItem}>
            {cvData.personalInfo?.email}
          </Text>
          <Text style={creativeCVStyles.contactItem}>
            {cvData.personalInfo?.phone}
          </Text>
          <Text style={creativeCVStyles.contactItem}>
            {cvData.personalInfo?.municipality}
          </Text>
        </View>
      </View>

      <View style={creativeCVStyles.content}>
        {/* Left Column */}
        <View style={creativeCVStyles.leftColumn}>
          {/* About */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>Sobre Mí</Text>
            <Text style={creativeCVStyles.summary}>
              Joven profesional apasionado por la tecnología y el desarrollo
              web. Busco oportunidades para crecer y contribuir con mis
              habilidades en proyectos innovadores.
            </Text>
          </View>

          {/* Education */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>Educación</Text>

            {/* Current Education */}
            <View style={creativeCVStyles.educationItem}>
              <Text style={creativeCVStyles.institution}>
                {cvData.education?.currentInstitution}
              </Text>
              <Text style={creativeCVStyles.degree}>
                {cvData.education?.currentDegree}
              </Text>
              <Text style={creativeCVStyles.date}>
                {cvData.education?.universityStartDate} -{" "}
                {cvData.education?.universityEndDate || "Presente"}
              </Text>
              {cvData.education?.gpa && (
                <Text style={creativeCVStyles.date}>
                  GPA: {cvData.education.gpa}
                </Text>
              )}
            </View>

            {/* Education History */}
            {cvData.education?.educationHistory?.map((item, index) => (
              <View key={index} style={creativeCVStyles.educationItem}>
                <Text style={creativeCVStyles.institution}>
                  {item.institution}
                </Text>
                <Text style={creativeCVStyles.degree}>{item.degree}</Text>
                <Text style={creativeCVStyles.date}>
                  {item.startDate} - {item.endDate || "Presente"}
                </Text>
                <Text style={creativeCVStyles.date}>Estado: {item.status}</Text>
                {item.gpa && (
                  <Text style={creativeCVStyles.date}>GPA: {item.gpa}</Text>
                )}
              </View>
            ))}

            {/* Academic Achievements */}
            {cvData.education?.academicAchievements &&
              cvData.education.academicAchievements.length > 0 && (
                <View style={creativeCVStyles.card}>
                  <Text style={creativeCVStyles.sectionTitle}>
                    Logros Académicos
                  </Text>
                  {cvData.education.academicAchievements.map(
                    (achievement, index) => (
                      <View
                        key={index}
                        style={creativeCVStyles.achievementsItem}
                      >
                        <Text style={creativeCVStyles.achievementTitle}>
                          {achievement.title}
                        </Text>
                        <Text style={creativeCVStyles.achievementDescription}>
                          {achievement.description}
                        </Text>
                        <Text style={creativeCVStyles.date}>
                          {achievement.date}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
          </View>

          {/* Skills */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>Habilidades</Text>
            <View style={creativeCVStyles.skillsContainer}>
              {cvData.skills?.map((skill, index) => (
                <Text key={index} style={creativeCVStyles.skill}>
                  {skill.name}
                  {skill.experienceLevel && ` (${skill.experienceLevel})`}
                </Text>
              ))}
            </View>
          </View>

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>Idiomas</Text>
              {cvData.languages.map((language, index) => (
                <View key={index} style={creativeCVStyles.languagesItem}>
                  <Text style={creativeCVStyles.languageName}>
                    {language.name}
                  </Text>
                  <Text style={creativeCVStyles.languageLevel}>
                    {language.proficiency}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Social Links */}
          {cvData.socialLinks && cvData.socialLinks.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>Enlaces Web</Text>
              {cvData.socialLinks.map((link, index) => (
                <View key={index} style={creativeCVStyles.socialLinkItem}>
                  <Text style={creativeCVStyles.socialPlatform}>
                    {link.platform}:
                  </Text>
                  <Text style={creativeCVStyles.socialUrl}>{link.url}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Interests */}
          {cvData.interests && cvData.interests.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>Intereses</Text>
              <Text style={creativeCVStyles.interestsText}>
                {cvData.interests.join(", ")}
              </Text>
            </View>
          )}

          {/* Activities */}
          {cvData.activities && cvData.activities.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>Actividades</Text>
              {cvData.activities.map((activity, index) => (
                <View key={index} style={creativeCVStyles.activityItem}>
                  <Text style={creativeCVStyles.activityTitle}>
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text style={creativeCVStyles.activityDescription}>
                      {activity.description}
                    </Text>
                  )}
                  {activity.startDate && (
                    <Text style={creativeCVStyles.date}>
                      {activity.startDate} - {activity.endDate}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Relevant Skills */}
          {cvData.relevantSkills && cvData.relevantSkills.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>
                Habilidades Relevantes
              </Text>
              <Text style={creativeCVStyles.relevantSkillsText}>
                {cvData.relevantSkills.join(", ")}
              </Text>
            </View>
          )}
        </View>

        {/* Right Column */}
        <View style={creativeCVStyles.rightColumn}>
          {/* Professional Summary */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>
              Resumen Profesional
            </Text>
            <Text style={creativeCVStyles.summary}>
              {cvData.professionalSummary ||
                "Joven profesional con sólidos conocimientos en desarrollo web y tecnologías modernas. Comprometido con el aprendizaje continuo y el desarrollo de soluciones innovadoras."}
            </Text>
          </View>

          {/* Target Position & Company */}
          {(cvData.targetPosition || cvData.targetCompany) && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>
                Objetivos Profesionales
              </Text>
              {cvData.targetPosition && (
                <Text style={creativeCVStyles.targetText}>
                  <Text style={creativeCVStyles.targetLabel}>
                    Posición objetivo:{" "}
                  </Text>
                  {cvData.targetPosition}
                </Text>
              )}
              {cvData.targetCompany && (
                <Text style={creativeCVStyles.targetText}>
                  <Text style={creativeCVStyles.targetLabel}>
                    Empresa objetivo:{" "}
                  </Text>
                  {cvData.targetCompany}
                </Text>
              )}
            </View>
          )}

          {/* Experience */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>Experiencia</Text>
            {cvData.workExperience?.map((exp, index) => (
              <View key={index} style={creativeCVStyles.experienceItem}>
                <Text style={creativeCVStyles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={creativeCVStyles.company}>{exp.company}</Text>
                <Text style={creativeCVStyles.date}>
                  {exp.startDate && exp.endDate
                    ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(exp.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                    : exp.startDate
                      ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                      : "Fecha no especificada"}
                </Text>
                <Text style={creativeCVStyles.description}>
                  {exp.description}
                </Text>
              </View>
            ))}
            {(!cvData.workExperience || cvData.workExperience.length === 0) && (
              <Text style={creativeCVStyles.description}>
                Sin experiencia laboral registrada
              </Text>
            )}
          </View>

          {/* Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <View style={creativeCVStyles.card}>
              <Text style={creativeCVStyles.sectionTitle}>Proyectos</Text>
              {cvData.projects.map((project, index) => (
                <View key={index} style={creativeCVStyles.projectsItem}>
                  <Text style={creativeCVStyles.creativeProjectTitle}>
                    {project.title}
                  </Text>
                  {project.location && (
                    <Text style={creativeCVStyles.company}>
                      {project.location}
                    </Text>
                  )}
                  <Text style={creativeCVStyles.date}>
                    {project.startDate && project.endDate
                      ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })} - ${new Date(project.endDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`
                      : project.startDate
                        ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })} - Presente`
                        : "Fecha no especificada"}
                  </Text>
                  <Text style={creativeCVStyles.description}>
                    {project.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Achievements */}
          <View style={creativeCVStyles.card}>
            <Text style={creativeCVStyles.sectionTitle}>Logros</Text>
            {cvData.achievements?.map((achievement, index) => (
              <View key={index} style={creativeCVStyles.achievementsItem}>
                <Text style={creativeCVStyles.achievementTitle}>
                  {achievement.title}
                </Text>
                <Text style={creativeCVStyles.achievementDescription}>
                  {achievement.description}
                </Text>
                <Text style={creativeCVStyles.date}>{achievement.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Componente PDF del CV - Template Minimalist
const MinimalistPDF = ({ cvData }: { cvData: CVData }) => (
  <Document>
    <Page size="A4" style={minimalistCVStyles.page}>
      {/* Header */}
      <View style={minimalistCVStyles.header}>
        <Text style={minimalistCVStyles.name}>
          {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
        </Text>
        <Text style={minimalistCVStyles.title}>
          {cvData.targetPosition || "Desarrollador Frontend"}
        </Text>
        <View style={minimalistCVStyles.contactInfo}>
          <Text style={minimalistCVStyles.contactItem}>
            {cvData.personalInfo?.email}
          </Text>
          <Text style={minimalistCVStyles.contactItem}>
            {cvData.personalInfo?.phone}
          </Text>
          <Text style={minimalistCVStyles.contactItem}>
            {cvData.personalInfo?.municipality},{" "}
            {cvData.personalInfo?.department}
          </Text>
          <Text style={minimalistCVStyles.contactItem}>
            {cvData.personalInfo?.country}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={minimalistCVStyles.section}>
        <Text style={minimalistCVStyles.sectionTitle}>Resumen</Text>
        <Text style={minimalistCVStyles.summary}>
          {cvData.professionalSummary ||
            "Joven profesional con experiencia en desarrollo web y tecnologías modernas. Enfocado en crear soluciones eficientes y experiencias de usuario excepcionales."}
        </Text>
      </View>

      {/* Experience */}
      <View style={minimalistCVStyles.section}>
        <Text style={minimalistCVStyles.sectionTitle}>Experiencia</Text>
        {cvData.workExperience?.map((exp, index) => (
          <View key={index} style={minimalistCVStyles.experienceItem}>
            <View style={minimalistCVStyles.experienceHeader}>
              <Text style={minimalistCVStyles.jobTitle}>{exp.jobTitle}</Text>
              <Text style={minimalistCVStyles.date}>
                {exp.startDate && exp.endDate
                  ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(exp.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                  : exp.startDate
                    ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                    : "Fecha no especificada"}
              </Text>
            </View>
            <Text style={minimalistCVStyles.company}>{exp.company}</Text>
            <Text style={minimalistCVStyles.description}>
              {exp.description}
            </Text>
          </View>
        ))}
        {(!cvData.workExperience || cvData.workExperience.length === 0) && (
          <Text style={minimalistCVStyles.description}>
            Sin experiencia laboral registrada
          </Text>
        )}
      </View>

      {/* Education */}
      <View style={minimalistCVStyles.section}>
        <Text style={minimalistCVStyles.sectionTitle}>Educación</Text>

        {/* Current Education */}
        <View style={minimalistCVStyles.educationItem}>
          <View style={minimalistCVStyles.educationHeader}>
            <Text style={minimalistCVStyles.institution}>
              {cvData.education?.currentInstitution}
            </Text>
            <Text style={minimalistCVStyles.date}>
              {cvData.education?.universityStartDate} -{" "}
              {cvData.education?.universityEndDate || "Presente"}
            </Text>
          </View>
          <Text style={minimalistCVStyles.degree}>
            {cvData.education?.currentDegree}
          </Text>
          {cvData.education?.gpa && (
            <Text style={minimalistCVStyles.date}>
              GPA: {cvData.education.gpa}
            </Text>
          )}
        </View>

        {/* Education History */}
        {cvData.education?.educationHistory?.map((item, index) => (
          <View key={index} style={minimalistCVStyles.educationItem}>
            <View style={minimalistCVStyles.educationHeader}>
              <Text style={minimalistCVStyles.institution}>
                {item.institution}
              </Text>
              <Text style={minimalistCVStyles.date}>
                {item.startDate} - {item.endDate || "Presente"}
              </Text>
            </View>
            <Text style={minimalistCVStyles.degree}>{item.degree}</Text>
            <Text style={minimalistCVStyles.date}>Estado: {item.status}</Text>
            {item.gpa && (
              <Text style={minimalistCVStyles.date}>GPA: {item.gpa}</Text>
            )}
          </View>
        ))}

        {/* Academic Achievements */}
        {cvData.education?.academicAchievements &&
          cvData.education.academicAchievements.length > 0 && (
            <View style={minimalistCVStyles.section}>
              <Text style={minimalistCVStyles.sectionTitle}>
                Logros Académicos
              </Text>
              {cvData.education.academicAchievements.map(
                (achievement, index) => (
                  <View key={index} style={minimalistCVStyles.educationItem}>
                    <Text style={minimalistCVStyles.institution}>
                      {achievement.title}
                    </Text>
                    <Text style={minimalistCVStyles.degree}>
                      {achievement.description}
                    </Text>
                    <Text style={minimalistCVStyles.date}>
                      {achievement.date} - {achievement.type}
                    </Text>
                  </View>
                )
              )}
            </View>
          )}
      </View>

      {/* Skills */}
      <View style={minimalistCVStyles.section}>
        <Text style={minimalistCVStyles.sectionTitle}>Habilidades</Text>
        <View style={minimalistCVStyles.skillsContainer}>
          {cvData.skills?.map((skill, index) => (
            <Text key={index} style={minimalistCVStyles.skill}>
              {skill.name}
              {skill.experienceLevel && ` (${skill.experienceLevel})`}
            </Text>
          ))}
        </View>
      </View>

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>Idiomas</Text>
          {cvData.languages.map((language, index) => (
            <View key={index} style={minimalistCVStyles.languagesItem}>
              <Text style={minimalistCVStyles.languageName}>
                {language.name}
              </Text>
              <Text style={minimalistCVStyles.languageLevel}>
                {language.proficiency}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {cvData.projects && cvData.projects.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>Proyectos</Text>
          {cvData.projects.map((project, index) => (
            <View key={index} style={minimalistCVStyles.projectsItem}>
              <View style={minimalistCVStyles.projectHeader}>
                <Text style={minimalistCVStyles.minimalistProjectTitle}>
                  {project.title}
                </Text>
                <Text style={minimalistCVStyles.date}>
                  {project.startDate && project.endDate
                    ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })} - ${new Date(project.endDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`
                    : project.startDate
                      ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })} - Presente`
                      : "Fecha no especificada"}
                </Text>
              </View>
              {project.location && (
                <Text style={minimalistCVStyles.company}>
                  {project.location}
                </Text>
              )}
              <Text style={minimalistCVStyles.description}>
                {project.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Social Links */}
      {cvData.socialLinks && cvData.socialLinks.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>Enlaces Web</Text>
          {cvData.socialLinks.map((link, index) => (
            <View key={index} style={minimalistCVStyles.socialLinkItem}>
              <Text style={minimalistCVStyles.socialPlatform}>
                {link.platform}:
              </Text>
              <Text style={minimalistCVStyles.socialUrl}>{link.url}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Interests */}
      {cvData.interests && cvData.interests.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>Intereses</Text>
          <Text style={minimalistCVStyles.interestsText}>
            {cvData.interests.join(", ")}
          </Text>
        </View>
      )}

      {/* Activities */}
      {cvData.activities && cvData.activities.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>Actividades</Text>
          {cvData.activities.map((activity, index) => (
            <View key={index} style={minimalistCVStyles.activityItem}>
              <Text style={minimalistCVStyles.activityTitle}>
                {activity.title}
              </Text>
              {activity.description && (
                <Text style={minimalistCVStyles.activityDescription}>
                  {activity.description}
                </Text>
              )}
              {activity.startDate && (
                <Text style={minimalistCVStyles.date}>
                  {activity.startDate} - {activity.endDate}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Relevant Skills */}
      {cvData.relevantSkills && cvData.relevantSkills.length > 0 && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>
            Habilidades Relevantes
          </Text>
          <Text style={minimalistCVStyles.relevantSkillsText}>
            {cvData.relevantSkills.join(", ")}
          </Text>
        </View>
      )}

      {/* Target Position & Company */}
      {(cvData.targetPosition || cvData.targetCompany) && (
        <View style={minimalistCVStyles.section}>
          <Text style={minimalistCVStyles.sectionTitle}>
            Objetivos Profesionales
          </Text>
          {cvData.targetPosition && (
            <Text style={minimalistCVStyles.targetText}>
              <Text style={minimalistCVStyles.targetLabel}>
                Posición objetivo:{" "}
              </Text>
              {cvData.targetPosition}
            </Text>
          )}
          {cvData.targetCompany && (
            <Text style={minimalistCVStyles.targetText}>
              <Text style={minimalistCVStyles.targetLabel}>
                Empresa objetivo:{" "}
              </Text>
              {cvData.targetCompany}
            </Text>
          )}
        </View>
      )}

      {/* Achievements */}
      <View style={minimalistCVStyles.section}>
        <Text style={minimalistCVStyles.sectionTitle}>Logros</Text>
        {cvData.achievements?.map((achievement, index) => (
          <View key={index} style={minimalistCVStyles.achievementsItem}>
            <View style={minimalistCVStyles.achievementHeader}>
              <Text style={minimalistCVStyles.achievementTitle}>
                {achievement.title}
              </Text>
              <Text style={minimalistCVStyles.date}>{achievement.date}</Text>
            </View>
            <Text style={minimalistCVStyles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Template 1: Modern Professional
function ModernProfessionalTemplate({
  cvData,
  isEditing = false,
}: {
  cvData: CVData;
  isEditing?: boolean;
}) {
  return (
    <div
      className="bg-white w-full"
      style={{ minWidth: "800px", maxWidth: "1000px", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex items-center gap-6">
          {cvData.personalInfo?.profileImage && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
              <img
                src={cvData.personalInfo.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {cvData.jobTitle ||
                cvData.targetPosition ||
                "Desarrollador Frontend"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {cvData.personalInfo?.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {cvData.personalInfo?.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {cvData.personalInfo?.addressLine ||
                  cvData.personalInfo?.address}
                {cvData.personalInfo?.city && `, ${cvData.personalInfo.city}`}
                {cvData.personalInfo?.municipality &&
                  `, ${cvData.personalInfo.municipality}`}
                {cvData.personalInfo?.department &&
                  `, ${cvData.personalInfo.department}`}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {cvData.personalInfo?.country}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educación
              </h3>
              <div className="space-y-3">
                {/* Current Education */}
                <div className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-medium">
                    {cvData.education?.currentInstitution}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {cvData.education?.currentDegree}
                  </p>
                  <p className="text-xs text-gray-500">
                    {cvData.education?.universityStartDate} -{" "}
                    {cvData.education?.universityEndDate || "Presente"}
                  </p>
                  {cvData.education?.gpa && (
                    <p className="text-xs text-gray-500">
                      GPA: {cvData.education.gpa}
                    </p>
                  )}
                </div>

                {/* Education History */}
                {cvData.education?.educationHistory?.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h5 className="font-medium text-sm">{item.institution}</h5>
                    <p className="text-xs text-gray-600">{item.degree}</p>
                    <p className="text-xs text-gray-500">
                      {item.startDate} - {item.endDate || "Presente"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estado: {item.status}
                    </p>
                    {item.gpa && (
                      <p className="text-xs text-gray-500">GPA: {item.gpa}</p>
                    )}
                  </div>
                ))}

                {/* Academic Achievements */}
                {cvData.education?.academicAchievements &&
                  cvData.education.academicAchievements.length > 0 && (
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h5 className="font-medium text-sm">Logros Académicos</h5>
                      {cvData.education.academicAchievements.map(
                        (achievement, index) => (
                          <div key={index} className="mt-1">
                            <p className="text-xs font-medium">
                              {achievement.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {achievement.date}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {cvData.skills?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {skill.name}
                    {skill.experienceLevel && (
                      <span className="text-xs ml-1">
                        ({skill.experienceLevel})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Idiomas
              </h3>
              <div className="space-y-2">
                {cvData.languages?.map((language, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{language.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {language.proficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Enlaces
              </h3>
              <div className="space-y-2">
                {cvData.socialLinks?.map((link, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{link.platform}:</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Intereses
              </h3>
              <div className="flex flex-wrap gap-2">
                {cvData.interests?.map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Professional Summary */}
            <div>
              <h3 className="text-base font-semibold text-blue-800 mb-2">
                Resumen Profesional
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {cvData.professionalSummary ||
                  "Joven profesional con sólidos conocimientos en desarrollo web y tecnologías modernas. Comprometido con el aprendizaje continuo y el desarrollo de soluciones innovadoras."}
              </p>
            </div>

            {/* Work Experience */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiencia Laboral
              </h3>
              <div className="space-y-4">
                {cvData.workExperience?.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-medium">{exp.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {exp.startDate && exp.endDate
                        ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(exp.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                        : exp.startDate
                          ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                          : "Fecha no especificada"}
                    </p>
                    <p className="text-sm text-gray-700">{exp.description}</p>
                  </div>
                ))}
                {(!cvData.workExperience ||
                  cvData.workExperience.length === 0) && (
                  <p className="text-gray-500 italic">
                    Sin experiencia laboral registrada
                  </p>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Logros
              </h3>
              <div className="space-y-3">
                {cvData.achievements?.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {achievement.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.date}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Proyectos
              </h3>
              <div className="space-y-4">
                {cvData.projects?.map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-medium">{project.title}</h4>
                    {project.location && (
                      <p className="text-sm text-gray-600">
                        {project.location}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {project.startDate && project.endDate
                        ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(project.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                        : project.startDate
                          ? `${new Date(project.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                          : "Fecha no especificada"}
                    </p>
                    <p className="text-sm text-gray-700">
                      {project.description}
                    </p>
                  </div>
                ))}
                {(!cvData.projects || cvData.projects.length === 0) && (
                  <p className="text-gray-500 italic">
                    Sin proyectos registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 2: Creative Portfolio
function CreativePortfolioTemplate({
  cvData,
  isEditing = false,
}: {
  cvData: CVData;
  isEditing?: boolean;
}) {
  return (
    <div
      className="bg-gradient-to-br from-purple-50 to-pink-50 w-full"
      style={{
        minWidth: "800px",
        maxWidth: "1000px",
        margin: "0 auto",
        minHeight: "auto",
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            {cvData.personalInfo?.profileImage && (
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                <img
                  src={cvData.personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
            </h1>
            <p className="text-xl text-purple-600 mb-4">
              {cvData.targetPosition || "Desarrollador Frontend"}
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {cvData.personalInfo?.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {cvData.personalInfo?.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {cvData.personalInfo?.municipality}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sobre Mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Joven profesional apasionado por la tecnología y el desarrollo
                  web. Busco oportunidades para crecer y contribuir con mis
                  habilidades en proyectos innovadores.
                </p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Education */}
                  <div className="border-l-4 border-purple-300 pl-4">
                    <h4 className="font-semibold text-gray-800">
                      {cvData.education?.currentInstitution}
                    </h4>
                    <p className="text-purple-600">
                      {cvData.education?.currentDegree}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cvData.education?.universityStartDate} -{" "}
                      {cvData.education?.universityEndDate || "Presente"}
                    </p>
                    {cvData.education?.gpa && (
                      <p className="text-sm text-gray-500">
                        GPA: {cvData.education.gpa}
                      </p>
                    )}
                  </div>

                  {/* Education History */}
                  {cvData.education?.educationHistory?.map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-300 pl-4"
                    >
                      <h5 className="font-semibold text-sm text-gray-800">
                        {item.institution}
                      </h5>
                      <p className="text-purple-600 text-sm">{item.degree}</p>
                      <p className="text-sm text-gray-500">
                        {item.startDate} - {item.endDate || "Presente"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estado: {item.status}
                      </p>
                      {item.gpa && (
                        <p className="text-sm text-gray-500">GPA: {item.gpa}</p>
                      )}
                    </div>
                  ))}

                  {/* Academic Achievements */}
                  {cvData.education?.academicAchievements &&
                    cvData.education.academicAchievements.length > 0 && (
                      <div className="border-l-4 border-purple-300 pl-4">
                        <h5 className="font-semibold text-sm text-gray-800">
                          Logros Académicos
                        </h5>
                        {cvData.education.academicAchievements.map(
                          (achievement, index) => (
                            <div key={index} className="mt-2">
                              <p className="text-sm font-medium text-gray-800">
                                {achievement.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {achievement.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {achievement.date}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800">Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills?.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      {skill.name}
                      {skill.experienceLevel && (
                        <span className="text-xs ml-1">
                          ({skill.experienceLevel})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Professional Summary */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  Resumen Profesional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {cvData.professionalSummary ||
                    "Joven profesional con sólidos conocimientos en desarrollo web y tecnologías modernas. Comprometido con el aprendizaje continuo y el desarrollo de soluciones innovadoras."}
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvData.workExperience?.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-300 pl-4"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {exp.jobTitle}
                      </h4>
                      <p className="text-purple-600">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {exp.startDate && exp.endDate
                          ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(exp.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                          : exp.startDate
                            ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                            : "Fecha no especificada"}
                      </p>
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                  {(!cvData.workExperience ||
                    cvData.workExperience.length === 0) && (
                    <p className="text-gray-500 italic">
                      Sin experiencia laboral registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cvData.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                        <Badge className="bg-purple-200 text-purple-800">
                          {achievement.date}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template 3: Minimalist
function MinimalistTemplate({
  cvData,
  isEditing = false,
}: {
  cvData: CVData;
  isEditing?: boolean;
}) {
  return (
    <div className="bg-white max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-8 mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {cvData.targetPosition || "Desarrollador Frontend"}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>{cvData.personalInfo?.email}</div>
          <div>{cvData.personalInfo?.phone}</div>
          <div>
            {cvData.personalInfo?.municipality},{" "}
            {cvData.personalInfo?.department}
          </div>
          <div>{cvData.personalInfo?.country}</div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Summary */}
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Resumen</h2>
          <p className="text-gray-700 leading-relaxed">
            {cvData.professionalSummary ||
              "Joven profesional con experiencia en desarrollo web y tecnologías modernas. Enfocado en crear soluciones eficientes y experiencias de usuario excepcionales."}
          </p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Experiencia
          </h2>
          <div className="space-y-6">
            {cvData.workExperience?.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {exp.startDate && exp.endDate
                      ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - ${new Date(exp.endDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                      : exp.startDate
                        ? `${new Date(exp.startDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - Presente`
                        : "Fecha no especificada"}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{exp.company}</p>
                <p className="text-gray-700">{exp.description}</p>
              </div>
            ))}
            {(!cvData.workExperience || cvData.workExperience.length === 0) && (
              <p className="text-gray-500 italic">
                Sin experiencia laboral registrada
              </p>
            )}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Educación</h2>

          {/* Current Education */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {cvData.education?.currentInstitution}
              </h3>
              <span className="text-sm text-gray-500">
                {cvData.education?.universityStartDate} -{" "}
                {cvData.education?.universityEndDate || "Presente"}
              </span>
            </div>
            <p className="text-gray-600">{cvData.education?.currentDegree}</p>
            {cvData.education?.gpa && (
              <p className="text-sm text-gray-500">
                GPA: {cvData.education.gpa}
              </p>
            )}
          </div>

          {/* Education History */}
          {cvData.education?.educationHistory?.map((item, index) => (
            <div key={index} className="mt-4 border-t pt-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-md font-medium text-gray-900">
                  {item.institution}
                </h4>
                <span className="text-sm text-gray-500">
                  {item.startDate} - {item.endDate || "Presente"}
                </span>
              </div>
              <p className="text-gray-600">{item.degree}</p>
              <p className="text-sm text-gray-500">Estado: {item.status}</p>
              {item.gpa && (
                <p className="text-sm text-gray-500">GPA: {item.gpa}</p>
              )}
            </div>
          ))}

          {/* Academic Achievements */}
          {cvData.education?.academicAchievements &&
            cvData.education.academicAchievements.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  Logros Académicos
                </h4>
                {cvData.education.academicAchievements.map(
                  (achievement, index) => (
                    <div key={index} className="mt-2">
                      <p className="text-sm font-medium text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {achievement.date} - {achievement.type}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Habilidades
          </h2>
          <div className="flex flex-wrap gap-2">
            {cvData.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill.name}
                {skill.experienceLevel && (
                  <span className="text-xs ml-1">
                    ({skill.experienceLevel})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Logros</h2>
          <div className="space-y-4">
            {cvData.achievements?.map((achievement, index) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900">
                    {achievement.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {achievement.date}
                  </span>
                </div>
                <p className="text-gray-700">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// PDF Components for new templates

// HTML Preview Components for CV Templates
function ModernProfessionalHTML({ cvData }: { cvData: CVData }) {
  return (
    <div
      className="bg-white w-full shadow-lg"
      style={{ minWidth: "800px", maxWidth: "1000px", margin: "0 auto" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex items-center gap-6">
          {cvData.personalInfo?.profileImage && (
            <img
              src={cvData.personalInfo.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {cvData.jobTitle || cvData.targetPosition || "Profesional"}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {cvData.personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {cvData.personalInfo.email}
                </div>
              )}
              {cvData.personalInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {cvData.personalInfo.phone}
                </div>
              )}
              {cvData.personalInfo?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {cvData.personalInfo.city}, {cvData.personalInfo?.department}
                </div>
              )}
              {cvData.personalInfo?.country && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {cvData.personalInfo.country}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        {cvData.professionalSummary && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Resumen Profesional
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {cvData.professionalSummary}
            </p>
          </div>
        )}

        {/* Education */}
        {cvData.education && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Educación
            </h2>
            <div className="space-y-4">
              {/* Current Education */}
              {(cvData.education.currentDegree ||
                cvData.education.level ||
                cvData.education.universityName ||
                cvData.education.currentInstitution) && (
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {cvData.education.currentDegree || cvData.education.level}
                  </h3>
                  <p className="text-gray-600">
                    {cvData.education.universityName ||
                      cvData.education.currentInstitution}
                  </p>
                  {cvData.education.graduationYear && (
                    <p className="text-sm text-gray-500">
                      Año de graduación: {cvData.education.graduationYear}
                    </p>
                  )}
                  {cvData.education.universityStatus && (
                    <p className="text-sm text-gray-500">
                      Estado: {cvData.education.universityStatus}
                    </p>
                  )}
                  {cvData.education.gpa && (
                    <p className="text-sm text-gray-500">
                      GPA: {cvData.education.gpa}
                    </p>
                  )}
                </div>
              )}

              {/* Education History */}
              {cvData.education.educationHistory &&
                cvData.education.educationHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Historial Educativo
                    </h4>
                    {cvData.education.educationHistory.map((edu, index) => (
                      <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-gray-800">
                          {edu.degree}
                        </h5>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate || "En curso"}
                        </p>
                        {edu.status && (
                          <p className="text-sm text-gray-500">
                            Estado: {edu.status}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {/* Academic Achievements */}
              {cvData.education.academicAchievements &&
                cvData.education.academicAchievements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Logros Académicos
                    </h4>
                    {cvData.education.academicAchievements.map(
                      (achievement, index) => (
                        <div key={index} className="mb-2">
                          <h5 className="font-medium text-gray-800">
                            {achievement.title}
                          </h5>
                          {achievement.date && (
                            <p className="text-sm text-gray-500">
                              {achievement.date}
                            </p>
                          )}
                          {achievement.description && (
                            <p className="text-sm text-gray-600">
                              {achievement.description}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {cvData.workExperience && cvData.workExperience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Experiencia Laboral
            </h2>
            <div className="space-y-4">
              {cvData.workExperience.map((exp, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">
                    {exp.jobTitle}
                  </h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || "Presente"}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {typeof skill === "string" ? skill : (skill as any).name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Idiomas
            </h2>
            <div className="space-y-2">
              {cvData.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-gray-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects && cvData.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Proyectos
            </h2>
            <div className="space-y-4">
              {cvData.projects.map((project, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">
                    {project.title}
                  </h3>
                  {project.location && (
                    <p className="text-gray-600 text-sm">
                      Ubicación: {project.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {project.startDate} - {project.endDate || "En curso"}
                  </p>
                  {project.description && (
                    <p className="text-gray-700 mt-2">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {cvData.socialLinks && cvData.socialLinks.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Enlaces Web
            </h2>
            <div className="space-y-2">
              {cvData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {link.platform}:
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {cvData.interests && cvData.interests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Intereses
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {cvData.activities && cvData.activities.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Actividades Extracurriculares
            </h2>
            <div className="space-y-3">
              {cvData.activities.map((activity, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">
                    {activity.title}
                  </h3>
                  {activity.description && (
                    <p className="text-gray-600 text-sm">
                      {activity.description}
                    </p>
                  )}
                  {activity.startDate && (
                    <p className="text-sm text-gray-500">
                      {activity.startDate} - {activity.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {cvData.achievements && cvData.achievements.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Logros
            </h2>
            <div className="space-y-3">
              {cvData.achievements.map((achievement, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">
                    {achievement.title}
                  </h3>
                  {achievement.description && (
                    <p className="text-gray-600 text-sm">
                      {achievement.description}
                    </p>
                  )}
                  {achievement.date && (
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Position & Company */}
        {(cvData.targetPosition || cvData.targetCompany) && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Objetivos Profesionales
            </h2>
            <div className="space-y-2">
              {cvData.targetPosition && (
                <p>
                  <span className="font-medium">Posición objetivo:</span>{" "}
                  {cvData.targetPosition}
                </p>
              )}
              {cvData.targetCompany && (
                <p>
                  <span className="font-medium">Empresa objetivo:</span>{" "}
                  {cvData.targetCompany}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Relevant Skills */}
        {cvData.relevantSkills && cvData.relevantSkills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
              Habilidades Relevantes
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.relevantSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {typeof skill === "string" ? skill : (skill as any).name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreativePortfolioHTML({ cvData }: { cvData: CVData }) {
  return (
    <div
      className="bg-gradient-to-br from-purple-50 to-pink-50 w-full shadow-lg"
      style={{
        minWidth: "800px",
        maxWidth: "1000px",
        margin: "0 auto",
        minHeight: "auto",
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            {cvData.personalInfo?.profileImage && (
              <img
                src={cvData.personalInfo.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-purple-800 mb-2">
                {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
              </h1>
              <p className="text-xl text-purple-600 mb-4">
                {cvData.jobTitle ||
                  cvData.targetPosition ||
                  "Profesional Creativo"}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                {cvData.personalInfo?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {cvData.personalInfo.email}
                  </div>
                )}
                {cvData.personalInfo?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {cvData.personalInfo.phone}
                  </div>
                )}
                {cvData.personalInfo?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {cvData.personalInfo.city},{" "}
                    {cvData.personalInfo?.department}
                  </div>
                )}
                {cvData.personalInfo?.country && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {cvData.personalInfo.country}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Professional Summary */}
          {cvData.professionalSummary && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Sobre Mí
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {cvData.professionalSummary}
              </p>
            </div>
          )}

          {/* Education */}
          {cvData.education && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Educación
              </h2>
              <div className="space-y-4">
                {/* Current Education */}
                {(cvData.education.currentDegree ||
                  cvData.education.level ||
                  cvData.education.universityName ||
                  cvData.education.currentInstitution) && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {cvData.education.currentDegree || cvData.education.level}
                    </h3>
                    <p className="text-gray-600">
                      {cvData.education.universityName ||
                        cvData.education.currentInstitution}
                    </p>
                    {cvData.education.graduationYear && (
                      <p className="text-sm text-gray-500">
                        Año de graduación: {cvData.education.graduationYear}
                      </p>
                    )}
                    {cvData.education.universityStatus && (
                      <p className="text-sm text-gray-500">
                        Estado: {cvData.education.universityStatus}
                      </p>
                    )}
                    {cvData.education.gpa && (
                      <p className="text-sm text-gray-500">
                        GPA: {cvData.education.gpa}
                      </p>
                    )}
                  </div>
                )}

                {/* Education History */}
                {cvData.education.educationHistory &&
                  cvData.education.educationHistory.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Historial Educativo
                      </h4>
                      {cvData.education.educationHistory.map((edu, index) => (
                        <div
                          key={index}
                          className="mb-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <h5 className="font-medium text-gray-800">
                            {edu.degree}
                          </h5>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">
                            {edu.startDate} - {edu.endDate || "En curso"}
                          </p>
                          {edu.status && (
                            <p className="text-sm text-gray-500">
                              Estado: {edu.status}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Academic Achievements */}
                {cvData.education.academicAchievements &&
                  cvData.education.academicAchievements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Logros Académicos
                      </h4>
                      {cvData.education.academicAchievements.map(
                        (achievement, index) => (
                          <div
                            key={index}
                            className="mb-2 p-3 bg-yellow-50 rounded-lg"
                          >
                            <h5 className="font-medium text-gray-800">
                              {achievement.title}
                            </h5>
                            {achievement.date && (
                              <p className="text-sm text-gray-500">
                                {achievement.date}
                              </p>
                            )}
                            {achievement.description && (
                              <p className="text-sm text-gray-600">
                                {achievement.description}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {cvData.workExperience && cvData.workExperience.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experiencia
              </h2>
              <div className="space-y-4">
                {cvData.workExperience.map((exp, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate || "Presente"}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 mt-2 text-sm">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cvData.skills && cvData.skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Habilidades
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cvData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-center font-medium"
                  >
                    {typeof skill === "string" ? skill : (skill as any).name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Proyectos
              </h2>
              <div className="space-y-3">
                {cvData.projects.map((project, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {project.title}
                    </h3>
                    {project.location && (
                      <p className="text-gray-600 text-sm">
                        Ubicación: {project.location}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {project.startDate} - {project.endDate || "En curso"}
                    </p>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Idiomas
              </h2>
              <div className="space-y-2">
                {cvData.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-2 bg-purple-50 rounded"
                  >
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {cvData.socialLinks && cvData.socialLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Enlaces Web
              </h2>
              <div className="space-y-2">
                {cvData.socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-purple-50 rounded"
                  >
                    <span className="font-medium text-gray-800">
                      {link.platform}:
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {cvData.interests && cvData.interests.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Intereses
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {cvData.activities && cvData.activities.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Actividades Extracurriculares
              </h2>
              <div className="space-y-3">
                {cvData.activities.map((activity, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {activity.title}
                    </h3>
                    {activity.organization && (
                      <p className="text-gray-600 text-sm">
                        {activity.organization}
                      </p>
                    )}
                    {activity.description && (
                      <p className="text-gray-600 text-sm">
                        {activity.description}
                      </p>
                    )}
                    {activity.startDate && (
                      <p className="text-sm text-gray-500">
                        {activity.startDate} - {activity.endDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {cvData.achievements && cvData.achievements.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Logros
              </h2>
              <div className="space-y-3">
                {cvData.achievements.map((achievement, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {achievement.title}
                    </h3>
                    {achievement.description && (
                      <p className="text-gray-600 text-sm">
                        {achievement.description}
                      </p>
                    )}
                    {achievement.date && (
                      <p className="text-sm text-gray-500">
                        {achievement.date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Position & Company */}
          {(cvData.targetPosition || cvData.targetCompany) && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Objetivos Profesionales
              </h2>
              <div className="space-y-2">
                {cvData.targetPosition && (
                  <p>
                    <span className="font-medium">Posición objetivo:</span>{" "}
                    {cvData.targetPosition}
                  </p>
                )}
                {cvData.targetCompany && (
                  <p>
                    <span className="font-medium">Empresa objetivo:</span>{" "}
                    {cvData.targetCompany}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Relevant Skills */}
          {cvData.relevantSkills && cvData.relevantSkills.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Habilidades Relevantes
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.relevantSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {typeof skill === "string" ? skill : (skill as any).name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MinimalistHTML({ cvData }: { cvData: CVData }) {
  return (
    <div
      className="bg-white w-full"
      style={{ minWidth: "800px", maxWidth: "1000px", margin: "0 auto" }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-light text-gray-800 mb-2">
            {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {cvData.jobTitle || "Profesional"}
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            {cvData.personalInfo?.email && (
              <span>{cvData.personalInfo.email}</span>
            )}
            {cvData.personalInfo?.phone && (
              <span>{cvData.personalInfo.phone}</span>
            )}
            {cvData.personalInfo?.city && (
              <span>{cvData.personalInfo.city}</span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Professional Summary */}
          {cvData.professionalSummary && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Resumen
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {cvData.professionalSummary}
              </p>
            </div>
          )}

          {/* Education */}
          {cvData.education && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Educación
              </h2>
              <div className="space-y-2">
                {(cvData.education.currentDegree || cvData.education.level) && (
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {cvData.education.currentDegree || cvData.education.level}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {cvData.education.universityName ||
                        cvData.education.currentInstitution}
                    </p>
                    {cvData.education.graduationYear && (
                      <p className="text-gray-500 text-sm">
                        {cvData.education.graduationYear}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {cvData.workExperience && cvData.workExperience.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Experiencia
              </h2>
              <div className="space-y-3">
                {cvData.workExperience.map((exp, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-800">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-gray-600 text-sm">{exp.company}</p>
                    <p className="text-gray-500 text-sm">
                      {exp.startDate} - {exp.endDate || "Presente"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cvData.skills && cvData.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Habilidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-gray-600 border border-gray-300 px-3 py-1 rounded"
                  >
                    {typeof skill === "string" ? skill : (skill as any).name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Idiomas
              </h2>
              <div className="space-y-1">
                {cvData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-800">{lang.name}</span>
                    <span className="text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Proyectos
              </h2>
              <div className="space-y-2">
                {cvData.projects.map((project, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-800">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm">
                        {project.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main CV Template Selector
// PDF Preview Component - Using HTML preview instead of PDFViewer
function PDFPreview({
  selectedTemplate,
  cvData,
}: {
  selectedTemplate: string;
  cvData: CVData;
}) {
  if (!cvData) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <p className="text-gray-600">No hay datos de CV disponibles</p>
      </div>
    );
  }

  // Ensure minimum required data exists
  if (!cvData.personalInfo?.firstName || !cvData.personalInfo?.lastName) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <p className="text-gray-600">
          Por favor, completa al menos tu nombre y apellido para ver la vista
          previa
        </p>
      </div>
    );
  }

  // Render HTML preview based on selected template
  const renderHTMLPreview = () => {
    switch (selectedTemplate) {
      case "modern":
        return <ModernProfessionalHTML cvData={cvData} />;
      case "creative":
        return <CreativePortfolioHTML cvData={cvData} />;
      case "minimalist":
        return <MinimalistHTML cvData={cvData} />;
      default:
        return <ModernProfessionalHTML cvData={cvData} />;
    }
  };

  return (
    <div className="w-full h-[600px] bg-white border rounded-lg overflow-auto">
      {renderHTMLPreview()}
    </div>
  );
}

export function CVTemplateSelector() {
  const { cvData, loading, error } = useCV();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!cvData) return;

    setIsGenerating(true);
    try {
      let pdfComponent;
      switch (selectedTemplate) {
        case "modern":
          pdfComponent = <ModernProfessionalPDF cvData={cvData} />;
          break;
        case "creative":
          pdfComponent = <CreativePortfolioPDF cvData={cvData} />;
          break;
        case "minimalist":
          pdfComponent = <MinimalistPDF cvData={cvData} />;
          break;
        default:
          pdfComponent = <ModernProfessionalPDF cvData={cvData} />;
      }

      const blob = await pdf(pdfComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${cvData.personalInfo?.firstName || "Usuario"}_${cvData.personalInfo?.lastName || "CEMSE"}_${selectedTemplate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!cvData) return;

    setIsGenerating(true);
    try {
      let pdfComponent;
      switch (selectedTemplate) {
        case "modern":
          pdfComponent = <ModernProfessionalPDF cvData={cvData} />;
          break;
        case "creative":
          pdfComponent = <CreativePortfolioPDF cvData={cvData} />;
          break;
        case "minimalist":
          pdfComponent = <MinimalistPDF cvData={cvData} />;
          break;
        default:
          pdfComponent = <ModernProfessionalPDF cvData={cvData} />;
      }

      const blob = await pdf(pdfComponent).toBlob();
      const url = URL.createObjectURL(blob);

      // Open in new window for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF for printing:", error);
      alert("Error al preparar la impresión. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando CV...</p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !cvData ||
    !cvData.personalInfo?.firstName ||
    !cvData.personalInfo?.lastName
  ) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-4">
            <User className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Completa tu información
          </h3>
          <p className="text-yellow-700 mb-3">
            Para generar tu CV necesitamos al menos tu nombre y apellido.
          </p>
          <p className="text-yellow-600 text-sm">
            Ve a la pestaña "Editar Datos" para completar tu información
            personal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Seleccionar Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modern">Profesional Moderno</TabsTrigger>
              <TabsTrigger value="creative">Portfolio Creativo</TabsTrigger>
              <TabsTrigger value="minimalist">Minimalista</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* CV Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vista Previa del CV</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                data-cv-print
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Preparando..." : "Imprimir"}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                data-cv-download
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Generando..." : "Descargar PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <PDFPreview selectedTemplate={selectedTemplate} cvData={cvData} />
        </CardContent>
      </Card>

      {/* Enhanced Print Styles for CV Templates */}
      <style jsx global>{`
        @media print {
          /* Hide non-essential elements when printing */
          .no-print,
          button:not([data-cv-print]),
          [role="tablist"],
          .card-header,
          .print\\:hidden {
            display: none !important;
          }

          /* Ensure CV template takes full page */
          body.cv-printing .cv-template,
          body.cv-printing .print-content,
          body.cv-printing [class*="Template"] {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20pt !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Page settings */
          @page {
            margin: 1.5cm;
            size: A4;
          }

          /* Typography for print */
          body.cv-printing {
            font-size: 10pt !important;
            line-height: 1.3 !important;
            color: #000 !important;
          }

          /* Headers and sections */
          body.cv-printing h1 {
            font-size: 18pt !important;
            font-weight: bold !important;
            margin-bottom: 8pt !important;
            page-break-after: avoid;
          }

          body.cv-printing h2,
          body.cv-printing h3 {
            font-size: 12pt !important;
            font-weight: bold !important;
            margin-bottom: 6pt !important;
            page-break-after: avoid;
          }

          /* Grid layouts */
          body.cv-printing .grid {
            display: grid !important;
          }

          body.cv-printing .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }

          body.cv-printing .grid-cols-3 {
            grid-template-columns: 1fr 2fr 1fr !important;
          }

          body.cv-printing .lg\\:grid-cols-3 {
            grid-template-columns: 1fr 2fr !important;
          }

          /* Spacing */
          body.cv-printing .space-y-4 > * + * {
            margin-top: 8pt !important;
          }

          body.cv-printing .space-y-6 > * + * {
            margin-top: 12pt !important;
          }

          /* Colors and backgrounds */
          body.cv-printing .bg-gradient-to-r {
            background: #1e40af !important;
            color: white !important;
          }

          body.cv-printing .text-blue-800 {
            color: #1e40af !important;
          }

          /* Remove overflow issues */
          body.cv-printing * {
            overflow: visible !important;
          }

          /* Ensure content is visible */
          body.cv-printing .overflow-x-auto {
            overflow: visible !important;
          }

          /* Card content */
          body.cv-printing .card-content {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
