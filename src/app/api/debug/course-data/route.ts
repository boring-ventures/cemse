import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole, CourseLevel, CourseCategory } from "@prisma/client";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Checking course data...");
    
    // Check if we have any courses with modules and lessons
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                resources: true,
                quizzes: {
                  include: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
        enrollments: {
          take: 5,
          include: {
            student: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    console.log(`🔍 Found ${courses.length} courses in database`);
    
    const coursesWithContent = courses.filter(course => 
      course.modules.length > 0 && 
      course.modules.some(module => module.lessons.length > 0)
    );
    
    console.log(`🔍 Found ${coursesWithContent.length} courses with actual content`);

    return NextResponse.json({
      totalCourses: courses.length,
      coursesWithContent: coursesWithContent.length,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        isActive: course.isActive,
        isPublished: course.isPublished,
        modulesCount: course.modules.length,
        lessonsCount: course.modules.reduce((acc, module) => acc + module.lessons.length, 0),
        enrollmentsCount: course.enrollments.length,
        modules: course.modules.map(module => ({
          id: module.id,
          title: module.title,
          lessonsCount: module.lessons.length,
          lessons: module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            contentType: lesson.contentType,
            hasVideoUrl: !!lesson.videoUrl,
            hasContent: !!lesson.content,
            duration: lesson.duration,
            resourcesCount: lesson.resources.length,
            quizzesCount: lesson.quizzes.length,
          })),
        })),
        enrollments: course.enrollments.map(enrollment => ({
          id: enrollment.id,
          studentUsername: enrollment.student.username,
          progress: enrollment.progress,
          status: enrollment.status,
        })),
      })),
    });
  } catch (error) {
    console.error("❌ Error checking course data:", error);
    return NextResponse.json(
      { 
        error: "Failed to check course data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Debug: Creating sample course data...");
    
    // Create instructor user if doesn't exist
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    let instructor = await prisma.user.findFirst({
      where: { role: UserRole.INSTRUCTOR },
    });
    
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          username: "instructor_demo",
          password: hashedPassword,
          role: UserRole.INSTRUCTOR,
          isActive: true,
        },
      });
    }

    // Create a sample course with modules and lessons
    const course = await prisma.course.create({
      data: {
        title: "React para Principiantes - Demo",
        slug: "react-principiantes-demo",
        description: "Aprende React desde cero con este curso completo y práctico.",
        shortDescription: "Curso completo de React desde cero hasta nivel intermedio.",
        category: CourseCategory.TECHNOLOGY,
        level: CourseLevel.BEGINNER,
        duration: 40,
        price: 0,
        currency: "BOB",
        thumbnail: "react-course.jpg",
        instructorId: instructor.id,
        isPublished: true,
        isActive: true,
        requirements: [
          "Conocimientos básicos de HTML y CSS",
          "JavaScript básico",
          "Computadora con acceso a internet",
        ],
        objectives: [
          "Dominar los fundamentos de React",
          "Crear aplicaciones web modernas",
          "Manejar estado y props",
          "Implementar componentes reutilizables",
        ],
        enrollmentCount: 0,
        rating: 4.5,
        totalRatings: 10,
      },
    });

    // Create modules
    const modules = [];
    for (let i = 0; i < 3; i++) {
      const module = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: `Módulo ${i + 1}: ${i === 0 ? 'Introducción a React' : i === 1 ? 'Componentes y Props' : 'Estado y Eventos'}`,
          description: `Contenido del módulo ${i + 1} sobre React`,
          orderIndex: i,
          duration: 12,
          isPublished: true,
        },
      });
      modules.push(module);

      // Create lessons for each module
      for (let j = 0; j < 4; j++) {
        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: `Lección ${j + 1}: ${
              i === 0 && j === 0 ? 'Qué es React' :
              i === 0 && j === 1 ? 'Instalación y Setup' :
              i === 0 && j === 2 ? 'Tu primer componente' :
              i === 0 && j === 3 ? 'JSX Básico' :
              i === 1 && j === 0 ? 'Componentes Funcionales' :
              i === 1 && j === 1 ? 'Props y su uso' :
              i === 1 && j === 2 ? 'Composición de componentes' :
              i === 1 && j === 3 ? 'Ejercicio práctico' :
              i === 2 && j === 0 ? 'useState Hook' :
              i === 2 && j === 1 ? 'Manejo de eventos' :
              i === 2 && j === 2 ? 'useEffect Hook' :
              'Proyecto final'
            }`,
            description: `Contenido detallado de la lección ${j + 1} del módulo ${i + 1}`,
            content: `
# Lección ${j + 1}: ${
  i === 0 && j === 0 ? 'Qué es React' :
  i === 0 && j === 1 ? 'Instalación y Setup' :
  'Contenido de la lección'
}

## Introducción

En esta lección aprenderás conceptos fundamentales que te ayudarán a dominar React.

## Objetivos de la lección

- Comprender los conceptos básicos
- Aplicar lo aprendido en ejemplos prácticos
- Prepararte para el siguiente nivel

## Contenido principal

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Ejemplo de código

\`\`\`javascript
import React from 'react';

function MiComponente() {
  return (
    <div>
      <h1>¡Hola, React!</h1>
      <p>Este es mi primer componente.</p>
    </div>
  );
}

export default MiComponente;
\`\`\`

## Ejercicio práctico

Intenta crear tu propio componente siguiendo el ejemplo anterior.

## Resumen

En esta lección hemos cubierto los conceptos básicos que necesitas conocer para continuar con el curso.
            `,
            contentType: j % 2 === 0 ? "VIDEO" : "TEXT",
            videoUrl: j % 2 === 0 ? "https://www.youtube.com/watch?v=dGcsHMXbSOA" : null,
            duration: 15,
            orderIndex: j,
            isPublished: true,
            isPreview: i === 0 && j === 0, // First lesson is preview
            isRequired: true,
          },
        });
      }
    }

    console.log("✅ Created sample course with modules and lessons");

    // Now create a sample enrollment for testing
    const youthUser = await prisma.user.findFirst({
      where: { role: UserRole.YOUTH },
    });

    if (youthUser) {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          courseId: course.id,
          studentId: youthUser.id,
          enrolledAt: new Date(),
          progress: 0,
          status: "ENROLLED",
          timeSpent: 0,
        },
      });

      console.log("✅ Created sample enrollment:", enrollment.id);
    }

    return NextResponse.json({
      success: true,
      message: "Sample course data created successfully",
      course: {
        id: course.id,
        title: course.title,
        modulesCount: modules.length,
        lessonsCount: modules.length * 4,
      },
    });
  } catch (error) {
    console.error("❌ Error creating sample course data:", error);
    return NextResponse.json(
      {
        error: "Failed to create sample course data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
