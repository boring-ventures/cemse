"use client";

// import { useUserColors } from "@/hooks/use-user-colors";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { NavGroup } from "@/components/sidebar/nav-group";
import { NavUser } from "@/components/sidebar/nav-user";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  User,
  Users,
  BookOpen,
  GraduationCap,
  Heart,
  BarChart3,
  Settings,
  Home,
  Globe,
  Zap,
  Command,
} from "lucide-react";
import { getSidebarDataByRole } from "./data/role-based-sidebar-data";
import type { UserRole } from "@/types/api";
import { cn } from "@/lib/utils";

interface AdaptiveAppSidebarProps {
  className?: string;
}

export function AdaptiveAppSidebar({ className }: AdaptiveAppSidebarProps) {
  const { profile } = useCurrentUser();

  // Aplicar colores del usuario - DESHABILITADO TEMPORALMENTE
  // useUserColors();

  // Obtener datos del usuario para el sidebar
  const userRole = profile?.role || "USUARIO";

  // Debug logs para ver qué está pasando
  console.log("🎨 AdaptiveAppSidebar - Component rendered:", {
    userRole,
    profile: profile
      ? {
          id: profile.id,
          role: profile.role,
          primaryColor: profile.primaryColor,
          secondaryColor: profile.secondaryColor,
        }
      : null,
  });

  // Obtener datos del sidebar basados en el rol del usuario
  const sidebarData = getSidebarDataByRole(userRole as UserRole);

  // Condición especial para municipios: aplicar colores primario y secundario - DESHABILITADO TEMPORALMENTE
  // const isMunicipality =
  //   userRole === "GOBIERNOS_MUNICIPALES" ||
  //   (userRole && userRole.toLowerCase().includes("municipal"));

  // console.log("🎨 AdaptiveAppSidebar - Municipality check:", {
  //   userRole,
  //   isMunicipality,
  //   willApplyStyles: isMunicipality,
  //   userRoleType: typeof userRole,
  //   userRoleLower: userRole ? userRole.toLowerCase() : null,
  //   includesMunicipal: userRole
  //     ? userRole.toLowerCase().includes("municipal")
  //     : false,
  // });

  // Use sidebar data consistently for all roles
  const getNavigationItems = () => {
    // Always use the data from getSidebarDataByRole function
    // since it handles all role mappings properly
    return sidebarData.navGroups;
  };

  const navigationItems = getNavigationItems();

  // Define teams data for TeamSwitcher
  const teams = [
    {
      name: "CEMSE Platform",
      logo: Command,
      plan: "Employability & Entrepreneurship",
    },
    {
      name: "Cochabamba",
      logo: Globe,
      plan: "Regional Hub",
    },
    {
      name: "Bolivia",
      logo: Zap,
      plan: "National Network",
    },
  ];

  // Generar estilos CSS personalizados para municipios - DESHABILITADO TEMPORALMENTE
  // const getMunicipalityStyles = () => {
  //   if (!isMunicipality) {
  //     console.log("🎨 getMunicipalityStyles - No styles applied:", {
  //       isMunicipality,
  //     });
  //     return {};
  //   }

  //   console.log("🎨 getMunicipalityStyles - Applying municipality styles");

  //   // No necesitamos establecer variables CSS aquí porque ya están establecidas por useUserColors
  //   return {};
  // };

  // Log final state before rendering
  console.log("🎨 AdaptiveAppSidebar - Final render state:", {
    // isMunicipality,
    className: cn(className),
    // styles: getMunicipalityStyles(),
    userRole,
  });

  return (
    <Sidebar
      className={cn(className)}
      // style={getMunicipalityStyles()}
    >
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarInset>
          {navigationItems.map((group, groupIndex) => (
            <NavGroup
              key={groupIndex}
              title={group.title}
              items={group.items}
            />
          ))}
        </SidebarInset>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
