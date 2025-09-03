/**
 * Utility functions for URL handling and routing
 */

/**
 * Generates a proper course URL
 * @param courseId - The course ID
 * @returns The course URL
 */
export const getCourseUrl = (courseId: string): string => {
  return `/courses/${courseId}`;
};

/**
 * Generates a proper course learning URL
 * @param courseId - The course ID
 * @returns The course learning URL
 */
export const getCourseLearnUrl = (courseId: string): string => {
  return `/development/courses/${courseId}`;
};

/**
 * Generates a proper course enrollment URL
 * @param courseId - The course ID
 * @returns The course enrollment URL
 */
export const getCourseEnrollmentUrl = (courseId: string): string => {
  return `/development/courses/${courseId}/enroll`;
};

/**
 * Ensures a URL is properly formatted
 * @param url - The URL to format
 * @returns The formatted URL
 */
export const formatUrl = (url: string): string => {
  // Remove any leading slashes to ensure proper routing
  return url.replace(/^\/+/, "/");
};

/**
 * Checks if a URL is external
 * @param url - The URL to check
 * @returns True if the URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

/**
 * Gets the base URL for the application
 * @returns The base URL
 */
export const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Client-side: use the current origin
    return window.location.origin;
  }

  // Server-side: use environment variable or default
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://cemse-back-production.up.railway.app"
  );
};

/**
 * Safely gets the site URL for authentication redirects
 * Handles both client and server-side rendering
 * @returns The site URL
 */
export const getSiteUrl = (): string => {
  if (typeof window !== "undefined") {
    // Client-side: use the current origin
    return window.location.origin;
  }

  // Server-side: use environment variable or default
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://cemse-back-production.up.railway.app"
  );
};
