// Backend configuration - always use production backend
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cemse-back-production.up.railway.app';

// Backend API endpoints
export const BACKEND_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: `${BACKEND_URL}/api/auth/login`,
  AUTH_REFRESH: `${BACKEND_URL}/api/auth/refresh`,
  AUTH_ME: `${BACKEND_URL}/api/auth/me`,

  // Profile
  PROFILE: `${BACKEND_URL}/api/profile`,
  PROFILE_AVATAR: `${BACKEND_URL}/api/profile/avatar`,

  // Job Offers
  JOB_OFFERS: `${BACKEND_URL}/api/joboffer`,
  JOB_APPLICATIONS: `${BACKEND_URL}/api/jobapplication`,
  JOB_QUESTIONS: `${BACKEND_URL}/api/jobquestion`,

  // Entrepreneurship
  ENTREPRENEURSHIP: `${BACKEND_URL}/api/entrepreneurship`,
  ENTREPRENEURSHIP_PUBLIC: `${BACKEND_URL}/api/entrepreneurship/public`,

  // Contacts
  CONTACTS: `${BACKEND_URL}/api/contacts`,
  CONTACTS_SEARCH: `${BACKEND_URL}/api/contacts/search`,
  CONTACTS_REQUEST: `${BACKEND_URL}/api/contacts/request`,
  CONTACTS_REQUESTS_RECEIVED: `${BACKEND_URL}/api/contacts/requests/received`,
  CONTACTS_STATS: `${BACKEND_URL}/api/contacts/stats`,

  // Companies
  COMPANIES: `${BACKEND_URL}/api/company`,
  COMPANIES_SEARCH: `${BACKEND_URL}/api/company/search`,

  // Courses
  COURSES: `${BACKEND_URL}/api/course`,
  COURSE_ENROLLMENTS: `${BACKEND_URL}/api/course-enrollments`,

  // News
  NEWS: `${BACKEND_URL}/api/news`,

  // Institutions
  INSTITUTIONS_PUBLIC: `${BACKEND_URL}/api/institution/public`,
  MUNICIPALITIES_PUBLIC: `${BACKEND_URL}/api/municipality/public`,

  // Files
  FILES_UPLOAD: `${BACKEND_URL}/api/files/upload`,
  FILES_UPLOAD_PROFILE_IMAGE: `${BACKEND_URL}/api/files/upload/profile-image`,
  FILES_UPLOAD_CV: `${BACKEND_URL}/api/files/upload/cv`,

  // Admin
  ADMIN_SETTINGS: `${BACKEND_URL}/api/admin/settings`,
  ADMIN_ENTREPRENEURSHIP_RESOURCES: `${BACKEND_URL}/api/admin/entrepreneurship/resources`,
  ADMIN_ENTREPRENEURSHIP_EVENTS: `${BACKEND_URL}/api/admin/entrepreneurship/events`,

  // Youth Applications
  YOUTH_APPLICATIONS: `${BACKEND_URL}/api/youthapplication`,
  YOUTH_APPLICATION_DETAIL: (id: string) => `${BACKEND_URL}/api/youthapplication/${id}`,
  YOUTH_APPLICATION_MESSAGES: (id: string) => `${BACKEND_URL}/api/youthapplication/${id}/messages`,
  YOUTH_APPLICATION_SEND_MESSAGE: (id: string) => `${BACKEND_URL}/api/youthapplication/${id}/message`,
  YOUTH_APPLICATION_COMPANY_INTERESTS: (id: string) => `${BACKEND_URL}/api/youthapplication/${id}/company-interests`,
  YOUTH_APPLICATION_EXPRESS_INTEREST: (id: string) => `${BACKEND_URL}/api/youthapplication/${id}/company-interest`,

  // Health check
  HEALTH: `${BACKEND_URL}/health`,
} as const;

// Helper function to get endpoint URL
export const getBackendUrl = (endpoint: keyof typeof BACKEND_ENDPOINTS) => {
  return BACKEND_ENDPOINTS[endpoint];
};

// Helper function to make backend requests
export const makeBackendRequest = async (
  endpoint: keyof typeof BACKEND_ENDPOINTS,
  options: RequestInit = {}
) => {
  const url = getBackendUrl(endpoint);

  console.log('🔍 makeBackendRequest - Making request to:', url);

  // Handle function endpoints
  const finalUrl = typeof url === 'function' ? url('') : url;

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
