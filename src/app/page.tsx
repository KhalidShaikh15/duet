'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Auth from '@/components/auth/Auth';
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  const updateUserStatus = useCallback(async (name: string, isOnline: boolean) => {
    if (!name) return;
    const userRef = doc(db, 'users', name);
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
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      handleLoginSuccess(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    const handleBeforeUnload = () => {
      updateUserStatus(username, false);
    };
    
    const handlePageHide = () => {
      updateUserStatus(username, false);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);


    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [username, updateUserStatus]);

  const handleLoginSuccess = async (name: string) => {
    if (!name) return;
    const trimmedName = name.trim();
    localStorage.setItem('username', trimmedName);
    setUsername(trimmedName);
    await updateUserStatus(trimmedName, true);
  };

  const handleLogout = async () => {
    if (username) {
        await updateUserStatus(username, false);
    }
    localStorage.removeItem('username');
    setUsername(null);
  }

  if (!username) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return <AppLayout username={username} onLogout={handleLogout} />;
}
