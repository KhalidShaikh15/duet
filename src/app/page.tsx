'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Auth from '@/components/auth/Auth';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export default function Home() {
  const { user: authUser, loading: userLoading } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const firestore = useFirestore();

  const updateUserStatus = useCallback(
    async (uid: string, isOnline: boolean) => {
      if (!firestore || !uid) return;
      const userRef = doc(firestore, 'users', uid);
      try {
        await updateDoc(userRef, {
          isOnline,
          lastActive: serverTimestamp(),
        });
      } catch (error) {
        // If the document doesn't exist, it might be a new user.
        // The creation logic in Auth.tsx should handle the initial document.
        console.warn('Could not update user status, may be a new user.', error);
      }
    },
    [firestore]
  );
  
  // Fetch full user profile from Firestore
  useEffect(() => {
    if (authUser?.uid && firestore) {
      const userRef = doc(firestore, 'users', authUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          setAppUser(docSnap.data() as AppUser);
          updateUserStatus(authUser.uid, true);
        }
      });
    } else {
        setAppUser(null);
    }
  }, [authUser?.uid, firestore, updateUserStatus]);

  // Set user offline on browser close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (authUser?.uid) {
        updateUserStatus(authUser.uid, false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authUser?.uid, updateUserStatus]);


  const handleLogout = async () => {
    if (authUser?.uid) {
      await updateUserStatus(authUser.uid, false);
    }
    // The actual sign-out is handled by the useUser hook/Firebase SDK
  };


  if (userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!appUser) {
    return <Auth />;
  }

  return <AppLayout user={appUser} onLogout={handleLogout} />;
}
