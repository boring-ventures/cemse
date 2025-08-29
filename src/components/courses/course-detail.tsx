"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Star,
  // Play,
  Target,
  FileText,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Course } from "@/types/api";
import {
  getCourseThumbnail,
  isYouTubeVideo,
  getYouTubeThumbnail,
} from "@/lib/utils/image-utils";
import { VideoPreview } from "./video-preview";

interface CourseDetailProps {
  course: Course;
  onEnroll?: () => void;
  onStartLearning?: () => void;
  enrollment?: {
    isEnrolled: boolean;
    progress?: number;
    status?: string;
  };
  enrolling?: boolean;
}

export const CourseDetail = ({
  course,
  onEnroll,
  onStartLearning,
  enrollment,
  enrolling = false,
}: CourseDetailProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc] = useState(() => {
    if (course.videoPreview && isYouTubeVideo(course.videoPreview)) {
      return getYouTubeThumbnail(course.videoPreview);
    }
    return getCourseThumbnail(course);
  });

  // Debug logs
  console.log("🔍 CourseDetail - course data:", course);
  console.log("🔍 CourseDetail - studentsCount:", course.studentsCount);
  console.log("🔍 CourseDetail - totalLessons:", course.totalLessons);
  console.log("🔍 CourseDetail - totalQuizzes:", course.totalQuizzes);
  console.log("🔍 CourseDetail - totalResources:", course.totalResources);
  console.log("🔍 CourseDetail - completionRate:", course.completionRate);
  console.log("🔍 CourseDetail - rating:", course.rating);

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice === 0) return "Gratis";
    return `$${numPrice.toLocaleString()} BOB`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      SOFT_SKILLS: "Habilidades Blandas",
      BASIC_COMPETENCIES: "Competencias Básicas",
      JOB_PLACEMENT: "Inserción Laboral",
      ENTREPRENEURSHIP: "Emprendimiento",
      TECHNICAL_SKILLS: "Habilidades Técnicas",
      DIGITAL_LITERACY: "Alfabetización Digital",
      COMMUNICATION: "Comunicación",
      LEADERSHIP: "Liderazgo",
    };
    return labels[category] || category;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      BEGINNER: "bg-green-100 text-green-800",
      INTERMEDIATE: "bg-yellow-100 text-yellow-800",
      ADVANCED: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzado",
    };
    return labels[level] || level;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Course Image and Video */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {!imageError ? (
              <Image
                src={currentImageSrc}
                alt={course.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-blue-600" />
              </div>
            )}

            {/* Video Preview Overlay */}
            {course.videoPreview && (
              <VideoPreview
                videoUrl={course.videoPreview}
                title={course.title}
                className="absolute inset-0 opacity-100"
              />
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={getLevelColor(course.level)}>
                {getLevelLabel(course.level)}
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(course.category)}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">
              {course.shortDescription}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.studentsCount} estudiantes</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price and Enrollment */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPrice(course.price)}
            </div>

            {enrollment?.isEnrolled ? (
              <div className="space-y-2">
                <Button className="w-full" onClick={onStartLearning}>
                  {enrollment.progress && enrollment.progress > 0
                    ? "Continuar Aprendiendo"
                    : "Comenzar Curso"}
                </Button>
                {enrollment.status === "COMPLETED" && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Curso Completado
                  </Badge>
                )}
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={onEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Inscribiendo..." : "Inscribirse al Curso"}
              </Button>
            )}
          </div>

          {/* Progress Section (for enrolled users) */}
          {enrollment?.isEnrolled && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Tu Progreso
                  </span>
                </div>
                <Progress value={enrollment.progress || 0} className="mb-2" />
                <div className="flex justify-between text-xs text-green-600">
                  <span>{enrollment.progress || 0}% completado</span>
                  <span className="capitalize">
                    {enrollment.status?.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{course.totalLessons}</div>
                  <div className="text-muted-foreground">Lecciones</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{course.totalQuizzes}</div>
                  <div className="text-muted-foreground">Evaluaciones</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {course.totalResources}
                  </div>
                  <div className="text-muted-foreground">Recursos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {course.completionRate}%
                  </div>
                  <div className="text-muted-foreground">
                    Tasa de Finalización
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Objectives */}
          {course.objectives && course.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prerrequisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span>{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Included Materials */}
          {course.includedMaterials && course.includedMaterials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Material Incluido</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.includedMaterials.map((material, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{material}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certification */}
          {course.certification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Al completar este curso recibirás un certificado de
                  finalización.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
