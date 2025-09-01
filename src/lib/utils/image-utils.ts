/**
 * Utility functions for handling images safely
 */

export const getSafeImageUrl = (
  url: string | null | undefined,
  fallback: string = "/images/default-placeholder.jpg"
): string => {
  // If no URL provided, return fallback
  if (!url || url.trim() === "" || url === null || url === undefined) {
    return fallback;
  }

  // If it's already a relative URL (starts with /), return as is
  if (url.startsWith("/")) {
    return url;
  }

  // If it's a valid external URL, return it
  try {
    new URL(url);
    return url;
  } catch {
    // If URL is invalid, return fallback
    return fallback;
  }
};

export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === "" || url === null || url === undefined) {
    return false;
  }

  // Check if it's a local uploaded image (starts with /uploads/)
  if (url.startsWith('/uploads/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

export const getCourseThumbnail = (course: any): string => {
  // Try thumbnail first - check if it exists and is valid
  if (course.thumbnail && (isValidImageUrl(course.thumbnail) || course.thumbnail.startsWith('/uploads/'))) {
    return course.thumbnail;
  }

  // Try coverImage as fallback
  if (course.coverImage && (isValidImageUrl(course.coverImage) || course.coverImage.startsWith('/uploads/'))) {
    return course.coverImage;
  }

  // Return default course image - use an existing SVG as fallback
  return "/file.svg";
};

export const getCourseVideoPreview = (course: any): string | null => {
  if (isValidImageUrl(course.videoPreview)) {
    return course.videoPreview;
  }
  return null;
};

export const isYouTubeVideo = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const getYouTubeThumbnail = (videoUrl: string): string => {
  // Extract video ID from YouTube URL
  const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
  
  if (videoId) {
    // Try different thumbnail qualities
    const qualities = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    ];
    
    return qualities[0]; // Return highest quality first
  }
  
  return "/images/courses/default-course.jpg";
};

export const getAvatarUrl = (user: any): string => {
  if (isValidImageUrl(user.avatarUrl)) {
    return user.avatarUrl;
  }

  if (isValidImageUrl(user.profilePicture)) {
    return user.profilePicture;
  }

  return "/images/default-avatar.png";
};

export const getCompanyLogo = (company: any): string => {
  if (isValidImageUrl(company.logo)) {
    return company.logo;
  }

  return "/images/companies/default-logo.png";
};
