import {
  PrismaClient,
  UserRole,
  EducationLevel,
  CompanySize,
  InstitutionType,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  try {
    // Create super admin user
    const hashedPassword = await bcrypt.hash("12345678", 10);

    const superAdmin = await prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        username: "admin",
        password: hashedPassword,
        role: UserRole.SUPERADMIN,
        isActive: true,
      },
    });

    console.log("✅ Super admin created:", superAdmin.username);

    // Create profile for super admin
    await prisma.profile.upsert({
      where: { userId: superAdmin.id },
      update: {},
      create: {
        userId: superAdmin.id,
        firstName: "Super",
        lastName: "Admin",
        role: UserRole.SUPERADMIN,
        active: true,
        email: "admin@cemse.com",
        phone: "+591 4 1234567",
        address: "Cochabamba, Bolivia",
        municipality: "Cochabamba",
        department: "Cochabamba",
        country: "Bolivia",
      },
    });

    // Create sample municipalities first (needed for companies)
    const municipalities = [
      {
        name: "Cochabamba",
        department: "Cochabamba",
        region: "Valle",
        population: 630587,
        mayorName: "Manfred Reyes Villa",
        mayorEmail: "alcalde@cochabamba.bo",
        mayorPhone: "+591 4 4222222",
        address: "Plaza 14 de Septiembre",
        website: "https://cochabamba.bo",
        username: "cochabamba_gob",
        password: await bcrypt.hash("cochabamba123", 10),
        email: "info@cochabamba.bo",
        phone: "+591 4 4222222",
        institutionType: InstitutionType.MUNICIPALITY,
        primaryColor: "#1E40AF",
        secondaryColor: "#F59E0B",
        createdBy: superAdmin.id,
      },
      {
        name: "La Paz",
        department: "La Paz",
        region: "Altiplano",
        population: 789585,
        mayorName: "Iván Arias",
        mayorEmail: "alcalde@lapaz.bo",
        mayorPhone: "+591 2 2200000",
        address: "Plaza Murillo",
        website: "https://lapaz.bo",
        username: "lapaz_gob",
        password: await bcrypt.hash("lapaz123", 10),
        email: "info@lapaz.bo",
        phone: "+591 2 2200000",
        institutionType: InstitutionType.MUNICIPALITY,
        primaryColor: "#DC2626",
        secondaryColor: "#F59E0B",
        createdBy: superAdmin.id,
      },
      {
        name: "Santa Cruz",
        department: "Santa Cruz",
        region: "Oriente",
        population: 1453549,
        mayorName: "Jhonny Fernández",
        mayorEmail: "alcalde@santacruz.bo",
        mayorPhone: "+591 3 3333333",
        address: "Plaza 24 de Septiembre",
        website: "https://santacruz.bo",
        username: "santacruz_gob",
        password: await bcrypt.hash("santacruz123", 10),
        email: "info@santacruz.bo",
        phone: "+591 3 3333333",
        institutionType: InstitutionType.MUNICIPALITY,
        primaryColor: "#059669",
        secondaryColor: "#F59E0B",
        createdBy: superAdmin.id,
      },
    ];

    const createdMunicipalities = [];
    for (const municipalityData of municipalities) {
      const municipality = await prisma.municipality.upsert({
        where: {
          name_department: {
            name: municipalityData.name,
            department: municipalityData.department,
          },
        },
        update: {},
        create: municipalityData,
      });
      createdMunicipalities.push(municipality);
    }

    console.log("✅ Municipalities created");

    // Create comprehensive youth users
    const youthUsers = [
      {
        username: "jovenes1",
        password: "12345678",
        firstName: "María",
        lastName: "González",
        email: "maria.gonzalez@email.com",
        phone: "+591 700 123 456",
        address: "Av. Heroínas 123",
        municipality: "Cochabamba",
        department: "Cochabamba",
        birthDate: new Date("2000-05-15"),
        gender: "FEMALE",
        educationLevel: EducationLevel.UNIVERSITY,
        currentInstitution: "Universidad Mayor de San Simón",
        graduationYear: 2024,
        isStudying: true,
        skills: ["JavaScript", "React", "Node.js", "Python", "Diseño Gráfico"],
        interests: ["Tecnología", "Programación", "Diseño", "Emprendimiento"],
      },
      {
        username: "carlos_mendoza_2024",
        password: "12345678",
        firstName: "Carlos",
        lastName: "Mendoza",
        email: "carlos.mendoza@email.com",
        phone: "+591 700 234 567",
        address: "Calle 25 de Mayo 456",
        municipality: "La Paz",
        department: "La Paz",
        birthDate: new Date("1999-08-22"),
        gender: "MALE",
        educationLevel: EducationLevel.TECHNICAL,
        currentInstitution: "Instituto Técnico Superior",
        graduationYear: 2023,
        isStudying: false,
        skills: ["Marketing Digital", "Ventas", "Comunicación", "Liderazgo"],
        interests: ["Negocios", "Marketing", "Ventas", "Liderazgo"],
      },
      {
        username: "ana_rodriguez_sc",
        password: "12345678",
        firstName: "Ana",
        lastName: "Rodríguez",
        email: "ana.rodriguez@email.com",
        phone: "+591 700 345 678",
        address: "Av. Cañoto 789",
        municipality: "Santa Cruz",
        department: "Santa Cruz",
        birthDate: new Date("2001-12-10"),
        gender: "FEMALE",
        educationLevel: EducationLevel.SECONDARY,
        currentInstitution: "Colegio Nacional",
        graduationYear: 2023,
        isStudying: true,
        skills: ["Inglés", "Matemáticas", "Ciencias", "Arte"],
        interests: ["Educación", "Ciencias", "Arte", "Voluntariado"],
      },
    ];

    for (const userData of youthUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role: UserRole.YOUTH,
          isActive: true,
        },
      });

      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: UserRole.YOUTH,
          active: true,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipality: userData.municipality,
          department: userData.department,
          country: "Bolivia",
          birthDate: userData.birthDate,
          gender: userData.gender,
          educationLevel: userData.educationLevel,
          currentInstitution: userData.currentInstitution,
          graduationYear: userData.graduationYear,
          isStudying: userData.isStudying,
          skills: userData.skills,
          interests: userData.interests,
          profileCompletion: 85,
        },
      });
    }

    console.log("✅ Youth users created");

    // Create adolescent users
    const adolescentUsers = [
      {
        username: "adolescentes1",
        password: "12345678",
        firstName: "Sofía",
        lastName: "López",
        email: "sofia.lopez@email.com",
        phone: "+591 700 456 789",
        address: "Zona Sur, Calle 1",
        municipality: "Cochabamba",
        department: "Cochabamba",
        birthDate: new Date("2008-03-18"),
        gender: "FEMALE",
        educationLevel: EducationLevel.SECONDARY,
        currentInstitution: "Colegio San Agustín",
        isStudying: true,
        skills: ["Música", "Dibujo", "Matemáticas", "Inglés"],
        interests: ["Música", "Arte", "Deportes", "Lectura"],
        parentalConsent: true,
        parentEmail: "padres.lopez@email.com",
        consentDate: new Date(),
      },
      {
        username: "diego_torres_lp",
        password: "12345678",
        firstName: "Diego",
        lastName: "Torres",
        email: "diego.torres@email.com",
        phone: "+591 700 567 890",
        address: "Zona Norte, Av. 6 de Agosto",
        municipality: "La Paz",
        department: "La Paz",
        birthDate: new Date("2007-11-25"),
        gender: "MALE",
        educationLevel: EducationLevel.SECONDARY,
        currentInstitution: "Colegio San Calixto",
        isStudying: true,
        skills: ["Programación", "Robótica", "Matemáticas", "Física"],
        interests: ["Tecnología", "Robótica", "Videojuegos", "Ciencia"],
        parentalConsent: true,
        parentEmail: "padres.torres@email.com",
        consentDate: new Date(),
      },
    ];

    for (const userData of adolescentUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role: UserRole.ADOLESCENTS,
          isActive: true,
        },
      });

      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: UserRole.ADOLESCENTS,
          active: true,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipality: userData.municipality,
          department: userData.department,
          country: "Bolivia",
          birthDate: userData.birthDate,
          gender: userData.gender,
          educationLevel: userData.educationLevel,
          currentInstitution: userData.currentInstitution,
          isStudying: userData.isStudying,
          skills: userData.skills,
          interests: userData.interests,
          parentalConsent: userData.parentalConsent,
          parentEmail: userData.parentEmail,
          consentDate: userData.consentDate,
          profileCompletion: 70,
        },
      });
    }

    console.log("✅ Adolescent users created");

    // Create municipality-based institutions (NGOs, Training Centers, etc.)
    const institutionUsers = [
      {
        username: "institucion1",
        password: "12345678",
        name: "Fundación Ayuda Social",
        email: "info@fundacionayuda.bo",
        phone: "+591 4 4444444",
        address: "Av. Ayacucho 123",
        institutionType: InstitutionType.FOUNDATION,
        primaryColor: "#7C3AED",
        secondaryColor: "#F59E0B",
        municipality: createdMunicipalities[0], // Cochabamba
      },
      {
        username: "centro_entrenamiento_lp",
        password: "12345678",
        name: "Centro de Entrenamiento Técnico",
        email: "info@centroentrenamiento.bo",
        phone: "+591 2 5555555",
        address: "Calle Comercio 456",
        institutionType: InstitutionType.OTHER,
        customType: "Centro de Entrenamiento",
        primaryColor: "#059669",
        secondaryColor: "#F59E0B",
        municipality: createdMunicipalities[1], // La Paz
      },
      {
        username: "ong_desarrollo_sc",
        password: "12345678",
        name: "ONG Desarrollo Comunitario",
        email: "info@ongdesarrollo.bo",
        phone: "+591 3 6666666",
        address: "Av. Roca y Coronado 789",
        institutionType: InstitutionType.NGO,
        primaryColor: "#DC2626",
        secondaryColor: "#F59E0B",
        municipality: createdMunicipalities[2], // Santa Cruz
      },
    ];

    for (const userData of institutionUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role:
            userData.institutionType === InstitutionType.FOUNDATION
              ? UserRole.NGOS_AND_FOUNDATIONS
              : userData.institutionType === InstitutionType.OTHER
                ? UserRole.TRAINING_CENTERS
                : UserRole.NGOS_AND_FOUNDATIONS,
          isActive: true,
        },
      });

      // Create municipality record for the institution
      const municipality = await prisma.municipality.upsert({
        where: {
          name_department: {
            name: userData.name,
            department: userData.municipality.department,
          },
        },
        update: {},
        create: {
          name: userData.name,
          department: userData.municipality.department,
          region: userData.municipality.region,
          username: userData.username,
          password: hashedPassword,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          institutionType: userData.institutionType,
          customType: userData.customType,
          primaryColor: userData.primaryColor,
          secondaryColor: userData.secondaryColor,
          isActive: true,
          createdBy: superAdmin.id,
        },
      });

      // Create profile for the institution user
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: userData.name,
          lastName: "",
          role: user.role,
          active: true,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipality: userData.municipality.name,
          department: userData.municipality.department,
          country: "Bolivia",
          institutionName: userData.name,
          institutionType: userData.institutionType,
          institutionDescription: `Institución dedicada al desarrollo social y comunitario en ${userData.municipality.name}`,
          profileCompletion: 90,
        },
      });
    }

    console.log("✅ Institution users created");

    // Create municipal government users
    const municipalGovernmentUsers = [
      {
        username: "municipio1",
        password: "12345678",
        name: "Gobierno Municipal de Cochabamba",
        email: "info@cochabamba.bo",
        phone: "+591 4 4222222",
        address: "Plaza 14 de Septiembre",
        municipality: createdMunicipalities[0], // Cochabamba
      },
      {
        username: "gobierno_lapaz",
        password: "12345678",
        name: "Gobierno Municipal de La Paz",
        email: "info@lapaz.bo",
        phone: "+591 2 2200000",
        address: "Plaza Murillo",
        municipality: createdMunicipalities[1], // La Paz
      },
      {
        username: "alcaldia_santacruz",
        password: "12345678",
        name: "Gobierno Municipal de Santa Cruz",
        email: "info@santacruz.bo",
        phone: "+591 3 3333333",
        address: "Plaza 24 de Septiembre",
        municipality: createdMunicipalities[2], // Santa Cruz
      },
    ];

    for (const userData of municipalGovernmentUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role: UserRole.MUNICIPAL_GOVERNMENTS,
          isActive: true,
        },
      });

      // Create profile for the municipal government user
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: userData.name,
          lastName: "",
          role: UserRole.MUNICIPAL_GOVERNMENTS,
          active: true,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipality: userData.municipality.name,
          department: userData.municipality.department,
          country: "Bolivia",
          institutionName: userData.name,
          institutionType: InstitutionType.MUNICIPALITY,
          institutionDescription: `Gobierno Municipal de ${userData.municipality.name} - Institución pública dedicada al desarrollo local y la gestión municipal`,
          profileCompletion: 95,
        },
      });
    }

    console.log("✅ Municipal government users created");

    // Create company users with associated Company records
    const companyUsers = [
      {
        username: "empresa1",
        password: "12345678",
        name: "TechCorp Bolivia",
        email: "info@techcorp.bo",
        phone: "+591 4 7777777",
        address: "Av. América 1234",
        businessSector: "Tecnología",
        companySize: CompanySize.MEDIUM,
        foundedYear: 2018,
        website: "https://techcorp.bo",
        municipality: createdMunicipalities[0], // Cochabamba
      },
      {
        username: "innovate_labs_consulting",
        password: "12345678",
        name: "InnovateLabs",
        email: "contacto@innovatelabs.bo",
        phone: "+591 2 8888888",
        address: "Calle Potosí 567",
        businessSector: "Consultoría",
        companySize: CompanySize.SMALL,
        foundedYear: 2020,
        website: "https://innovatelabs.bo",
        municipality: createdMunicipalities[1], // La Paz
      },
      {
        username: "zenith_health_bolivia",
        password: "12345678",
        name: "Zenith Health Solutions",
        email: "info@zenithhealth.bo",
        phone: "+591 3 9999999",
        address: "Av. San Martín 890",
        businessSector: "Salud",
        companySize: CompanySize.LARGE,
        foundedYear: 2015,
        website: "https://zenithhealth.bo",
        municipality: createdMunicipalities[2], // Santa Cruz
      },
    ];

    for (const userData of companyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role: UserRole.COMPANIES,
          isActive: true,
        },
      });

      // Create company record
      const company = await prisma.company.upsert({
        where: {
          name_municipalityId: {
            name: userData.name,
            municipalityId: userData.municipality.id,
          },
        },
        update: {},
        create: {
          name: userData.name,
          description: `Empresa líder en ${userData.businessSector.toLowerCase()} en ${userData.municipality.name}`,
          businessSector: userData.businessSector,
          companySize: userData.companySize,
          foundedYear: userData.foundedYear,
          website: userData.website,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipalityId: userData.municipality.id,
          username: userData.username,
          password: hashedPassword,
          loginEmail: userData.email,
          isActive: true,
          createdBy: superAdmin.id,
        },
      });

      // Create profile for the company user
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: userData.name,
          lastName: "",
          role: UserRole.COMPANIES,
          active: true,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          municipality: userData.municipality.name,
          department: userData.municipality.department,
          country: "Bolivia",
          companyName: userData.name,
          businessSector: userData.businessSector,
          companySize: userData.companySize,
          companyDescription: company.description,
          website: userData.website,
          foundedYear: userData.foundedYear,
          companyId: company.id,
          profileCompletion: 95,
        },
      });
    }

    console.log("✅ Company users created");

    // Create diverse job offers for all companies
    const jobOffers = [
      // TechCorp Bolivia (Tecnología) - Cochabamba
      {
        title: "Desarrollador Frontend React",
        description:
          "Buscamos un desarrollador frontend con experiencia en React para unirse a nuestro equipo de desarrollo.",
        requirements:
          "Conocimiento sólido en React, JavaScript, HTML, CSS. Experiencia mínima 1 año.",
        benefits:
          "Salario competitivo, horario flexible, capacitaciones, seguro médico",
        salaryMin: 5000,
        salaryMax: 8000,
        contractType: "FULL_TIME" as const,
        workSchedule: "Lunes a Viernes 9:00-18:00",
        workModality: "HYBRID" as const,
        location: "Cochabamba",
        municipality: "Cochabamba",
        experienceLevel: "ENTRY_LEVEL" as const,
        educationRequired: EducationLevel.UNIVERSITY,
        skillsRequired: ["React", "JavaScript", "HTML", "CSS"],
        desiredSkills: ["TypeScript", "Node.js", "Git"],
        companyName: "TechCorp Bolivia",
      },
      {
        title: "Desarrollador Backend Node.js",
        description:
          "Oportunidad para desarrollador backend con experiencia en Node.js y bases de datos.",
        requirements:
          "Experiencia en Node.js, Express, MongoDB/PostgreSQL, APIs REST.",
        benefits: "Trabajo remoto, bonos por productividad, ambiente innovador",
        salaryMin: 6000,
        salaryMax: 9000,
        contractType: "FULL_TIME" as const,
        workSchedule: "Lunes a Viernes 8:00-17:00",
        workModality: "REMOTE" as const,
        location: "Cochabamba",
        municipality: "Cochabamba",
        experienceLevel: "MID_LEVEL" as const,
        educationRequired: EducationLevel.UNIVERSITY,
        skillsRequired: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
        desiredSkills: ["Docker", "AWS", "GraphQL"],
        companyName: "TechCorp Bolivia",
      },
      // InnovateLabs (Consultoría) - La Paz
      {
        title: "Consultor de Marketing Digital",
        description:
          "Oportunidad para un consultor de marketing digital con experiencia en redes sociales y SEO.",
        requirements:
          "Experiencia en marketing digital, manejo de redes sociales, conocimientos en SEO/SEM.",
        benefits: "Comisión por ventas, capacitaciones, ambiente dinámico",
        salaryMin: 4000,
        salaryMax: 6000,
        contractType: "FULL_TIME" as const,
        workSchedule: "Lunes a Viernes 8:00-17:00",
        workModality: "ON_SITE" as const,
        location: "La Paz",
        municipality: "La Paz",
        experienceLevel: "MID_LEVEL" as const,
        educationRequired: EducationLevel.TECHNICAL,
        skillsRequired: [
          "Marketing Digital",
          "SEO",
          "Redes Sociales",
          "Google Analytics",
        ],
        desiredSkills: ["Google Ads", "Facebook Ads", "Content Marketing"],
        companyName: "InnovateLabs",
      },
      {
        title: "Analista de Datos",
        description:
          "Buscamos analista de datos para proyectos de consultoría empresarial.",
        requirements:
          "Conocimientos en Excel avanzado, Power BI, SQL, análisis estadístico.",
        benefits:
          "Capacitaciones especializadas, proyectos variados, crecimiento profesional",
        salaryMin: 4500,
        salaryMax: 7000,
        contractType: "FULL_TIME" as const,
        workSchedule: "Lunes a Viernes 9:00-18:00",
        workModality: "HYBRID" as const,
        location: "La Paz",
        municipality: "La Paz",
        experienceLevel: "ENTRY_LEVEL" as const,
        educationRequired: EducationLevel.UNIVERSITY,
        skillsRequired: ["Excel", "Power BI", "SQL", "Estadística"],
        desiredSkills: ["Python", "R", "Tableau", "Machine Learning"],
        companyName: "InnovateLabs",
      },
      // Zenith Health Solutions (Salud) - Santa Cruz
      {
        title: "Enfermero/a General",
        description:
          "Oportunidad para enfermero/a con experiencia en atención hospitalaria.",
        requirements:
          "Título en Enfermería, experiencia mínima 2 años, disponibilidad para turnos.",
        benefits:
          "Seguro médico familiar, bonos por turnos nocturnos, capacitaciones médicas",
        salaryMin: 3500,
        salaryMax: 5000,
        contractType: "FULL_TIME" as const,
        workSchedule: "Turnos rotativos 24/7",
        workModality: "ON_SITE" as const,
        location: "Santa Cruz",
        municipality: "Santa Cruz",
        experienceLevel: "MID_LEVEL" as const,
        educationRequired: EducationLevel.TECHNICAL,
        skillsRequired: [
          "Enfermería",
          "Atención al Paciente",
          "Medicamentos",
          "Primeros Auxilios",
        ],
        desiredSkills: ["UCI", "Emergencias", "Pediatría", "Geriatría"],
        companyName: "Zenith Health Solutions",
      },
      {
        title: "Técnico en Radiología",
        description:
          "Buscamos técnico en radiología para nuestro departamento de diagnóstico por imágenes.",
        requirements:
          "Título técnico en Radiología, experiencia en equipos de rayos X, ecografía.",
        benefits:
          "Equipos modernos, especialización en nuevas tecnologías, ambiente profesional",
        salaryMin: 4000,
        salaryMax: 5500,
        contractType: "FULL_TIME" as const,
        workSchedule: "Lunes a Viernes 7:00-15:00",
        workModality: "ON_SITE" as const,
        location: "Santa Cruz",
        municipality: "Santa Cruz",
        experienceLevel: "ENTRY_LEVEL" as const,
        educationRequired: EducationLevel.TECHNICAL,
        skillsRequired: ["Radiología", "Rayos X", "Ecografía", "Anatomía"],
        desiredSkills: [
          "Resonancia Magnética",
          "TAC",
          "Mamografía",
          "Densitometría",
        ],
        companyName: "Zenith Health Solutions",
      },
    ];

    // Create job offers for each company
    let createdJobOffers = [];

    for (const jobData of jobOffers) {
      // Find the company by name
      const company = await prisma.company.findFirst({
        where: { name: jobData.companyName },
      });

      if (company) {
        const { companyName, ...jobOfferData } = jobData; // Remove companyName from job data
        const jobOffer = await prisma.jobOffer.create({
          data: {
            ...jobOfferData,
            companyId: company.id,
          },
        });
        createdJobOffers.push(jobOffer);
        console.log(`Created job offer: ${jobOffer.title} at ${company.name}`);
      } else {
        console.log(`❌ Company not found: ${jobData.companyName}`);
      }
    }

    console.log(`✅ ${createdJobOffers.length} job offers created`);

    // Create job applications from youth users
    if (createdJobOffers.length > 0) {
      // Get youth users
      const youthProfiles = await prisma.profile.findMany({
        where: { role: UserRole.YOUTH },
        include: { user: true },
      });

      console.log(`Found ${youthProfiles.length} youth profiles`);
      console.log(`Found ${createdJobOffers.length} job offers`);

      // Create unique job applications for each youth user
      const jobApplications = [];

      // María González applications
      if (youthProfiles[0]?.user?.id) {
        // Frontend Developer at TechCorp
        if (createdJobOffers[0]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[0].id,
            applicantId: youthProfiles[0].user.id,
            coverLetter:
              "Soy una desarrolladora apasionada por la tecnología con experiencia en React y JavaScript. Me interesa mucho esta oportunidad para crecer profesionalmente en una empresa innovadora como TechCorp Bolivia.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "Tengo experiencia en proyectos personales con React y estoy dispuesta a aprender nuevas tecnologías.",
          });
        }

        // Data Analyst at InnovateLabs
        if (createdJobOffers[3]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[3].id,
            applicantId: youthProfiles[0].user.id,
            coverLetter:
              "Esta posición me interesa porque combina mis habilidades técnicas con la oportunidad de trabajar con datos. Creo que puedo aportar una perspectiva fresca y tecnológica al equipo de análisis.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "He participado en proyectos de análisis de datos y tengo experiencia con herramientas de visualización.",
          });
        }
      }

      // Carlos Mendoza applications
      if (youthProfiles[1]?.user?.id) {
        // Backend Developer at TechCorp
        if (createdJobOffers[1]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[1].id,
            applicantId: youthProfiles[1].user.id,
            coverLetter:
              "Estoy interesado en expandir mis habilidades hacia el desarrollo backend. Tengo conocimientos básicos en bases de datos y estoy aprendiendo Node.js. Esta oportunidad me permitiría crecer como desarrollador full-stack.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "Actualmente estoy tomando un curso de Node.js y tengo experiencia básica con MongoDB.",
          });
        }

        // Marketing Digital at InnovateLabs
        if (createdJobOffers[2]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[2].id,
            applicantId: youthProfiles[1].user.id,
            coverLetter:
              "Mi perfil se alinea perfectamente con esta posición. Tengo experiencia en marketing digital, manejo de redes sociales y análisis de datos. He trabajado en campañas exitosas para pequeñas empresas.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "Tengo certificaciones en Google Analytics y Facebook Ads Manager.",
          });
        }
      }

      // Ana Rodríguez applications
      if (youthProfiles[2]?.user?.id) {
        // Nurse at Zenith Health
        if (createdJobOffers[4]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[4].id,
            applicantId: youthProfiles[2].user.id,
            coverLetter:
              "Aunque mi formación es en tecnología, siempre he tenido interés en el área de salud. He participado como voluntaria en campañas de salud comunitaria y tengo vocación de servicio. Estoy dispuesta a formarme en enfermería.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "He sido voluntaria en Cruz Roja y tengo certificación en primeros auxilios básicos.",
          });
        }

        // Radiology Technician at Zenith Health
        if (createdJobOffers[5]?.id) {
          jobApplications.push({
            jobOfferId: createdJobOffers[5].id,
            applicantId: youthProfiles[2].user.id,
            coverLetter:
              "Mi interés en la tecnología médica me lleva a considerar esta oportunidad. Tengo facilidad para aprender el manejo de equipos técnicos y me interesa el campo de la salud. Estoy dispuesta a formarme en radiología.",
            status: "SENT" as const,
            appliedAt: new Date(),
            notes:
              "Tengo experiencia con equipos técnicos y estoy estudiando anatomía básica por mi cuenta.",
          });
        }
      }

      // Create all valid job applications
      console.log(`Creating ${jobApplications.length} job applications...`);
      for (const applicationData of jobApplications) {
        await prisma.jobApplication.create({
          data: applicationData,
        });
      }
      console.log(`✅ ${jobApplications.length} job applications created`);
    }

    // Create sample courses
    const courses = [
      {
        title: "Introducción a la Programación Web",
        slug: "introduccion-programacion-web",
        description:
          "Aprende los fundamentos de la programación web con HTML, CSS y JavaScript desde cero.",
        shortDescription: "Curso básico de programación web para principiantes",
        objectives: [
          "Entender los fundamentos de HTML y CSS",
          "Aprender JavaScript básico",
          "Crear páginas web interactivas",
          "Comprender la estructura de sitios web",
        ],
        prerequisites: ["Conocimientos básicos de computación"],
        duration: 40, // hours
        level: "BEGINNER" as const,
        category: "TECHNICAL_SKILLS" as const,
        isMandatory: false,
        isActive: true,
        rating: 4.5,
        studentsCount: 150,
        completionRate: 85.5,
        totalLessons: 12,
        totalQuizzes: 4,
        totalResources: 8,
        tags: ["HTML", "CSS", "JavaScript", "Web Development"],
        certification: true,
        includedMaterials: ["Videos", "Ejercicios", "Proyectos", "Certificado"],
        institutionName: "Centro de Entrenamiento Técnico",
      },
      {
        title: "Marketing Digital para Emprendedores",
        slug: "marketing-digital-emprendedores",
        description:
          "Domina las estrategias de marketing digital para hacer crecer tu negocio en línea.",
        shortDescription: "Estrategias de marketing digital para emprendedores",
        objectives: [
          "Aprender estrategias de marketing digital",
          "Dominar redes sociales para negocios",
          "Crear campañas publicitarias efectivas",
          "Medir y analizar resultados",
        ],
        prerequisites: ["Conocimientos básicos de redes sociales"],
        duration: 30,
        level: "INTERMEDIATE" as const,
        category: "ENTREPRENEURSHIP" as const,
        isMandatory: false,
        isActive: true,
        rating: 4.8,
        studentsCount: 200,
        completionRate: 90.2,
        totalLessons: 10,
        totalQuizzes: 3,
        totalResources: 12,
        tags: ["Marketing", "Redes Sociales", "Publicidad", "Emprendimiento"],
        certification: true,
        includedMaterials: [
          "Videos",
          "Plantillas",
          "Herramientas",
          "Certificado",
        ],
        institutionName: "Fundación Ayuda Social",
      },
      {
        title: "Habilidades de Comunicación Efectiva",
        slug: "habilidades-comunicacion-efectiva",
        description:
          "Desarrolla tus habilidades de comunicación para el éxito personal y profesional.",
        shortDescription: "Mejora tu comunicación personal y profesional",
        objectives: [
          "Desarrollar habilidades de comunicación verbal",
          "Mejorar la comunicación no verbal",
          "Aprender técnicas de presentación",
          "Dominar la comunicación escrita",
        ],
        prerequisites: [],
        duration: 20,
        level: "BEGINNER" as const,
        category: "SOFT_SKILLS" as const,
        isMandatory: true,
        isActive: true,
        rating: 4.6,
        studentsCount: 300,
        completionRate: 88.7,
        totalLessons: 8,
        totalQuizzes: 2,
        totalResources: 6,
        tags: [
          "Comunicación",
          "Presentaciones",
          "Liderazgo",
          "Desarrollo Personal",
        ],
        certification: true,
        includedMaterials: [
          "Videos",
          "Ejercicios",
          "Evaluaciones",
          "Certificado",
        ],
        institutionName: "ONG Desarrollo Comunitario",
      },
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = await prisma.course.upsert({
        where: { slug: courseData.slug },
        update: {},
        create: courseData,
      });
      createdCourses.push(course);
    }

    console.log("✅ Sample courses created");

    // Create modules, lessons, and quizzes for each course
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];

      if (course.slug === "introduccion-programacion-web") {
        // Course 1: Introducción a la Programación Web
        const modules = [
          {
            title: "Fundamentos de HTML",
            description:
              "Aprende la estructura básica de HTML y sus elementos fundamentales",
            orderIndex: 1,
            estimatedDuration: 8,
            courseId: course.id,
          },
          {
            title: "Estilos con CSS",
            description:
              "Domina CSS para dar estilo y diseño a tus páginas web",
            orderIndex: 2,
            estimatedDuration: 10,
            courseId: course.id,
          },
          {
            title: "JavaScript Básico",
            description: "Introducción a la programación con JavaScript",
            orderIndex: 3,
            estimatedDuration: 12,
            courseId: course.id,
          },
          {
            title: "Proyecto Final",
            description: "Crea tu primera página web completa",
            orderIndex: 4,
            estimatedDuration: 10,
            courseId: course.id,
          },
        ];

        for (const moduleData of modules) {
          const module = await prisma.courseModule.create({
            data: moduleData,
          });

          // Create lessons for each module
          if (module.title === "Fundamentos de HTML") {
            const lessons = [
              {
                title: "¿Qué es HTML?",
                description:
                  "Introducción a HTML y su importancia en el desarrollo web",
                content:
                  "HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. Es la base de todo sitio web y nos permite estructurar el contenido de manera semántica.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Estructura básica de un documento HTML",
                description:
                  "Aprende la estructura fundamental de un documento HTML",
                content:
                  "Todo documento HTML debe tener una estructura básica que incluye las etiquetas html, head y body. Esta estructura proporciona la base para el contenido de la página.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Etiquetas de encabezado y párrafos",
                description:
                  "Uso de las etiquetas h1-h6 y p para estructurar el contenido",
                content:
                  "Las etiquetas de encabezado (h1, h2, h3, h4, h5, h6) y párrafos (p) son fundamentales para organizar el contenido de manera jerárquica y legible.",
                contentType: "TEXT" as const,
                orderIndex: 3,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              const lesson = await prisma.lesson.create({
                data: lessonData,
              });

              // Create quiz for specific lessons
              if (lesson.title === "¿Qué es HTML?") {
                const lessonQuiz = await prisma.quiz.create({
                  data: {
                    courseId: course.id,
                    lessonId: lesson.id,
                    title: `Quiz: ${lesson.title}`,
                    description: `Evalúa tu comprensión de ${lesson.title}`,
                    timeLimit: 10,
                    passingScore: 80,
                    showCorrectAnswers: true,
                    isActive: true,
                  },
                });

                await prisma.quizQuestion.create({
                  data: {
                    quizId: lessonQuiz.id,
                    question: "¿Cuál es el propósito principal de HTML?",
                    type: "MULTIPLE_CHOICE",
                    options: [
                      "Dar estilo a las páginas web",
                      "Estructurar el contenido de las páginas web",
                      "Hacer las páginas interactivas",
                      "Crear animaciones",
                    ],
                    correctAnswer:
                      "Estructurar el contenido de las páginas web",
                    explanation:
                      "HTML se encarga de estructurar y organizar el contenido de las páginas web.",
                    points: 1,
                    orderIndex: 1,
                  },
                });
              }
            }
          } else if (module.title === "Estilos con CSS") {
            const lessons = [
              {
                title: "Introducción a CSS",
                description: "¿Qué es CSS y cómo se integra con HTML?",
                content:
                  "CSS (Cascading Style Sheets) es el lenguaje que nos permite dar estilo y diseño a nuestras páginas HTML. Separa la estructura del diseño.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Selectores CSS",
                description:
                  "Aprende a seleccionar elementos para aplicar estilos",
                content:
                  "Los selectores CSS nos permiten elegir qué elementos HTML queremos estilizar. Existen diferentes tipos de selectores como elementos, clases e IDs.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Propiedades de color y tipografía",
                description: "Controla colores y fuentes en tu página web",
                content:
                  "CSS nos permite controlar el color del texto, fondo, bordes y la tipografía de nuestros elementos HTML.",
                contentType: "TEXT" as const,
                orderIndex: 3,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              const lesson = await prisma.lesson.create({
                data: lessonData,
              });

              // Create quiz for specific lessons
              if (lesson.title === "Introducción a CSS") {
                const lessonQuiz = await prisma.quiz.create({
                  data: {
                    courseId: course.id,
                    lessonId: lesson.id,
                    title: `Quiz: ${lesson.title}`,
                    description: `Evalúa tu comprensión de ${lesson.title}`,
                    timeLimit: 10,
                    passingScore: 80,
                    showCorrectAnswers: true,
                    isActive: true,
                  },
                });

                await prisma.quizQuestion.create({
                  data: {
                    quizId: lessonQuiz.id,
                    question: "¿Qué significa CSS?",
                    type: "MULTIPLE_CHOICE",
                    options: [
                      "Computer Style Sheets",
                      "Cascading Style Sheets",
                      "Creative Style Sheets",
                      "Colorful Style Sheets",
                    ],
                    correctAnswer: "Cascading Style Sheets",
                    explanation:
                      "CSS significa Cascading Style Sheets, el lenguaje para estilizar páginas web.",
                    points: 1,
                    orderIndex: 1,
                  },
                });
              }
            }
          } else if (module.title === "JavaScript Básico") {
            const lessons = [
              {
                title: "Introducción a JavaScript",
                description: "¿Qué es JavaScript y por qué es importante?",
                content:
                  "JavaScript es un lenguaje de programación que permite hacer interactivas las páginas web. Es el único lenguaje que se ejecuta en el navegador.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Variables y tipos de datos",
                description:
                  "Aprende a declarar variables y trabajar con diferentes tipos de datos",
                content:
                  "En JavaScript podemos almacenar información en variables usando let, const o var. Los tipos de datos incluyen números, strings, booleanos, arrays y objetos.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Funciones en JavaScript",
                description:
                  "Crea funciones para organizar y reutilizar código",
                content:
                  "Las funciones nos permiten agrupar código que realiza una tarea específica y reutilizarlo cuando lo necesitemos.",
                contentType: "TEXT" as const,
                orderIndex: 3,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              const lesson = await prisma.lesson.create({
                data: lessonData,
              });

              // Create quiz for specific lessons
              if (lesson.title === "Introducción a JavaScript") {
                const lessonQuiz = await prisma.quiz.create({
                  data: {
                    courseId: course.id,
                    lessonId: lesson.id,
                    title: `Quiz: ${lesson.title}`,
                    description: `Evalúa tu comprensión de ${lesson.title}`,
                    timeLimit: 10,
                    passingScore: 80,
                    showCorrectAnswers: true,
                    isActive: true,
                  },
                });

                await prisma.quizQuestion.create({
                  data: {
                    quizId: lessonQuiz.id,
                    question: "¿Dónde se ejecuta JavaScript?",
                    type: "MULTIPLE_CHOICE",
                    options: [
                      "Solo en el servidor",
                      "Solo en el navegador",
                      "Tanto en el servidor como en el navegador",
                      "Solo en aplicaciones móviles",
                    ],
                    correctAnswer: "Tanto en el servidor como en el navegador",
                    explanation:
                      "JavaScript se puede ejecutar tanto en el navegador (frontend) como en el servidor (backend).",
                    points: 1,
                    orderIndex: 1,
                  },
                });
              }
            }
          }

          // Create quiz for each module
          const quiz = await prisma.quiz.create({
            data: {
              courseId: course.id,
              title: `Quiz: ${module.title}`,
              description: `Evalúa tus conocimientos sobre ${module.title}`,
              timeLimit: 15,
              passingScore: 70,
              showCorrectAnswers: true,
              isActive: true,
            },
          });

          // Create quiz questions
          if (module.title === "Fundamentos de HTML") {
            const questions = [
              {
                question: "¿Qué significa HTML?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                  "HyperText Markup Language",
                  "High Tech Modern Language",
                  "Home Tool Markup Language",
                  "Hyperlink and Text Markup Language",
                ],
                correctAnswer: "HyperText Markup Language",
                explanation:
                  "HTML significa HyperText Markup Language, el lenguaje estándar para crear páginas web.",
                points: 1,
                orderIndex: 1,
                quizId: quiz.id,
              },
              {
                question:
                  "¿Cuál es la etiqueta correcta para un encabezado principal?",
                type: "MULTIPLE_CHOICE" as const,
                options: ["<header>", "<h1>", "<title>", "<head>"],
                correctAnswer: "<h1>",
                explanation:
                  "La etiqueta <h1> se usa para el encabezado principal de la página.",
                points: 1,
                orderIndex: 2,
                quizId: quiz.id,
              },
              {
                question:
                  "¿Todas las etiquetas HTML deben tener una etiqueta de cierre?",
                type: "TRUE_FALSE" as const,
                options: ["Verdadero", "Falso"],
                correctAnswer: "Falso",
                explanation:
                  "No todas las etiquetas necesitan cierre. Algunas como <img> y <br> son auto-cerradas.",
                points: 1,
                orderIndex: 3,
                quizId: quiz.id,
              },
            ];

            for (const questionData of questions) {
              await prisma.quizQuestion.create({
                data: questionData,
              });
            }
          } else if (module.title === "Estilos con CSS") {
            const questions = [
              {
                question: "¿Qué significa CSS?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                  "Cascading Style Sheets",
                  "Computer Style Sheets",
                  "Creative Style Sheets",
                  "Colorful Style Sheets",
                ],
                correctAnswer: "Cascading Style Sheets",
                explanation:
                  "CSS significa Cascading Style Sheets, el lenguaje para estilizar páginas web.",
                points: 1,
                orderIndex: 1,
                quizId: quiz.id,
              },
              {
                question:
                  "¿Cuál es la sintaxis correcta para aplicar color rojo a un párrafo?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                  "p { color: red; }",
                  "p.color = red",
                  "<p style='color:red'>",
                  "p:color(red)",
                ],
                correctAnswer: "p { color: red; }",
                explanation:
                  "La sintaxis CSS correcta es: selector { propiedad: valor; }",
                points: 1,
                orderIndex: 2,
                quizId: quiz.id,
              },
            ];

            for (const questionData of questions) {
              await prisma.quizQuestion.create({
                data: questionData,
              });
            }
          }
        }
      } else if (course.slug === "marketing-digital-emprendedores") {
        // Course 2: Marketing Digital para Emprendedores
        const modules = [
          {
            title: "Fundamentos del Marketing Digital",
            description:
              "Comprende los conceptos básicos del marketing digital",
            orderIndex: 1,
            estimatedDuration: 6,
            courseId: course.id,
          },
          {
            title: "Redes Sociales para Negocios",
            description:
              "Aprende a usar las redes sociales para promocionar tu negocio",
            orderIndex: 2,
            estimatedDuration: 8,
            courseId: course.id,
          },
          {
            title: "Publicidad Digital",
            description: "Crea y gestiona campañas publicitarias efectivas",
            orderIndex: 3,
            estimatedDuration: 8,
            courseId: course.id,
          },
          {
            title: "Análisis y Métricas",
            description: "Mide el éxito de tus estrategias de marketing",
            orderIndex: 4,
            estimatedDuration: 8,
            courseId: course.id,
          },
        ];

        for (const moduleData of modules) {
          const module = await prisma.courseModule.create({
            data: moduleData,
          });

          // Create lessons for each module
          if (module.title === "Fundamentos del Marketing Digital") {
            const lessons = [
              {
                title: "¿Qué es el Marketing Digital?",
                description: "Introducción al marketing digital y sus ventajas",
                content:
                  "El marketing digital es el conjunto de estrategias publicitarias que se ejecutan a través de medios digitales para promocionar productos o servicios.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Diferencias entre Marketing Tradicional y Digital",
                description: "Compara ambos enfoques y sus características",
                content:
                  "El marketing digital ofrece mayor alcance, medición precisa, costos más bajos y personalización, a diferencia del marketing tradicional.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              await prisma.lesson.create({
                data: lessonData,
              });
            }
          } else if (module.title === "Redes Sociales para Negocios") {
            const lessons = [
              {
                title: "Estrategia en Redes Sociales",
                description: "Planifica tu presencia en redes sociales",
                content:
                  "Una buena estrategia en redes sociales incluye definir objetivos, conocer a tu audiencia, elegir las plataformas adecuadas y crear contenido relevante.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Facebook e Instagram para Negocios",
                description: "Aprovecha estas plataformas para tu negocio",
                content:
                  "Facebook e Instagram ofrecen herramientas específicas para negocios como páginas, perfiles comerciales, anuncios y métricas detalladas.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              await prisma.lesson.create({
                data: lessonData,
              });
            }
          }

          // Create quiz for each module
          const quiz = await prisma.quiz.create({
            data: {
              courseId: course.id,
              title: `Quiz: ${module.title}`,
              description: `Evalúa tus conocimientos sobre ${module.title}`,
              timeLimit: 20,
              passingScore: 70,
              showCorrectAnswers: true,
              isActive: true,
            },
          });

          // Create quiz questions
          if (module.title === "Fundamentos del Marketing Digital") {
            const questions = [
              {
                question:
                  "¿Cuál es la principal ventaja del marketing digital?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                  "Mayor alcance y medición precisa",
                  "Menor costo de producción",
                  "Mayor credibilidad",
                  "Más fácil de implementar",
                ],
                correctAnswer: "Mayor alcance y medición precisa",
                explanation:
                  "El marketing digital permite llegar a más personas y medir exactamente el impacto de cada acción.",
                points: 1,
                orderIndex: 1,
                quizId: quiz.id,
              },
              {
                question:
                  "¿El marketing digital es más caro que el tradicional?",
                type: "TRUE_FALSE" as const,
                options: ["Verdadero", "Falso"],
                correctAnswer: "Falso",
                explanation:
                  "Generalmente el marketing digital es más económico y ofrece mejor ROI que el marketing tradicional.",
                points: 1,
                orderIndex: 2,
                quizId: quiz.id,
              },
            ];

            for (const questionData of questions) {
              await prisma.quizQuestion.create({
                data: questionData,
              });
            }
          }
        }
      } else if (course.slug === "habilidades-comunicacion-efectiva") {
        // Course 3: Habilidades de Comunicación Efectiva
        const modules = [
          {
            title: "Fundamentos de la Comunicación",
            description: "Comprende los elementos básicos de la comunicación",
            orderIndex: 1,
            estimatedDuration: 4,
            courseId: course.id,
          },
          {
            title: "Comunicación Verbal",
            description: "Mejora tu expresión oral y vocal",
            orderIndex: 2,
            estimatedDuration: 6,
            courseId: course.id,
          },
          {
            title: "Comunicación No Verbal",
            description: "Domina el lenguaje corporal y la expresión",
            orderIndex: 3,
            estimatedDuration: 5,
            courseId: course.id,
          },
          {
            title: "Presentaciones Efectivas",
            description: "Aprende a crear y dar presentaciones impactantes",
            orderIndex: 4,
            estimatedDuration: 5,
            courseId: course.id,
          },
        ];

        for (const moduleData of modules) {
          const module = await prisma.courseModule.create({
            data: moduleData,
          });

          // Create lessons for each module
          if (module.title === "Fundamentos de la Comunicación") {
            const lessons = [
              {
                title: "Elementos de la Comunicación",
                description:
                  "Conoce los componentes básicos del proceso comunicativo",
                content:
                  "La comunicación incluye emisor, receptor, mensaje, canal, código y contexto. Todos estos elementos son esenciales para una comunicación efectiva.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Barreras de la Comunicación",
                description: "Identifica y supera los obstáculos comunicativos",
                content:
                  "Las barreras pueden ser físicas, psicológicas, semánticas o culturales. Reconocerlas es el primer paso para superarlas.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              await prisma.lesson.create({
                data: lessonData,
              });
            }
          } else if (module.title === "Comunicación Verbal") {
            const lessons = [
              {
                title: "Técnicas de Expresión Oral",
                description: "Mejora tu forma de hablar y expresarte",
                content:
                  "La expresión oral efectiva incluye claridad, ritmo apropiado, volumen adecuado y entonación correcta.",
                contentType: "TEXT" as const,
                orderIndex: 1,
                isRequired: true,
                moduleId: module.id,
              },
              {
                title: "Escucha Activa",
                description: "Aprende a escuchar de manera efectiva",
                content:
                  "La escucha activa implica prestar atención completa, hacer preguntas clarificadoras y mostrar interés genuino.",
                contentType: "TEXT" as const,
                orderIndex: 2,
                isRequired: true,
                moduleId: module.id,
              },
            ];

            for (const lessonData of lessons) {
              await prisma.lesson.create({
                data: lessonData,
              });
            }
          }

          // Create quiz for each module
          const quiz = await prisma.quiz.create({
            data: {
              courseId: course.id,
              title: `Quiz: ${module.title}`,
              description: `Evalúa tus conocimientos sobre ${module.title}`,
              timeLimit: 15,
              passingScore: 70,
              showCorrectAnswers: true,
              isActive: true,
            },
          });

          // Create quiz questions
          if (module.title === "Fundamentos de la Comunicación") {
            const questions = [
              {
                question:
                  "¿Cuáles son los elementos básicos de la comunicación?",
                type: "MULTIPLE_SELECT" as const,
                options: [
                  "Emisor",
                  "Receptor",
                  "Mensaje",
                  "Canal",
                  "Código",
                  "Contexto",
                ],
                correctAnswer: "Emisor,Receptor,Mensaje,Canal,Código,Contexto",
                explanation:
                  "Todos estos elementos son fundamentales en el proceso de comunicación.",
                points: 2,
                orderIndex: 1,
                quizId: quiz.id,
              },
              {
                question: "¿La comunicación es un proceso bidireccional?",
                type: "TRUE_FALSE" as const,
                options: ["Verdadero", "Falso"],
                correctAnswer: "Verdadero",
                explanation:
                  "La comunicación efectiva requiere retroalimentación entre emisor y receptor.",
                points: 1,
                orderIndex: 2,
                quizId: quiz.id,
              },
            ];

            for (const questionData of questions) {
              await prisma.quizQuestion.create({
                data: questionData,
              });
            }
          }
        }
      }
    }

    console.log("✅ Course modules, lessons, and quizzes created");

    // Create some sample news articles
    const newsArticles = [
      {
        title: "Nuevas Oportunidades de Empleo para Jóvenes en Tecnología",
        content:
          "El sector tecnológico en Bolivia está experimentando un crecimiento significativo, creando nuevas oportunidades de empleo para jóvenes profesionales. Las empresas buscan talento joven con conocimientos en programación, marketing digital y análisis de datos.",
        summary:
          "El sector tecnológico boliviano ofrece nuevas oportunidades laborales para jóvenes con habilidades digitales.",
        authorId: "", // Will be set below
        authorName: "TechCorp Bolivia",
        authorType: "COMPANY" as const,
        status: "PUBLISHED" as const,
        priority: "HIGH" as const,
        featured: true,
        tags: ["Tecnología", "Empleo", "Jóvenes", "Oportunidades"],
        category: "Empleo",
        publishedAt: new Date(),
        targetAudience: ["YOUTH", "ADOLESCENTS"],
        region: "Cochabamba",
      },
      {
        title: "Programa de Capacitación Gratuita para Emprendedores",
        content:
          "La Fundación Ayuda Social lanza un nuevo programa de capacitación gratuita dirigido a emprendedores jóvenes. El programa incluye módulos sobre plan de negocios, marketing digital y gestión financiera.",
        summary:
          "Programa gratuito de capacitación para emprendedores jóvenes en Bolivia.",
        authorId: "", // Will be set below
        authorName: "Fundación Ayuda Social",
        authorType: "NGO" as const,
        status: "PUBLISHED" as const,
        priority: "MEDIUM" as const,
        featured: false,
        tags: ["Capacitación", "Emprendimiento", "Gratuito", "Jóvenes"],
        category: "Educación",
        publishedAt: new Date(),
        targetAudience: ["YOUTH"],
        region: "Cochabamba",
      },
    ];

    // Get a company and NGO profile for news articles
    const companyProfile = await prisma.profile.findFirst({
      where: { role: UserRole.COMPANIES },
    });
    const ngoProfile = await prisma.profile.findFirst({
      where: { role: UserRole.NGOS_AND_FOUNDATIONS },
    });

    if (companyProfile && ngoProfile) {
      newsArticles[0].authorId = companyProfile.userId;
      newsArticles[1].authorId = ngoProfile.userId;

      for (const newsData of newsArticles) {
        await prisma.newsArticle.create({
          data: newsData,
        });
      }
      console.log("✅ Sample news articles created");
    }

    // Create some sample resources
    const resources = [
      {
        title: "Guía de Empleo para Jóvenes",
        description:
          "Una guía completa con consejos y estrategias para encontrar empleo siendo joven en Bolivia.",
        type: "PDF",
        category: "Empleo",
        format: "PDF",
        downloadUrl: "/resources/guia-empleo-jovenes.pdf",
        thumbnail: "/resources/thumbnails/guia-empleo.jpg",
        author: "CEMSE",
        publishedDate: new Date(),
        tags: ["Empleo", "Jóvenes", "Guía", "Consejos"],
        isPublic: true,
        createdByUserId: superAdmin.id,
      },
      {
        title: "Plantilla de CV Profesional",
        description:
          "Plantilla editable de currículum vitae profesional para jóvenes que buscan empleo.",
        type: "DOCUMENT",
        category: "Recursos",
        format: "DOCX",
        downloadUrl: "/resources/plantilla-cv-profesional.docx",
        thumbnail: "/resources/thumbnails/plantilla-cv.jpg",
        author: "CEMSE",
        publishedDate: new Date(),
        tags: ["CV", "Plantilla", "Empleo", "Profesional"],
        isPublic: true,
        createdByUserId: superAdmin.id,
      },
    ];

    for (const resourceData of resources) {
      await prisma.resource.create({
        data: resourceData,
      });
    }

    console.log("✅ Sample resources created");

    console.log("🎉 Comprehensive database seeding completed!");
    console.log("");
    console.log("📋 Login Credentials:");
    console.log("Super Admin: admin / admin123");
    console.log("");
    console.log("Youth Users:");
    youthUsers.forEach((user) => {
      console.log(
        `  ${user.firstName} ${user.lastName}: ${user.username} / ${user.password}`
      );
    });
    console.log("");
    console.log("Adolescent Users:");
    adolescentUsers.forEach((user) => {
      console.log(
        `  ${user.firstName} ${user.lastName}: ${user.username} / ${user.password}`
      );
    });
    console.log("");
    console.log("Institution Users:");
    institutionUsers.forEach((user) => {
      console.log(`  ${user.name}: ${user.username} / ${user.password}`);
    });
    console.log("");
    console.log("Municipal Government Users:");
    municipalGovernmentUsers.forEach((user) => {
      console.log(`  ${user.name}: ${user.username} / ${user.password}`);
    });
    console.log("");
    console.log("Company Users:");
    companyUsers.forEach((user) => {
      console.log(`  ${user.name}: ${user.username} / ${user.password}`);
    });
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
