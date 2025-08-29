const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCourses() {
  console.log('🌱 Seeding courses...');

  try {
    // Get or create a user to be the instructor
    let instructor = await prisma.profile.findFirst({
      where: { role: 'YOUTH' }
    });

    if (!instructor) {
      // Create a test instructor profile
      const testUser = await prisma.user.create({
        data: {
          username: 'instructor_test',
          password: '$2b$10$test', // bcrypt hash for 'password123'
          role: 'YOUTH',
          isActive: true,
        }
      });

      instructor = await prisma.profile.create({
        data: {
          userId: testUser.id,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'instructor@cemse.org',
          jobTitle: 'Instructor Senior',
          role: 'YOUTH',
        }
      });
    }

    // Create test courses
    const courses = [
      {
        title: 'Introducción al Emprendimiento',
        slug: 'introduccion-emprendimiento',
        description: 'Aprende los fundamentos del emprendimiento y cómo desarrollar tu idea de negocio desde cero.',
        shortDescription: 'Fundamentos del emprendimiento para jóvenes',
        thumbnail: '/images/emprendimiento-course.jpg',
        objectives: [
          'Comprender los conceptos básicos del emprendimiento',
          'Identificar oportunidades de negocio',
          'Desarrollar un plan de negocio básico'
        ],
        prerequisites: ['Motivación para aprender', 'Ganas de emprender'],
        duration: 240, // 4 horas
        level: 'BEGINNER',
        category: 'ENTREPRENEURSHIP',
        isMandatory: true,
        isActive: true,
        price: 0,
        rating: 4.5,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 8,
        totalQuizzes: 2,
        totalResources: 5,
        tags: ['emprendimiento', 'negocio', 'startup'],
        certification: true,
        includedMaterials: ['Videos explicativos', 'Plantillas de negocio', 'Certificado'],
        instructorId: instructor.userId,
        institutionName: 'CEMSE',
        publishedAt: new Date(),
      },
      {
        title: 'Habilidades Blandas para el Trabajo',
        slug: 'habilidades-blandas-trabajo',
        description: 'Desarrolla las habilidades interpersonales esenciales para el éxito profesional.',
        shortDescription: 'Comunicación, liderazgo y trabajo en equipo',
        thumbnail: '/images/soft-skills-course.jpg',
        objectives: [
          'Mejorar la comunicación efectiva',
          'Desarrollar habilidades de liderazgo',
          'Fortalecer el trabajo en equipo'
        ],
        prerequisites: [],
        duration: 180, // 3 horas
        level: 'BEGINNER',
        category: 'SOFT_SKILLS',
        isMandatory: true,
        isActive: true,
        price: 0,
        rating: 4.3,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 6,
        totalQuizzes: 1,
        totalResources: 3,
        tags: ['comunicación', 'liderazgo', 'trabajo en equipo'],
        certification: true,
        includedMaterials: ['Videos interactivos', 'Ejercicios prácticos', 'Certificado'],
        instructorId: instructor.userId,
        institutionName: 'CEMSE',
        publishedAt: new Date(),
      },
      {
        title: 'Competencias Digitales Básicas',
        slug: 'competencias-digitales-basicas',
        description: 'Domina las herramientas digitales esenciales para el mundo laboral actual.',
        shortDescription: 'Office, internet y herramientas digitales',
        thumbnail: '/images/digital-skills-course.jpg',
        objectives: [
          'Manejar Microsoft Office con soltura',
          'Navegar internet de forma segura',
          'Usar herramientas de comunicación digital'
        ],
        prerequisites: ['Conocimientos básicos de computación'],
        duration: 300, // 5 horas
        level: 'BEGINNER',
        category: 'DIGITAL_LITERACY',
        isMandatory: false,
        isActive: true,
        price: 0,
        rating: 4.7,
        studentsCount: 0,
        completionRate: 0,
        totalLessons: 10,
        totalQuizzes: 3,
        totalResources: 8,
        tags: ['office', 'internet', 'digital', 'computación'],
        certification: true,
        includedMaterials: ['Tutoriales paso a paso', 'Archivos de práctica', 'Certificado'],
        instructorId: instructor.userId,
        institutionName: 'CEMSE',
        publishedAt: new Date(),
      }
    ];

    for (const courseData of courses) {
      const existingCourse = await prisma.course.findUnique({
        where: { slug: courseData.slug }
      });

      if (!existingCourse) {
        const course = await prisma.course.create({
          data: courseData
        });

        // Create some modules for each course
        await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: 'Introducción',
            description: 'Módulo introductorio del curso',
            orderIndex: 1,
            estimatedDuration: 60,
            isLocked: false,
            prerequisites: [],
            hasCertificate: false,
          }
        });

        await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: 'Contenido Principal',
            description: 'Módulo principal con el contenido del curso',
            orderIndex: 2,
            estimatedDuration: 120,
            isLocked: false,
            prerequisites: [],
            hasCertificate: true,
          }
        });

        console.log(`✅ Created course: ${course.title}`);
      } else {
        console.log(`⏭️  Course already exists: ${courseData.title}`);
      }
    }

    console.log('🎉 Courses seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCourses()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
