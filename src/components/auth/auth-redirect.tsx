"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";

export function AuthRedirect() {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're on auth pages or if user recently logged out
    const authPages = ['/sign-in', '/sign-up', '/login', '/register'];
    const isOnAuthPage = authPages.some(page => pathname.startsWith(page));
    
    // Check for recent logout flag
    const recentLogout = typeof window !== 'undefined' ? sessionStorage.getItem('recent-logout') : null;
    
    if (isOnAuthPage) {
      console.log("🔐 AuthRedirect - On auth page, skipping redirect");
      return;
    }
    
    if (recentLogout) {
      console.log("🔐 AuthRedirect - Recent logout detected, skipping redirect");
      return;
    }

    // Only redirect if user is authenticated and not loading
    if (!loading && isAuthenticated && user) {
      console.log("🔐 AuthRedirect - User authenticated:", {
        role: user.role,
        username: user.username,
        id: user.id,
        currentPath: pathname,
      });

      // Define role-specific default routes
      const roleDefaultRoutes: Record<string, string> = {
        EMPRESAS: "/dashboard",
        GOBIERNOS_MUNICIPALES: "/admin/companies",
        SUPER_ADMIN: "/dashboard", // Allow SUPER_ADMIN to stay on dashboard
        SUPERADMIN: "/dashboard", // Allow SUPERADMIN to stay on dashboard
        JOVENES: "/dashboard",
        ADOLESCENTES: "/dashboard",
        CENTROS_DE_FORMACION: "/admin/courses",
        ONGS_Y_FUNDACIONES: "/dashboard",
      };

      const defaultRoute = roleDefaultRoutes[user.role] || "/dashboard";

      // Only redirect if the user is on the generic '/dashboard' path
      // This prevents redirects when users are on specific pages like '/my-applications'
      if (pathname === "/dashboard") {
        console.log(
          `🔐 AuthRedirect - User on generic dashboard, redirecting ${user.role} to ${defaultRoute}`
        );
        router.replace(defaultRoute);
      } else {
        console.log(
          `🔐 AuthRedirect - User on specific page (${pathname}), no redirect needed`
        );
      }
    }
  }, [user, loading, isAuthenticated, router, pathname]);

  // Don't render anything, this is just for side effects
  return null;
}
