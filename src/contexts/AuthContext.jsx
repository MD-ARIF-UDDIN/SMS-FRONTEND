import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // true until session is resolved

  // Fetch role from the profiles table (linked to auth.users.id)
  const fetchRole = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error.message);
        return null;
      }
      return data?.role ?? null;
    } catch (err) {
      console.error('Unexpected error fetching role:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Resolve the current session on mount (server-validated)
    const initSession = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const userRole = await fetchRole(currentUser.id);
          setUser(currentUser);
          setRole(userRole);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const userRole = await fetchRole(session.user.id);
            setUser(session.user);
            setRole(userRole);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
        }
        // Always clear loading after first auth event
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  /**
   * Sign in with email and password.
   * Returns { error } — null error means success.
   */
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    setUser(null);
    setRole(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
