'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Auth from '@/components/auth/Auth';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function Home() {
  const { user, loading: userLoading } = useUser();
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
  
  // Set user online on login
  useEffect(() => {
    if (user?.uid) {
      updateUserStatus(user.uid, true);
    }
  }, [user?.uid, updateUserStatus]);

  // Set user offline on browser close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (user?.uid) {
        updateUserStatus(user.uid, false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid, updateUserStatus]);


  const handleLogout = async () => {
    if (user?.uid) {
      await updateUserStatus(user.uid, false);
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

  if (!user) {
    return <Auth />;
  }

  return <AppLayout user={{uid: user.uid, username: user.email!, isOnline: true, lastActive: new Date() as any}} onLogout={handleLogout} />;
}
