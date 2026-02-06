import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "interviewer" | "candidate";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: AppRole | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for role lookups to avoid redundant queries
const roleCache = new Map<string, { role: AppRole; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  const fetchUserRole = useCallback(async (userId: string, skipCache = false): Promise<AppRole | null> => {
    // Check cache first
    if (!skipCache) {
      const cached = roleCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.role;
      }
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      const userRole = data.role as AppRole;
      roleCache.set(userId, { role: userRole, timestamp: Date.now() });
      return userRole;
    } catch {
      return null;
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user) {
      const userRole = await fetchUserRole(user.id, true);
      setRole(userRole);
    }
  }, [user, fetchUserRole]);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;

    const initAuth = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        const userRole = await fetchUserRole(existingSession.user.id);
        if (mounted) {
          setRole(userRole);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        // Skip role fetch for SIGNED_IN - handled in signIn function
        if (event === 'SIGNED_IN') {
          setIsLoading(false);
          return;
        }

        // For other events, fetch role if not cached
        fetchUserRole(currentSession.user.id).then((userRole) => {
          if (mounted) {
            setRole(userRole);
            setIsLoading(false);
          }
        });
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error as Error | null };
    }

    if (data.user) {
      // Fetch role immediately for instant navigation
      const userRole = await fetchUserRole(data.user.id, true);
      setRole(userRole);
      setSession(data.session);
      setUser(data.user);
      return { error: null, role: userRole };
    }

    return { error: null };
  };

  const signOut = async () => {
    // Clear cache for current user
    if (user) {
      roleCache.delete(user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
