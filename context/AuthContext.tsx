import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { PsvProfile, getPsvProfile } from '../services/firestore';

interface SessionContextType {
  user: User | null;
  profile: PsvProfile | null;
  loading: boolean;
  reloadSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  profile: null,
  loading: true,
  reloadSession: async () => {},
});

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PsvProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const psvProfile = await getPsvProfile(currentUser.uid);
        setUser(currentUser);
        setProfile(psvProfile);
      } catch (error) {
        console.error("SessionProvider: Failed to fetch user profile.", error);
        setUser(currentUser);
        setProfile(null);
      }
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  const reloadSession = async () => {
    setLoading(true);
    await fetchSessionData(auth.currentUser);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fetchSessionData);
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    reloadSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {!loading && children}
    </SessionContext.Provider>
  );
};
