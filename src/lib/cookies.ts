// Secure cookie management for authentication
import { cookies } from "next/headers";

// Cookie names
export const AUTH_COOKIE_NAME = "cemse-auth-token";
export const REFRESH_COOKIE_NAME = "cemse-refresh-token";

// Cookie options for production-ready security
export const getCookieOptions = (isProduction: boolean = process.env.NODE_ENV === 'production') => ({
  httpOnly: true,
  secure: isProduction, // Only HTTPS in production
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

export const getRefreshCookieOptions = (isProduction: boolean = process.env.NODE_ENV === 'production') => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
});

// Server-side cookie functions
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  
  cookieStore.set(AUTH_COOKIE_NAME, accessToken, getCookieOptions());
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
}

export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token?.value || null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(REFRESH_COOKIE_NAME);
  return token?.value || null;
}

export async function clearAuthCookies() {
  const cookieStore = cookies();
  
  cookieStore.set(AUTH_COOKIE_NAME, '', { 
    ...getCookieOptions(), 
    maxAge: 0 
  });
  
  cookieStore.set(REFRESH_COOKIE_NAME, '', { 
    ...getRefreshCookieOptions(), 
    maxAge: 0 
  });
}

// Client-side cookie functions (using document.cookie for client components)
export const setClientAuthCookies = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const securePart = isProduction ? '; Secure' : '';
  
  // Set auth token cookie
  document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; Path=/; SameSite=Lax; HttpOnly=false; Max-Age=${60 * 60 * 24 * 7}${securePart}`;
  
  // Set refresh token cookie  
  document.cookie = `${REFRESH_COOKIE_NAME}=${refreshToken}; Path=/; SameSite=Lax; HttpOnly=false; Max-Age=${60 * 60 * 24 * 30}${securePart}`;
};

export const getClientAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
  
  return authCookie ? authCookie.split('=')[1] : null;
};

export const clearClientAuthCookies = () => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`;
  document.cookie = `${REFRESH_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`;
};