import {
  LayoutDashboard,
  Search,
  FileText,
  GraduationCap,
  Lightbulb,
  User,
  BarChart3,
  Briefcase,
  Building2,
  Users,
  Settings,
  PieChart,
  UserCog,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
  Newspaper,
  UserCircle,
  MessageCircle,
  Calendar,
} from "lucide-react";
import type { SidebarData, SidebarItem } from "../types";
import type { UserRole } from "@/types/api";

const commonTeams = [
  {
    name: "CEMSE Platform",
    logo: Command,
    plan: "Employability & Entrepreneurship",
  },
  {
    name: "Cochabamba",
    logo: GalleryVerticalEnd,
    plan: "Regional Hub",
  },
  {
    name: "Bolivia",
    logo: AudioWaveform,
    plan: "National Network",
  },
];

// YOUTH navigation
export const youthSidebarData: SidebarData = {
  user: {
    name: "Usuario Joven",
    email: "youth@example.com",
    avatar: "/avatars/youth.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Buscar Empleos",
          url: "/jobs",
          icon: Search,
        },
        {
          title: "Mis Aplicaciones",
          icon: FileText,
          items: [
            {
              title: "Ver Mis Aplicaciones",
              url: "/my-applications",
            },
          ],
        },
        {
          title: "Mis Postulaciones de Joven",
          icon: FileText,
          items: [
            {
              title: "Ver Mis Postulaciones",
              url: "/my-youth-applications",
            },
            {
              title: "Nueva Postulación",
              url: "/my-applications/new",
            },
          ],
        },

      ],
    },
    {
      title: "Desarrollo",
      items: [
        {
          title: "Capacitación",
          icon: GraduationCap,
          items: [
            {
              title: "Explorar Cursos",
              url: "/courses",
            },
            {
              title: "Mis Cursos",
              url: "/my-courses",
            },
            {
              title: "Certificados",
              url: "/certificates",
            },
          ],
        },
        {
          title: "Emprendimiento",
          icon: Lightbulb,
          items: [
            {
              title: "Hub de Emprendimiento",
              url: "/entrepreneurship",
            },
            {
              title: "Simulador de Plan de Negocios",
              url: "/business-plan-simulator",
            },
            {
              title: "Centro de Recursos",
              url: "/resources",
            },
            {
              title: "Publicar mi Emprendimiento",
              url: "/publish-entrepreneurship",
            },
            {
              title: "Mis Emprendimientos",
              url: "/my-entrepreneurships",
            },

          ],
        },
      ],
    },
    {
      title: "Recursos de Emprendimiento",
      items: [
        {
          title: "Directorio de Instituciones",
          url: "/entrepreneurship/directory",
          icon: Building2,
        },

      ],
    },
    {
      title: "Conectar con Emprendedores",
      items: [
        {
          title: "Buscar Emprendedores",
          url: "/entrepreneurship/network",
          icon: Users,
        },

      ],
    },
    {
      title: "Información",
      items: [
        {
          title: "Noticias",
          icon: Newspaper,
          url: "/news",
        },

      ],
    },
    {
      title: "Personal",
      items: [
        {
          title: "Mi Perfil",
          url: "/profile",
          icon: User,
        },
        {
          title: "CV Builder",
          url: "/cv-builder",
          icon: FileText,
        },
        // {
        //   title: "Reportes Personales",
        //   url: "/reports/personal",
        //   icon: BarChart3,
        // },
      ],
    },
  ],
};


// ADOLESCENTS navigation (similar to youth but no reports)
export const adolescentSidebarData: SidebarData = {
  user: {
    name: "Usuario Adolescente",
    email: "adolescent@example.com",
    avatar: "/avatars/adolescent.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Buscar Empleos",
          url: "/jobs",
          icon: Search,
        },
        {
          title: "Mis Postulaciones",
          url: "/my-applications",
          icon: FileText,
        },
      ],
    },
    {
      title: "Desarrollo",
      items: [
        {
          title: "Capacitación",
          icon: GraduationCap,
          items: [
            {
              title: "Cursos Disponibles",
              url: "/courses",
            },
            {
              title: "Mis Cursos",
              url: "/my-courses",
            },
            {
              title: "Certificados",
              url: "/certificates",
            },
          ],
        },
        {
          title: "Emprendimiento",
          icon: Lightbulb,
          items: [
            {
              title: "Hub de Emprendimiento",
              url: "/entrepreneurship",
            },
            {
              title: "Simulador de Plan de Negocios",
              url: "/business-plan-simulator",
            },
            {
              title: "Centro de Recursos",
              url: "/entrepreneurship/resources",
            },
            // {
            //   title: "Directorio de Instituciones",
            //   url: "/entrepreneurship/directory",
            // },
            {
              title: "Publicar mi Emprendimiento",
              url: "/publish-entrepreneurship",
            },
            {
              title: "Mis Emprendimientos",
              url: "/my-entrepreneurships",
            },
            // {
            //   title: "Red de Contactos",
            //   url: "/entrepreneurship/network",
            // },
            {
              title: "Mensajería",
              url: "/entrepreneurship/messaging",
              icon: MessageCircle,
            },

          ],
        },
      ],
    },
    {
      title: "Personal",
      items: [
        {
          title: "Mi Perfil",
          url: "/profile",
          icon: User,
        },
        // Note: No Reports for adolescents per permission matrix
      ],
    },
  ],
};

// COMPANIES navigation
export const companySidebarData: SidebarData = {
  user: {
    name: "Empresa",
    email: "company@example.com",
    avatar: "/avatars/company.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Publicar Empleos",
          url: "/jobs/create",
          icon: Briefcase,
        },
        {
          title: "Mis Empleos",
          url: "/company/jobs",
          icon: Building2,
        },
        {
          title: "Gestionar Candidatos",
          url: "/job-publishing/candidates",
          icon: Users,
        },
        {
          title: "Postulaciones de Jóvenes",
          url: "/company/youth-applications",
          icon: FileText,
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/company/news",
          icon: FileText,
        },
      ],
    },
    {
      title: "Recursos",
      items: [
        {
          title: "Ver Recursos",
          url: "/resources",
          icon: FileText,
        },
        {
          title: "Crear Recurso",
          url: "/resources/create",
          icon: FileText,
        },
      ],
    },
    // {
    //   title: "Análisis",
    //   items: [
    //     {
    //       title: "Reportes Empresariales",
    //       url: "/company/report",
    //       icon: BarChart3,
    //     },
    //   ],
    // },
    {
      title: "Configuración",
      items: [
        {
          title: "Perfil de Empresa",
          url: "/company/profile",
          icon: Building2,
        },
      ],
    },
  ],
};

// MUNICIPAL GOVERNMENTS navigation
export const municipalGovernmentSidebarData: SidebarData = {
  user: {
    name: "Gobierno Municipal",
    email: "municipality@example.com",
    avatar: "/avatars/government.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Administración",
      items: [
        {
          title: "Dashboard Administrativo",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Empresas",
          url: "/admin/companies",
          icon: Building2,
        },
      ],
    },
    {
      title: "Programas",
      items: [
        {
          title: "Capacitación",
          icon: GraduationCap,
          items: [
            {
              title: "Gestión de Cursos",
              url: "/admin/courses",
            },
            {
              title: "Crear Curso",
              url: "/admin/courses/create",
            },
            {
              title: "Estudiantes",
              url: "/admin/students",
            },
          ],
        },
        {
          title: "Contenido para Jóvenes",
          icon: Lightbulb,
          items: [
            {
              title: "Gestión de Contenido",
              url: "/admin/youth-content",
            },
          ],
        },

        {
          title: "Recursos",
          icon: FileText,
          items: [
            {
              title: "Gestión de Recursos",
              url: "/municipalities/resources",
            },
            {
              title: "Crear Recurso",
              url: "/resources/create",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/admin/municipalities/news",
          icon: FileText,
        },
      ],
    },
    {
      title: "Análisis",
      items: [
        {
          title: "Reportes Avanzados",
          url: "/reports/admin",
          icon: PieChart,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Perfil",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// TRAINING CENTERS navigation
export const trainingCenterSidebarData: SidebarData = {
  user: {
    name: "Centro de Capacitación",
    email: "training@example.com",
    avatar: "/avatars/training.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Administración",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Usuarios",
          url: "/admin/users",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Programas",
      items: [
        {
          title: "Capacitación",
          icon: GraduationCap,
          items: [
            {
              title: "Gestión de Cursos",
              url: "/admin/courses",
            },
            {
              title: "Crear Curso",
              url: "/admin/courses/create",
            },
            {
              title: "Estudiantes",
              url: "/admin/students",
            },
          ],
        },
        {
          title: "Contenido para Jóvenes",
          icon: Lightbulb,
          items: [
            {
              title: "Gestión de Contenido",
              url: "/admin/youth-content",
            },
            {

            },
          ],
        },
        {
          title: "Recursos",
          icon: FileText,
          items: [
            {
              title: "Ver Recursos",
              url: "/resources",
            },
            {
              title: "Crear Recurso",
              url: "/resources/create",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/admin/news",
          icon: FileText,
        },
      ],
    },
    {
      title: "Análisis",
      items: [
        {
          title: "Reportes de Capacitación",
          url: "/reports/training",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Configuración",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// NGOS AND FOUNDATIONS navigation
export const ngoFoundationSidebarData: SidebarData = {
  user: {
    name: "ONG/Fundación",
    email: "ngo@example.com",
    avatar: "/avatars/ngo.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Administración",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Usuarios",
          url: "/admin/users",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Programas",
      items: [
        {
          title: "Capacitación",
          icon: GraduationCap,
          items: [
            {
              title: "Gestión de Cursos",
              url: "/admin/courses",
            },
            {
              title: "Crear Curso",
              url: "/admin/courses/create",
            },
            {
              title: "Estudiantes",
              url: "/admin/students",
            },
          ],
        },
        {
          title: "Contenido para Jóvenes",
          icon: Lightbulb,
          items: [
            {
              title: "Gestión de Contenido",
              url: "/admin/youth-content",
            },
            {

            },
          ],
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/admin/news",
          icon: FileText,
        },
        {
          title: "Recursos",
          icon: FileText,
          items: [
            {
              title: "Ver Recursos",
              url: "/resources",
            },
            {
              title: "Crear Recurso",
              url: "/resources/create",
            },
          ],
        },
      ],
    },
    {
      title: "Análisis",
      items: [
        {
          title: "Reportes de Impacto Social",
          url: "/reports/impact",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Configuración",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

// SUPERADMIN navigation
export const superAdminSidebarData: SidebarData = {
  user: {
    name: "Super Administrador",
    email: "admin@cemse.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: commonTeams,
  navGroups: [
    {
      title: "Administración",
      items: [
        {
          title: "Dashboard Administrativo",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Gestión de Usuarios",
          url: "/admin/users",
          icon: UserCog,
        },
        {
          title: "Gestión de Instituciones",
          url: "/admin/municipalities",
          icon: Building2,
        },
        {
          title: "Gestión de Empresas",
          url: "/admin/companies",
          icon: Building2,
        },
        {
          title: "Gestión de Roles",
          url: "/admin/roles",
          icon: Users,
        },
      ],
    },
    {
      title: "Capacitación",
      items: [
        {
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Crear Curso",
          url: "/admin/courses/create",
          icon: GraduationCap,
        },
        {
          title: "Estudiantes",
          url: "/admin/students",
          icon: Users,
        },
      ],
    },
    {
      title: "Empleos",
      items: [
        {
          title: "Gestión de Empleos",
          url: "/admin/job-offers",
          icon: Briefcase,
        },
        {
          title: "Candidatos",
          url: "/admin/job-applications",
          icon: Users,
        },
      ],
    },
    {
      title: "Emprendimiento",
      items: [
        {
          title: "Gestión de Contenido",
          url: "/admin/entrepreneurship",
          icon: Lightbulb,
        },
      ],
    },

    {
      title: "Recursos",
      items: [
        {
          title: "Gestión de Recursos",
          url: "/resources",
          icon: FileText,
        },
        {
          title: "Crear Recurso",
          url: "/resources/create",
          icon: FileText,
        },
      ],
    },
    {
      title: "Comunicación",
      items: [
        {
          title: "Gestión de Noticias",
          url: "/admin/news",
          icon: FileText,
        },
        {
          title: "Anuncios del Sistema",
          url: "/admin/announcements",
          icon: Newspaper,
        },
      ],
    },
    {
      title: "Análisis",
      items: [
        {
          title: "Reportes del Sistema",
          url: "/admin/reports",
          icon: BarChart3,
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
          icon: PieChart,
        },
      ],
    },
    {
      title: "Configuración",
      items: [
        {
          title: "Configuración del Sistema",
          url: "/admin/settings",
          icon: Settings,
        },
        {
          title: "Mi Perfil",
          url: "/profile",
          icon: User,
        },
      ],
    },
  ],
};

export function getSidebarDataByRole(role: UserRole): SidebarData {
  console.log("🔍 getSidebarDataByRole - Role:", role);

  switch (role) {
    case "JOVENES":
      return youthSidebarData;
    case "ADOLESCENTES":
      return adolescentSidebarData;
    case "EMPRESAS":
    case "COMPANIES":
      return companySidebarData;
    case "GOBIERNOS_MUNICIPALES":
      return municipalGovernmentSidebarData;
    case "CENTROS_DE_FORMACION":
      return trainingCenterSidebarData;
    case "ONGS_Y_FUNDACIONES":
      return ngoFoundationSidebarData;
    case "SUPER_ADMIN":
    case "SUPERADMIN":
      return superAdminSidebarData;
    default:
      console.log("🔍 getSidebarDataByRole - No match for role:", role, "using superAdminSidebarData as fallback for admin roles");
      // For any unknown role, check if it contains "ADMIN" and return super admin data
      if (role && typeof role === 'string' && role.toUpperCase().includes('ADMIN')) {
        return superAdminSidebarData;
      }
      return youthSidebarData; // Default fallback to youth data
  }
}

export const youthSidebarItems: SidebarItem[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Buscar Empleos",
        icon: Briefcase,
        href: "/jobs",
      },
      {
        title: "Mis Postulaciones",
        icon: Briefcase,
        href: "/my-applications",
      },
    ],
  },
  {
    title: "Desarrollo",
    items: [
      {
        title: "Capacitación",
        icon: GraduationCap,
        href: "/courses",
        items: [
          {
            title: "Explorar Cursos",
            href: "/courses",
          },
          {
            title: "Mis Cursos",
            href: "/my-courses",
          },
        ],
      },
      {
        title: "Emprendimiento",
        icon: Lightbulb,
        href: "/entrepreneurship",
        items: [
          {
            title: "Recursos",
            href: "/entrepreneurship/resources",
          },
          {
            title: "Directorio",
            href: "/entrepreneurship/directory",
          },
          {
            title: "Red de Contactos",
            href: "/entrepreneurship/network",
          },
        ],
      },
    ],
  },
  {
    title: "Información",
    items: [
      {
        title: "Noticias",
        icon: Newspaper,
        href: "/news",
      },
    ],
  },
  {
    title: "Personal",
    items: [
      {
        title: "Mi Perfil",
        icon: UserCircle,
        href: "/profile",
      },
      // {
      //   title: "Reportes Personales",
      //   icon: BarChart3,
      //   href: "/reports",
      // },
    ],
  },
];
