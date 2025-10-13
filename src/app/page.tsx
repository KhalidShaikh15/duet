'use client';

import { useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Auth from '@/components/auth/Auth';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function Home() {
  const { user, loading } = useUser();
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
        // If the user document doesn't exist, create it.
        if ((error as any).code === 'not-found' && user) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            isOnline: true,
            lastActive: serverTimestamp(),
          });
        } else {
          console.error('Error updating user status:', error);
        }
      }
    },
    [firestore, user]
  );

  useEffect(() => {
    if (user?.uid) {
      updateUserStatus(user.uid, true);
    }

    const handleBeforeUnload = () => {
      if (user?.uid) {
        updateUserStatus(user.uid, false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user?.uid) {
        updateUserStatus(user.uid, false);
      }
    };
  }, [user?.uid, updateUserStatus]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <AppLayout />;
}
