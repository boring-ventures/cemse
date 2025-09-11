"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  Play,
  CheckCircle,
} from "lucide-react";
import {
  getCourseThumbnail,
  isYouTubeVideo,
  getYouTubeThumbnail,
} from "@/lib/utils/image-utils";
import { getCourseUrl, getCourseLearnUrl } from "@/lib/utils/url-utils";

interface CourseCardProps {
  course: Course;
  viewMode?: "grid" | "list";
  enrollment?: {
    isEnrolled: boolean;
    progress?: number;
    status?: string;
    enrollmentId?: string;
  };
}

export const CourseCard = ({
  course,
  viewMode = "grid",
  enrollment,
}: CourseCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc] = useState(() => {
    // If course has a YouTube video preview, use its thumbnail
    if (course.videoPreview && isYouTubeVideo(course.videoPreview)) {
      console.log("Using YouTube thumbnail for course:", course.title);
      return getYouTubeThumbnail(course.videoPreview);
    }
    // Otherwise use the course thumbnail
    console.log("Using course thumbnail for course:", course.title);
    return getCourseThumbnail(course);
  });

  const formatDuration = (hours: number) => {
    if (!hours || isNaN(hours)) return "0 min";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return "Gratis";
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

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Course Image */}
            <div className="relative lg:w-80 h-48 lg:h-auto">
              <Link href={getCourseUrl(course.id)}>
                {!imageError ? (
                  <Image
                    src={currentImageSrc}
                    alt={course.title}
                    fill
                    className="object-cover rounded-l-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center rounded-l-lg">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                )}
                {course.videoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-200 cursor-pointer">
                    <div className="bg-white bg-opacity-30 rounded-full p-4 backdrop-blur-sm border-2 border-white border-opacity-50 shadow-lg">
                      <Play className="h-12 w-12 text-white fill-current" />
                    </div>
                  </div>
                )}
              </Link>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {course.isMandatory && (
                  <Badge className="bg-red-500 hover:bg-red-600">
                    Obligatorio
                  </Badge>
                )}
                {course.price === 0 && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Gratis
                  </Badge>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={getLevelColor(course.level)}
                    >
                      {getLevelLabel(course.level)}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryLabel(course.category)}
                    </Badge>
                  </div>

                  <Link href={getCourseUrl(course.id)}>
                    <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  {/* Instructor */}
                  {course.instructor && (
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={course.instructor.avatar} />
                        <AvatarFallback>
                          {course.instructor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {course.instructor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.instructor.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatPrice(course.price)}
                  </div>
                  {enrollment?.isEnrolled && (
                    <Badge variant="secondary" className="mb-2">
                      {enrollment.status === "COMPLETED"
                        ? "Completado"
                        : enrollment.status === "IN_PROGRESS"
                          ? "En Progreso"
                          : "Inscrito"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar (if enrolled) */}
              {enrollment?.isEnrolled && enrollment.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso del curso</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
              )}

              {/* Course Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {(
                      (course.studentCount ?? course.enrollmentCount ?? 0) ||
                      0
                    ).toLocaleString()}{" "}
                    estudiantes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.modules?.length ?? 0} módulos</span>
                </div>
                {course.certification && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>Certificado</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags && course.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{course.tags.length - 3} más
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {enrollment?.isEnrolled ? (
                  <Button asChild className="flex-1">
                    <Link
                      href={getCourseLearnUrl(
                        enrollment.enrollmentId || course.id
                      )}
                    >
                      {enrollment.status === "COMPLETED" ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ver Certificado
                        </>
                      ) : enrollment.status === "IN_PROGRESS" ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Ir al Curso
                        </>
                      )}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="flex-1">
                    <Link href={getCourseUrl(course.id)} prefetch={false}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver curso
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      <div className="relative">
        <Link href={getCourseUrl(course.id)}>
          {!imageError ? (
            <Image
              src={currentImageSrc}
              alt={course.title}
              width={400}
              height={200}
              className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-32 sm:h-36 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
          )}
          {course.videoPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-200 cursor-pointer">
              <div className="bg-white bg-opacity-30 rounded-full p-3 backdrop-blur-sm border-2 border-white border-opacity-50 shadow-lg">
                <Play className="h-8 w-8 text-white fill-current" />
              </div>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {course.isMandatory && (
            <Badge className="bg-red-500 hover:bg-red-600 text-xs px-1.5 py-0.5">
              Obligatorio
            </Badge>
          )}
          {course.price === 0 && (
            <Badge className="bg-green-500 hover:bg-green-600 text-xs px-1.5 py-0.5">
              Gratis
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-md shadow-md">
          <span className="font-bold text-blue-600 text-xs sm:text-sm">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          <Badge
            variant="outline"
            className={`text-xs px-1.5 py-0.5 ${getLevelColor(course.level)}`}
          >
            {getLevelLabel(course.level)}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs px-1.5 py-0.5 hidden sm:inline-flex"
          >
            {getCategoryLabel(course.category)}
          </Badge>
        </div>

        <Link href={getCourseUrl(course.id)}>
          <h3 className="font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2 text-sm sm:text-base">
            {course.title}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {course.shortDescription}
        </p>

        {/* Progress Bar (if enrolled) */}
        {enrollment?.isEnrolled && enrollment.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progreso</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-1.5" />
          </div>
        )}

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">
              {course.studentCount ?? course.enrollmentCount ?? 0}
            </span>
            <span className="sm:hidden">
              {(course.studentCount ?? course.enrollmentCount ?? 0) > 999
                ? "999+"
                : (course.studentCount ?? course.enrollmentCount ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>

        {/* Tags - Only show on larger screens */}
        <div className="hidden sm:flex flex-wrap gap-1 mb-3">
          {course.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {course.tags && course.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{course.tags.length - 2}
            </span>
          )}
        </div>

        {/* Action Button */}
        {enrollment?.isEnrolled ? (
          <Button asChild className="w-full" size="sm" className="mt-auto">
            <Link
              href={getCourseLearnUrl(enrollment.enrollmentId || course.id)}
            >
              {enrollment.status === "COMPLETED" ? (
                <>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Ver Certificado</span>
                </>
              ) : enrollment.status === "IN_PROGRESS" ? (
                <>
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Continuar</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Ir al Curso</span>
                </>
              )}
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" size="sm" className="mt-auto">
            <Link href={getCourseUrl(course.id)} prefetch={false}>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Ver curso</span>
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
