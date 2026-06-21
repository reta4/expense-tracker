import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

export const useAuthUser = (navigate) => {
  const [user, setUser] = useState(null);
  const [contactId, setContactId] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);
  const hasFetchedData = useRef(false);

  const resetSession = useCallback(() => {
    hasFetchedData.current = false;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (hasFetchedData.current) {
          setLoadingAuth(false);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!userDoc.exists()) {
            await auth.signOut();
            navigate('/login');
            return;
          }

          const userData = userDoc.data();
          const resolvedContactId = userData.salesforceContactId
            || userData.User_Contact__c
            || userData.contactId;

          if (!resolvedContactId?.toString().trim()) {
            await auth.signOut();
            navigate('/login');
            return;
          }

          hasFetchedData.current = true;
          setContactId(resolvedContactId);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: userData.firstName || 'User',
            lastName: userData.lastName || '',
            User_Contact__c: resolvedContactId,
          });
        } catch {
          navigate('/login');
        } finally {
          setLoadingAuth(false);
        }
      } else {
        hasFetchedData.current = false;
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
