import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

interface Session {
  user: User;
  expires: Date;
}

// Helper function to get session in API routes
export async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    const userId = (session?.user as any)?.id || null;

    // Si no hay sesión, usar un ID fijo para testing
    if (!userId) {
      console.log("No session found, using default user ID for testing");
      return "user_123";
    }

    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    // En caso de error, usar un ID fijo para testing
    return "user_123";
  }
}

// Mock implementation of auth function
export async function auth(): Promise<Session | null> {
  // In a real app, this would check for a valid session
  // For demo purposes, we're returning a mock session

  // If you're implementing a real auth system, replace this with actual auth logic
  const mockUser: User = {
    id: "user_123",
    email: "user@example.com",
    name: "Demo User",
    role: "USER",
  };

  return {
    user: mockUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };
}

// Function to get the current user (useful for client components)
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  return session?.user || null;
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Mock authentication - in a real app, you would validate against your database
        if (
          credentials?.email === "admin@cemse.com" &&
          credentials?.password === "admin"
        ) {
          return {
            id: "user_123",
            email: "admin@cemse.com",
            name: "Super Admin",
            role: "SUPERADMIN",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.sub || "user_123",
          email: token.email || "admin@cemse.com",
          name: token.name || "Super Admin",
          role: token.role || "SUPERADMIN",
        };
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
