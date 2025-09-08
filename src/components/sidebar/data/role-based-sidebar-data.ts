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
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Empleos",
          url: "/jobs",
          icon: Search,
        },
        {
          title: "Postulaciones",
          url: "/my-youth-applications",
          icon: FileText,
        },
        {
          title: "Instituciones",
          url: "/institutions",
          icon: Building2,
        },
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
      ],
    },
    {
      title: "Desarrollo",
      items: [
        {
          title: "Cursos",
          url: "/courses",
          icon: GraduationCap,
        },
        {
          title: "Certificados",
          url: "/certificates",
          icon: GraduationCap,
        },
        {
          title: "Hub de Emprendimiento",
          url: "/entrepreneurship",
          icon: Lightbulb,
        },

        {
          title: "Mis Emprendimientos",
          url: "/my-entrepreneurships",
          icon: Lightbulb,
        },
      ],
    },
    //{
    //title: "Recursos de Emprendimiento",
    //items: [
    //{
    //title: "Directorio de Instituciones",
    //url: "/entrepreneurship/directory",
    //icon: Building2,
    //},
    //],
    //},
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
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Empleos",
          url: "/jobs",
          icon: Search,
        },
        {
          title: "Postulaciones",
          url: "/my-applications",
          icon: FileText,
        },
      ],
    },
    {
      title: "Desarrollo",
      items: [
        {
          title: "Cursos",
          url: "/courses",
          icon: GraduationCap,
        },
        {
          title: "Certificados",
          url: "/certificates",
          icon: GraduationCap,
        },
        {
          title: "Hub de Emprendimiento",
          url: "/entrepreneurship",
          icon: Lightbulb,
        },
        {
          title: "Simulador de Plan de Negocios",
          url: "/business-plan-simulator",
          icon: Lightbulb,
        },
        {
          title: "Centro de Recursos",
          url: "/entrepreneurship/resources",
          icon: Lightbulb,
        },
        {
          title: "Publicar mi Emprendimiento",
          url: "/publish-entrepreneurship",
          icon: Lightbulb,
        },
        {
          title: "Mis Emprendimientos",
          url: "/my-entrepreneurships",
          icon: Lightbulb,
        },
        {
          title: "Mensajería",
          url: "/entrepreneurship/messaging",
          icon: MessageCircle,
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
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Empleos",
          url: "/company/jobs",
          icon: Briefcase,
        },
        {
          title: "Candidatos",
          url: "/job-publishing/candidates",
          icon: Users,
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
      title: "Personal",
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
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
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
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Gestión de Recursos",
          url: "/municipalities/resources",
          icon: FileText,
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
      title: "Personal",
      items: [
        {
          title: "Mi Perfil",
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
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
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
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Gestión de Recursos",
          url: "/municipalities/resources",
          icon: FileText,
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
      title: "Personal",
      items: [
        {
          title: "Mi Perfil",
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
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
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
          title: "Gestión de Cursos",
          url: "/admin/courses",
          icon: GraduationCap,
        },
        {
          title: "Gestión de Recursos",
          url: "/municipalities/resources",
          icon: FileText,
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
      title: "Personal",
      items: [
        {
          title: "Mi Perfil",
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
      title: "Principal",
      items: [
        {
          title: "Panel Principal",
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
          title: "Gestión de Recursos",
          url: "/admin/entrepreneurship/resources",
          icon: Lightbulb,
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
      title: "Personal",
      items: [
        {
          title: "Configuración",
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
      console.log(
        "🔍 getSidebarDataByRole - No match for role:",
        role,
        "using superAdminSidebarData as fallback for admin roles"
      );
      // For any unknown role, check if it contains "ADMIN" and return super admin data
      if (
        role &&
        typeof role === "string" &&
        role.toUpperCase().includes("ADMIN")
      ) {
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
        title: "Panel Principal",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Empleos",
        icon: Search,
        href: "/jobs",
      },
      {
        title: "Postulaciones",
        icon: FileText,
        href: "/my-applications",
      },
      {
        title: "Instituciones",
        icon: Building2,
        href: "/institutions",
      },
    ],
  },
  {
    title: "Desarrollo",
    items: [
      {
        title: "Cursos",
        icon: GraduationCap,
        href: "/courses",
      },
      {
        title: "Emprendimiento",
        icon: Lightbulb,
        href: "/entrepreneurship",
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
    ],
  },
];
