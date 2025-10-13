'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/components/auth/Login';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const storedUser = localStorage.getItem('duet-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const updateUserStatus = useCallback(
    async (uid: string, isOnline: boolean) => {
      if (!firestore || !uid) return;
      const userRef = doc(firestore, 'users', uid);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            isOnline,
            lastActive: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    },
    [firestore]
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
        // This might not always run, but it's a good fallback
        updateUserStatus(user.uid, false);
      }
    };
  }, [user?.uid, updateUserStatus]);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('duet-user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    if (user?.uid) {
      updateUserStatus(user.uid, false);
    }
    localStorage.removeItem('duet-user');
    setUser(null);
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AppLayout user={user} onLogout={handleLogout} />;
}
