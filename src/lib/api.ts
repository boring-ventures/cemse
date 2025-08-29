// Base API configuration and utilities
const API_BASE_PROD =
  process.env.NEXT_PUBLIC_API_BASE_PROD ||
  "https://cemse-back-production.up.railway.app/api";
const API_BASE_LOCAL = "/api"; // Use local Next.js API routes

// Use local API routes for development - all youth application APIs are implemented in Next.js
export const API_BASE = API_BASE_LOCAL;

// Backend URL configuration - use local Next.js server
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// Utility function to make direct backend calls
export const backendCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log("🔍 backendCall - Making request to:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Cookie-based authentication - tokens are managed via httpOnly cookies
// No client-side token management needed

// Legacy token functions for backward compatibility (deprecated)
export const getToken = (): string | null => {
  console.warn("getToken is deprecated - use cookie-based authentication");
  return null;
};

export const clearTokens = (): void => {
  console.warn("clearTokens is deprecated - use clearAllAuthData instead");
  // For compatibility, still clear localStorage tokens if they exist
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

// Function to decode JWT token and extract user information
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to get user info from token (cookie-based authentication)
// Note: This function is deprecated as we use cookie-based authentication
// User info should be retrieved from API endpoints like /api/auth/me
export const getUserFromToken = (): {
  id?: string;
  role?: string;
  municipalityId?: string;
} | null => {
  // With cookie-based authentication, we cannot access tokens on client-side
  // This function should not be used. Use API calls to get user info instead.
  console.warn(
    "getUserFromToken is deprecated - use API endpoints to get user info"
  );
  return null;
};

// Check if user is authenticated (cookie-based authentication)
// Note: This function is deprecated as we use cookie-based authentication
// Authentication should be checked via API endpoints
export const isAuthenticated = () => {
  // With cookie-based authentication, we cannot reliably check auth status on client-side
  // This should be checked via API calls instead
  console.warn(
    "isAuthenticated is deprecated - use API endpoints to check authentication"
  );
  return true; // Assume authenticated, let API endpoints handle auth validation
};

// Get basic headers for API calls - authentication handled by cookies
export const getAuthHeaders = async (excludeContentType = false) => {
  console.log("🔐 getAuthHeaders - Using cookie-based authentication");

  const headers: Record<string, string> = {};

  // Only add Content-Type if not excluded (for FormData)
  if (!excludeContentType) {
    headers["Content-Type"] = "application/json";
  }

  // Try to get JWT token from cookies for Authorization header
  try {
    const tokenResponse = await fetch("/api/auth/get-token", {
      method: "GET",
      credentials: "include",
    });

    if (tokenResponse.ok) {
      const { token } = await tokenResponse.json();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("🔐 getAuthHeaders - Added JWT Bearer token to headers");
      }
    } else {
      console.log("🔐 getAuthHeaders - No JWT token available");
    }
  } catch (error) {
    console.log("🔐 getAuthHeaders - Could not get JWT token:", error);
  }

  console.log("🔐 getAuthHeaders - Final headers:", headers);
  return headers;
};

// Cookie-based authentication doesn't require manual token refresh

// Enhanced API call function with cookie-based authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  try {
    // Build headers - don't include Content-Type for FormData
    const headers: Record<string, string> = {};

    // For external backend API calls, we need to extract JWT token from cookies
    // and send it as Bearer token in Authorization header
    const isExternalAPI = !endpoint.startsWith("/api/");

    if (isExternalAPI) {
      console.log(
        "🔐 apiCall - External API call detected, extracting JWT token from cookies"
      );

      // Extract JWT token from httpOnly cookies via a server-side call
      try {
        const tokenResponse = await fetch("/api/auth/get-token", {
          method: "GET",
          credentials: "include",
        });

        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
            console.log(
              "🔐 apiCall - Added JWT Bearer token to Authorization header"
            );
          }
        }
      } catch (error) {
        console.error(
          "🔐 apiCall - Failed to get JWT token for external API:",
          error
        );
      }
    } else {
      // For local Next.js API routes, also try to get JWT token for consistency
      console.log(
        "🔐 apiCall - Local API call detected, extracting JWT token for auth consistency"
      );

      try {
        const tokenResponse = await fetch("/api/auth/get-token", {
          method: "GET",
          credentials: "include",
        });

        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
            console.log(
              "🔐 apiCall - Added JWT Bearer token to local API call"
            );
          }
        } else {
          console.log("🔐 apiCall - No JWT token available for local API call");
        }
      } catch (error) {
        console.log(
          "🔐 apiCall - Could not get JWT token for local API call:",
          error
        );
      }
    }

    // Debug cookie information
    if (typeof document !== "undefined") {
      console.log("🔐 apiCall - All cookies:", document.cookie);
      const cookies = document.cookie.split(";");
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("cemse-auth-token=")
      );
      console.log("🔐 apiCall - Auth cookie found:", authCookie ? "YES" : "NO");

      // Since cookies are httpOnly, they won't show in document.cookie
      // but they should still be sent with the request
      console.log(
        "🔐 apiCall - Note: Auth cookies are httpOnly and won't show in document.cookie"
      );
    }

    // Add other headers from options, but exclude Content-Type for FormData
    if (options.headers) {
      const optionsHeaders = options.headers as Record<string, string>;
      Object.keys(optionsHeaders).forEach((key) => {
        if (
          !(options.body instanceof FormData) ||
          key.toLowerCase() !== "content-type"
        ) {
          headers[key] = optionsHeaders[key];
        }
      });
    }

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const fullUrl = `${API_BASE}${endpoint}`;

    console.log("🔐 apiCall - Making request to:", fullUrl);
    console.log("🔐 apiCall - Using cookie-based authentication");
    console.log("🔐 apiCall - Headers:", headers);
    console.log("🔐 apiCall - Method:", options.method || "GET");
    console.log("🔐 apiCall - Credentials: include");
    console.log(
      "🔐 apiCall - Document cookies:",
      typeof document !== "undefined" ? document.cookie : "Server-side"
    );

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include", // Important: Include cookies for authentication
    });

    console.log("🔐 apiCall - Response status:", response.status);
    console.log("🔐 apiCall - Using cookie-based authentication");

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🔐 apiCall - Received 401, authentication failed");
        throw new Error("Authentication failed");
      }

      // For 400 and 500 errors, try to get the specific error message from response
      if (response.status === 400 || response.status === 500) {
        try {
          const errorData = await response.json();
          const errorMessage =
            errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`;
          console.error(
            `🔐 apiCall - ${response.status} error details:`,
            errorData
          );

          // Log debug information if available
          if (errorData.debug) {
            console.error(`🔐 apiCall - Debug info:`, errorData.debug);
          }

          throw new Error(errorMessage);
        } catch (parseError) {
          console.error(
            `🔐 apiCall - Could not parse ${response.status} error response:`,
            parseError
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);

    // If backend is not available, return mock data
    if (error instanceof Error && error.message.includes("fetch failed")) {
      console.log(
        "🔐 apiCall - Backend not available, returning mock data for:",
        endpoint
      );
      return getMockData(endpoint, options);
    }

    throw error;
  }
};

// Mock data persistence helpers - removed mock companies data

// Mock data function
const getMockData = (endpoint: string, options?: RequestInit) => {
  console.log(
    "🔐 getMockData - Generating mock data for:",
    endpoint,
    options?.method || "GET"
  );

  // Mock data for different endpoints
  if (endpoint.includes("/joboffer")) {
    return {
      jobOffers: [
        {
          id: "1",
          title: "Desarrollador Frontend",
          company: "TechCorp",
          location: "Buenos Aires",
          salary: "$3000 - $5000",
          description:
            "Buscamos un desarrollador frontend con experiencia en React",
          requirements: ["React", "TypeScript", "3+ años de experiencia"],
          createdAt: new Date().toISOString(),
          status: "active",
        },
        {
          id: "2",
          title: "Diseñador UX/UI",
          company: "DesignStudio",
          location: "Córdoba",
          salary: "$2500 - $4000",
          description: "Diseñador creativo para proyectos digitales",
          requirements: [
            "Figma",
            "Adobe Creative Suite",
            "2+ años de experiencia",
          ],
          createdAt: new Date().toISOString(),
          status: "active",
        },
      ],
    };
  }

  if (endpoint.includes("/company")) {
    // No mock data for companies - return empty results
    console.log(
      "🔐 getMockData - No mock data for companies, returning empty results"
    );

    if (endpoint.includes("/company/stats")) {
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        pendingCompanies: 0,
        inactiveCompanies: 0,
        totalEmployees: 0,
        totalRevenue: 0,
      };
    }

    return { companies: [] };
  }

  if (endpoint.includes("/course")) {
    return {
      courses: [
        {
          id: "1",
          title: "React para Principiantes",
          description: "Aprende React desde cero",
          duration: "8 semanas",
          instructor: "Juan Pérez",
        },
        {
          id: "2",
          title: "Diseño UX/UI",
          description: "Fundamentos del diseño de experiencia de usuario",
          duration: "6 semanas",
          instructor: "María García",
        },
      ],
    };
  }

  if (
    endpoint.includes("/certificate") &&
    !endpoint.includes("/certificate/")
  ) {
    return [
      {
        id: "cert_1",
        userId: "user_123",
        courseId: "course_1",
        template: "default",
        issuedAt: "2024-01-15T10:00:00Z",
        verificationCode: "CERT-2024-001",
        digitalSignature: "sha256-signature-1",
        isValid: true,
        url: "https://example.com/certificates/course-cert-1.pdf",
        course: {
          id: "course_1",
          title: "Desarrollo Web Completo",
          description:
            "Curso completo de desarrollo web con HTML, CSS y JavaScript",
        },
        user: {
          id: "user_123",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
        },
      },
      {
        id: "cert_2",
        userId: "user_123",
        courseId: "course_2",
        template: "premium",
        issuedAt: "2024-02-20T14:30:00Z",
        verificationCode: "CERT-2024-002",
        digitalSignature: "sha256-signature-2",
        isValid: true,
        url: "https://example.com/certificates/course-cert-2.pdf",
        course: {
          id: "course_2",
          title: "React Avanzado",
          description: "Aprende React desde cero hasta nivel avanzado",
        },
        user: {
          id: "user_123",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
        },
      },
    ];
  }

  if (
    endpoint.includes("/modulecertificate") &&
    !endpoint.includes("/modulecertificate/")
  ) {
    return [
      {
        id: "module_cert_1",
        moduleId: "module_1",
        studentId: "user_123",
        certificateUrl: "https://example.com/certificates/module-cert-1.pdf",
        issuedAt: "2024-01-10T09:00:00Z",
        grade: 95,
        completedAt: "2024-01-10T08:45:00Z",
        module: {
          id: "module_1",
          title: "Fundamentos de HTML",
          course: {
            id: "course_1",
            title: "Desarrollo Web Completo",
          },
        },
        student: {
          id: "user_123",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
        },
      },
      {
        id: "module_cert_2",
        moduleId: "module_2",
        studentId: "user_123",
        certificateUrl: "https://example.com/certificates/module-cert-2.pdf",
        issuedAt: "2024-01-25T11:30:00Z",
        grade: 88,
        completedAt: "2024-01-25T11:15:00Z",
        module: {
          id: "module_2",
          title: "CSS y Estilos",
          course: {
            id: "course_1",
            title: "Desarrollo Web Completo",
          },
        },
        student: {
          id: "user_123",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
        },
      },
      {
        id: "module_cert_3",
        moduleId: "module_3",
        studentId: "user_123",
        certificateUrl: "https://example.com/certificates/module-cert-3.pdf",
        issuedAt: "2024-02-05T16:20:00Z",
        grade: 92,
        completedAt: "2024-02-05T16:05:00Z",
        module: {
          id: "module_3",
          title: "JavaScript Básico",
          course: {
            id: "course_1",
            title: "Desarrollo Web Completo",
          },
        },
        student: {
          id: "user_123",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
        },
      },
    ];
  }

  if (endpoint.includes("/course-enrollments")) {
    return [
      {
        id: "enrollment_1",
        courseId: "course_1",
        userId: "user_123",
        status: "IN_PROGRESS",
        progress: 65,
        enrolledAt: "2024-01-15T10:00:00Z",
        course: {
          id: "course_1",
          title: "Desarrollo Web Completo",
        },
      },
      {
        id: "enrollment_2",
        courseId: "course_2",
        userId: "user_123",
        status: "COMPLETED",
        progress: 100,
        enrolledAt: "2024-01-20T14:30:00Z",
        completedAt: "2024-02-15T16:45:00Z",
        course: {
          id: "course_2",
          title: "React Avanzado",
        },
      },
      {
        id: "enrollment_3",
        courseId: "course_3",
        userId: "user_123",
        status: "PENDING",
        progress: 0,
        enrolledAt: "2024-02-01T09:15:00Z",
        course: {
          id: "course_3",
          title: "Diseño UX/UI",
        },
      },
    ];
  }

  // Mock data for events endpoints
  if (false && endpoint.includes("/events")) {
    // Mock data for events stats
    if (endpoint.includes("/events/stats")) {
      return {
        totalEvents: 15,
        upcomingEvents: 8,
        totalAttendees: 245,
        attendanceRate: 78.5,
        publishedEvents: 12,
        featuredEvents: 3,
      };
    }

    if (endpoint.includes("/events/my-stats")) {
      return {
        totalEvents: 5,
        upcomingEvents: 2,
        totalAttendees: 45,
        attendanceRate: 85.2,
        publishedEvents: 4,
        featuredEvents: 1,
      };
    }

    if (endpoint.includes("/events/my-events")) {
      return [
        {
          id: "event_1",
          title: "Workshop de Emprendimiento",
          organizer: "Municipio de Cercado",
          description:
            "Taller práctico sobre emprendimiento y desarrollo de negocios",
          date: "2024-03-15",
          time: "14:00",
          type: "IN_PERSON",
          category: "WORKSHOP",
          location: "Centro de Convenciones",
          maxCapacity: 50,
          currentAttendees: 35,
          price: 0,
          status: "PUBLISHED",
          isFeatured: true,
          registrationDeadline: "2024-03-10",
          imageUrl:
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
          tags: ["Emprendimiento", "Negocios", "Desarrollo"],
          requirements: "Interés en emprender",
          agenda:
            "14:00 - Introducción\n15:00 - Casos de éxito\n16:00 - Networking",
          speakers: "Dr. Juan Pérez, Lic. María García",
          createdAt: "2024-02-01T10:00:00Z",
          updatedAt: "2024-02-01T10:00:00Z",
        },
        {
          id: "event_2",
          title: "Conferencia de Tecnología",
          organizer: "TechCorp",
          description: "Conferencia sobre las últimas tendencias en tecnología",
          date: "2024-03-20",
          time: "09:00",
          type: "HYBRID",
          category: "CONFERENCE",
          location: "Auditorio Principal",
          maxCapacity: 100,
          currentAttendees: 75,
          price: 50,
          status: "PUBLISHED",
          isFeatured: false,
          registrationDeadline: "2024-03-18",
          imageUrl:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
          tags: ["Tecnología", "Innovación"],
          requirements: "Conocimientos básicos de programación",
          agenda: "09:00 - Apertura\n10:00 - Charlas técnicas\n16:00 - Cierre",
          speakers: "Ing. Carlos López, Dra. Ana Martínez",
          createdAt: "2024-02-05T14:30:00Z",
          updatedAt: "2024-02-05T14:30:00Z",
        },
      ];
    }

    if (endpoint.includes("/events/my-attendances")) {
      return [
        {
          id: "event_3",
          title: "Networking Empresarial",
          organizer: "Cámara de Comercio",
          description: "Evento de networking para empresarios y emprendedores",
          date: "2024-03-25",
          time: "18:00",
          type: "IN_PERSON",
          category: "NETWORKING",
          location: "Hotel Plaza",
          maxCapacity: 80,
          currentAttendees: 60,
          price: 25,
          status: "PUBLISHED",
          isFeatured: true,
          registrationDeadline: "2024-03-22",
          imageUrl:
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
          tags: ["Networking", "Empresarios"],
          requirements: "Ser empresario o emprendedor",
          agenda:
            "18:00 - Registro\n18:30 - Presentaciones\n20:00 - Networking",
          speakers: "Lic. Roberto Silva",
          createdAt: "2024-02-10T09:15:00Z",
          updatedAt: "2024-02-10T09:15:00Z",
          isRegistered: true,
          attendeeStatus: "CONFIRMED",
        },
        {
          id: "event_4",
          title: "Seminario de Marketing Digital",
          organizer: "Agencia Digital",
          description: "Seminario sobre estrategias de marketing digital",
          date: "2024-04-05",
          time: "10:00",
          type: "VIRTUAL",
          category: "SEMINAR",
          location: "Zoom Meeting",
          maxCapacity: 200,
          currentAttendees: 150,
          price: 0,
          status: "PUBLISHED",
          isFeatured: false,
          registrationDeadline: "2024-04-03",
          imageUrl:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
          tags: ["Marketing", "Digital"],
          requirements: "Ninguno",
          agenda:
            "10:00 - Introducción\n11:00 - Estrategias\n12:00 - Casos prácticos",
          speakers: "Lic. Patricia Morales",
          createdAt: "2024-02-15T16:45:00Z",
          updatedAt: "2024-02-15T16:45:00Z",
          isRegistered: true,
          attendeeStatus: "REGISTERED",
        },
      ];
    }

    // Mock data for specific event attendees
    if (endpoint.includes("/events/") && endpoint.includes("/attendees")) {
      const eventId = endpoint.split("/")[2];
      return [
        {
          id: "attendee_1",
          userId: "user_1",
          eventId: eventId,
          status: "CONFIRMED",
          registeredAt: "2024-02-20T10:00:00Z",
          user: {
            name: "Juan Pérez",
            email: "juan.perez@example.com",
          },
        },
        {
          id: "attendee_2",
          userId: "user_2",
          eventId: eventId,
          status: "REGISTERED",
          registeredAt: "2024-02-21T14:30:00Z",
          user: {
            name: "María García",
            email: "maria.garcia@example.com",
          },
        },
      ];
    }

    // Default events list
    return [
      {
        id: "event_1",
        title: "Workshop de Emprendimiento",
        organizer: "Municipio de Cercado",
        description:
          "Taller práctico sobre emprendimiento y desarrollo de negocios",
        date: "2024-03-15",
        time: "14:00",
        type: "IN_PERSON",
        category: "WORKSHOP",
        location: "Centro de Convenciones",
        maxCapacity: 50,
        currentAttendees: 35,
        price: 0,
        status: "PUBLISHED",
        isFeatured: true,
        registrationDeadline: "2024-03-10",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        tags: ["Emprendimiento", "Negocios", "Desarrollo"],
        requirements: "Interés en emprender",
        agenda:
          "14:00 - Introducción\n15:00 - Casos de éxito\n16:00 - Networking",
        speakers: "Dr. Juan Pérez, Lic. María García",
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
        isRegistered: false,
      },
      {
        id: "event_2",
        title: "Conferencia de Tecnología",
        organizer: "TechCorp",
        description: "Conferencia sobre las últimas tendencias en tecnología",
        date: "2024-03-20",
        time: "09:00",
        type: "HYBRID",
        category: "CONFERENCE",
        location: "Auditorio Principal",
        maxCapacity: 100,
        currentAttendees: 75,
        price: 50,
        status: "PUBLISHED",
        isFeatured: false,
        registrationDeadline: "2024-03-18",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        tags: ["Tecnología", "Innovación"],
        requirements: "Conocimientos básicos de programación",
        agenda: "09:00 - Apertura\n10:00 - Charlas técnicas\n16:00 - Cierre",
        speakers: "Ing. Carlos López, Dra. Ana Martínez",
        createdAt: "2024-02-05T14:30:00Z",
        updatedAt: "2024-02-05T14:30:00Z",
        isRegistered: false,
      },
      {
        id: "event_3",
        title: "Networking Empresarial",
        organizer: "Cámara de Comercio",
        description: "Evento de networking para empresarios y emprendedores",
        date: "2024-03-25",
        time: "18:00",
        type: "IN_PERSON",
        category: "NETWORKING",
        location: "Hotel Plaza",
        maxCapacity: 80,
        currentAttendees: 60,
        price: 25,
        status: "PUBLISHED",
        isFeatured: true,
        registrationDeadline: "2024-03-22",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        tags: ["Networking", "Empresarios"],
        requirements: "Ser empresario o emprendedor",
        agenda: "18:00 - Registro\n18:30 - Presentaciones\n20:00 - Networking",
        speakers: "Lic. Roberto Silva",
        createdAt: "2024-02-10T09:15:00Z",
        updatedAt: "2024-02-10T09:15:00Z",
        isRegistered: false,
      },
      {
        id: "event_4",
        title: "Seminario de Marketing Digital",
        organizer: "Agencia Digital",
        description: "Seminario sobre estrategias de marketing digital",
        date: "2024-04-05",
        time: "10:00",
        type: "VIRTUAL",
        category: "SEMINAR",
        location: "Zoom Meeting",
        maxCapacity: 200,
        currentAttendees: 150,
        price: 0,
        status: "PUBLISHED",
        isFeatured: false,
        registrationDeadline: "2024-04-03",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        tags: ["Marketing", "Digital"],
        requirements: "Ninguno",
        agenda:
          "10:00 - Introducción\n11:00 - Estrategias\n12:00 - Casos prácticos",
        speakers: "Lic. Patricia Morales",
        createdAt: "2024-02-15T16:45:00Z",
        updatedAt: "2024-02-15T16:45:00Z",
        isRegistered: false,
      },
      {
        id: "event_5",
        title: "Feria de Empleo",
        organizer: "Ministerio de Trabajo",
        description: "Feria de empleo con empresas locales y nacionales",
        date: "2024-04-10",
        time: "08:00",
        type: "IN_PERSON",
        category: "FAIR",
        location: "Centro de Exposiciones",
        maxCapacity: 500,
        currentAttendees: 300,
        price: 0,
        status: "PUBLISHED",
        isFeatured: true,
        registrationDeadline: "2024-04-08",
        imageUrl:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
        tags: ["Empleo", "Oportunidades"],
        requirements: "CV actualizado",
        agenda: "08:00 - Apertura\n09:00 - Presentaciones\n17:00 - Cierre",
        speakers: "Lic. Carmen Rodríguez",
        createdAt: "2024-02-20T11:20:00Z",
        updatedAt: "2024-02-20T11:20:00Z",
        isRegistered: false,
      },
    ];
  }

  // Endpoints específicos de certificados
  if (
    endpoint.includes("/modulecertificate/") &&
    !endpoint.includes("/verify/")
  ) {
    const certificateId = endpoint.split("/").pop();
    return {
      id: certificateId,
      moduleId: "module_1",
      studentId: "user_123",
      certificateUrl: "https://example.com/certificates/module-cert-1.pdf",
      issuedAt: "2024-01-10T09:00:00Z",
      grade: 95,
      completedAt: "2024-01-10T08:45:00Z",
      module: {
        id: "module_1",
        title: "Fundamentos de HTML",
        course: {
          id: "course_1",
          title: "Desarrollo Web Completo",
        },
      },
      student: {
        id: "user_123",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
      },
    };
  }

  if (endpoint.includes("/certificate/") && !endpoint.includes("/verify/")) {
    const certificateId = endpoint.split("/").pop();
    return {
      id: certificateId,
      userId: "user_123",
      courseId: "course_1",
      template: "default",
      issuedAt: "2024-01-15T10:00:00Z",
      verificationCode: "CERT-2024-001",
      digitalSignature: "sha256-signature-1",
      isValid: true,
      url: "https://example.com/certificates/course-cert-1.pdf",
      course: {
        id: "course_1",
        title: "Desarrollo Web Completo",
        description:
          "Curso completo de desarrollo web con HTML, CSS y JavaScript",
      },
      user: {
        id: "user_123",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
      },
    };
  }

  if (endpoint.includes("/certificate/verify/")) {
    const verificationCode = endpoint.split("/").pop();
    return {
      isValid: true,
      certificate: {
        id: "cert_1",
        verificationCode: verificationCode,
        course: {
          title: "Desarrollo Web Completo",
        },
        user: {
          firstName: "Juan",
          lastName: "Pérez",
        },
        issuedAt: "2024-01-15T10:00:00Z",
      },
    };
  }

  // Mock data for job questions
  if (endpoint.includes("/jobquestion")) {
    return [
      {
        id: "question_1",
        jobOfferId: "mock-job-1",
        question: "¿Por qué te interesa trabajar en nuestra empresa?",
        type: "TEXT",
        required: true,
        orderIndex: 1,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "question_2",
        jobOfferId: "mock-job-1",
        question: "¿Tienes experiencia previa en este tipo de roles?",
        type: "MULTIPLE_CHOICE",
        required: true,
        options: [
          "Sí, tengo mucha experiencia",
          "Tengo algo de experiencia",
          "No, pero estoy dispuesto/a a aprender",
        ],
        orderIndex: 2,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "question_3",
        jobOfferId: "mock-job-1",
        question: "¿Estás disponible para trabajar tiempo completo?",
        type: "BOOLEAN",
        required: true,
        orderIndex: 3,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ];
  }

  // Mock data for profile endpoints
  if (endpoint.includes("/profile")) {
    // Handle profile by role query
    if (endpoint.includes("role=YOUTH") || endpoint.includes("role=JOVENES")) {
      return {
        profiles: [
          {
            id: "profile_1",
            userId: "youth_1",
            firstName: "Ana",
            lastName: "Martínez",
            email: "ana.martinez@email.com",
            phone: "+591 700 111 222",
            address: "Av. Estudiantes 456",
            municipality: "La Paz",
            department: "La Paz",
            country: "Bolivia",
            birthDate: new Date("2003-05-15"),
            gender: "FEMALE",
            educationLevel: "SECONDARY",
            currentInstitution: "Colegio San Patricio",
            graduationYear: 2024,
            isStudying: true,
            skills: ["JavaScript", "React", "Python"],
            interests: ["Programación", "Tecnología", "Arte"],
            role: "YOUTH",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
            active: true,
            status: "ACTIVE",
            profileCompletion: 75,
            parentalConsent: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z"),
          },
          {
            id: "profile_2",
            userId: "youth_2",
            firstName: "Carlos",
            lastName: "Rodríguez",
            email: "carlos.rodriguez@email.com",
            phone: "+591 700 333 444",
            address: "Calle Libertad 789",
            municipality: "El Alto",
            department: "La Paz",
            country: "Bolivia",
            birthDate: new Date("2002-08-22"),
            gender: "MALE",
            educationLevel: "UNIVERSITY",
            currentInstitution: "Universidad Mayor de San Andrés",
            graduationYear: 2025,
            isStudying: true,
            skills: ["Java", "Spring", "MySQL"],
            interests: ["Desarrollo Backend", "Base de Datos", "Deportes"],
            role: "YOUTH",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=random",
            active: true,
            status: "ACTIVE",
            profileCompletion: 80,
            parentalConsent: true,
            createdAt: new Date("2024-01-20T14:30:00Z"),
            updatedAt: new Date("2024-01-20T14:30:00Z"),
          },
          {
            id: "profile_3",
            userId: "youth_3",
            firstName: "Lucía",
            lastName: "Vargas",
            email: "lucia.vargas@email.com",
            phone: "+591 700 555 666",
            address: "Zona Norte 321",
            municipality: "Cochabamba",
            department: "Cochabamba",
            country: "Bolivia",
            birthDate: new Date("2004-12-03"),
            gender: "FEMALE",
            educationLevel: "SECONDARY",
            currentInstitution: "Colegio Nacional Bolívar",
            graduationYear: 2023,
            isStudying: false,
            skills: ["Photoshop", "Illustrator", "Diseño Gráfico"],
            interests: ["Arte Digital", "Fotografía", "Música"],
            role: "YOUTH",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Lucia+Vargas&background=random",
            active: true,
            status: "ACTIVE",
            profileCompletion: 65,
            parentalConsent: true,
            createdAt: new Date("2024-02-01T09:15:00Z"),
            updatedAt: new Date("2024-02-01T09:15:00Z"),
          },
        ],
      };
    }

    // Handle general profile endpoints
    return {
      profiles: [
        {
          id: "profile_general_1",
          userId: "user_1",
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@email.com",
          phone: "+591 700 123 456",
          role: "YOUTH",
          status: "ACTIVE",
          profileCompletion: 85,
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        },
      ],
    };
  }

  // Mock data for authentication endpoints
  if (endpoint.includes("/auth/me")) {
    return {
      id: "user_1",
      username: "admin_municipio",
      firstName: "Administrador",
      lastName: "Municipio",
      email: "admin@cercado.gob.bo",
      role: "GOBIERNOS_MUNICIPALES",
      municipalityId: "1",
      profilePicture:
        "https://ui-avatars.com/api/?name=Admin+Municipio&background=random",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
  }

  // Mock data for municipality endpoints
  if (endpoint.includes("/municipality/auth/me")) {
    return {
      id: "1",
      name: "Cercado",
      department: "La Paz",
      region: "Altiplano",
      population: 850000,
      mayor: "Dr. Juan Pérez",
      mayorEmail: "alcalde@cercado.gob.bo",
      mayorPhone: "+591 2 1234567",
      address: "Plaza Mayor 1",
      website: "https://cercado.gob.bo",
      email: "info@cercado.gob.bo",
      phone: "+591 2 7654321",
      logo: "https://ui-avatars.com/api/?name=Cercado&background=random",
      coverImage:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      description: "Municipio de Cercado, La Paz - Bolivia",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
  }

  if (endpoint.includes("/municipality")) {
    return [
      {
        id: "1",
        name: "Cercado",
        department: "La Paz",
        region: "Altiplano",
        population: 850000,
        mayor: "Dr. Juan Pérez",
        mayorEmail: "alcalde@cercado.gob.bo",
        mayorPhone: "+591 2 1234567",
        address: "Plaza Mayor 1",
        website: "https://cercado.gob.bo",
        email: "info@cercado.gob.bo",
        phone: "+591 2 7654321",
        logo: "https://ui-avatars.com/api/?name=Cercado&background=random",
        coverImage:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
        description: "Municipio de Cercado, La Paz - Bolivia",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "El Alto",
        department: "La Paz",
        region: "Altiplano",
        population: 1200000,
        mayor: "Dra. María García",
        mayorEmail: "alcalde@elalto.gob.bo",
        mayorPhone: "+591 2 9876543",
        address: "Av. Principal 100",
        website: "https://elalto.gob.bo",
        email: "info@elalto.gob.bo",
        phone: "+591 2 4567890",
        logo: "https://ui-avatars.com/api/?name=El+Alto&background=random",
        coverImage:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
        description: "Municipio de El Alto, La Paz - Bolivia",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];
  }

  // Default mock response
  return {
    message: "Mock data - Backend not available",
    endpoint,
    timestamp: new Date().toISOString(),
  };
};
