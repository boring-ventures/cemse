"use client";

import { useState } from "react";
import { useAuthContext } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

export function ProfileDropdown() {
  const { user, signOut, loading } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative h-9 w-9 rounded-full border border-sidebar-border/50 bg-sidebar-background/80 backdrop-blur-sm hover:bg-sidebar-accent/80 hover:border-sidebar-border hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2"
        >
          <Avatar className="h-8 w-8 ring-2 ring-sidebar-background/50 group-hover:ring-sidebar-accent/30 transition-all duration-200">
            <AvatarImage src={user.profilePicture || ""} alt={user.username} />
            <AvatarFallback className="bg-sidebar-accent/20 text-sidebar-accent-foreground font-medium">
              {getInitials(user.firstName || "", user.lastName || "")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-2 bg-white/95 backdrop-blur-md border-sidebar-border/50 shadow-xl"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-gray-600">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sidebar-border/50" />
        <DropdownMenuItem asChild className="rounded-md">
          <Link
            href="/profile"
            className="flex items-center p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <User className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-900">Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-md">
          <Link
            href="/settings"
            className="flex items-center p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <Settings className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-900">Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-sidebar-border/50" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 focus:bg-destructive/10 focus:text-destructive"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin text-gray-600" />
          ) : (
            <LogOut className="mr-3 h-4 w-4 text-gray-600" />
          )}
          <span className="text-sm text-gray-900">
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
