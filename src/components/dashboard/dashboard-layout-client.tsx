"use client";

import { cn } from "@/lib/utils";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdaptiveAppSidebar } from "@/components/sidebar/adaptive-app-sidebar";
import SkipToMain from "@/components/skip-to-main";
import { AdaptiveHeader } from "@/components/sidebar/adaptive-header";
import RoleGuard from "@/components/auth/role-guard";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { useUserColors } from "@/hooks/use-user-colors";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutProps) {
  // Aplicar colores del usuario globalmente
  useUserColors();

  return (
    <RoleGuard>
      <AuthRedirect />
      <SearchProvider>
        <SidebarProvider defaultOpen={true}>
          <SkipToMain />
          <AdaptiveAppSidebar className="fixed inset-y-0 left-0 z-20" />
          <div
            id="content"
            className={cn(
              "ml-auto w-full max-w-full min-w-0", // Added min-w-0 to prevent flex item overflow
              "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
              "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
              "transition-[width] duration-200 ease-linear",
              "flex min-h-screen flex-col",
              "group-data-[scroll-locked=1]/body:h-full",
              "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:min-h-screen",
              "overflow-x-hidden" // Prevent horizontal overflow
            )}
          >
            <AdaptiveHeader />
            {children}
          </div>
        </SidebarProvider>
      </SearchProvider>
    </RoleGuard>
  );
}
