import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const demo = localStorage.getItem('sms_demo_session');
    if (demo) {
      try { return JSON.parse(demo).user; } catch(e) {}
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    const demo = localStorage.getItem('sms_demo_session');
    if (demo) {
      try { return JSON.parse(demo).role; } catch(e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check active Supabase sessions
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (data?.role) {
        setRole(data.role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const loginAsRole = (userEmail, userRole) => {
    const sessionObj = {
      user: { id: 'demo-id-' + userRole, email: userEmail },
      role: userRole
    };
    localStorage.setItem('sms_demo_session', JSON.stringify(sessionObj));
    setUser(sessionObj.user);
    setRole(sessionObj.role);
  };

  const signOut = async () => {
    localStorage.removeItem('sms_demo_session');
    setUser(null);
    setRole(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginAsRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

