"use client";

import React from 'react';
import { JWTAuthProvider } from '@/context/jwt-auth-context';

/**
 * Unified JWT Authentication Provider
 * This provider wraps the entire application with JWT authentication context
 */
export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <JWTAuthProvider>
      {children}
    </JWTAuthProvider>
  );
}

export default UnifiedAuthProvider;