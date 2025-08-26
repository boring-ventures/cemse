"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { mapBackendRoleToFrontend } from "@/lib/utils";

export function AuthRedirect() {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    console.log("🔐 AuthRedirect - Effect triggered:", {
      loading,
      isAuthenticated,
      user: user
        ? { role: user.role, username: user.username, id: user.id }
        : null,
      currentPath:
        typeof window !== "undefined" ? window.location.pathname : "unknown",
    });

    // Only redirect if user is authenticated, not loading, and we're on an auth page
    if (!loading && isAuthenticated && user) {
      const currentPath = window.location.pathname;
      const isAuthPage = ["/sign-in", "/sign-up", "/login", "/register"].some(
        (route) => currentPath.startsWith(route)
      );

      // Only redirect if we're on an auth page (post-login)
      if (isAuthPage) {
        console.log(
          "🔐 AuthRedirect - User authenticated on auth page, redirecting..."
        );

        // Add a small delay to ensure state is fully updated
        const redirectTimer = setTimeout(() => {
          try {
            let targetPath = "/dashboard"; // Default fallback

            // Map the role to ensure consistency
            const mappedRole = mapBackendRoleToFrontend(user.role);
            console.log(
              `🔐 AuthRedirect - Original role: ${user.role}, Mapped role: ${mappedRole}`
            );

            // Redirect based on mapped user role
            switch (mappedRole) {
              case "EMPRESAS":
                console.log(
                  "🔐 AuthRedirect - Redirecting company user to company jobs"
                );
                targetPath = "/company/jobs";
                break;
              case "GOBIERNOS_MUNICIPALES":
                console.log(
                  "🔐 AuthRedirect - Redirecting municipality user to municipality dashboard"
                );
                targetPath = "/admin/companies";
                break;
              case "SUPER_ADMIN":
              case "SUPERADMIN":
                console.log(
                  "🔐 AuthRedirect - Redirecting super admin to admin dashboard"
                );
                targetPath = "/admin/users";
                break;
              case "JOVENES":
              case "ADOLESCENTES":
                console.log(
                  "🔐 AuthRedirect - Redirecting youth user to youth dashboard"
                );
                targetPath = "/dashboard";
                break;
              case "CENTROS_DE_FORMACION":
                console.log(
                  "🔐 AuthRedirect - Redirecting training center to training dashboard"
                );
                targetPath = "/admin/courses";
                break;
              case "ONGS_Y_FUNDACIONES":
                console.log(
                  "🔐 AuthRedirect - Redirecting NGO to NGO dashboard"
                );
                targetPath = "/dashboard";
                break;
              default:
                console.log(
                  `🔐 AuthRedirect - Unknown mapped role: ${mappedRole}, redirecting to default dashboard`
                );
                targetPath = "/dashboard";
                break;
            }

            console.log(`🔐 AuthRedirect - Navigating to: ${targetPath}`);

            // Use router.push for client-side navigation
            router.push(targetPath);
          } catch (error) {
            console.error("🔐 AuthRedirect - Error during redirection:", error);
            // Fallback to dashboard
            router.push("/dashboard");
          }
        }, 100); // Small delay to ensure state is stable

        return () => clearTimeout(redirectTimer);
      } else {
        console.log(
          "🔐 AuthRedirect - User authenticated but not on auth page, no redirection needed"
        );
      }
    }
  }, [user, loading, isAuthenticated, router]);

  // Don't render anything, this is just for side effects
  return null;
}
