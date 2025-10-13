
'use client';

import { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

// This provider is responsible for initializing Firebase on the client side.
// It should be used as a wrapper around the root layout of your application.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const { app, auth, firestore } = useMemo(
    () => initializeFirebase(firebaseConfig as any),
    [firebaseConfig]
  );
  
  return <FirebaseProvider value={{app, auth, firestore}}>{children}</FirebaseProvider>;
}
