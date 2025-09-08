"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/hooks/use-auth";
import { useUserColors } from "@/hooks/use-user-colors";
import { ProfileDropdown } from "./profile-dropdown";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface AdaptiveHeaderProps {
  title: string;
  breadcrumbs?: string[];
  userRole?: string;
  showSearch?: boolean;
  showThemeSwitch?: boolean;
  showProfileDropdown?: boolean;
}

export function AdaptiveHeader({
  title,
  breadcrumbs = [],
  userRole,
  showSearch = true,
  showThemeSwitch = true,
  showProfileDropdown = true,
}: AdaptiveHeaderProps) {
  const { user } = useAuthContext();
  const { toggleSidebar } = useSidebar();

  // Usar el hook para aplicar las variables CSS automáticamente
  useUserColors();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 bg-sidebar-background/95 backdrop-blur-md px-4">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex aspect-square size-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="M9 3v18" />
          </svg>
          <span className="sr-only">Alternar barra lateral</span>
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {/* Home icon for first breadcrumb */}
          {breadcrumbs.length > 0 && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-sidebar-accent/50 transition-colors duration-200"
              aria-label="Ir al inicio"
            >
              <Home className="h-3.5 w-3.5 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors duration-200" />
            </Link>
          )}

          {breadcrumbs.length > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60 flex-shrink-0" />
          )}

          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors duration-200 cursor-default">
                {crumb}
              </span>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60 flex-shrink-0" />
              )}
            </div>
          ))}

          {/* Current page title */}
          <div className="flex items-center gap-2">
            {breadcrumbs.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60 flex-shrink-0" />
            )}
            <h1 className="text-sm font-semibold text-sidebar-foreground truncate">
              {title}
            </h1>
          </div>
        </nav>
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center gap-3">
        {/* User role badge */}
        {userRole && (
          <div className="hidden sm:flex items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sidebar-accent/20 text-sidebar-accent-foreground border border-sidebar-accent/30">
              {userRole}
            </span>
          </div>
        )}

        {/* Profile dropdown */}
        {showProfileDropdown && user && (
          <div className="flex items-center">
            <ProfileDropdown />
          </div>
        )}
      </div>
    </header>
  );
}
