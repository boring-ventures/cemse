"use client";

import Link from "next/link";
import { BadgeCheck, ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/hooks/use-auth";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { signOut, user } = useAuthContext();

  if (!user) return null;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const getInitials = () => {
    if (user.firstName || user.lastName) {
      return [user.firstName?.[0], user.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative overflow-hidden data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:shadow-md transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-sidebar-primary/20 group-hover:ring-sidebar-primary/40 transition-all duration-200">
                <AvatarImage
                  src={user.profilePicture || null}
                  alt={displayName || user.email || "User"}
                />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  {displayName || user.email}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground transition-colors duration-200" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-sidebar-border/50 shadow-lg backdrop-blur-sm bg-white/95"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm border-b border-sidebar-border/30">
                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-sidebar-primary/20">
                  <AvatarImage
                    src={user.profilePicture || null}
                    alt={displayName || user.email || "User"}
                  />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900">
                    {displayName || user.email}
                  </span>
                  <span className="truncate text-xs text-gray-600">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border/30" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings/account"
                  className="gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors duration-200 flex items-center"
                >
                  <BadgeCheck className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Cuenta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors duration-200 flex items-center"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Configuración
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border/30" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="gap-3 px-3 py-2.5 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
