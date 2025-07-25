"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  Play,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface CourseCardProps {
  course: Course;
  viewMode?: "grid" | "list";
  enrollment?: {
    isEnrolled: boolean;
    progress?: number;
    status?: string;
  };
}

export const CourseCard = ({
  course,
  viewMode = "grid",
  enrollment,
}: CourseCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return `$${price.toLocaleString()} BOB`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      soft_skills: "Habilidades Blandas",
      basic_competencies: "Competencias Básicas",
      job_placement: "Inserción Laboral",
      entrepreneurship: "Emprendimiento",
      technical_skills: "Habilidades Técnicas",
      digital_literacy: "Alfabetización Digital",
      communication: "Comunicación",
      leadership: "Liderazgo",
    };
    return labels[category] || category;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
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
              <Link href={`/courses/${course.id}`}>
                {!imageError ? (
                  <Image
                    src={course.thumbnail}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-opacity">
                      <Play className="h-6 w-6 text-white fill-current" />
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

                  <Link href={`/courses/${course.id}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  {/* Instructor */}
                  {/* <div className="flex items-center gap-3 mb-4">
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
                  </div> */}
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatPrice(course.price)}
                  </div>
                  {enrollment?.isEnrolled && (
                    <Badge variant="secondary" className="mb-2">
                      {enrollment.status === "completed"
                        ? "Completado"
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
                    {course.studentCount.toLocaleString()} estudiantes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalLessons} lecciones</span>
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
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{course.tags.length - 3} más
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {enrollment?.isEnrolled ? (
                  <Button asChild className="flex-1">
                    <Link href={`/courses/${course.id}/learn`}>
                      {enrollment.status === "completed"
                        ? "Revisar curso"
                        : "Continuar"}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="flex-1">
                    <Link href={`/courses/${course.id}`}>Ver curso</Link>
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
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <Link href={`/courses/${course.id}`}>
          {!imageError ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              width={400}
              height={250}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          )}
          {course.videoPreview && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black bg-opacity-50 rounded-full p-3">
                <Play className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {course.isMandatory && (
            <Badge className="bg-red-500 hover:bg-red-600 text-xs">
              Obligatorio
            </Badge>
          )}
          {course.price === 0 && (
            <Badge className="bg-green-500 hover:bg-green-600 text-xs">
              Gratis
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-md shadow-md">
          <span className="font-bold text-blue-600">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className={`text-xs ${getLevelColor(course.level)}`}
          >
            {getLevelLabel(course.level)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(course.category)}
          </Badge>
        </div>

        <Link href={`/courses/${course.id}`}>
          <h3 className="font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Instructor */}
        {/* <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.instructor.avatar} />
            <AvatarFallback className="text-xs">
              {course.instructor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {course.instructor.name}
          </span>
        </div> */}

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
          {/* <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div> */}
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{course.studentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          {/* {course.certification && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
            </div>
          )} */}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {course.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{course.tags.length - 2}
            </span>
          )}
        </div>

        {/* Action Button */}
        {enrollment?.isEnrolled ? (
          <Button asChild className="w-full" size="sm">
            <Link href={`/courses/${course.id}/learn`}>
              {enrollment.status === "completed" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completado
                </>
              ) : (
                "Continuar"
              )}
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" size="sm">
            <Link href={`/courses/${course.id}`}>Ver curso</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
