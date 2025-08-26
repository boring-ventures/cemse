// Role-Based Access Control Hooks
// Provides utilities for role-based UI rendering and access control

import React, { useMemo } from 'react';
import { useJWTAuth } from '@/context/jwt-auth-context';
import type { UserRole } from '@prisma/client';

// Define role hierarchies and groups for complex access control
export const ROLE_GROUPS = {
  STUDENTS: ['YOUTH', 'ADOLESCENTS'] as UserRole[],
  ORGANIZATIONS: ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'] as UserRole[],
  ADMINS: ['SUPER_ADMIN'] as UserRole[],
  SERVICE: ['CLIENT', 'AGENT'] as UserRole[],
} as const;

// Role permissions mapping (can be extended based on business logic)
export const ROLE_PERMISSIONS = {
  YOUTH: ['view_courses', 'apply_jobs', 'create_entrepreneurship', 'view_news'],
  ADOLESCENTS: ['view_courses', 'apply_jobs', 'create_entrepreneurship', 'view_news'],
  COMPANIES: ['post_jobs', 'manage_applications', 'view_candidates', 'company_news'],
  MUNICIPAL_GOVERNMENTS: ['manage_municipal_services', 'view_youth_programs', 'municipal_news'],
  TRAINING_CENTERS: ['create_courses', 'manage_students', 'issue_certificates'],
  NGOS_AND_FOUNDATIONS: ['create_programs', 'manage_resources', 'community_outreach'],
  CLIENT: ['basic_access'],
  AGENT: ['agent_functions'],
  SUPER_ADMIN: ['full_access', 'user_management', 'system_configuration'],
} as const;

export interface UseRoleReturn {
  // Current user role info
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  
  // Role checking methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  
  // Role group checking
  isStudent: boolean;
  isOrganization: boolean;
  isAdmin: boolean;
  isService: boolean;
  
  // Permission-based access
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  
  // UI helpers
  shouldShowForRole: (allowedRoles: UserRole[]) => boolean;
  shouldHideForRole: (hiddenRoles: UserRole[]) => boolean;
  getRoleDisplayName: () => string;
  getRoleColor: () => string;
}

/**
 * Role-based access control hook
 * Provides comprehensive role checking and permission utilities
 */
export function useRole(): UseRoleReturn {
  const { user, isAuthenticated, hasRole, hasAnyRole } = useJWTAuth();
  
  const currentRole = user?.role || null;

  // Role group checks
  const isStudent = useMemo(() => 
    hasAnyRole(ROLE_GROUPS.STUDENTS), [hasAnyRole]
  );
  
  const isOrganization = useMemo(() => 
    hasAnyRole(ROLE_GROUPS.ORGANIZATIONS), [hasAnyRole]
  );
  
  const isAdmin = useMemo(() => 
    hasAnyRole(ROLE_GROUPS.ADMINS), [hasAnyRole]
  );
  
  const isService = useMemo(() => 
    hasAnyRole(ROLE_GROUPS.SERVICE), [hasAnyRole]
  );

  // Check if user has all specified roles (unlikely but useful for complex scenarios)
  const hasAllRoles = useMemo(() => 
    (roles: UserRole[]): boolean => {
      if (!currentRole) return false;
      return roles.every(role => role === currentRole);
    }, [currentRole]
  );

  // Permission-based access control
  const hasPermission = useMemo(() => 
    (permission: string): boolean => {
      if (!currentRole) return false;
      
      const rolePermissions = ROLE_PERMISSIONS[currentRole] || [];
      return rolePermissions.includes(permission as any) || rolePermissions.includes('full_access' as any);
    }, [currentRole]
  );

  const hasAnyPermission = useMemo(() => 
    (permissions: string[]): boolean => {
      return permissions.some(permission => hasPermission(permission));
    }, [hasPermission]
  );

  // UI helper methods
  const shouldShowForRole = useMemo(() => 
    (allowedRoles: UserRole[]): boolean => {
      return hasAnyRole(allowedRoles);
    }, [hasAnyRole]
  );

  const shouldHideForRole = useMemo(() => 
    (hiddenRoles: UserRole[]): boolean => {
      return !hasAnyRole(hiddenRoles);
    }, [hasAnyRole]
  );

  // Get user-friendly role display name
  const getRoleDisplayName = useMemo(() => 
    (): string => {
      if (!currentRole) return 'Guest';
      
      const roleNames: Record<UserRole, string> = {
        YOUTH: 'Youth',
        ADOLESCENTS: 'Adolescent',
        COMPANIES: 'Company',
        MUNICIPAL_GOVERNMENTS: 'Municipal Government',
        TRAINING_CENTERS: 'Training Center',
        NGOS_AND_FOUNDATIONS: 'NGO/Foundation',
        CLIENT: 'Client',
        AGENT: 'Agent',
        SUPER_ADMIN: 'Super Admin',
      };
      
      return roleNames[currentRole] || currentRole;
    }, [currentRole]
  );

  // Get role-specific color for UI theming
  const getRoleColor = useMemo(() => 
    (): string => {
      if (!currentRole) return 'gray';
      
      const roleColors: Record<UserRole, string> = {
        YOUTH: 'blue',
        ADOLESCENTS: 'green',
        COMPANIES: 'purple',
        MUNICIPAL_GOVERNMENTS: 'orange',
        TRAINING_CENTERS: 'teal',
        NGOS_AND_FOUNDATIONS: 'pink',
        CLIENT: 'gray',
        AGENT: 'indigo',
        SUPER_ADMIN: 'red',
      };
      
      return roleColors[currentRole] || 'gray';
    }, [currentRole]
  );

  return {
    currentRole,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isStudent,
    isOrganization,
    isAdmin,
    isService,
    hasPermission,
    hasAnyPermission,
    shouldShowForRole,
    shouldHideForRole,
    getRoleDisplayName,
    getRoleColor,
  };
}

// Utility function for conditional rendering based on roles
export function withRole<T>(
  allowedRoles: UserRole[],
  component: T,
  fallback: T | null = null
): T | null {
  const { shouldShowForRole } = useRole();
  return shouldShowForRole(allowedRoles) ? component : fallback;
}

// Higher-order component for role-based access
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null 
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { shouldShowForRole } = useRole();
  
  return shouldShowForRole(allowedRoles) ? <>{children}</> : <>{fallback}</>;
}

export default useRole;