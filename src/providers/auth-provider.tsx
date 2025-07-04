&ldquo;use client&rdquo;;

import { createContext, useContext, useEffect, useState } from &ldquo;react&rdquo;;
import { createClientComponentClient } from &ldquo;@supabase/auth-helpers-nextjs&rdquo;;
import type { User, Session } from &ldquo;@supabase/auth-helpers-nextjs&rdquo;;
import { useRouter } from &ldquo;next/navigation&rdquo;;
import type { Profile } from &ldquo;@/types/profile&rdquo;;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Fetch profile function
  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) throw new Error(&ldquo;Failed to fetch profile&rdquo;);
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error(&ldquo;Error fetching profile:&rdquo;, error);
      setProfile(null);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);

      if (event === &ldquo;SIGNED_OUT&rdquo;) {
        router.push(&ldquo;/sign-in&rdquo;);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    router.push(&ldquo;/dashboard&rdquo;);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    router.push(&ldquo;/sign-in&rdquo;);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 