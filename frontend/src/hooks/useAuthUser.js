import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { fetchValidatedUserProfile } from '../utils/userProfile';

let authSession = null;

export const clearAuthSession = () => {
  authSession = null;
};

export const useAuthUser = (navigate) => {
  const [user, setUser] = useState(() => authSession?.user ?? null);
  const [contactId, setContactId] = useState(() => authSession?.contactId ?? '');
  const [loadingAuth, setLoadingAuth] = useState(() => !authSession);

  const resetSession = useCallback(() => {
    authSession = null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (authSession?.uid === firebaseUser.uid) {
          setUser(authSession.user);
          setContactId(authSession.contactId);
          setLoadingAuth(false);
          return;
        }

        try {
          const profile = await fetchValidatedUserProfile(firebaseUser);

          if (!profile.valid) {
            authSession = null;
            await auth.signOut();
            navigate('/login');
            return;
          }

          authSession = {
            uid: firebaseUser.uid,
            user: profile.user,
            contactId: profile.contactId,
          };

          setContactId(profile.contactId);
          setUser(profile.user);
        } catch {
          authSession = null;
          navigate('/login');
        } finally {
          setLoadingAuth(false);
        }
      } else {
        authSession = null;
        setUser(null);
        setContactId('');
        navigate('/login');
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return { user, contactId, loadingAuth, resetSession };
};

export default useAuthUser;
