import { PrismaClient, UserRole, EducationLevel, JobStatus, ApplicationStatus, ContractType, ExperienceLevel, WorkModality, CourseLevel, CourseCategory, YouthApplicationStatus, CompanyInterestStatus, MessageType, MessageStatus, YouthMessageSenderType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random number
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick random items from array
function pickRandom<T>(array: T[], count: number = 1): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Lists of realistic data
const firstNames = ['María', 'Juan', 'Ana', 'Carlos', 'Laura', 'Diego', 'Sofia', 'Luis', 'Valentina', 'Miguel', 'Isabella', 'Alejandro', 'Camila', 'Fernando', 'Daniela', 'Ricardo', 'Paula', 'Gabriel', 'Andrea', 'Roberto'];
const lastNames = ['Rodriguez', 'González', 'Martínez', 'López', 'Sánchez', 'Pérez', 'García', 'Fernández', 'Torres', 'Flores', 'Rivera', 'Mendoza', 'Vargas', 'Castro', 'Ortiz', 'Silva', 'Rojas', 'Morales', 'Jiménez', 'Herrera'];
const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Marketing Digital', 'Diseño Gráfico', 'Excel Avanzado', 'Inglés Avanzado', 'Gestión de Proyectos', 'Comunicación', 'Trabajo en Equipo', 'Liderazgo'];
const interests = ['Tecnología', 'Emprendimiento', 'Sostenibilidad', 'Educación', 'Salud', 'Arte y Cultura', 'Deportes', 'Ciencias', 'Innovación Social', 'Desarrollo Comunitario', 'Medio Ambiente', 'Finanzas', 'Turismo', 'Agricultura', 'Energías Renovables'];
const municipalities = ['Cochabamba', 'Santa Cruz', 'La Paz', 'Sacaba', 'Quillacollo', 'El Alto', 'Oruro', 'Tarija', 'Potosí', 'Sucre'];
const universities = ['Universidad Mayor de San Simón', 'Universidad Privada Boliviana', 'Universidad Católica Boliviana', 'Universidad Central', 'Universidad del Valle', 'UNIFRANZ', 'Universidad Técnica de Oruro', 'Universidad Autónoma Gabriel René Moreno'];
const degrees = ['Ingeniería de Sistemas', 'Administración de Empresas', 'Ingeniería Industrial', 'Contabilidad', 'Medicina', 'Derecho', 'Psicología', 'Arquitectura', 'Marketing', 'Comunicación Social', 'Ingeniería Civil', 'Economía'];
const companyNames = ['TechStart Bolivia', 'InnovaLab SRL', 'Digital Solutions SA', 'CodeCraft Bolivia', 'StartupHub CB', 'TechForward Solutions', 'ByteWise Systems', 'CloudNative Bolivia', 'DataDriven SA', 'SmartDev Bolivia'];

interface YouthProfileData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date;
  educationLevel: EducationLevel;
  skills: string[];
  interests: string[];
  municipality: string;
  currentDegree?: string;
  universityName?: string;
  universityStartDate?: Date;
  universityStatus?: string;
  gpa?: number;
  workExperience?: any;
}

async function main() {
  console.log('🌱 Starting enhanced database seed for YOUTH users...');

  try {
    // Create realistic YOUTH profiles
    const youthProfiles: YouthProfileData[] = [];
    
    for (let i = 0; i < 25; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = `${lastNames[i % lastNames.length]} ${lastNames[(i + 5) % lastNames.length]}`;
      const username = `${firstName.toLowerCase()}_${lastName.split(' ')[0].toLowerCase()}${randomInt(1, 99)}`;
      const birthYear = randomInt(1998, 2006);
      
      youthProfiles.push({
        username,
        firstName,
        lastName,
        email: `${username}@email.com`,
        phone: `+591 ${randomInt(60000000, 79999999)}`,
        birthDate: new Date(birthYear, randomInt(0, 11), randomInt(1, 28)),
        educationLevel: pickRandom([EducationLevel.SECONDARY, EducationLevel.TECHNICAL, EducationLevel.UNIVERSITY])[0],
        skills: pickRandom(skills, randomInt(3, 8)),
        interests: pickRandom(interests, randomInt(2, 5)),
        municipality: pickRandom(municipalities)[0],
        currentDegree: pickRandom(degrees)[0],
        universityName: pickRandom(universities)[0],
        universityStartDate: new Date(2020 + randomInt(0, 3), randomInt(0, 1) * 6, 1),
        universityStatus: pickRandom(['en_curso', 'graduado', 'pausado'])[0],
        gpa: Math.round((3 + Math.random() * 1.5) * 100) / 100,
        workExperience: i % 3 === 0 ? {
          positions: [{
            title: pickRandom(['Pasante', 'Asistente', 'Junior Developer', 'Auxiliar'])[0],
            company: pickRandom(companyNames)[0],
            startDate: new Date(2023, randomInt(0, 11), 1).toISOString(),
            endDate: i % 2 === 0 ? new Date(2024, randomInt(0, 11), 1).toISOString() : null,
            current: i % 2 === 1,
            description: 'Apoyo en diversas tareas relacionadas con el área de tecnología y desarrollo.'
          }]
        } : null
      });
    }

    // Create YOUTH users and profiles
    const createdYouthUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const profileData of youthProfiles) {
      const user = await prisma.user.create({
        data: {
          username: profileData.username,
          password: hashedPassword,
          role: UserRole.YOUTH,
          isActive: true,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          birthDate: profileData.birthDate,
          gender: randomInt(0, 1) === 0 ? 'Masculino' : 'Femenino',
          documentType: 'CI',
          documentNumber: `${randomInt(1000000, 9999999)}`,
          educationLevel: profileData.educationLevel,
          currentInstitution: profileData.universityName,
          currentDegree: profileData.currentDegree,
          universityName: profileData.universityName,
          universityStartDate: profileData.universityStartDate,
          universityStatus: profileData.universityStatus,
          gpa: profileData.gpa,
          skills: profileData.skills,
          interests: profileData.interests,
          municipality: profileData.municipality,
          department: 'Cochabamba',
          country: 'Bolivia',
          address: `Calle ${randomInt(1, 50)} #${randomInt(100, 999)}`,
          workExperience: profileData.workExperience,
          profileCompletion: randomInt(60, 95),
          role: UserRole.YOUTH,
          status: 'ACTIVE',
          active: true,
          jobTitle: profileData.workExperience ? profileData.workExperience.positions[0].title : null,
          academicAchievements: randomInt(0, 2) === 0 ? {
            achievements: [
              'Mejor promedio de la carrera',
              'Participación en olimpiadas de programación',
              'Proyecto destacado en feria tecnológica'
            ].slice(0, randomInt(1, 3))
          } : null,
          languages: {
            languages: [
              { language: 'Español', level: 'Nativo' },
              { language: 'Inglés', level: pickRandom(['Básico', 'Intermedio', 'Avanzado'])[0] },
            ]
          },
          extracurricularActivities: {
            activities: [
              'Voluntariado en fundación educativa',
              'Miembro del club de robótica',
              'Organizador de eventos tecnológicos universitarios'
            ].slice(0, randomInt(0, 3))
          },
        },
      });

      createdYouthUsers.push({ user, profile });
    }

    console.log(`✅ Created ${createdYouthUsers.length} YOUTH users with complete profiles`);

    // Create sample companies for interactions
    const companies = [];
    for (let i = 0; i < 10; i++) {
      const companyName = companyNames[i];
      const companyUser = await prisma.user.create({
        data: {
          username: companyName.toLowerCase().replace(/\s+/g, '_'),
          password: hashedPassword,
          role: UserRole.COMPANIES,
          isActive: true,
        },
      });

      const company = await prisma.company.create({
        data: {
          userId: companyUser.id,
          name: companyName,
          taxId: `NIT${randomInt(1000000, 9999999)}`,
          email: `rrhh@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `+591 ${randomInt(3, 4)}${randomInt(1000000, 9999999)}`,
          website: `www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `${companyName} es una empresa líder en soluciones tecnológicas y desarrollo de software en Bolivia.`,
          industry: pickRandom(['Tecnología', 'Software', 'Consultoría IT', 'Desarrollo Web'])[0],
          size: pickRandom(['1-10', '11-50', '51-200', '200+'])[0],
          foundedYear: randomInt(2010, 2023),
          logo: null,
          isVerified: true,
          isActive: true,
          address: `Av. Tecnológica ${randomInt(100, 999)}, ${pickRandom(municipalities)[0]}`,
          city: pickRandom(municipalities)[0],
          country: 'Bolivia',
        },
      });

      companies.push(company);
    }

    console.log(`✅ Created ${companies.length} companies`);

    // Create Youth Applications with realistic content
    const youthApplications = [];
    for (let i = 0; i < Math.min(15, createdYouthUsers.length); i++) {
      const youth = createdYouthUsers[i];
      const applicationTitles = [
        'Desarrollador Frontend Junior - Buscando Primera Oportunidad',
        'Estudiante de Ingeniería de Sistemas - Disponible para Pasantías',
        'Recién Graduado en Administración - Área de Marketing Digital',
        'Desarrollador Full Stack en Formación - Proyectos Freelance',
        'Diseñador UI/UX Junior - Portfolio Disponible',
        'Analista de Datos Junior - Python y SQL',
        'Community Manager - Experiencia en Redes Sociales',
        'Asistente Administrativo - Manejo Avanzado de Office',
        'Desarrollador Mobile - React Native',
        'QA Tester Junior - Certificación ISTQB en Proceso'
      ];

      const applicationDescriptions = [
        'Estudiante apasionado por la tecnología con conocimientos en React, TypeScript y Node.js. He desarrollado varios proyectos personales y busco mi primera oportunidad laboral para aplicar mis conocimientos y seguir aprendiendo en un ambiente profesional.',
        'Cursando último año de Ingeniería de Sistemas con excelente promedio académico. Tengo experiencia en proyectos universitarios usando Java, Python y bases de datos SQL. Busco una pasantía donde pueda aportar mis conocimientos y adquirir experiencia práctica.',
        'Recién graduado en Administración de Empresas con especialización en Marketing Digital. Manejo herramientas como Google Analytics, Facebook Ads y diseño básico. Busco iniciar mi carrera profesional en una empresa dinámica.',
        'Desarrollador autodidacta con 2 años de experiencia en proyectos freelance. Domino el stack MERN y tengo experiencia con AWS. Busco una posición estable donde pueda crecer profesionalmente.',
        'Diseñador con formación en UX/UI y manejo de Figma, Adobe XD y principios de diseño centrado en el usuario. Portfolio con más de 10 proyectos disponible. Busco unirme a un equipo creativo.',
      ];

      const application = await prisma.youthApplication.create({
        data: {
          youthProfileId: youth.user.id,
          title: applicationTitles[i % applicationTitles.length],
          description: applicationDescriptions[i % applicationDescriptions.length],
          status: pickRandom([YouthApplicationStatus.ACTIVE, YouthApplicationStatus.PAUSED])[0],
          isPublic: Math.random() > 0.2, // 80% public
          viewsCount: randomInt(10, 500),
          applicationsCount: randomInt(0, 25),
          cvFile: 'cv_sample.pdf',
          coverLetterFile: Math.random() > 0.5 ? 'cover_letter_sample.pdf' : null,
        },
      });

      youthApplications.push({ application, youth });
    }

    console.log(`✅ Created ${youthApplications.length} youth applications`);

    // Create Company Interests in Youth Applications
    for (let i = 0; i < 30; i++) {
      const application = pickRandom(youthApplications)[0];
      const company = pickRandom(companies)[0];

      try {
        const interest = await prisma.youthApplicationCompanyInterest.create({
          data: {
            applicationId: application.application.id,
            companyId: company.id,
            status: pickRandom([
              CompanyInterestStatus.INTERESTED,
              CompanyInterestStatus.CONTACTED,
              CompanyInterestStatus.INTERVIEW_SCHEDULED,
            ])[0],
            message: pickRandom([
              'Nos interesa tu perfil para una posición junior en nuestro equipo de desarrollo.',
              'Tu experiencia y habilidades encajan con lo que buscamos. ¿Podríamos coordinar una entrevista?',
              'Hemos revisado tu postulación y nos gustaría conocerte mejor. ¿Tienes disponibilidad esta semana?',
              'Tu perfil es muy interesante. Nos gustaría discutir oportunidades en nuestra empresa.',
            ])[0],
          },
        });

        // Create some messages for the interaction
        if (Math.random() > 0.5) {
          const messages = [
            { 
              senderId: company.userId, 
              senderType: YouthMessageSenderType.COMPANY,
              content: 'Hola! Hemos visto tu postulación y estamos muy interesados en tu perfil.' 
            },
            { 
              senderId: application.youth.user.id, 
              senderType: YouthMessageSenderType.YOUTH,
              content: 'Muchas gracias por su interés! Estoy muy emocionado por esta oportunidad.' 
            },
            { 
              senderId: company.userId, 
              senderType: YouthMessageSenderType.COMPANY,
              content: '¿Podrías enviarnos tu disponibilidad para una entrevista virtual esta semana?' 
            },
          ];

          for (const msg of messages) {
            await prisma.youthApplicationMessage.create({
              data: {
                applicationId: application.application.id,
                senderId: msg.senderId,
                senderType: msg.senderType,
                content: msg.content,
                messageType: MessageType.TEXT,
                status: MessageStatus.READ,
                readAt: new Date(),
              },
            });
          }
        }
      } catch (error) {
        // Skip if duplicate
      }
    }

    console.log(`✅ Created company interests and messages`);

    // Create Job Offers
    const jobOffers = [];
    for (let i = 0; i < 25; i++) {
      const company = pickRandom(companies)[0];
      const jobTitles = [
        'Desarrollador Frontend Junior',
        'Desarrollador Backend Junior',
        'Analista de Datos',
        'Diseñador UI/UX',
        'Community Manager',
        'Asistente de Marketing Digital',
        'QA Tester',
        'DevOps Junior',
        'Scrum Master Junior',
        'Business Analyst',
      ];

      const jobDescriptions = [
        'Buscamos un desarrollador frontend junior con conocimientos en React y TypeScript para unirse a nuestro equipo de desarrollo.',
        'Requerimos un desarrollador backend con experiencia en Node.js y bases de datos SQL para trabajar en proyectos innovadores.',
        'Buscamos un analista de datos con conocimientos en Python y SQL para ayudar en la toma de decisiones basada en datos.',
        'Necesitamos un diseñador UI/UX creativo con experiencia en Figma para diseñar interfaces modernas y atractivas.',
      ];

      const jobOffer = await prisma.jobOffer.create({
        data: {
          companyId: company.id,
          title: jobTitles[i % jobTitles.length],
          description: jobDescriptions[i % jobDescriptions.length],
          requirements: [
            'Estudiante o graduado de carreras afines',
            'Conocimientos básicos en el área requerida',
            'Capacidad de trabajo en equipo',
            'Ganas de aprender y crecer profesionalmente',
            'Disponibilidad inmediata',
          ],
          benefits: [
            'Salario competitivo',
            'Horario flexible',
            'Trabajo remoto/híbrido',
            'Capacitación constante',
            'Ambiente de trabajo dinámico',
            'Oportunidades de crecimiento',
          ],
          location: pickRandom(municipalities)[0],
          salary: `${randomInt(2500, 8000)} BOB`,
          contractType: pickRandom([ContractType.FULL_TIME, ContractType.PART_TIME, ContractType.INTERNSHIP])[0],
          workModality: pickRandom([WorkModality.REMOTE, WorkModality.ONSITE, WorkModality.HYBRID])[0],
          experienceLevel: pickRandom([ExperienceLevel.JUNIOR, ExperienceLevel.ENTRY_LEVEL, ExperienceLevel.INTERNSHIP])[0],
          status: JobStatus.ACTIVE,
          isActive: true,
          publishedAt: randomDate(new Date(2024, 0, 1), new Date()),
          deadline: randomDate(new Date(), new Date(2025, 11, 31)),
          vacancies: randomInt(1, 5),
          applicationsCount: randomInt(5, 50),
        },
      });

      jobOffers.push(jobOffer);
    }

    console.log(`✅ Created ${jobOffers.length} job offers`);

    // Create Job Applications
    for (let i = 0; i < 50; i++) {
      const youth = pickRandom(createdYouthUsers)[0];
      const jobOffer = pickRandom(jobOffers)[0];

      try {
        await prisma.jobApplication.create({
          data: {
            jobOfferId: jobOffer.id,
            applicantId: youth.user.id,
            coverLetter: 'Me considero un candidato ideal para esta posición debido a mi formación académica y mi pasión por la tecnología. Tengo experiencia en proyectos universitarios y personales que demuestran mi capacidad de aprendizaje y resolución de problemas.',
            status: pickRandom([
              ApplicationStatus.SENT,
              ApplicationStatus.UNDER_REVIEW,
              ApplicationStatus.PRE_SELECTED,
            ])[0],
            appliedAt: randomDate(new Date(2024, 0, 1), new Date()),
          },
        });
      } catch (error) {
        // Skip if duplicate
      }
    }

    console.log(`✅ Created job applications`);

    // Create sample Courses
    const courseCategories = [
      { title: 'Desarrollo Web con React', category: CourseCategory.TECHNOLOGY },
      { title: 'Marketing Digital para Emprendedores', category: CourseCategory.BUSINESS },
      { title: 'Inglés para Profesionales', category: CourseCategory.LANGUAGES },
      { title: 'Excel Avanzado para Análisis de Datos', category: CourseCategory.TECHNOLOGY },
      { title: 'Liderazgo y Gestión de Equipos', category: CourseCategory.PERSONAL_DEVELOPMENT },
      { title: 'Introducción a la Inteligencia Artificial', category: CourseCategory.TECHNOLOGY },
      { title: 'Finanzas Personales', category: CourseCategory.BUSINESS },
      { title: 'Diseño Gráfico con Adobe', category: CourseCategory.DESIGN },
      { title: 'Emprendimiento Social', category: CourseCategory.ENTREPRENEURSHIP },
      { title: 'Comunicación Efectiva', category: CourseCategory.PERSONAL_DEVELOPMENT },
    ];

    const instructorUser = await prisma.user.create({
      data: {
        username: 'instructor_principal',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
        isActive: true,
      },
    });

    const courses = [];
    for (let i = 0; i < courseCategories.length; i++) {
      const course = await prisma.course.create({
        data: {
          title: courseCategories[i].title,
          description: `Curso completo de ${courseCategories[i].title} con contenido actualizado y ejercicios prácticos.`,
          shortDescription: `Aprende ${courseCategories[i].title} desde cero hasta nivel avanzado.`,
          category: courseCategories[i].category,
          level: pickRandom([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE])[0],
          duration: randomInt(20, 80),
          price: randomInt(0, 500),
          currency: 'BOB',
          thumbnail: `course_${i + 1}.jpg`,
          instructorId: instructorUser.id,
          isPublished: true,
          isActive: true,
          isFeatured: Math.random() > 0.7,
          requirements: [
            'Computadora con acceso a internet',
            'Conocimientos básicos de informática',
            'Ganas de aprender',
          ],
          objectives: [
            'Dominar los conceptos fundamentales',
            'Aplicar los conocimientos en proyectos reales',
            'Obtener certificación al completar el curso',

          ],
          enrollmentCount: randomInt(50, 500),
          rating: Math.round((4 + Math.random()) * 10) / 10,
          totalRatings: randomInt(10, 100),
        },
      });

      courses.push(course);

      // Create course modules
      for (let j = 0; j < 3; j++) {
        const module = await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: `Módulo ${j + 1}: ${j === 0 ? 'Introducción' : j === 1 ? 'Desarrollo' : 'Proyecto Final'}`,
            description: `Contenido del módulo ${j + 1} del curso`,
            orderIndex: j,
            duration: randomInt(5, 15),
            isPublished: true,
          },
        });

        // Create lessons for each module
        for (let k = 0; k < 3; k++) {
          await prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: `Lección ${k + 1}`,
              description: `Contenido de la lección ${k + 1}`,
              content: `# Lección ${k + 1}\n\nContenido detallado de la lección...`,
              videoUrl: Math.random() > 0.5 ? `https://www.youtube.com/watch?v=example${k}` : null,
              duration: randomInt(10, 30),
              orderIndex: k,
              isPublished: true,
              isFree: k === 0, // First lesson free
            },
          });
        }
      }
    }

    console.log(`✅ Created ${courses.length} courses with modules and lessons`);

    // Create Course Enrollments
    for (let i = 0; i < 30; i++) {
      const youth = pickRandom(createdYouthUsers)[0];
      const course = pickRandom(courses)[0];

      try {
        await prisma.courseEnrollment.create({
          data: {
            courseId: course.id,
            studentId: youth.user.id,
            enrolledAt: randomDate(new Date(2024, 0, 1), new Date()),
            progress: randomInt(0, 100),
            completedAt: Math.random() > 0.7 ? new Date() : null,
            lastAccessedAt: new Date(),
          },
        });
      } catch (error) {
        // Skip if duplicate
      }
    }

    console.log(`✅ Created course enrollments`);

    // Create sample News Articles
    const newsArticles = [];
    for (let i = 0; i < 15; i++) {
      const newsTitles = [
        'Nueva convocatoria de becas para jóvenes emprendedores',
        'Feria de empleo tecnológico este fin de semana',
        'Programa de capacitación gratuita en desarrollo web',
        'Empresas locales buscan talento joven',
        'Lanzamiento de incubadora de startups juveniles',
        'Taller de preparación para entrevistas laborales',
        'Oportunidades de pasantías en empresas internacionales',
        'Curso intensivo de inglés para profesionales',
        'Hackathon universitario con premios en efectivo',
        'Programa de mentoría para jóvenes profesionales',
      ];

      const article = await prisma.newsArticle.create({
        data: {
          title: newsTitles[i % newsTitles.length],
          content: `Contenido detallado del artículo de noticias sobre ${newsTitles[i % newsTitles.length]}. Esta es una excelente oportunidad para los jóvenes de nuestra comunidad.`,
          summary: `Resumen del artículo sobre ${newsTitles[i % newsTitles.length]}`,
          imageUrl: `news_${i + 1}.jpg`,
          authorId: pickRandom(createdYouthUsers)[0].user.id,
          category: pickRandom(['education', 'employment', 'technology', 'entrepreneurship'])[0],
          tags: pickRandom(['juventud', 'oportunidades', 'educación', 'empleo', 'tecnología'], 3),
          isPublished: true,
          isFeatured: Math.random() > 0.8,
          viewsCount: randomInt(100, 5000),
          publishedAt: randomDate(new Date(2024, 0, 1), new Date()),
        },
      });

      newsArticles.push(article);
    }

    console.log(`✅ Created ${newsArticles.length} news articles`);

    // Create Entrepreneurships
    for (let i = 0; i < 10; i++) {
      const youth = createdYouthUsers[i];
      const entrepreneurshipNames = [
        'EcoTech Solutions',
        'Digital Marketing Pro',
        'App Delivery Express',
        'Green Energy Bolivia',
        'Educational Games Studio',
        'Health Tech Innovation',
        'Local Food Marketplace',
        'Smart Home Solutions',
        'Fashion Sustainable',
        'Tourism Tech Platform',
      ];

      await prisma.entrepreneurship.create({
        data: {
          ownerId: youth.user.id,
          name: entrepreneurshipNames[i],
          description: `${entrepreneurshipNames[i]} es un emprendimiento innovador que busca resolver problemas reales mediante tecnología y creatividad.`,
          category: pickRandom(['technology', 'social', 'education', 'health', 'environment'])[0],
          stage: pickRandom(['IDEA', 'PROTOTYPE', 'MVP', 'GROWTH'])[0],
          website: `www.${entrepreneurshipNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
          logo: `logo_${i + 1}.png`,
          teamSize: randomInt(1, 10),
          location: pickRandom(municipalities)[0],
          isActive: true,
          isFeatured: Math.random() > 0.7,
          viewsCount: randomInt(50, 1000),
        },
      });
    }

    console.log(`✅ Created entrepreneurships`);

    console.log('✨ Enhanced seeding completed successfully!');
    console.log(`
    Summary:
    - 25 YOUTH users with complete profiles
    - 10 Companies
    - 15 Youth Applications
    - 25 Job Offers
    - 50+ Job Applications
    - 10 Courses with modules and lessons
    - 30+ Course Enrollments
    - 15 News Articles
    - 10 Entrepreneurships
    - Company interests and messages
    `);

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });
  });